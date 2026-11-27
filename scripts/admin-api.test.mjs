import assert from 'node:assert/strict'
import test from 'node:test'
import { createActivityHandler } from '../server/activity-handler.js'
import { createAdminHandler } from '../server/admin-handler.js'

const env = {
  SUPABASE_URL: 'https://fixture.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture',
  SUPABASE_SECRET_KEY: 'sb_secret_fixture',
}
const owner = 'fixture.owner.token'
const id = 'b92eda60-470a-4149-a2d9-43defa201c0a'

async function invoke(handler, request) {
  const reply = { headers: {} }
  await handler(request, {
    setHeader(key, value) { reply.headers[key] = value },
    status(code) { reply.status = code; return this },
    json(body) { reply.body = body },
    end() {},
  })
  return reply
}

test('publishes only the URL and publishable key and rejects a misplaced secret', async () => {
  const getEnv = () => env
  const request = { method: 'GET', url: '/api/admin/?action=config' }
  const result = await invoke(createAdminHandler({ getEnv }), request)
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { url: env.SUPABASE_URL, publishableKey: env.SUPABASE_PUBLISHABLE_KEY })
  assert.equal(result.headers['Cache-Control'], 'private, no-store')

  const badEnv = () => ({ ...env, SUPABASE_PUBLISHABLE_KEY: env.SUPABASE_SECRET_KEY })
  assert.equal((await invoke(createAdminHandler({ getEnv: badEnv }), request)).status, 503)
})

test('requires a login, enforces owner access, and forwards paging and status updates', async () => {
  const fetchImpl = async (url, { headers, body }) => {
    assert.equal(headers.apikey, env.SUPABASE_PUBLISHABLE_KEY)
    if (headers.Authorization !== 'Bearer ' + owner) return Response.json({}, { status: 403 })
    if (url.endsWith('/site_admin_inbox')) {
      assert.deepEqual(JSON.parse(body), { page_number: 2 })
      return Response.json({ enquiries: [], page: 2 })
    }
    assert.ok(url.endsWith('/site_admin_set_status'))
    assert.deepEqual(JSON.parse(body), { enquiry_id: id, new_status: 'closed' })
    return Response.json({ id, status: 'closed' })
  }
  const handler = createAdminHandler({ getEnv: () => env, fetchImpl })
  const request = { method: 'GET', url: '/api/admin/?page=2' }
  assert.equal((await invoke(handler, request)).status, 401)
  assert.equal((await invoke(handler, { ...request, headers: { authorization: 'Bearer fixture.other.token' } })).status, 403)
  const headers = { authorization: 'Bearer ' + owner, 'content-type': 'application/json' }
  assert.deepEqual((await invoke(handler, { ...request, headers })).body, { enquiries: [], page: 2 })
  assert.equal((await invoke(handler, { ...request, headers, url: '/api/admin/?page=0' })).status, 400)
  const update = { method: 'PATCH', headers, body: { id, status: 'closed' } }
  assert.deepEqual((await invoke(handler, update)).body, { id, status: 'closed' })
  assert.equal((await invoke(handler, { ...update, body: { id, status: 'sent' } })).status, 400)
})

test('records public paths while keeping the activity report restricted to the owner', async () => {
  const report = { days: [], pages: [] }
  let writes = 0
  const fetchImpl = async (url, { headers, body }) => {
    if (url.endsWith('/site_admin_activity')) {
      assert.equal(headers.apikey, env.SUPABASE_PUBLISHABLE_KEY)
      return headers.Authorization === 'Bearer ' + owner
        ? Response.json(report) : Response.json({}, { status: 403 })
    }
    writes++
    assert.ok(url.endsWith('/site_record_page_view'))
    assert.equal(headers.apikey, env.SUPABASE_SECRET_KEY)
    assert.deepEqual(JSON.parse(body), { page_path: '/contact/' })
    return new Response(null, { status: 204 })
  }
  const handler = createActivityHandler({ getEnv: () => env, fetchImpl })
  const headers = { origin: 'https://www.elevenbsitesense.com', 'content-type': 'application/json' }
  const view = { method: 'POST', headers, body: { path: '/contact' } }
  assert.equal((await invoke(handler, view)).status, 204)
  assert.equal((await invoke(handler, { ...view, body: { path: '/contact/?service=painting' } })).status, 400)
  assert.equal((await invoke(handler, { ...view, body: { path: '/admin/' } })).status, 400)
  assert.equal((await invoke(handler, { ...view, headers: { ...headers, origin: 'https://fixture.invalid' } })).status, 403)
  assert.equal(writes, 1)
  assert.equal((await invoke(handler, { method: 'GET' })).status, 401)
  assert.equal((await invoke(handler, { method: 'GET', headers: { authorization: 'Bearer fixture.other.token' } })).status, 403)
  assert.deepEqual((await invoke(handler, { method: 'GET', headers: { authorization: 'Bearer ' + owner } })).body, report)
})
