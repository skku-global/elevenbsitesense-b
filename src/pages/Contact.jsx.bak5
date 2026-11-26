import { useRef, useState } from 'react'
import { Seo, Hero } from '../components/Parts.jsx'
import { BRAND, MAIN, OTHER, ADDR, EMAIL, PHONES, breadcrumbLd } from '../data/site.js'
import { validateEnquiry, createSubmissionId, readEnquiryResponse } from '../data/enquiry.js'

const crumbs = [['/', 'Home'], ['/contact/', 'Contact']]
const empty = { name: '', email: '', phone: '', service: MAIN.slug, message: '' }

export default function Contact() {
  const [v, setV] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ kind: 'idle', text: '' })
  const attempt = useRef({ body: '', id: '' }) // an unchanged retry reuses its reference

  const set = (k) => (e) => setV((c) => ({ ...c, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const errs = validateEnquiry(v)
    setErrors(errs)
    if (Object.keys(errs).length) { setStatus({ kind: 'error', text: 'Please check the highlighted fields.' }); return }
    const body = JSON.stringify(v)
    if (attempt.current.body !== body) attempt.current = { body, id: createSubmissionId() }
    const id = attempt.current.id
    setStatus({ kind: 'sending', text: 'Sending...' })
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Idempotency-Key': id }, body })
      await readEnquiryResponse(res, id)
      setV(empty); attempt.current = { body: '', id: '' }
      setStatus({ kind: 'ok', text: 'Thank you. We have your enquiry and will reply soon.' })
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors)
      setStatus({ kind: 'error', text: err.userFacing ? err.message : 'We could not send your enquiry. Please call or WhatsApp us.' })
    }
  }

  const field = (k) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `e-${k}` : undefined, value: v[k], onChange: set(k) })
  const err = (k) => errors[k] && <span id={`e-${k}`} style={{ color: '#B3261E', fontWeight: 400 }}>{errors[k]}</span>

  return (
    <>
      <Seo path="/contact/" title={`Contact & Free Quote | ${BRAND}`} desc="Request a free quote for a swimming pool or building project in Nigeria. We reply within one working day." ld={[breadcrumbLd(crumbs)]} />
      <Hero h1="Get a free quote" p="Tell us what you want to build and where. We reply within one working day." crumbs={crumbs} buttons={false} />
      <section className="contact-section"><div className="w cols">
        <form onSubmit={submit} noValidate>
          <label>Your name<input name="name" autoComplete="name" {...field('name')} />{err('name')}</label>
          <label>Email<input type="email" name="email" autoComplete="email" {...field('email')} />{err('email')}</label>
          <label>Phone or WhatsApp (with country code if abroad)<input name="phone" autoComplete="tel" {...field('phone')} />{err('phone')}</label>
          <label>Service
            <select name="service" {...field('service')}>
              {[MAIN, ...OTHER].map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              <option value="not-sure">Multiple services / not sure yet</option>
            </select>{err('service')}
          </label>
          <label>Project details (at least 20 characters)
            <textarea name="message" rows={5} placeholder="Location of the plot, size, and what you have in mind" {...field('message')} />{err('message')}
          </label>
          <button className="btn" type="submit" disabled={status.kind === 'sending'}>Send enquiry</button>
          <p className="msg" role="status" aria-live="polite">{status.text}</p>
        </form>
        <div className="contact-info">
          <h2>Or reach us directly</h2>
          <ul className="tick">
            {PHONES.map((p) => <li key={p.number}><a href={`https://wa.me/${p.international}`}>WhatsApp or call {p.number}</a></li>)}
            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li>{ADDR}</li>
          </ul>
        </div>
      </div></section>
    </>
  )
}
