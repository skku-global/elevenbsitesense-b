import { useCallback, useEffect, useRef, useState } from 'react'
import { Head } from 'vite-react-ssg'
import { Icon } from '../components/Visuals.jsx'
import { getEnquiryServiceTitle } from '../data/enquiry.js'
import { getServiceOption } from '../data/serviceOptions.js'
import './admin.css'

const inboxUrl = '/api/admin/'
const statuses = { new: 'New', in_progress: 'In progress', closed: 'Closed' }
const deliveryLabels = { pending: 'Pending', sent: 'Accepted by email provider', failed: 'Send failed', skipped: 'Skipped' }
const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' })
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
const count = new Intl.NumberFormat('en-GB')

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', ...options })
  if (!response.ok) {
    const error = new Error('Request failed')
    error.status = response.status
    throw error
  }
  return response.status === 204 ? null : response.json()
}

async function authenticate(config, grant, body) {
  const json = await fetchJson(`${config.url}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    credentials: 'omit',
    headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!json?.access_token || !json.refresh_token) throw new Error('Invalid session')
  const expires = json.expires_at || (Date.now() / 1000 + json.expires_in)
  if (!Number.isFinite(expires)) throw new Error('Invalid expiry')
  return { access: json.access_token, refresh: json.refresh_token, expires: expires * 1000 }
}

function readSession(key) {
  try {
    const session = JSON.parse(window.sessionStorage.getItem(key))
    if (typeof session?.access === 'string' && typeof session.refresh === 'string' && Number.isFinite(session.expires)) return session
  } catch { /* A private tab may disable storage. */ }
  return null
}

function SiteBar({ onSignOut }) {
  return <header className="admin-bar"><div className="admin-width">
    <a href="/" className="admin-brand"><Icon name="mark" /><span>Eleven B<br />Site Sense</span></a>
    <div className="admin-actions"><a href="/">View website <span aria-hidden="true">↗</span></a>
      {onSignOut && <button className="admin-button" onClick={onSignOut}>Sign out</button>}
    </div>
  </div></header>
}

function Login({ config, onLogin, notice, onRetry, unavailable }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!config || busy) return
    const fields = new FormData(event.currentTarget)
    setError('')
    setBusy(true)
    try {
      const session = await authenticate(config, 'password', { email: fields.get('email').trim(), password: fields.get('password') })
      onLogin(session)
    } catch (failure) {
      if (failure.status === 429) setError('Too many sign-in attempts. Please try again later.')
      else if ([400, 401, 403].includes(failure.status)) setError('Check your email address and password and try again.')
      else setError('Could not reach sign-in. Please try again.')
    } finally { setBusy(false) }
  }
  return <><SiteBar /><main className="admin-login">
    <form className="admin-card" method="post" onSubmit={submit}>
      <h1>Owner sign-in</h1>
      <label>Email address<input name="email" type="email" required autoComplete="username" disabled={!config || busy} /></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password" disabled={!config || busy} /></label>
      <button type="submit" className="admin-button admin-primary" disabled={!config || busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      {(error || notice) && <p className="admin-notice" role="alert">{error || notice}</p>}
      {!config && <p role="status">{unavailable ? 'Owner sign-in is temporarily unavailable.' : 'Connecting to sign-in…'}
        {unavailable && <> <button type="button" className="admin-text-button" onClick={onRetry}>Try again</button></>}</p>}
    </form>
  </main></>
}

function Enquiry({ item, disabled, changeStatus }) {
  const when = new Date(item.created_at)
  const time = Number.isFinite(when.getTime()) ? dateTime.format(when) : 'Date unavailable'
  const serviceTitle = getServiceOption(item.service)?.title || (item.service === 'not-sure' ? getEnquiryServiceTitle(item.service) : item.service)
  return <details className="admin-enquiry">
    <summary>
      <span className="admin-enquiry-name"><strong>{item.name}</strong><span>{serviceTitle}</span></span>
      <span className="admin-enquiry-status" data-status={item.status}>{statuses[item.status] || 'Unknown'}</span>
    </summary>
    <div className="admin-enquiry-body">
      <p className="admin-message">{item.message}</p>
      <dl className="admin-facts">
        <div><dt>Received (Lagos time)</dt><dd><time dateTime={item.created_at}>{time}</time></dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${encodeURIComponent(item.email).replace('%40', '@')}`}>{item.email}</a></dd></div>
        {item.phone && <div><dt>Phone</dt><dd><a href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}>{item.phone}</a></dd></div>}
        <div><dt>Email notification</dt><dd>{deliveryLabels[item.delivery_status] || 'Unknown'}</dd></div>
      </dl>
      <label className="admin-status-label">Follow-up status
        <select aria-label={`Follow-up status for ${item.name}`} value={item.status} disabled={disabled} onChange={event => changeStatus(item, event.target.value)}>
          {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  </details>
}

function Traffic({ request, revision }) {
  const [report, setReport] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    request('/api/activity/', { signal: controller.signal }, false).then(data => {
      if (!Array.isArray(data?.days) || !Array.isArray(data.pages)) throw new Error('Invalid report')
      if (!controller.signal.aborted) setReport(data)
    }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [request, revision, retry])
  const days = report?.days || []
  const total = days.reduce((sum, day) => sum + day.views, 0)
  const maximum = Math.max(1, ...days.map(day => day.views))
  return <section className="admin-panel admin-traffic" aria-labelledby="admin-traffic-title">
    <h2 id="admin-traffic-title">Website traffic</h2>
    {error && <p role="status">Traffic could not be refreshed. <button className="admin-text-button" onClick={() => setRetry(x => x + 1)}>Try again</button></p>}
    {!report && !error && <p role="status">Loading page views…</p>}
    {report && <><p className="admin-traffic-total"><strong>{count.format(total)}</strong> page views in the last 7 days</p>
      {total === 0 ? <p>Page views will appear here as people visit the site.</p> : <>
        <ol className="admin-chart" aria-label="Daily page views in UTC">{days.map(day => <li key={day.date}>
          <span>{count.format(day.views)}</span><div className="admin-bar-track" aria-hidden="true"><i style={{ height: `${100 * day.views / maximum}%` }} /></div>
          <time dateTime={day.date} title={day.date}>{weekday.format(new Date(`${day.date}T00:00:00Z`))}</time>
        </li>)}</ol>
        {report.pages.length > 0 && <><h3>Top pages</h3><ul className="admin-pages">{report.pages.map(page =>
          <li key={page.path}><span>{page.path}</span> <strong>{count.format(page.views)}</strong></li>)}</ul></>}
      </>}
    </>}
  </section>
}

function Inbox({ request, signOut }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setFeedback('')
    request(`${inboxUrl}?page=${page}`, { signal: controller.signal }).then(result => {
      if (!Array.isArray(result?.enquiries) || !result.counts || !(result.pageSize > 0)) throw new Error('Invalid inbox')
      if (!controller.signal.aborted) setData(result)
    }).catch(() => {
      if (!controller.signal.aborted) setFeedback('The inbox could not be refreshed. Please try again.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [request, page, revision])

  async function changeStatus(item, status) {
    if (saving || loading) return
    setSaving(true)
    setFeedback('')
    try {
      await request(inboxUrl, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) })
      setRevision(value => value + 1)
    } catch { setFeedback('Could not confirm the status change. Refresh to see the latest status.') }
    finally { setSaving(false) }
  }
  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  return <><SiteBar onSignOut={signOut} /><main className="admin-width admin-dashboard">
    <div className="admin-heading"><h1>Owner dashboard</h1><button className="admin-button" disabled={loading || saving} onClick={() => setRevision(value => value + 1)}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {feedback && <p className="admin-notice" role="alert">{feedback}</p>}
    {!data && loading && <p role="status">Opening your inbox…</p>}
    {data && <>
      <dl className="admin-counts" aria-label="Enquiry overview">
        {[['All enquiries', data.total], ...Object.entries(statuses).map(([key, label]) => [label, data.counts[key]])].map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd>{count.format(value)}</dd></div>)}
      </dl>
      <div className="admin-columns">
        <section className="admin-panel" aria-labelledby="admin-inbox-title"><h2 id="admin-inbox-title">Enquiry inbox</h2>
          {data.enquiries.length === 0 ? <p>Your inbox is empty. New contact form enquiries will appear here.</p> : <div className="admin-list" aria-busy={loading || saving}>
            {data.enquiries.map(item => <Enquiry key={item.id} item={item} disabled={loading || saving} changeStatus={changeStatus} />)}
          </div>}
          {lastPage > 1 && <div className="admin-paging" aria-label="Enquiry pages">
            <button className="admin-button" disabled={loading || saving || data.page <= 1} onClick={() => setPage(data.page - 1)}>Previous</button>
            <span aria-live="polite">Page {data.page} of {lastPage}</span>
            <button className="admin-button" disabled={loading || saving || data.page >= lastPage} onClick={() => setPage(data.page + 1)}>Next</button>
          </div>}
        </section>
        <Traffic request={request} revision={revision} />
      </div>
    </>}
  </main></>
}

function OwnerPortal({ config }) {
  const storageKey = `elevenb-owner-session:${config.url}`
  const [session, setSession] = useState(() => readSession(storageKey))
  const [notice, setNotice] = useState('')
  const current = useRef(session)
  const generation = useRef(0)
  const refreshing = useRef(null)
  const remember = useCallback(next => {
    if (!next || !current.current) generation.current++
    current.current = next
    setSession(next)
    try {
      if (next) window.sessionStorage.setItem(storageKey, JSON.stringify(next))
      else window.sessionStorage.removeItem(storageKey)
    } catch { /* Sign-in still works in memory when storage is unavailable. */ }
  }, [storageKey])

  const refresh = useCallback(async previous => {
    if (refreshing.current?.session === previous) return refreshing.current.promise
    const promise = authenticate(config, 'refresh_token', { refresh_token: previous.refresh }).then(next => {
      if (current.current !== previous) throw new Error('Session changed')
      remember(next)
      return next
    }).catch(error => {
      if (current.current === previous && [400, 401, 403].includes(error.status)) {
        remember(null)
        setNotice('Your session expired. Please sign in again.')
      }
      throw error
    }).finally(() => { if (refreshing.current?.session === previous) refreshing.current = null })
    refreshing.current = { session: previous, promise }
    return promise
  }, [config, remember])

  const request = useCallback(async (url, options = {}, signOutOnDenial = true) => {
    const started = generation.current
    let active = current.current
    if (!active) throw new Error('Signed out')
    if (active.expires < Date.now() + 30000) active = await refresh(active)
    const send = token => fetchJson(url, { ...options, mode: 'same-origin', headers: { ...options.headers, Authorization: `Bearer ${token}` } })
    try { return await send(active.access) }
    catch (first) {
      let error = first
      if (first.status === 401 && current.current && generation.current === started) {
        active = current.current === active ? await refresh(active) : current.current
        try { return await send(active.access) } catch (retryError) { error = retryError }
      }
      if (signOutOnDenial && [401, 403].includes(error.status) && current.current === active && generation.current === started) {
        remember(null)
        setNotice(error.status === 403 ? 'This account does not have owner access.' : 'Your session expired. Please sign in again.')
      }
      throw error
    }
  }, [remember, refresh])

  function signOut() {
    const token = current.current?.access
    remember(null)
    setNotice('Signed out of this tab.')
    if (token) fetch(`${config.url}/auth/v1/logout?scope=local`, {
      method: 'POST', credentials: 'omit', redirect: 'error', headers: { apikey: config.publishableKey, Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  return session ? <Inbox request={request} signOut={signOut} /> : <Login config={config} notice={notice} onLogin={next => { setNotice(''); remember(next) }} />
}

export default function AdminPage() {
  const [config, setConfig] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setFailed(false)
    fetchJson(`${inboxUrl}?action=config`, { signal: controller.signal, mode: 'same-origin' }).then(value => {
      if (!value?.url || !value.publishableKey) throw new Error('Unavailable')
      if (!controller.signal.aborted) setConfig({ ...value, url: value.url.replace(/\/$/, '') })
    }).catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [attempt])
  return <div className="admin-shell">
    <Head><title>Owner dashboard | Eleven B Site Sense</title><meta name="robots" content="noindex, nofollow" /></Head>
    {config ? <OwnerPortal config={config} /> : <Login unavailable={failed} onRetry={() => setAttempt(value => value + 1)} />}
  </div>
}
