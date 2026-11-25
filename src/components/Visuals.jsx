import { useState } from 'react'
import { photosFor } from '../data/site.js'

export function Icon({ name, ...props }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chat: <path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.5-.8L4 20l1.3-4.5a8.6 8.6 0 0 1-.8-3.5 8 8 0 1 1 15.5-.5Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    mark: <><path d="M4 20V8l8-4 8 4v12M9 20V10m6 10V10M4 15h16" /><path d="M2 20h20" /></>,
  }
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>
}

// All imagery stays on the existing local photo pipeline; no remote requests.
export function ProjectImage({ slug = 'swimming-pool-construction', index = 0, fallbackSlug, src, alt, decorative = false, eager = false, className = '', stage }) {
  const source = src || photosFor(slug)[index] || (fallbackSlug && photosFor(fallbackSlug)[index])
  const [failedSource, setFailedSource] = useState(null)
  const kind = /pool|work/.test(slug) ? 'pool' : /tiling|interlock/.test(slug) ? 'paving' : /ceiling|interior/.test(slug) ? 'interior' : 'building'
  const description = alt || `${slug.replaceAll('-', ' ')} project`
  return (
    <div className={`project-image ${className}`} aria-hidden={decorative || undefined}>
      {source && source !== failedSource ? (
        <img src={source} alt={decorative ? '' : description} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" onError={() => setFailedSource(source)} />
      ) : (
        <div className={`scene scene--${kind}${stage ? ` scene--${stage}` : ''}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${description} — illustrative placeholder`}>
          <span className="scene-light" />
          <span className="scene-structure" />
          <span className="scene-surface" />
          <span className="scene-water" />
        </div>
      )}
    </div>
  )
}

export function WaterWave() {
  return (
    <div className="hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path className="water-wave back" d="M-1440 70Q-1260 5-1080 70T-720 70T-360 70T0 70T360 70T720 70T1080 70T1440 70T1800 70T2160 70T2520 70T2880 70V120H-1440Z" />
        <path className="water-wave front" d="M-1440 85Q-1260 40-1080 85T-720 85T-360 85T0 85T360 85T720 85T1080 85T1440 85T1800 85T2160 85T2520 85T2880 85V120H-1440Z" />
      </svg>
    </div>
  )
}
