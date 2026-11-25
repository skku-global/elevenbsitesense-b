import { createHash, createHmac, randomUUID } from 'node:crypto'
import { isIP } from 'node:net'
import { ipAddress } from '@vercel/functions'
import { normalizeEnquiry, validateEnquiry, getEnquiryServiceTitle, isSubmissionId, isEmail } from '../src/data/enquiry.js'
import { createContactStore } from './contact-store.js'
import { createMailSender, notificationEmail, acknowledgementEmail, defaultContactFrom, defaultContactTo } from './contact-mail.js'
import { ContactConfigurationError, missingContactVariables, contactDiagnosticRedactions, diagnosticDetails } from './contact-diagnostics.js'

const productionOrigins = ['https://elevenbsitesense.com', 'https://www.elevenbsitesense.com', 'https://elevenbsitesense.vercel.app']
const projectPreviewPattern = 'https://elevenbsitesense11-*-adewalepolicy75-uxs-projects.vercel.app'
const projectPreviewOrigin = /^https:\/\/elevenbsitesense11-[a-z0-9]+(?:-[a-z0-9]+)*-adewalepolicy75-uxs-projects\.vercel\.app$/
const gitMainOrigin = 'https://elevenbsitesense11-git-main-adewalepolicy75-uxs-projects.vercel.app'
const payloadLimit = 16 * 1024
const allowedFields = new Set(['name', 'email', 'phone', 'service', 'message', 'company_website', 'serviceTitle', 'source'])
const header = (req, name) => typeof req.headers?.[name] === 'string' ? req.headers[name] : ''

export function allowedOrigins(env) {
  const result = new Set(productionOrigins)
  const settings = [
    ['ALLOWED_ORIGINS', env.ALLOWED_ORIGINS || `${projectPreviewPattern},${gitMainOrigin}`],
    ['CONTACT_ALLOWED_ORIGINS', env.CONTACT_ALLOWED_ORIGINS || ''],
  ]
  for (const [name, list] of settings) {
    if (typeof list !== 'string') throw new ContactConfigurationError('invalid_origin_configuration', [name])
    for (const value of list.split(',').map((origin) => origin.trim()).filter(Boolean)) {
      // Only this project's approved pattern is supported, and only in Preview.
      if (name === 'ALLOWED_ORIGINS' && value === projectPreviewPattern) {
        if (env.VERCEL_ENV === 'preview') result.add(value)
        continue
      }
      try {
        const url = new URL(value)
        if (value.includes('*') || url.protocol !== 'https:' || url.origin !== value) throw new Error('Invalid origin configuration')
        result.add(value)
      } catch { throw new ContactConfigurationError('invalid_origin_configuration', [name]) }
    }
  }
  if (env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'production') {
    for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL']) {
      if (!env[name]) continue
      const value = `https://${env[name]}`
      // A git-main or deployment URL can serve a Production build. Add only
      // that build's exact, project-scoped runtime URL; never a production glob.
      if (env.VERCEL_ENV === 'production' && !projectPreviewOrigin.test(value)) continue
      try {
        const url = new URL(value)
        if (url.hostname.endsWith('.vercel.app') && url.origin === value) result.add(url.origin)
      } catch { throw new ContactConfigurationError('invalid_preview_origin_configuration', [name]) }
    }
  }
  if (env.VERCEL_ENV === 'development' || (!env.VERCEL_ENV && env.NODE_ENV === 'development')) {
    for (const host of ['localhost', '127.0.0.1']) for (const port of [3000, 5173, 4173, 4183]) result.add(`http://${host}:${port}`)
  }
  return result
}

export function isAllowedOrigin(env, origin) {
  const origins = allowedOrigins(env)
  if (typeof origin !== 'string' || origin.includes('*')) return false
  try {
    // Require a canonical origin, without credentials, paths, whitespace, or ports hidden by URL normalization.
    const url = new URL(origin)
    return url.origin === origin && (origins.has(origin) || (origins.has(projectPreviewPattern) && projectPreviewOrigin.test(origin)))
  } catch { return false }
}

function clientAddress(req, env) {
  // Use Vercel's documented client-IP helper. Other runtimes use the socket.
  const forwarded = env.VERCEL === '1' ? ipAddress(new Headers({ 'x-real-ip': header(req, 'x-real-ip') })) || '' : ''
  return isIP(forwarded) ? forwarded : req.socket?.remoteAddress || 'unknown'
}

const fingerprint = (values) => createHash('sha256').update(JSON.stringify(values)).digest('hex')
const acceptance = (res, id) => res.status(200).json({ ok: true, status: 'accepted', enquiryId: id })
const rejection = (res, status, code, extra = {}) => res.status(status).json({ ok: false, code, ...extra })

export function createContactHandler({ getEnv = () => process.env, fetchImpl = fetch, schedule, logger = console, now = Date.now } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return rejection(res, 405, 'method_not_allowed') }

    let env
    try {
      env = getEnv()
      if (!isAllowedOrigin(env, header(req, 'origin'))) return rejection(res, 403, 'origin_not_allowed')
    } catch (error) {
      logger.error('contact_configuration_error', error instanceof ContactConfigurationError ? diagnosticDetails(error) : { reason: 'environment_access_failed' })
      return rejection(res, 503, 'service_unavailable')
    }
    if (!/^application\/json(?:\s*;|$)/i.test(header(req, 'content-type'))) return rejection(res, 415, 'unsupported_content_type')
    if (Number(header(req, 'content-length')) > payloadLimit) return rejection(res, 413, 'payload_too_large')

    let body
    try {
      const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      if (typeof raw !== 'string') return rejection(res, 400, 'validation_error')
      if (Buffer.byteLength(raw, 'utf8') > payloadLimit) return rejection(res, 413, 'payload_too_large')
      body = JSON.parse(raw)
      if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).some((field) => !allowedFields.has(field))) return rejection(res, 400, 'validation_error')
    } catch { return rejection(res, 400, 'validation_error') }

    const id = header(req, 'idempotency-key').toLowerCase()
    if (!isSubmissionId(id)) return rejection(res, 400, 'invalid_submission_reference')
    if (typeof body.company_website === 'string' && body.company_website.trim()) return acceptance(res, id)
    if (body.company_website !== undefined && typeof body.company_website !== 'string') return rejection(res, 400, 'validation_error')
    const fieldErrors = validateEnquiry(body)
    if (Object.keys(fieldErrors).length) return rejection(res, 400, 'validation_error', { fieldErrors })

    const values = normalizeEnquiry(body)
    const redactions = [...contactDiagnosticRedactions(env), ...Object.values(values), defaultContactFrom, defaultContactTo]
    let store, send, from, to
    try {
      const missing = missingContactVariables(env)
      if (missing.length) throw new ContactConfigurationError('missing_environment_variables', missing)
      from = env.CONTACT_FROM || defaultContactFrom
      to = env.CONTACT_TO || defaultContactTo
      const fromEmail = from.match(/<([^<>]+)>$/)?.[1]
      if (/[\r\n]/.test(from) || !isEmail(fromEmail)) throw new ContactConfigurationError('invalid_sender_format', ['CONTACT_FROM'])
      if (!fromEmail.endsWith('@elevenbsitesense.com')) throw new ContactConfigurationError('sender_domain_not_allowed', ['CONTACT_FROM'])
      if (!isEmail(to)) throw new ContactConfigurationError('invalid_destination_address', ['CONTACT_TO'])
      store = createContactStore({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN, fetchImpl })
      send = createMailSender({ key: env.RESEND_API_KEY, fetchImpl, redactions })
    } catch (error) {
      logger.error('contact_configuration_error', { enquiryId: id, ...diagnosticDetails(error, redactions) })
      return rejection(res, 503, 'service_unavailable')
    }

    const serviceTitle = getEnquiryServiceTitle(values.service)
    const owner = randomUUID()
    const safeLog = (event, error) => logger.error(event, { enquiryId: id, ...diagnosticDetails(error, redactions) })
    let reservation
    try {
      reservation = await store.reserve({ id, owner, fingerprint: fingerprint(values), now: now(), autoreply: env.AUTOREPLY === 'true', ipHash: createHmac('sha256', env.UPSTASH_REDIS_REST_TOKEN).update(clientAddress(req, env)).digest('hex') })
    } catch (error) { safeLog('contact_storage_unavailable', error); return rejection(res, 503, 'service_unavailable') }
    if (reservation.code === 'completed') {
      if (reservation.acknowledgementExpired) safeLog('contact_acknowledgement_retry_expired')
      return acceptance(res, id)
    }
    if (reservation.code !== 'ready') {
      if (reservation.retryAfter) res.setHeader('Retry-After', String(reservation.retryAfter))
      return rejection(res, reservation.code === 'rate_limited' ? 429 : 409, reservation.code)
    }

    const update = async (patch) => {
      try { return await store.update(id, owner, patch) }
      catch (error) { safeLog('contact_receipt_update_failed', error); return false }
    }
    const record = reservation.record
    if (record.notification !== 'sent') {
      try {
        await send({ from, to: [to], reply_to: values.email, ...notificationEmail(values, serviceTitle, id) }, `contact/${id}/notification`)
      } catch (error) {
        safeLog('contact_notification_failed', error)
        await update({ release: true })
        return rejection(res, 502, 'notification_unavailable')
      }
      if (!await update({ notification: 'sent' })) {
        // Resend has accepted the required message. Skip optional work when its
        // receipt cannot be committed; the provider key protects recovery retries.
        return acceptance(res, id)
      }
    }

    if (record.acknowledgement === 'pending' && env.AUTOREPLY === 'true') {
      const acknowledgement = (async () => {
        let state = 'sent'
        try {
          await send({ from, to: [values.email], reply_to: to, ...acknowledgementEmail(values, serviceTitle) }, `contact/${id}/acknowledgement`)
        } catch (error) { state = 'failed'; safeLog('contact_acknowledgement_failed', error) }
        await update({ acknowledgement: state, release: true })
      })()
      if (schedule) {
        // Register Vercel's background lifetime before ending the HTTP response.
        try { schedule(acknowledgement) }
        catch { safeLog('contact_background_schedule_failed'); await acknowledgement }
      } else await acknowledgement
    } else await update({ acknowledgement: record.acknowledgement === 'pending' ? 'disabled' : record.acknowledgement, release: true })
    return acceptance(res, id)
  }
}
