import { useEffect, useRef } from 'react'

const markers = {
  p1: [52, 46],
  p2: [20, 77],
  p3: [81, 19],
  p4: [68, 33],
  p5: [73, 75],
  p6: [47, 85],
  p7: [34, 91],
  p8: [88, 54],
}

const assemblySteps = [
  { part: 'foundation', start: .02, end: .31, x: 0, y: 8 },
  { part: 'ground-floor', start: .14, end: .50, x: 9, y: 8 },
  { part: 'upper-floor', start: .26, end: .67, x: 13, y: -5 },
  { part: 'roof', start: .42, end: .80, x: 6, y: -10 },
  { part: 'pool', start: .57, end: .92, x: -10, y: 4 },
]

function smoothStep(value) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

export default function BuildCutaway({ selectedService, services = [selectedService], onSelect }) {
  const viewRef = useRef(null)
  const animated = Boolean(onSelect)

  useEffect(() => {
    if (!animated || !CSS.supports('clip-path', 'polygon(evenodd, 0 0, 100% 0, 0 100%)')) return
    const view = viewRef.current
    const image = view.querySelector('img')
    const assembly = view.querySelector('.cutaway-assembly')
    const layers = [...assembly.children]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    function update() {
      frame = 0
      if (reducedMotion.matches || !image.complete || !image.naturalWidth) {
        view.removeAttribute('data-assembling')
        return
      }

      const { top } = view.getBoundingClientRect()
      const height = window.innerHeight
      const start = height * .82
      const finish = Math.min(start - 1, Math.max(110, height * .22))
      const progress = Math.min(1, Math.max(0, (start - top) / (start - finish)))
      view.toggleAttribute('data-assembling', progress < 1)
      if (progress >= 1) return

      view.style.setProperty('--cutaway-poster', smoothStep((progress - .88) / .12))
      assembly.style.transform = 'scale(' + (.82 + smoothStep((progress - .57) / .43) * .18) + ')'
      assemblySteps.forEach(({ start: begins, end, x, y }, index) => {
        const remaining = 1 - smoothStep((progress - begins) / (end - begins))
        layers[index].style.transform = 'translate3d(' + (x * remaining) + '%, ' + (y * remaining) + '%, 0)'
      })
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    reducedMotion.addEventListener('change', scheduleUpdate)
    image.addEventListener('load', scheduleUpdate)
    scheduleUpdate()

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      reducedMotion.removeEventListener('change', scheduleUpdate)
      image.removeEventListener('load', scheduleUpdate)
    }
  }, [animated])

  return (
    <>
      {animated && <p className="cutaway-hint"><span className="cutaway-motion-hint">Scroll to assemble. </span>Select a marker to explore.</p>}
      <div ref={viewRef} className="cutaway-view" role="group"
        aria-label={onSelect ? 'Building cutaway service markers' : 'Building cutaway highlighting ' + selectedService.title}>
        <picture>
          <source media="(width < 768px)" srcSet="/images/build-cutaway-mobile.webp" type="image/webp" />
          <img src="/images/build-cutaway.webp" alt="Two-storey house cutaway with a pool, paved terrace and finished rooms" width="1536" height="1024" loading="lazy" decoding="async" />
        </picture>
        {animated && <div className="cutaway-assembly" aria-hidden="true">
          {assemblySteps.map(({ part }) => <div key={part} className={'cutaway-layer cutaway-layer--' + part} />)}
        </div>}
        {services.filter((service) => markers[service.part]).map((service) => {
          const [x, y] = markers[service.part]
          const position = { left: x + '%', top: y + '%' }
          return onSelect ? (
            <button key={service.slug} className="cutaway-marker" type="button" style={position}
              data-service-part={service.part} aria-label={service.title}
              aria-pressed={selectedService === service} onClick={() => onSelect(service)} />
          ) : (
            <span key={service.slug} className="cutaway-marker cutaway-current" style={position}
              data-service-part={service.part} aria-hidden="true" />
          )
        })}
      </div>
    </>
  )
}
