import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Seo, Hero } from '../components/Parts.jsx'
import { BRAND, services, ADDR, EMAIL, PHONES, breadcrumbLd } from '../data/site.js'
import { getServiceOption } from '../data/serviceOptions.js'
import { company } from '../data/company.js'
import { enquiryLimits, normalizeEnquiry, validateEnquiry, createSubmissionId, readEnquiryResponse } from '../data/enquiry.js'

const crumbs = [['/', 'Home'], ['/contact/', 'Contact']]
const empty = { name: '', email: '', phone: '', service: '', message: '' }

export default function Contact() {
  const [v, setV] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ kind: 'idle', text: '' })
  const [ready, setReady] = useState(false)
  const attempt = useRef(null)
  const sending = useRef(false)
  const editVersion = useRef(0)
  const { search } = useLocation()
  const selected = getServiceOption(new URLSearchParams(search).get('service'))?.slug || ''

  useEffect(() => {
    editVersion.current++
    setV(current => ({ ...current, service: selected }))
    setReady(typeof window.fetch === 'function' && typeof window.crypto?.getRandomValues === 'function')
  }, [selected])

  const set = (k) => (e) => {
    const value = e.target.value
    editVersion.current++
    setV(current => ({ ...current, [k]: value }))
    if (errors[k]) setErrors(current => ({ ...current, [k]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!ready || sending.current) return
    const errs = validateEnquiry(v)
    setErrors(errs)
    if (Object.keys(errs).length) { setStatus({ kind: 'error', text: 'Please check the highlighted fields.' }); return }
    const body = JSON.stringify(normalizeEnquiry(v))
    const submittedVersion = editVersion.current
    sending.current = true
    setStatus({ kind: 'sending', text: 'Sending...' })
    try {
      if (attempt.current?.body !== body) attempt.current = { body, id: createSubmissionId() }
      const { id } = attempt.current
      const res = await fetch(company.contactFormEndpoint, { method: 'POST', mode: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Idempotency-Key': id }, body })
      await readEnquiryResponse(res, id)
      attempt.current = null
      if (submittedVersion === editVersion.current) {
        setV({ ...empty, service: selected })
        setStatus({ kind: 'ok', text: 'Thank you. We have your enquiry and will reply soon.' })
      } else {
        setStatus({ kind: 'ok', text: 'We received your earlier enquiry. Your latest edits are still in the form.' })
      }
    } catch (err) {
      if (err.fieldErrors && submittedVersion === editVersion.current) setErrors(err.fieldErrors)
      setStatus({ kind: 'error', text: err.userFacing ? err.message : 'We could not send your enquiry. Please call or WhatsApp us.' })
    } finally {
      sending.current = false
    }
  }

  const field = (k) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `e-${k}` : undefined, value: v[k], onChange: set(k) })
  const err = (k) => errors[k] && <span id={`e-${k}`} style={{ color: '#B3261E', fontWeight: 400 }}>{errors[k]}</span>

  return (
    <>
      <Seo path="/contact/" title={`Contact & Free Quote | ${BRAND}`} desc="Request a free quote for a swimming pool or building project in Nigeria. We reply within one working day." ld={[breadcrumbLd(crumbs)]} />
      <Hero h1="Get a free quote" p="Tell us what you want to build and where. We reply within one working day." crumbs={crumbs} buttons={false} />
      <section className="contact-section"><div className="w cols">
        <form method="post" action={company.contactFormEndpoint} onSubmit={submit} noValidate>
          <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={enquiryLimits.name} disabled={!ready} {...field('name')} />{err('name')}</label>
          <label>Email<input type="email" name="email" autoComplete="email" required maxLength={enquiryLimits.email} disabled={!ready} {...field('email')} />{err('email')}</label>
          <label>Phone or WhatsApp (with country code if abroad)<input type="tel" name="phone" autoComplete="tel" maxLength={enquiryLimits.phone} disabled={!ready} {...field('phone')} />{err('phone')}</label>
          <label>Service
            <select name="service" required disabled={!ready} {...field('service')}>
              <option value="">Choose a service</option>
              {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              <option value="not-sure">Multiple services / not sure yet</option>
            </select>{err('service')}
          </label>
          <label>Project details (at least 20 characters)
            <textarea name="message" rows={5} required minLength={20} maxLength={enquiryLimits.message} disabled={!ready} placeholder="Location of the plot, size, and what you have in mind" {...field('message')} />{err('message')}
          </label>
          <button className="btn" type="submit" disabled={!ready || status.kind === 'sending'}>Send enquiry</button>
          <p className="msg" role="status" aria-live="polite">{ready ? status.text : <>You can also request a quote by <a href={`tel:+${PHONES[0].international}`}>phone</a>, <a href={`https://wa.me/${PHONES[0].international}`}>WhatsApp</a> or <a href={`mailto:${EMAIL}`}>email</a>.</>}</p>
        </form>
        <div className="contact-info">
          <h2>Or reach us directly</h2>
          <ul className="tick">
            {PHONES.map(p => <li key={p.number}><a href={`tel:+${p.international}`}>Call {p.number}</a> · <a aria-label={`WhatsApp ${p.number}`} href={`https://wa.me/${p.international}`}>WhatsApp</a></li>)}
            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li>{ADDR}</li>
          </ul>
        </div>
      </div></section>
    </>
  )
}
