import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { GalleryProvider } from './GalleryModal.jsx'
import { BRAND, LEGAL, RC, ADDR, EMAIL, PHONES, WA, POOL, OTHER } from '../data/site.js'

const NAV = [['/swimming-pool-construction/', 'Swimming pools'], ['/services/', 'Other services'], ['/build-from-abroad/', 'Build from abroad'], ['/contact/', 'Contact']]

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

export default function Layout() {
  return (
    <GalleryProvider>
      <ScrollToTop />
      <header>
        <div className="w">
          <Link className="logo" to="/">{BRAND.toUpperCase()}</Link>
          <nav aria-label="Main">
            {NAV.map(([u, t]) => <NavLink key={u} to={u} end>{t}</NavLink>)}
          </nav>
          <Link className="btn" to="/contact/">Get a free quote</Link>
        </div>
      </header>
      <main><Outlet /></main>
      <footer>
        <div className="w">
          <div className="grid">
            <div>
              <h3>{BRAND}</h3>
              <p>We build it better. Swimming pools and building works in Nigeria, managed for clients at home and abroad.</p>
              <p>{ADDR}<br />
                {PHONES.map((p) => <span key={p.number}><a href={`tel:+${p.international}`}>{p.number}</a><br /></span>)}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
              <p>{LEGAL}<br />RC {RC}</p>
            </div>
            <div><h3>Swimming pools</h3><ul>{POOL.map((s) => <li key={s.slug}><Link to={`/${s.slug}/`}>{s.title}</Link></li>)}</ul></div>
            <div><h3>Other services</h3><ul>{OTHER.map((s) => <li key={s.slug}><Link to={`/${s.slug}/`}>{s.title}</Link></li>)}</ul></div>
            <div><h3>Company</h3><ul><li><Link to="/build-from-abroad/">Build from abroad</Link></li><li><Link to="/contact/">Contact</Link></li></ul></div>
          </div>
        </div>
      </footer>
      <a className="wa" href={`https://wa.me/${WA}`}>WhatsApp us</a>
    </GalleryProvider>
  )
}
