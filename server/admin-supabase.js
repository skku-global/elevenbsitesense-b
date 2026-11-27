import { getEnquiryServiceTitle, isSubmissionId } from '../src/data/enquiry.js'

const jwtFormat = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

function supabaseError(status, code, reason = code) {
  return Object.assign(new Error(reason), { provider: 'supabase', status, code, reason })
}

function projectUrl(env) {
  try {
    const url = new URL(env.SUPABASE_URL)
    const development = env.VERCEL_ENV === 'development' || env.NODE_ENV === 'development'
    const local = development && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') return null
    return url.origin
  } catch { return null }
}

// These checks keep a mistakenly configured secret out of the public response.
// Supabase verifies the signature of each user's bearer token before applying RLS.
function legacyKeyHasRole(key, role) {
  if (typeof key !== 'string' || !jwtFormat.test(key)) return false
  try { return JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8')).role === role }
  catch { return false }
}

export function getPublicSupabaseConfig(env) {
  const url = projectUrl(env)
  const key = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY
  const valid = typeof key === 'string' && (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) || legacyKeyHasRole(key, 'anon'))
  if (!url || !valid) throw supabaseError(503, 'service_unavailable', 'invalid_public_configuration')
  return { url, publishableKey: key }
}

export function getAdminBearer(req) {
  const value = req.headers?.authorization
  const match = typeof value === 'string' && value.length <= 16384 && /^Bearer ([^\s]+)$/i.exec(value)
  if (!match || !jwtFormat.test(match[1])) throw supabaseError(401, 'authentication_required')
  return match[1]
}

export async function callOwnerRpc(config, token, name, args = {}, fetchImpl = fetch) {
  let response
  try {
    response = await fetchImpl(config.url + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: { apikey: config.publishableKey, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), redirect: 'error', signal: AbortSignal.timeout(7000),
    })
  } catch { throw supabaseError(503, 'service_unavailable') }
  if (response.status === 401) throw supabaseError(401, 'authentication_required')
  if (response.status === 403) throw supabaseError(403, 'access_denied')
  let body
  try { body = await response.json() } catch { throw supabaseError(503, 'service_unavailable') }
  if (response.ok) return body
  if (response.status === 404 && body?.code === 'PT404') throw supabaseError(404, 'enquiry_not_found')
  if (response.status === 400 && body?.code === 'PT400') throw supabaseError(400, 'validation_error')
  throw supabaseError(503, 'service_unavailable')
}

export function getServiceSupabaseConfig(env) {
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  const url = projectUrl(env)
  const legacy = legacyKeyHasRole(key, 'service_role')
  if (!url || typeof key !== 'string' || (!/^sb_secret_[A-Za-z0-9_-]+$/.test(key) && !legacy)) {
    throw supabaseError(503, 'service_unavailable', 'invalid_journal_configuration')
  }
  const headers = { apikey: key, 'Content-Type': 'application/json' }
  if (legacy) headers.Authorization = 'Bearer ' + key
  return { url, headers }
}

export function createEnquiryJournal(env, fetchImpl = fetch) {
  const config = getServiceSupabaseConfig(env)
  if (!config) return null
  const { url, headers } = config
  async function write(method, query, body, prefer) {
    let response
    try {
      response = await fetchImpl(url + '/rest/v1/enquiries?' + query, {
        method, headers: { ...headers, Prefer: prefer }, body: JSON.stringify(body),
        redirect: 'error', signal: AbortSignal.timeout(4500),
      })
    } catch { throw supabaseError(503, 'service_unavailable', 'journal_write_failed') }
    if (!response.ok) throw supabaseError(response.status, 'service_unavailable', 'journal_write_failed')
  }
  return {
    async record(id, enquiry) {
      if (!isSubmissionId(id)) throw supabaseError(400, 'validation_error')
      const { name, email, phone, service, message } = enquiry
      await write('POST', 'on_conflict=id', {
        id, name, email, phone, service: getEnquiryServiceTitle(service), message,
      }, 'resolution=ignore-duplicates,return=minimal')
    },
    async markDelivery(id, status) {
      if (!isSubmissionId(id) || !['failed', 'sent'].includes(status)) throw supabaseError(400, 'validation_error')
      // An older attempt can finish after a successful retry.
      const query = new URLSearchParams({ id: 'eq.' + id })
      if (status === 'failed') query.set('delivery_status', 'neq.sent')
      await write('PATCH', query.toString(), { delivery_status: status }, 'return=minimal')
    },
  }
}
