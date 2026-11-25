import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ProjectImage } from './Visuals.jsx'

function Pic({ d, n, thumb }) {
  return <ProjectImage src={d.s[n]} slug={d.u?.split('/')[1] || 'work'} index={n} alt={`${d.t} photo ${n + 1}`} decorative={thumb} />
}

export default function Slider({ d, controlRef }) {
  const N = d.s.length || d.n
  const [i, setI] = useState(0)
  const th = useRef(null)
  const x0 = useRef(null)
  const go = (n) => setI((c) => (c + n + N) % N)
  useImperativeHandle(controlRef, () => ({ go }), [N])

  useEffect(() => {
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
          if (e.target !== e.currentTarget) return
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); go(e.key === 'ArrowLeft' ? -1 : 1) }
        }}
        onPointerDown={(e) => { x0.current = e.clientX }}
        onPointerUp={(e) => {
          if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) go(e.clientX < x0.current ? 1 : -1)
          x0.current = null
        }}
      >
        {range.map((k) => <div key={k} className={`gs${k === i ? ' on' : ''}`} aria-hidden={k !== i}><Pic d={d} n={k} /></div>)}
        <span className="ct" aria-live="polite" aria-atomic="true">{i + 1} / {N}</span>
        <button type="button" className="bp" aria-label="Previous photo" onClick={() => go(-1)}>&#8249;</button>
        <button type="button" className="bn" aria-label="Next photo" onClick={() => go(1)}>&#8250;</button>
        <div className="dots">{range.map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      </div>
      <div className="th" ref={th}>
        {range.map((k) => (
          <button key={k} type="button" className={k === i ? 'on' : ''} aria-label={`Show photo ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)}>
            <Pic d={d} n={k} thumb />
          </button>
        ))}
      </div>
    </>
  )
}
