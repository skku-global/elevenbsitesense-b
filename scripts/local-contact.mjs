import { loadEnv } from 'vite'
import { createContactHandler } from '../server/contact-handler.js'
import { createAdminHandler } from '../server/admin-handler.js'
import { createActivityHandler } from '../server/activity-handler.js'

const bodyLimit = 16 * 1024 // Matches the deployed /api/contact limit.

async function readBody(req) {
  if (Number(req.headers['content-length']) > bodyLimit) return null
  const chunks = []
  let size = 0
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length
    if (size > bodyLimit) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, size)
}

function register(server) {
  const { mode, envDir } = server.config
  const env = loadEnv(mode, envDir, ['RESEND_', 'CONTACT_', 'UPSTASH_', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'SUPABASE_', 'AUTOREPLY', 'ALLOWED_ORIGINS', 'VERCEL'])
  env.VERCEL_ENV ||= 'development'
  const options = { getEnv: () => env }
  const handlers = new Map([
    ['/api/contact', createContactHandler(options)],
    ['/api/admin', createAdminHandler(options)],
    ['/api/activity', createActivityHandler(options)],
  ])

  server.middlewares.use(async (req, res, next) => {
    const path = req.url?.split('?', 1)[0]
    const handler = handlers.get(path?.replace(/\/$/, ''))
    if (!handler) return next()

    // The production handler uses Vercel's status().json() response helpers.
    const response = {
      setHeader: (name, value) => res.setHeader(name, value),
      status(code) { res.statusCode = code; return this },
      end() { res.end() },
      json(value) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(value))
      },
    }
    try {
      let body
      if (req.method === 'POST' || req.method === 'PATCH') {
        body = await readBody(req)
        if (body === null) {
          req.resume()
          response.setHeader('Cache-Control', 'no-store')
          return response.status(413).json({ ok: false, code: 'payload_too_large' })
        }
      }
      await handler({ method: req.method, url: req.url, headers: req.headers, socket: req.socket, body }, response)
    } catch {
      if (!res.destroyed && !res.headersSent) {
        response.setHeader('Cache-Control', 'no-store')
        response.status(500).json({ ok: false, code: 'service_unavailable' })
      }
    }
  })
}

export const localContact = {
  name: 'local-contact',
  configureServer: register,
  configurePreviewServer: register,
}
