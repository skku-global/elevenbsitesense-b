// Server-only diagnostics. Never serialize an environment object or raw Error.
const redisVariablePairs = [
  { url: 'UPSTASH_REDIS_REST_URL', token: 'UPSTASH_REDIS_REST_TOKEN' },
  { url: 'KV_REST_API_URL', token: 'KV_REST_API_TOKEN' },
]
const environmentNames = new Set([
  'RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_TO', 'AUTOREPLY',
  ...redisVariablePairs.flatMap(pair => [pair.url, pair.token]), 'CONTACT_ALLOWED_ORIGINS', 'ALLOWED_ORIGINS',
  'VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL',
  'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_PUBLISHABLE_KEY',
])
const configurationReasons = new Set([
  'missing_environment_variables', 'invalid_origin_configuration', 'invalid_preview_origin_configuration',
  'invalid_sender_format', 'sender_domain_not_allowed', 'invalid_destination_address',
  'invalid_journal_configuration', 'journal_write_failed',
])
const diagnosticCodes = new Set([
  'provider_rejected', 'invalid_provider_response', 'provider_timeout', 'provider_unavailable',
  'storage_invalid_response', 'invalid_storage_endpoint', 'missing_environment_variables',
  'storage_http_error', 'storage_command_rejected', 'storage_timeout', 'storage_request_failed',
])

export class ContactConfigurationError extends Error {
  constructor(reason, variables = []) {
    super('Contact configuration unavailable')
    this.name = 'ContactConfigurationError'
    this.reason = reason
    this.variables = variables.filter((name) => environmentNames.has(name))
  }
}

const hasValue = (env, name) => typeof env?.[name] === 'string' && Boolean(env[name].trim())

export function contactRedisVariables(env) {
  // Keep each token paired with its own endpoint, including during a migration.
  return redisVariablePairs.find(pair => hasValue(env, pair.url) && hasValue(env, pair.token))
    ?? redisVariablePairs.find(pair => hasValue(env, pair.url) || hasValue(env, pair.token))
    ?? redisVariablePairs[0]
}

export function missingContactVariables(env, redis = contactRedisVariables(env)) {
  return ['RESEND_API_KEY', redis.url, redis.token].filter(name => !hasValue(env, name))
}
export const contactDiagnosticRedactions = (env) => [...environmentNames].map((name) => env?.[name]).filter((value) => typeof value === 'string' && value.length)

export function redactDiagnosticMessage(message, redactions = []) {
  if (typeof message !== 'string' || !message.trim()) return 'No provider error message returned'
  const variants = new Set()
  for (const value of redactions.flat().filter((value) => typeof value === 'string' && value.length)) {
    for (const part of [value, value.match(/<([^<>]+)>/)?.[1]].filter(Boolean)) {
      variants.add(part)
      try { variants.add(encodeURIComponent(part)) } catch { /* Unpaired Unicode surrogates cannot be URL encoded; keep the other redactions. */ }
      variants.add(JSON.stringify(part).slice(1, -1))
      variants.add(part.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])))
    }
  }
  let text = message
  for (const value of [...variants].sort((a, b) => b.length - a.length)) text = text.replaceAll(value, '[REDACTED]')
  text = text.replace(/\bre_[a-zA-Z0-9_-]{8,}\b/g, '[REDACTED]')
    .replace(/\bBearer\s+[^\s"'<>]+/gi, 'Bearer [REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED]')
  return Array.from(text, (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? ' ' : character).join('').replace(/\s+/g, ' ').trim().slice(0, 500)
}

export function diagnosticDetails(error, redactions = []) {
  if (!error) return {}
  return {
    ...(configurationReasons.has(error.reason) ? { reason: error.reason } : {}),
    ...(diagnosticCodes.has(error.code) ? { code: error.code } : {}),
    ...(['resend', 'upstash', 'supabase'].includes(error.provider) ? { provider: error.provider } : {}),
    ...(Number.isInteger(error.status) ? { status: error.status } : {}),
    ...(Array.isArray(error.variables) && error.variables.length ? { variables: error.variables.filter((name) => environmentNames.has(name)) } : {}),
    ...(error.providerMessage ? { message: redactDiagnosticMessage(error.providerMessage, redactions) } : {}),
  }
}
