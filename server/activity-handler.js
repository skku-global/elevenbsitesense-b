import { serviceOptions } from '../src/data/serviceOptions.js'
import { isAllowedOrigin } from './contact-handler.js'
import { callOwnerRpc, getAdminBearer, getPublicSupabaseConfig, getServiceSupabaseConfig } from './admin-supabase.js'

const pages = new Set(['/', '/contact/', '/projects/', '/services/', '/faq/', '/build-from-abroad/',
  ...serviceOptions.map(({ slug }) => '/' + slug + '/')])

function readPage(body) {
  try {
    const raw = Buffer.isBuffer(body) ? body.toString('utf8') : typeof body === 'string' ? body : JSON.stringify(body)
    if (!raw || Buffer.byteLength(raw) > 256) return null
    const data = JSON.parse(raw)
    if (typeof data?.path !== 'string' || Object.keys(data).length !== 1) return null
    const path = data.path.endsWith('/') ? data.path : data.path + '/'
    return pages.has(path) ? path : null
  } catch { return null }
}

export function createActivityHandler({ getEnv = () => process.env, fetchImpl = fetch } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('Vary', 'Authorization')
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.setHeader('Allow', 'GET, POST')
      return res.status(405).json({ code: 'method_not_allowed' })
    }
    try {
      const env = getEnv()
      if (req.method === 'GET') {
        const token = getAdminBearer(req)
        const config = getPublicSupabaseConfig(env)
        const report = await callOwnerRpc(config, token, 'site_admin_activity', {}, fetchImpl)
        return res.status(200).json(report)
      }
      if (!isAllowedOrigin(env, req.headers?.origin, req.socket)) return res.status(403).json({ code: 'origin_not_allowed' })
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) return res.status(415).json({ code: 'unsupported_content_type' })
      const path = readPage(req.body)
      if (!path) return res.status(400).json({ code: 'invalid_page' })
      const config = getServiceSupabaseConfig(env)
      if (config) {
        const result = await fetchImpl(config.url + '/rest/v1/rpc/site_record_page_view', {
          method: 'POST', headers: config.headers, body: JSON.stringify({ page_path: path }),
          redirect: 'error', signal: AbortSignal.timeout(3500),
        })
        if (!result.ok) throw new Error('Counter unavailable')
      }
      return res.status(204).end()
    } catch (err) {
      if (err?.provider === 'supabase' && req.method === 'GET') return res.status(err.status).json({ code: err.code })
      return res.status(503).json({ code: 'service_unavailable' })
    }
  }
}
