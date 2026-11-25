import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Drawing from '../components/Drawing.jsx'
import Slider from '../components/Slider.jsx'
import { Seo, ServiceCard, Steps, Cta } from '../components/Parts.jsx'
import { BRAND, SITE, LEGAL, EMAIL, PHONES, MAIN, POOL, OTHER, galleryFor } from '../data/site.js'
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
  const [cap, setCap] = useState({ name: STAGES[0][1], label: 'Stage 1 of 7' })

  useEffect(() => {
    setActive(null)
    const timers = STAGES.map(([sec, name], i) => setTimeout(() => setCap({ name, label: i < STAGES.length - 1 ? `Stage ${i + 1} of ${STAGES.length - 1}` : '' }), sec * 1000))
    return () => timers.forEach(clearTimeout)
  }, [run])

  const hover = (s) => { setCap({ name: s.title, label: s.level }); setActive(s.part) }
  const rows = [MAIN, ...OTHER]

  return (
    <>
      <Seo path="/" title={`Swimming Pool Construction in Nigeria | ${BRAND}`}
        desc="Swimming pool construction and building works in Nigeria. One team for the pool, paving, tiling and finishing, with weekly updates for clients abroad."
        ld={[org]} />
      <div className="w">
        <div className="stage">
          <div>
            <h1>Swimming pools in Nigeria, from foundation to finish</h1>
            <p className="lede">We build swimming pools from the first dig to the first swim, then pave, tile and finish everything around them. Based in Ibadan, building for clients in Nigeria and abroad.</p>
            <div className="row">
              <Link className="btn" to="/contact/">Get a free quote</Link>
              <Link className="btn o" to="/build-from-abroad/">Building from abroad?</Link>
            </div>
            <ul className="sl">
              {rows.map((s) => (
                <li key={s.slug} className={s === MAIN ? 'main' : undefined}>
                  <Link to={`/${s.slug}/`} onMouseEnter={() => hover(s)} onFocus={() => hover(s)}>
                    <b>{s.title}</b><small>{s.level}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <aside className="plate">
            <Drawing key={run} active={active} anim />
            <div className="cap"><span className="cn"><b>{cap.name}</b></span><span className="cl">{cap.label}</span></div>
            <button className="rp" type="button" onClick={() => setRun((n) => n + 1)}>Replay the build</button>
          </aside>
        </div>
      </div>

      <section>
        <div className="w cols">
          <div>
            <h2>Our work</h2>
            <p style={{ marginBottom: 22 }}>Browse recent work, or open any service to see photos of that service. Every page below has its own gallery.</p>
            <Link className="btn" to="/contact/">Plan your pool</Link>
          </div>
          <div id="work"><Slider d={galleryFor('work')} /></div>
        </div>
      </section>

      <section className="alt"><div className="w">
        <h2>Swimming pools</h2>
        <p style={{ maxWidth: '60ch', marginBottom: 26 }}>Pools are our main work. Whatever the size, you get one team, one price in writing and regular updates.</p>
        <div className="grid">{POOL.map((s) => <ServiceCard key={s.slug} slug={s.slug} featured />)}</div>
      </div></section>

      <section><div className="w">
        <h2>Other services</h2>
        <div className="grid">{OTHER.map((s) => <ServiceCard key={s.slug} slug={s.slug} />)}</div>
      </div></section>

      <section className="alt"><div className="w cols">
        <div>
          <h2>Living abroad? Build with confidence.</h2>
          <p style={{ marginBottom: 22 }}>Many of our clients live outside Nigeria. We send weekly photos and videos, tie payments to finished stages, and are on WhatsApp in your time zone.</p>
          <Link className="btn" to="/build-from-abroad/">See how it works</Link>
        </div>
        <div className="ph" role="img" aria-label="Add a photo of a recent pool project">Add a real project photo here</div>
      </div></section>

      <section><div className="w"><h2>How a project works</h2><Steps /></div></section>
      <Cta />
    </>
  )
}
