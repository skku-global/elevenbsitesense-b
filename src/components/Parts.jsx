import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { useGallery } from './GalleryModal.jsx'
import { SITE, BRAND, WA, bySlug, firstSentence, steps } from '../data/site.js'

export function Seo({ path, title, desc, ld = [] }) {
  const url = SITE + path
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${SITE}/og.jpg`} />
      {ld.map((x, i) => <script key={i} type="application/ld+json">{JSON.stringify(x)}</script>)}
    </Head>
  )
}

export function Hero({ h1, p, crumbs, buttons = true, side = null }) {
  return (
    <div className={`hero${side ? ' two' : ''}`}>
      <div className="w">
        <div>
          <div className="crumb">
            {crumbs.map(([u, t], i) => i < crumbs.length - 1 ? <span key={u}><Link to={u}>{t}</Link> / </span> : <span key={u}>{t}</span>)}
          </div>
          <h1>{h1}</h1>
          <p>{p}</p>
          {buttons && (
            <div className="row">
              <Link className="btn" to="/contact/">Get a free quote</Link>
              <Link className="btn o" to="/build-from-abroad/">Building from abroad?</Link>
            </div>
          )}
        </div>
        {side}
      </div>
    </div>
  )
}

export function ServiceCard({ slug, featured = false }) {
  const openGallery = useGallery()
  const s = bySlug[slug]
  return (
    <Link
      className={`card${featured ? ' f' : ''}`}
      to={`/${slug}/`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
        e.preventDefault()
        openGallery(slug, e.currentTarget)
      }}
    >
      <h3>{s.title}</h3>
      <p>{firstSentence(s)}</p>
      <span>View gallery</span>
    </Link>
  )
}

export const Faq = ({ faqs }) => faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)

export const Steps = () => (
  <ol className="steps">{steps.map((s) => <li key={s.title}><b>{s.title}</b><span>{s.text}</span></li>)}</ol>
)

export const Cta = ({ heading = 'Tell us what you want to build' }) => (
  <section className="cta">
    <div className="w">
      <h2>{heading}</h2>
      <p>Send your plot size, location and ideas. You get a reply within one working day, in your time zone.</p>
      <div className="row">
        <Link className="btn" to="/contact/">Get a free quote</Link>
        <a className="btn o" href={`https://wa.me/${WA}`}>Chat on WhatsApp</a>
      </div>
    </div>
  </section>
)

export const Section = ({ alt, children }) => <section className={alt ? 'alt' : undefined}><div className="w">{children}</div></section>
export { BRAND }
