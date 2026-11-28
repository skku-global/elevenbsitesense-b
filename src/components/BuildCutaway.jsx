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

export default function BuildCutaway({ selectedService, services = [selectedService], onSelect }) {
  return (
    <>
      {onSelect && <p className="cutaway-hint">Select a marker to explore the build</p>}
      <div className="cutaway-view" role="group"
        aria-label={onSelect ? 'Building cutaway service markers' : 'Building cutaway highlighting ' + selectedService.title}>
        <picture>
          <source media="(width < 768px)" srcSet="/images/build-cutaway-mobile.webp" type="image/webp" />
          <img src="/images/build-cutaway.webp" alt="Two-storey house cutaway with a pool, paved terrace and finished rooms" width="1536" height="1024" loading="lazy" decoding="async" />
        </picture>
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
