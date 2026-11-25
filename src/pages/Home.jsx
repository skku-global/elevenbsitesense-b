import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Drawing from '../components/Drawing.jsx'
import Slider from '../components/Slider.jsx'
import { Seo, ServiceCard, Steps, Cta } from '../components/Parts.jsx'
import { Icon, ProjectImage } from '../components/Visuals.jsx'
import { BRAND, SITE, LEGAL, EMAIL, PHONES, MAIN, POOL, OTHER } from '../data/site.js'
import { galleryFor } from '../components/GalleryData.js'
import { content } from '../data/content.js'
import { company } from '../data/company.js'

const STAGES = [[0, 'Excavating the site'], [0.9, 'Pouring the footing'], [1.3, 'Raising the columns'], [2.6, 'Casting the slabs'], [3.4, 'Floors and paving'], [4.2, 'Ceilings and interiors'], [4.8, 'Painting'], [5.7, 'Handed over. Hover a service.']]

const org = {
  '@context': 'https://schema.org', '@type': 'GeneralContractor', name: BRAND, legalName: LEGAL, url: SITE,
  telephone: PHONES[0].number, email: EMAIL, areaServed: 'Nigeria',
  address: { '@type': 'PostalAddress', ...company.postalAddress },
}

export default function Home() {
  const [run, setRun] = useState(0)
  const [active, setActive] = useState(null)
  const [buildStarted, setBuildStarted] = useState(false)
  const [cap, setCap] = useState({ name: STAGES[0][1], label: 'Stage 1 of 7' })
  const buildPanel = useRef(null)
  const activePart = useRef(null)
  const { stats } = content.home

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || !('IntersectionObserver' in window)) { setBuildStarted(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setBuildStarted(true); observer.disconnect() }
    }, { threshold: 0.15 })
    if (buildPanel.current) observer.observe(buildPanel.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!buildStarted) return
    activePart.current = null
    setActive(null)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCap({ name: STAGES[STAGES.length - 1][1], label: '' })
      return
    }
    const timers = STAGES.map(([sec, name], i) => setTimeout(() => {
      if (!activePart.current) setCap({ name, label: i < STAGES.length - 1 ? 'Stage ' + (i + 1) + ' of ' + (STAGES.length - 1) : '' })
    }, sec * 1000))
    return () => timers.forEach(clearTimeout)
  }, [run, buildStarted])

  const hover = (s) => {
    activePart.current = s.part
    setCap({ name: s.title, label: s.level })
    setActive(s.part)
  }
  const rows = [MAIN, ...OTHER]

  return (
    <div className="home-shell">
      <Seo path="/" title={`Swimming Pool Construction in Nigeria | ${BRAND}`}
        desc="Swimming pool construction and building works in Nigeria. One team for the pool, paving, tiling and finishing, with weekly updates for clients abroad."
        ld={[org]} />

      <section className="home-hero" aria-labelledby="home-heading">
        <div className="w home-hero-layout">
          <div className="home-hero-heading home-intro-heading">
            <span className="home-kicker">Ibadan, Nigeria</span>
            <h1 id="home-heading"><span className="home-title-line">Swimming pools and spaces</span>{' '}<span className="home-title-accent"><em>built</em> to last</span></h1>
          </div>
          <div className="home-hero-aside">
            <p className="home-intro-copy">{content.home.heroCopy}</p>
            <div className="home-intro-stats" data-placeholder={stats.placeholder || undefined}>
              <dl className="home-hero-stats">{stats.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
              {stats.placeholder && <p className="home-stats-note">{stats.note}</p>}
            </div>
            <a className="btn home-discover home-intro-button" href="#home-services">Discover more<Icon name="arrow" /></a>
          </div>
        </div>
      </section>


      <figure className="home-photo-band">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/hero-mobile.webp" type="image/webp" />
          <img src="/images/hero-desktop.webp" alt="Swimmer gliding through a clear blue swimming pool" loading="lazy" decoding="async" />
        </picture>
      </figure>

      <section className="home-services" id="home-services" aria-labelledby="home-services-heading">
        <div className="w">
          <div className="home-section-heading">
            <div><span className="home-kicker">From foundation to finish</span><h2 id="home-services-heading">Our services</h2></div>
            <p>Pools are our main work. Whatever the size, you get one team, one price in writing and regular updates.</p>
          </div>
          <div className="grid service-grid">{[...POOL, ...OTHER].map((s) => <ServiceCard key={s.slug} slug={s.slug} />)}</div>
        </div>
      </section>

      <section className="home-build" aria-labelledby="home-build-heading">
        <div className="w">
          <div className="home-section-heading">
            <div><span className="home-kicker">One team. Every detail.</span><h2 id="home-build-heading">How we build</h2></div>
            <p>We build swimming pools from the first dig to the first swim, then pave, tile and finish everything around them. Based in Ibadan, building for clients in Nigeria and abroad.</p>
          </div>
          <div className="stage">
            <aside className="plate" ref={buildPanel}>
              <Drawing key={run + '-' + buildStarted} active={active} anim={buildStarted} />
              <div className="cap"><span className="cn"><b>{cap.name}</b></span><span className="cl">{cap.label}</span></div>
              <button className="rp" type="button" onClick={() => setRun((n) => n + 1)}>Replay the build<Icon name="arrow" /></button>
            </aside>
            <ul className="sl">
              {rows.map((s) => (
                <li key={s.slug} className={[s === MAIN ? 'main' : '', active === s.part ? 'is-active' : ''].filter(Boolean).join(' ')}>
                  <Link to={'/' + s.slug + '/'} onMouseEnter={() => hover(s)} onFocus={() => hover(s)}><b>{s.title}</b><small>{s.level}</small></Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-work" aria-labelledby="home-work-heading">
        <div className="w">
          <div className="home-section-heading">
            <div><span className="home-kicker">Spaces, brought to life</span><h2 id="home-work-heading">Our work</h2></div>
            <div><p>Browse recent work, or open any service to see photos of that service. Every page below has its own gallery.</p><Link className="home-text-link" to="/contact/">Plan your pool<Icon name="arrow" /></Link></div>
          </div>
          <div id="work" className="home-work-gallery"><Slider d={galleryFor('work')} /></div>
        </div>
      </section>

      <section className="home-abroad" aria-labelledby="home-abroad-heading">
        <div className="w cols">
          <ProjectImage slug="swimming-pool-construction" alt="A recent pool project" className="feature-image" />
          <div>
            <span className="home-kicker">At home, wherever you are</span>
            <h2 id="home-abroad-heading">Living abroad? Build with confidence.</h2>
            <p>Many of our clients live outside Nigeria. We send weekly photos and videos, tie payments to finished stages, and are on WhatsApp in your time zone.</p>
            <Link className="btn o" to="/build-from-abroad/">See how it works<Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <section className="home-process" aria-labelledby="home-process-heading">
        <div className="w"><span className="home-kicker">A clear path forward</span><h2 id="home-process-heading">How a project works</h2><Steps /></div>
      </section>
      <Cta />
    </div>
  )
}
