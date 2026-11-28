import { useId, useState } from 'react'
import { content } from '../data/content.js'
import { ProjectImage } from './Visuals.jsx'
import renovationBefore from '../assets/images/services/pool-renovation-and-repair/pool-before-renovation.webp'
import renovationAfter from '../assets/images/services/pool-renovation-and-repair/restored-pool.webp'

export function Stats() {
  const { stats } = content.trust
  return (
    <section className="stats-strip" aria-label={stats.heading}>
      <div className="w">
        <div className="stats-intro"><span className="eyebrow">{stats.heading}</span><p>{stats.note}</p></div>
        <dl className="stats-grid">{stats.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      </div>
    </section>
  )
}

export function Testimonials() {
  const { testimonials } = content.trust
  return (
    <section className="testimonials">
      <div className="w">
        <div className="section-heading"><h2>{testimonials.heading}</h2><p>{testimonials.note}</p></div>
        <div className="grid">{testimonials.items.map((item) => (
          <figure className="testimonial-card" key={item.name}>
            <span className="quote-mark" aria-hidden="true">“</span>
            <blockquote>{item.quote}</blockquote>
            <figcaption><span className="client-avatar" aria-hidden="true">{item.initials}</span><span><b>{item.name}</b><small>{item.project}</small></span></figcaption>
          </figure>
        ))}</div>
      </div>
    </section>
  )
}

export function BeforeAfter() {
  const { comparison } = content.trust
  const [position, setPosition] = useState(50)
  const id = useId()
  return (
    <section className="comparison-section">
      <div className="w cols">
        <div className="comparison-copy"><span className="eyebrow">{comparison.eyebrow}</span><h2>{comparison.heading}</h2><p>{comparison.description}</p><p className="placeholder-note">{comparison.note}</p></div>
        <div>
          <div className="comparison" style={{ '--position': `${position}%` }}>
            <ProjectImage src={renovationAfter} slug={comparison.slug} alt={comparison.after.alt} stage="after" />
            <div className="comparison-before"><ProjectImage src={renovationBefore} slug={comparison.slug} alt={comparison.before.alt} stage="before" /></div>
            <span className="comparison-label before">{comparison.before.label}</span><span className="comparison-label after">{comparison.after.label}</span>
            <span className="comparison-divider" aria-hidden="true"><span>‹ ›</span></span>
            <input id={id} type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label={comparison.controlLabel} aria-valuetext={`${position}% before, ${100 - position}% after`} />
          </div>
          <label className="comparison-hint" htmlFor={id}>{comparison.instruction}</label>
        </div>
      </div>
    </section>
  )
}
