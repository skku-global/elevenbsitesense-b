import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { createContactHandler } from '../server/contact-handler.js'

function fixture(envChanges = {}) {
  const id = randomUUID()
  const env = {
    KV_REST_API_URL: 'https://test.upstash.io', KV_REST_API_TOKEN: 'redis-fixture',
    RESEND_API_KEY: 're_mailfixture', SUPABASE_URL: 'https://fixture.supabase.co',
    SUPABASE_SECRET_KEY: 'sb_secret_journalfixture', ...envChanges,
  }
  const body = { name: 'Fixture Owner', email: 'visitor@example.invalid', service: 'painting', message: 'A local fixture for the enquiry inbox.' }
  const state = { calls: [], mailKeys: [], rows: new Map(), logs: [] }
  let receipt
  function redisReply(result) { return Response.json({ result: JSON.stringify(result) }) }
  async function transport(address, options) {
    const url = new URL(address)
    const payload = JSON.parse(options.body)
    if (url.hostname === 'test.upstash.io') {
      if (payload[2] === 5) {
        state.calls.push('reserve')
        if (state.rateLimited) return redisReply({ code: 'rate_limited', retryAfter: 60 })
        if (receipt?.notification === 'sent') return redisReply({ code: 'completed' })
        if (state.expired) return redisReply({ code: receipt?.inboxReceived ? 'inbox_received' : 'retry_expired' })
        const [fingerprint, createdAt, owner] = payload.slice(8)
        receipt = { fingerprint, createdAt: Number(createdAt), owner, notification: 'pending', acknowledgement: 'disabled' }
        return redisReply({ code: 'ready', record: receipt })
      }
      const patch = JSON.parse(payload.at(-1))
      Object.assign(receipt, patch)
      return redisReply({ updated: true })
    }
    if (url.hostname === 'fixture.supabase.co') {
      assert.equal(new Headers(options.headers).get('apikey'), env.SUPABASE_SECRET_KEY)
      assert.equal(url.pathname, '/rest/v1/enquiries')
      if (options.method === 'POST') {
        state.calls.push('record')
        if (state.insertFails) return new Response(null, { status: 503 })
        assert.equal(url.searchParams.get('on_conflict'), 'id')
        assert.match(new Headers(options.headers).get('prefer'), /resolution=ignore-duplicates/)
        if (!state.rows.has(payload.id)) state.rows.set(payload.id, { delivery_status: 'pending', ...payload })
      } else {
        assert.equal(options.method, 'PATCH')
        assert.equal(url.searchParams.get('id'), 'eq.' + id)
        const status = payload.delivery_status
        state.calls.push(status)
        if (state.statusFails) return new Response(null, { status: 503 })
        if (status === 'failed') assert.equal(url.searchParams.get('delivery_status'), 'neq.sent')
        state.rows.get(id).delivery_status = status
      }
      return new Response(null, { status: 204 })
    }
    assert.equal(url.href, 'https://api.resend.com/emails')
    state.calls.push('email')
    state.mailKeys.push(new Headers(options.headers).get('Idempotency-Key'))
    if (state.mailFails) return Response.json({ message: 'Test rejection' }, { status: 403 })
    return Response.json({ id: 'accepted-fixture' })
  }
  const handle = createContactHandler({
    getEnv: () => env, fetchImpl: transport,
    logger: { error(event, details) { state.logs.push({ event, details }) } },
  })
  async function submit() {
    const res = { setHeader() {}, status(code) { this.code = code; return this }, json(data) { this.body = data } }
    await handle({
      method: 'POST', body,
      headers: { origin: 'https://elevenbsitesense.com', 'content-type': 'application/json', 'idempotency-key': id },
    }, res)
    return res
  }
  return { submit, id, state, body, env }
}

test('accepts an enquiry stored in the owner inbox and retries email with the same provider key', async () => {
  const { submit, state, id, body } = fixture()
  state.mailFails = true
  const saved = await submit()
  assert.equal(saved.code, 200)
  assert.equal(saved.body.enquiryId, id)
  assert.deepEqual(state.calls, ['reserve', 'record', 'email', 'failed'])
  assert.equal(state.rows.get(id).message, body.message)
  assert.equal(state.rows.get(id).delivery_status, 'failed')
  state.mailFails = false
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.size, 1)
  assert.equal(state.rows.get(id).delivery_status, 'sent')
  assert.deepEqual(state.mailKeys, Array(2).fill('contact/' + id + '/notification'))
})

test('keeps a successful notification accepted if a dashboard status update fails', async () => {
  const { submit, state, id } = fixture()
  state.statusFails = true
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.get(id).delivery_status, 'pending')
  assert.equal(state.logs[0].event, 'contact_journal_status_failed')
  state.statusFails = false
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.get(id).delivery_status, 'sent')
  assert.equal(state.mailKeys.length, 1)
})

test('an unavailable inbox can retry without an early notification or lost data', async () => {
  const { submit, state, id } = fixture()
  state.insertFails = true
  const failed = await submit()
  assert.equal(failed.code, 503)
  assert.equal(failed.body.requestId, id)
  assert.equal(state.mailKeys.length, 0)
  state.insertFails = false
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.get(id).delivery_status, 'sent')
})

test('accepts saved enquiries when email settings are missing and allows a repaired configuration to retry', async () => {
  const { submit, state, id, env } = fixture({ RESEND_API_KEY: '' })
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.get(id).delivery_status, 'failed')
  assert.equal(state.mailKeys.length, 0)
  env.RESEND_API_KEY = 're_mailfixture'
  assert.equal((await submit()).code, 200)
  assert.equal(state.rows.size, 1)
  assert.equal(state.rows.get(id).delivery_status, 'sent')
})

test('enforces the existing limit before storing any personal information', async () => {
  const { submit, state } = fixture()
  state.rateLimited = true
  assert.equal((await submit()).code, 429)
  assert.deepEqual(state.calls, ['reserve'])
})

test('a recorded inbox receipt still confirms an enquiry after the safe email retry window closes', async () => {
  const { submit, state, id } = fixture()
  state.mailFails = true
  assert.equal((await submit()).code, 200)
  state.expired = true
  assert.equal((await submit()).code, 200)
  assert.equal(state.mailKeys.length, 1)
  assert.equal(state.rows.get(id).delivery_status, 'failed')
})

test('email delivery works during partial Supabase setup with either Redis variable pair', async () => {
  for (const redis of [
    {},
    { KV_REST_API_URL: '', KV_REST_API_TOKEN: '', UPSTASH_REDIS_REST_URL: 'https://test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'redis-fixture' },
  ]) {
    const { submit, state } = fixture({ ...redis, SUPABASE_SECRET_KEY: '' })
    assert.equal((await submit()).code, 200)
    assert.deepEqual(state.calls, ['reserve', 'email'])
  }
})

test('email-only mode reports failure when no inbox has received the enquiry', async () => {
  const { submit, state, id, env } = fixture({ SUPABASE_SECRET_KEY: '' })
  state.mailFails = true
  const rejected = await submit()
  assert.equal(rejected.code, 502)
  assert.deepEqual(rejected.body, { ok: false, code: 'notification_unavailable', requestId: id })
  env.RESEND_API_KEY = ''
  const unavailable = await submit()
  assert.equal(unavailable.code, 503)
  assert.equal(unavailable.body.requestId, id)
  assert.equal(state.rows.size, 0)
})
