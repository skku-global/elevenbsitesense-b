import { useEffect, useImperativeHandle, useRef, useState } from 'react'

function Pic({ d, n, thumb }) {
  if (d.s[n]) return <img src={d.s[n]} alt={`${d.t} photo ${n + 1}`} loading="lazy" />
  return (
    <div className="ph2" style={{ '--h': (d.h + n * 23) % 360 }}>
      {!thumb && <span>Project photo {n + 1}<br /><small>Replace with a real image</small></span>}
    </div>
  )
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
        onPointerDown={(e) => { x0.current = e.clientX }}
        onPointerUp={(e) => {
          if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) go(e.clientX < x0.current ? 1 : -1)
          x0.current = null
        }}
      >
        {range.map((k) => <div key={k} className={`gs${k === i ? ' on' : ''}`}><Pic d={d} n={k} /></div>)}
        <span className="ct">{i + 1} / {N}</span>
        <button type="button" className="bp" aria-label="Previous photo" onClick={() => go(-1)}>&#8249;</button>
        <button type="button" className="bn" aria-label="Next photo" onClick={() => go(1)}>&#8250;</button>
        <div className="dots">{range.map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      </div>
      <div className="th" ref={th}>
        {range.map((k) => (
          <button key={k} type="button" className={k === i ? 'on' : ''} aria-label={`Show photo ${k + 1}`} onClick={() => setI(k)}>
            <Pic d={d} n={k} thumb />
          </button>
        ))}
      </div>
    </>
  )
}
