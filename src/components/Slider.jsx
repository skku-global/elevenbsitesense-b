import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ProjectImage } from './Visuals.jsx'
import { galleryStartIndex } from './galleryModel.js'

function Pic({ d, n, thumb, eagerFirst }) {
  const photo = d.photos?.[n]
  return (
    <div className="gallery-photo">
      <ProjectImage src={thumb ? photo?.thumbnail || d.s[n] : photo?.src || d.s[n]} slug={d.u?.split('/')[1] || 'work'} index={n} alt={photo?.alt || `${d.t} photo ${n + 1}`} width={thumb ? photo?.thumbnailWidth : photo?.width} height={thumb ? photo?.thumbnailHeight : photo?.height} decorative={thumb} eager={eagerFirst && n === 0 && !thumb} />
      {!thumb && photo?.label && <span className="photo-tag">{photo.label}</span>}
    </div>
  )
}

export default function Slider({ d, controlRef, initialIndex = 0, eagerFirst = false, onOpen }) {
  const N = d.s.length || d.n
  const [i, setI] = useState(() => galleryStartIndex(initialIndex, N))
  const [seen, setSeen] = useState(() => new Set([0, galleryStartIndex(initialIndex, N)]))
  const th = useRef(null)
  const x0 = useRef(null)
  const swiped = useRef(false)
  const go = (n) => setI((c) => (c + n + N) % N)
  useImperativeHandle(controlRef, () => ({ go }), [N])

  useEffect(() => {
    setSeen((current) => current.has(i) ? current : new Set([...current, i]))
    const box = th.current
    const b = box && box.children[i]
    if (b) box.scrollLeft = b.offsetLeft - box.clientWidth / 2 + b.clientWidth / 2
  }, [i])

  const range = Array.from({ length: N }, (_, k) => k)
  return (
    <>
      <div
        className="sv" tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`${d.t} photos`}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget && !onOpen) return
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault(); go(e.key === 'ArrowLeft' ? -1 : 1)
            if (e.target !== e.currentTarget) e.currentTarget.focus({ preventScroll: true })
          }
        }}
        onPointerDown={(e) => { x0.current = e.clientX; swiped.current = false }}
        onPointerUp={(e) => {
          if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) { swiped.current = true; go(e.clientX < x0.current ? 1 : -1) }
          x0.current = null
        }}
        onPointerCancel={() => { x0.current = null }}
      >
        {range.map((k) => <div key={k} className={`gs${k === i ? ' on' : ''}`} aria-hidden={k !== i}>
          {(k === i || seen.has(k)) && (onOpen ? (
            <button className="gallery-open-photo" type="button" tabIndex={k === i ? 0 : -1} aria-label={`Enlarge ${d.photos?.[k]?.alt || `${d.t} photo ${k + 1}`}`} onClick={(e) => {
              if (swiped.current) { swiped.current = false; return }
              onOpen(k, e.currentTarget)
            }}><Pic d={d} n={k} eagerFirst={eagerFirst} /></button>
          ) : <Pic d={d} n={k} eagerFirst={eagerFirst} />)}
        </div>)}
        <span className="ct" aria-live="polite" aria-atomic="true">{i + 1} / {N}</span>
        <button type="button" className="bp" aria-label="Previous photo" onClick={() => go(-1)}>&#8249;</button>
        <button type="button" className="bn" aria-label="Next photo" onClick={() => go(1)}>&#8250;</button>
        <div className="dots">{range.map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      </div>
      <div className="th" ref={th}>
        {range.map((k) => (
          <button key={k} type="button" className={k === i ? 'on' : ''} aria-label={d.photos?.[k] ? `${d.photos[k].label}: ${d.photos[k].alt}` : `Show photo ${k + 1}`} aria-pressed={k === i} onClick={(e) => { setI(k); onOpen?.(k, e.currentTarget) }}>
            <Pic d={d} n={k} thumb />
          </button>
        ))}
      </div>
    </>
  )
}
