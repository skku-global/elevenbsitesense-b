import { getServiceOption } from './serviceOptions.js'

export const enquiryLimits = Object.freeze({ name: 100, email: 254, phone: 30, message: 3000 })
export const multipleServicesTitle = 'Multiple services / not sure yet'
export const isSubmissionId = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
export const isEmail = (value) => typeof value === 'string' && value.length <= enquiryLimits.email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
const containsControls = (value, allowed = []) => Array.from(value).some((character) => { const code = character.charCodeAt(0); return (code < 32 || code === 127) && !allowed.includes(code) })

export function normalizeEnquiry(input) {
  return Object.fromEntries(['name', 'email', 'phone', 'service', 'message'].map((field) => [field, typeof input?.[field] === 'string' ? input[field].trim().replace(/\r\n?/g, '\n') : '']))
}

export function validateEnquiry(input) {
  const values = normalizeEnquiry(input)
  const errors = {}
  const singleLine = (value) => !containsControls(value)
  if (typeof input?.name !== 'string' || values.name.length < 2 || input.name.length > enquiryLimits.name || !singleLine(input.name)) errors.name = 'Please enter your full name (2–100 characters).'
  if (!isEmail(values.email) || typeof input?.email !== 'string' || input.email.length > enquiryLimits.email || !singleLine(input.email)) errors.email = 'Please enter a valid email address (up to 254 characters).'
  if ((input?.phone !== undefined && typeof input.phone !== 'string') || (values.phone && (input.phone.length > enquiryLimits.phone || !singleLine(input.phone) || !/^[+\d\s().-]+$/.test(values.phone) || !/^\d{7,15}$/.test(values.phone.replace(/\D/g, ''))))) errors.phone = 'Please enter a valid phone number with 7–15 digits.'
  if (typeof input?.service !== 'string' || (!getServiceOption(values.service) && values.service !== 'not-sure')) errors.service = 'Please select a service, or choose “Multiple services / not sure yet”.'
  if (typeof input?.message !== 'string' || values.message.length < 20 || input.message.length > enquiryLimits.message || containsControls(input.message, [9, 10, 13])) errors.message = 'Please describe your project in 20–3000 characters.'
  return errors
}

export const getEnquiryServiceTitle = (slug) => getServiceOption(slug)?.title || multipleServicesTitle

export function createSubmissionId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const submissionMessages = {
  validation_error: 'Please check the highlighted fields so we can send your enquiry.',
  rate_limited: 'You’ve made several requests recently. Please wait a little before trying again, or contact us directly.',
  enquiry_in_progress: 'Your enquiry is being processed. Please wait a moment before trying again.',
  retry_expired: 'We couldn’t confirm the status of this earlier enquiry. Please contact us directly before submitting it again.',
}
const submissionFailure = 'We couldn’t send your enquiry. Your details are still here. Please try again or contact us directly.'

// Require the API's explicit acceptance, including this enquiry's reference.
export async function readEnquiryResponse(response, submissionId) {
  let body
  try {
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Unexpected response')
    body = await response.json()
  } catch {
    const error = new Error(submissionFailure)
    error.userFacing = true
    throw error
  }
  if (response.ok && body?.ok === true && body.status === 'accepted' && body.enquiryId === submissionId) return body
  const error = new Error(submissionMessages[body?.code] || submissionFailure)
  error.userFacing = true
  if (body?.code === 'validation_error' && body.fieldErrors && typeof body.fieldErrors === 'object') {
    error.fieldErrors = Object.fromEntries(Object.entries(body.fieldErrors).filter(([field, message]) => ['name', 'email', 'phone', 'service', 'message'].includes(field) && typeof message === 'string' && message.length <= 200))
  }
  throw error
}
