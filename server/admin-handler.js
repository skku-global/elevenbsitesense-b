import { isSubmissionId } from '../src/data/enquiry.js'
import { callOwnerRpc, getAdminBearer, getPublicSupabaseConfig } from './admin-supabase.js'

const statusValues = new Set(['new', 'in_progress', 'closed'])
const bodyLimit = 1024
const reject = (res, status, code) => res.status(status).json({ code })

function statusUpdate(req) {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  if (!raw || Buffer.byteLength(raw) > bodyLimit) return null
  try {
    const body = JSON.parse(raw)
    if (!body || Array.isArray(body) || Object.keys(body).length !== 2) return null
    if (!isSubmissionId(body.id) || !statusValues.has(body.status)) return null
    return { enquiry_id: body.id, new_status: body.status }
  } catch { return null }
}

export function createAdminHandler({ getEnv = () => process.env, fetchImpl = fetch } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('Vary', 'Authorization')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    if (!['GET', 'PATCH'].includes(req.method)) {
      res.setHeader('Allow', 'GET, PATCH')
      return reject(res, 405, 'method_not_allowed')
    }
    try {
      const params = new URL(req.url || '/', 'http://localhost').searchParams
      if (req.method === 'GET' && params.get('action') === 'config') {
        return res.status(200).json(getPublicSupabaseConfig(getEnv()))
      }
      const token = getAdminBearer(req)
      const config = getPublicSupabaseConfig(getEnv())
      if (req.method === 'GET') {
        const value = params.get('page') ?? '1'
        if (!/^[1-9]\d{0,9}$/.test(value) || Number(value) > 2147483647) return reject(res, 400, 'invalid_page')
        const result = await callOwnerRpc(config, token, 'site_admin_inbox', { page_number: Number(value) }, fetchImpl)
        return res.status(200).json(result)
      }
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) return reject(res, 415, 'unsupported_content_type')
      if (Number(req.headers?.['content-length']) > bodyLimit) return reject(res, 413, 'payload_too_large')
      const update = statusUpdate(req)
      if (!update) return reject(res, 400, 'validation_error')
      const result = await callOwnerRpc(config, token, 'site_admin_set_status', update, fetchImpl)
      return res.status(200).json(result)
    } catch (error) {
      if (error?.provider === 'supabase') return reject(res, error.status, error.code)
      return reject(res, 503, 'service_unavailable')
    }
  }
}
