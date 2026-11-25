import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Slider from './Slider.jsx'
import { galleryFor } from './GalleryData.js'

const Ctx = createContext(() => {})
export const useGallery = () => useContext(Ctx)

export function GalleryProvider({ children }) {
  const [slug, setSlug] = useState(null)
  const [initialIndex, setInitialIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const busy = useRef(false)
  const last = useRef(null)
  const panel = useRef(null)
  const control = useRef(null)

  const openGallery = useCallback((k, from, index = 0) => {
    if (busy.current) return
    last.current = from || document.activeElement
    setSlug(k)
    setInitialIndex(index)
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => { setOpen(true); setTimeout(() => panel.current?.focus(), 150) }))
  }, [])

  const close = useCallback(() => {
    if (!open) return
    setOpen(false)
    busy.current = true
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400
    setTimeout(() => { setMounted(false); busy.current = false }, delay)
  }, [open])

  useEffect(() => {
    document.documentElement.style.overflow = mounted ? 'hidden' : ''
    if (!mounted) last.current?.focus?.({ preventScroll: true })
    return () => { document.documentElement.style.overflow = '' }
  }, [mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') control.current?.go(1)
      else if (e.key === 'ArrowLeft') control.current?.go(-1)
      else if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('a[href],button,[tabindex="0"]')
        const a = f[0], z = f[f.length - 1]
        if (e.shiftKey && (document.activeElement === a || document.activeElement === panel.current)) { e.preventDefault(); z.focus() }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const d = slug ? galleryFor(slug) : null
  return (
    <Ctx.Provider value={openGallery}>
      <div inert={mounted ? true : undefined}>{children}</div>
      {mounted && d && (
        <div className={`gm${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
          <div className="gm-bg" onClick={close} />
          <div className="gm-panel" role="dialog" aria-modal="true" aria-labelledby="gm-t" tabIndex={-1} ref={panel}>
            <div className="gm-h">
              <div><small>Service gallery</small><h2 id="gm-t">{d.t}</h2></div>
              <button className="gm-x" type="button" aria-label="Close gallery" onClick={close}>&times;</button>
            </div>
            <div className="gm-b">
              <div className="gm-s"><Slider key={slug} d={d} initialIndex={initialIndex} eagerFirst controlRef={control} /></div>
              <div className="gm-i">
                <p className="gm-l">{d.d}</p>
                <ul className="tick">{d.i.map((x) => <li key={x}>{x}</li>)}</ul>
                <div className="row">
                  <Link className="btn" to="/contact/" onClick={close}>Enquire about this service</Link>
                  <Link className="btn o" to={d.u} onClick={close}>Full service page</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
