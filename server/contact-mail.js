import { company } from '../src/data/company.js'
import { redactDiagnosticMessage } from './contact-diagnostics.js'

export const companyEmailName = 'Eleven B Site-Sense Nigeria Limited'
export const defaultContactFrom = 'Eleven B Site-Sense <info@elevenbsitesense.com>'
export const defaultContactTo = 'info@elevenbsitesense.com'

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))

function emailLayout({ preheader, eyebrow, title, content }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f3ee;color:#162d3e;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ee"><tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border:1px solid #e3e4de;background:#ffffff">
<tr><td style="height:4px;background:#bc9c67;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 30px;background:#162d3e">
<p style="margin:0;font-size:18px;line-height:1.5;letter-spacing:1.5px;font-weight:bold;color:#ffffff">ELEVEN B SITE SENSE</p>
<p style="margin:7px 0 0;font-size:10px;line-height:1.7;letter-spacing:2px;color:#dfc394">WE BUILD IT BETTER.</p>
</td></tr>
<tr><td style="padding:34px 30px 30px">
<p style="margin:0 0 14px;font-size:10px;line-height:1.7;letter-spacing:1.8px;color:#86652f;font-weight:bold">${escapeHtml(eyebrow)}</p>
<h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;font-weight:normal;color:#162d3e">${escapeHtml(title)}</h1>
${content}
</td></tr>
<tr><td style="padding:24px 30px;border-top:1px solid #e3e4de;background:#fcfbf8">
<p style="margin:0;font-size:12px;line-height:1.8;color:#162d3e">${escapeHtml(companyEmailName)}</p>
<p style="margin:6px 0 0;font-size:12px;line-height:1.8"><a href="${company.websiteUrl}" style="color:#86652f;text-decoration:none">elevenbsitesense.com</a><br><a href="mailto:${company.email}" style="color:#647078;text-decoration:none">${company.email}</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

export function notificationEmail(values, serviceTitle, id) {
  const row = (label, value) => `<tr><td style="padding:10px 0;width:90px;vertical-align:top;border-bottom:1px solid #e3e4de;font-size:13px;color:#647078">${label}</td><td style="padding:10px 0;border-bottom:1px solid #e3e4de;font-size:14px;line-height:1.7;overflow-wrap:anywhere;color:#162d3e">${escapeHtml(value)}</td></tr>`
  return {
    subject: `New enquiry: ${serviceTitle} - ${values.name}`,
    html: emailLayout({
      preheader: `A new ${serviceTitle} enquiry from ${values.name}.`,
      eyebrow: 'NEW WEBSITE ENQUIRY', title: 'A new project conversation.',
      content: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row('Service', serviceTitle)}${row('Name', values.name)}${row('Email', values.email)}${row('Phone', values.phone || 'Not supplied')}</table>
<p style="margin:24px 0 10px;font-size:11px;letter-spacing:1.2px;font-weight:bold;color:#86652f">PROJECT DETAILS</p>
<div style="padding:18px;background:#f5f3ee;font-size:15px;line-height:1.8;color:#162d3e;overflow-wrap:anywhere">${escapeHtml(values.message).replace(/\n/g, '<br>')}</div>
<p style="margin:22px 0 0;font-size:13px;line-height:1.8;color:#647078">Reply to this email to contact the customer directly.</p>
<p style="margin:12px 0 0;font-size:11px;line-height:1.8;color:#647078">Enquiry reference: ${escapeHtml(id)}</p>`,
    }),
    text: `New website enquiry\n\nService: ${serviceTitle}\nName: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone || 'Not supplied'}\n\nProject details:\n${values.message}\n\nReply to this email to contact the customer directly.\nEnquiry reference: ${id}\n\n${companyEmailName}\n${company.websiteUrl}\n`,
  }
}

export function acknowledgementEmail(values, serviceTitle) {
  const firstName = escapeHtml(values.name.split(/\s+/)[0])
  return {
    subject: 'We received your enquiry - Eleven B Site-Sense',
    html: emailLayout({
      preheader: 'Thank you for your enquiry. Our team will review your message and respond.',
      eyebrow: 'YOUR NEXT PROJECT', title: 'Your enquiry is in good hands.',
      content: `<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#162d3e">Hello ${firstName},</p>
<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#647078">Thank you for contacting ${escapeHtml(companyEmailName)}. We have received your enquiry.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:18px 20px;background:#f5f3ee;border-left:3px solid #bc9c67"><p style="margin:0 0 5px;font-size:10px;line-height:1.7;letter-spacing:1.2px;color:#86652f">YOUR SELECTED SERVICE</p><p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.5;color:#162d3e">${escapeHtml(serviceTitle)}</p></td></tr></table>
<p style="margin:22px 0 18px;font-size:16px;line-height:1.8;color:#647078">Our team will review your message and respond using the contact details you provided.</p>
<p style="margin:0;font-size:14px;line-height:1.8;color:#647078">If you would like to add drawings, photos, or more details, simply reply to this email.</p>
<p style="margin:26px 0 0;font-size:15px;line-height:1.8;color:#162d3e">We look forward to discussing your project.<br><strong>The Eleven B Site-Sense team</strong></p>`,
    }),
    text: `Hello ${values.name.split(/\s+/)[0]},\n\nThank you for contacting ${companyEmailName}. We have received your enquiry.\n\nSelected service: ${serviceTitle}\n\nOur team will review your message and respond using the contact details you provided.\n\nIf you would like to add drawings, photos, or more details, simply reply to this email.\n\nWe look forward to discussing your project.\nThe Eleven B Site-Sense team\n\n${company.websiteUrl}\n${company.email}\n`,
    headers: { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All' },
  }
}

export class ContactMailError extends Error {
  constructor(code, status, providerMessage) {
    super('Email provider unavailable')
    this.name = 'ContactMailError'
    this.code = code
    this.status = status
    this.provider = 'resend'
    this.providerMessage = providerMessage
  }
}

export function createMailSender({ key, fetchImpl = fetch, timeoutMs = 7000, redactions = [] }) {
  return async (payload, idempotencyKey) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        let providerMessage = 'Resend returned a non-JSON error response'
        try { const body = await response.json(); providerMessage = body?.message || 'Resend returned no error message' } catch { /* Preserve the HTTP status without logging an arbitrary response body. */ }
        throw new ContactMailError('provider_rejected', response.status, redactDiagnosticMessage(providerMessage, [key, payload.from, payload.to, payload.reply_to, ...redactions]))
      }
      const body = await response.json()
      if (typeof body?.id !== 'string' || !body.id.trim()) throw new ContactMailError('invalid_provider_response')
    } catch (error) {
      if (error instanceof ContactMailError) throw error
      throw new ContactMailError(controller.signal.aborted ? 'provider_timeout' : 'provider_unavailable')
    } finally { clearTimeout(timer) }
  }
}
