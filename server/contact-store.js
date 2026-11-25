// Server-only Redis coordination. Lua keeps rate limits and reservations atomic
// across concurrent Vercel instances. Delivery receipts deliberately do not expire.
import { redactDiagnosticMessage } from './contact-diagnostics.js'
export const retryWindowMs = 23 * 60 * 60 * 1000 // Resend keeps provider keys for 24 hours.
export const lockDurationMs = 45_000 // Longer than the function's 30-second maximum.
const rateWindowSeconds = 600
const namespace = 'contact:{enquiries}:v1' // One Redis Cluster hash slot for atomic multi-key operations.

export const reserveScript = `
local fingerprint, now, owner = ARGV[1], tonumber(ARGV[2]), ARGV[3]
local window = tonumber(ARGV[11])
local function count(key) return tonumber(redis.call('GET', key) or '0') end
local function retry(key) return math.max(1, redis.call('TTL', key)) end
local function tick(key)
  if redis.call('INCR', key) == 1 then redis.call('EXPIRE', key, window) end
end
if count(KEYS[2]) >= tonumber(ARGV[7]) then return cjson.encode({code='rate_limited', retryAfter=retry(KEYS[2])}) end
if count(KEYS[3]) >= tonumber(ARGV[9]) then return cjson.encode({code='rate_limited', retryAfter=retry(KEYS[3])}) end
tick(KEYS[2]); tick(KEYS[3])
local encoded = redis.call('GET', KEYS[1])
local record
if encoded then
  record = cjson.decode(encoded)
  if record.fingerprint ~= fingerprint then return cjson.encode({code='idempotency_conflict'}) end
  local sent = record.notification == 'sent'
  if sent and record.acknowledgement ~= 'pending' then return cjson.encode({code='completed'}) end
  if record.owner and record.lockUntil > now then
    if sent then return cjson.encode({code='completed'}) end
    return cjson.encode({code='enquiry_in_progress', retryAfter=math.max(1, math.ceil((record.lockUntil-now)/1000))})
  end
  if now-record.createdAt >= tonumber(ARGV[6]) then
    if sent then
      record.acknowledgement = 'failed'
      record.owner = nil; record.lockUntil = nil
      redis.call('SET', KEYS[1], cjson.encode(record))
      return cjson.encode({code='completed', acknowledgementExpired=true})
    end
    return cjson.encode({code='retry_expired'})
  end
else
  if count(KEYS[4]) >= tonumber(ARGV[8]) then return cjson.encode({code='rate_limited', retryAfter=retry(KEYS[4])}) end
  if count(KEYS[5]) >= tonumber(ARGV[10]) then return cjson.encode({code='rate_limited', retryAfter=retry(KEYS[5])}) end
  tick(KEYS[4]); tick(KEYS[5])
  record = {fingerprint=fingerprint, createdAt=now, notification='pending', acknowledgement='disabled'}
  if ARGV[4] == 'true' then record.acknowledgement = 'pending' end
end
record.owner = owner
record.lockUntil = now + tonumber(ARGV[5])
redis.call('SET', KEYS[1], cjson.encode(record))
return cjson.encode({code='ready', record=record})
`

export const updateScript = `
local encoded = redis.call('GET', KEYS[1])
if not encoded then return cjson.encode({updated=false}) end
local record = cjson.decode(encoded)
if record.owner ~= ARGV[1] then return cjson.encode({updated=false}) end
local patch = cjson.decode(ARGV[2])
if patch.notification then record.notification = patch.notification end
if patch.acknowledgement then record.acknowledgement = patch.acknowledgement end
if patch.release then record.owner = nil; record.lockUntil = nil end
redis.call('SET', KEYS[1], cjson.encode(record))
return cjson.encode({updated=true})
`

export class ContactStoreError extends Error {
  constructor(code = 'storage_invalid_response', { status, variables, providerMessage } = {}) {
    super('Contact storage unavailable')
    this.name = 'ContactStoreError'
    this.code = code
    this.provider = 'upstash'
    this.status = status
    this.variables = variables
    this.providerMessage = providerMessage
  }
}

export function createContactStore({ url, token, fetchImpl = fetch, timeoutMs = 2000 }) {
  let endpoint
  try {
    endpoint = new URL(url)
    if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.upstash.io') || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/') throw new Error('Invalid endpoint')
  } catch { throw new ContactStoreError('invalid_storage_endpoint', { variables: ['UPSTASH_REDIS_REST_URL'] }) }
  if (typeof token !== 'string' || !token.trim()) throw new ContactStoreError('missing_environment_variables', { variables: ['UPSTASH_REDIS_REST_TOKEN'] })

  const receiptKey = (id) => `${namespace}:receipt:${id}`
  const execute = async (command) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(endpoint.href, {
        method: 'POST', redirect: 'error',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command), signal: controller.signal,
      })
      if (!response.ok) throw new ContactStoreError('storage_http_error', { status: response.status, ...([401, 403].includes(response.status) ? { variables: ['UPSTASH_REDIS_REST_TOKEN'] } : {}) })
      const body = await response.json()
      if (body.error) throw new ContactStoreError('storage_command_rejected', { providerMessage: redactDiagnosticMessage(body.error, [url, token]) })
      if (typeof body.result !== 'string') throw new ContactStoreError()
      return JSON.parse(body.result)
    } catch (error) {
      if (error instanceof ContactStoreError) throw error
      throw new ContactStoreError(controller.signal.aborted ? 'storage_timeout' : 'storage_request_failed')
    }
    finally { clearTimeout(timer) }
  }
  return {
    async reserve({ id, fingerprint, ipHash, owner, now, autoreply }) {
      const result = await execute(['EVAL', reserveScript, 5,
        receiptKey(id), `${namespace}:requests:${ipHash}`, `${namespace}:requests:global`,
        `${namespace}:new:${ipHash}`, `${namespace}:new:global`,
        fingerprint, String(now), owner, String(autoreply), String(lockDurationMs), String(retryWindowMs),
        '30', '5', '300', '100', String(rateWindowSeconds),
      ])
      if (!result || !['ready', 'completed', 'rate_limited', 'idempotency_conflict', 'enquiry_in_progress', 'retry_expired'].includes(result.code)) throw new ContactStoreError()
      if (result.code === 'ready' && (!result.record || result.record.fingerprint !== fingerprint || result.record.owner !== owner || !Number.isFinite(result.record.createdAt) || !['pending', 'sent'].includes(result.record.notification) || !['pending', 'sent', 'failed', 'disabled'].includes(result.record.acknowledgement))) throw new ContactStoreError()
      if (['rate_limited', 'enquiry_in_progress'].includes(result.code) && (!Number.isInteger(result.retryAfter) || result.retryAfter < 1)) throw new ContactStoreError()
      return result
    },
    async update(id, owner, patch) {
      const result = await execute(['EVAL', updateScript, 1, receiptKey(id), owner, JSON.stringify(patch)])
      return result.updated === true
    },
  }
}
