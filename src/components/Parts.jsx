import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { useGallery } from './GalleryModal.jsx'
import { Icon, ProjectImage, WaterWave } from './Visuals.jsx'
import { SITE, BRAND, WA, bySlug, firstSentence, steps } from '../data/site.js'
import { quotePath } from '../data/serviceOptions.js'

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

export function Hero({ h1, p, crumbs = [], buttons = true, side = null, slug = 'swimming-pool-construction', home = false, imagePhoto, quoteService }) {
  return (
    <div className={`hero${side ? ' two' : ''}${home ? ' hero-home' : ''}`}>
      <ProjectImage src={imagePhoto?.src} alt={imagePhoto?.alt} width={imagePhoto?.width} height={imagePhoto?.height} slug={slug} fallbackSlug={home ? 'work' : 'hero'} decorative={!imagePhoto} eager className="hero-image" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="w">
        <div className="hero-copy">
          {crumbs.length > 0 && <div className="crumb">
            {crumbs.map(([u, t], i) => i < crumbs.length - 1 ? <span key={u}><Link to={u}>{t}</Link> / </span> : <span key={u}>{t}</span>)}
          </div>}
          <h1>{h1}</h1>
          <p>{p}</p>
          {buttons && (
            <div className="row">
              <Link className="btn" to={quotePath(quoteService)}>Get a free quote<Icon name="arrow" /></Link>
              <Link className="btn o" to="/build-from-abroad/">Building from abroad?</Link>
            </div>
          )}
        </div>
        {side}
      </div>
      <WaterWave />
      {imagePhoto?.label && <span className="photo-tag hero-photo-tag">{imagePhoto.label}</span>}
    </div>
  )
}

function ServiceIcon({ slug }) {
  const icons = {
    'swimming-pool-construction': <><path d="M4 18c2-2 4 2 6 0s4 2 6 0 4 2 6 0M4 23c2-2 4 2 6 0s4 2 6 0 4 2 6 0M8 15V6a2 2 0 0 1 4 0v2m5 7V6a2 2 0 0 1 4 0v2M8 10h9M8 14h9" /></>,
    'residential-swimming-pools': <><path d="m4 11 9-7 9 7M7 9v7m12-7v7M4 21c2-2 4 2 6 0s4 2 6 0 4 2 6 0M4 25c2-2 4 2 6 0s4 2 6 0 4 2 6 0M11 16v-5h4v5" /></>,
    'commercial-swimming-pools': <><rect x="4" y="6" width="20" height="17" rx="2" /><path d="M9 6v17M19 6v17M5 14c2-2 4 2 6 0s4 2 6 0 4 2 6 0" /></>,
    'pool-renovation-and-repair': <><path d="m16 4-5 10m-3-1 8 4-3 7-9-4 4-7ZM6 17l8 4M18 21c2-2 4 2 6 0" /></>,
    'general-building-contracting': <><path d="M5 24V8l9-4 9 4v16M3 24h22M10 24v-5h8v5M10 10h1m6 0h1m-8 4h1m6 0h1" /></>,
    'pop-ceiling-installation': <><path d="M4 20V5h20v15M4 9h20M9 9v4h10V9M14 13v4M11 20a3 3 0 0 1 6 0Z" /></>,
    'artwork-and-interior-design': <><path d="M8 16V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v8M8 13H6a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-2M8 13v5h12v-5M7 21v3m14-3v3" /></>,
    'tiling': <><rect x="4" y="4" width="20" height="20" rx="1" /><path d="M4 11h20M4 17h20M11 4v20M17 4v20" /></>,
    'interlock-paving': <><path d="m8 4-5 20M20 4l5 20M14 4v3m0 5v4m0 5v3M6 12h5m6 0h5M4 20h7m6 0h7" /></>,
    'imported-stamped-interlock': <><path d="m8 4-5 20M20 4l5 20M14 7l4 5-4 5-4-5 4-5ZM9 24l5-7 5 7" /></>,
    'painting': <><rect x="4" y="4" width="17" height="7" rx="2" /><path d="M21 7h3v9H14v3" /><rect x="12" y="19" width="4" height="7" rx="1" /></>,
  }
  return <svg className="service-icon" viewBox="0 0 28 28" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[slug]}</svg>
}

export function ServiceCard({ slug }) {
  const openGallery = useGallery()
  const s = bySlug[slug]
  return (
    <Link
      className="card service-card"
      to={`/${slug}/`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
        e.preventDefault()
        openGallery(slug, e.currentTarget)
      }}
    >
      <ServiceIcon slug={slug} />
      <h3>{s.title}</h3>
      <p>{firstSentence(s)}</p>
      <span className="card-link">View gallery<span className="gallery-arrow" aria-hidden="true">→</span></span>
    </Link>
  )
}

export const Faq = ({ faqs }) => faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)

export const Steps = () => (
  <ol className="steps">{steps.map((s) => <li key={s.title}><b>{s.title}</b><span>{s.text}</span></li>)}</ol>
)

export const Cta = ({ heading = 'Tell us what you want to build', quoteService }) => (
  <section className="cta">
    <div className="w">
      <h2>{heading}</h2>
      <p>Send your plot size, location and ideas. You get a reply within one working day, in your time zone.</p>
      <div className="row">
        <Link className="btn" to={quotePath(quoteService)}>Get a free quote<Icon name="arrow" /></Link>
        <a className="btn o" href={`https://wa.me/${WA}`}>Chat on WhatsApp</a>
      </div>
    </div>
  </section>
)

export const Section = ({ alt, children }) => <section className={alt ? 'alt' : undefined}><div className="w">{children}</div></section>
export { BRAND }
