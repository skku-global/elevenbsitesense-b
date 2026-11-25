import Drawing from '../components/Drawing.jsx'
import { Seo, Hero, ServiceCard, Steps, Faq, Cta, Section } from '../components/Parts.jsx'
import { BRAND, SITE, bySlug, POOL, breadcrumbLd, faqLd } from '../data/site.js'

export default function Service({ slug }) {
  const s = bySlug[slug]
  const isPool = s.group === 'pool'
  const first = slug === POOL[0].slug
  const path = `/${slug}/`
  const crumbs = [['/', 'Home'], ...(isPool ? (first ? [] : [[`/${POOL[0].slug}/`, 'Swimming pools']]) : [['/services/', 'Services']]), [path, s.title]]
  const ld = [
    breadcrumbLd(crumbs), faqLd(s.faqs),
    { '@context': 'https://schema.org', '@type': 'Service', name: s.h1, description: s.meta, areaServed: 'Nigeria', provider: { '@type': 'GeneralContractor', name: BRAND, url: SITE } },
  ]
  return (
    <>
      <Seo path={path} title={`${s.h1} | ${BRAND}`} desc={s.meta} ld={ld} />
      <Hero h1={s.h1} p={s.intro} crumbs={crumbs}
        side={<aside className="plate"><Drawing active={s.part} name={s.title} />
          <div className="cap"><span className="cn"><b>{s.title}</b></span><span className="cl">Highlighted in the building</span></div></aside>} />
      <section><div className="w cols">
        <div><h2>What’s included</h2><ul className="tick">{s.includes.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div className="ph" role="img" aria-label={`Add a project photo of ${s.title.toLowerCase()}`}>Add a real project photo here<br />(name the file {slug}.jpg and write a clear alt text)</div>
      </div></section>
      {first && <Section alt><h2>Types of pool we build</h2><div className="grid">{POOL.slice(1).map((c) => <ServiceCard key={c.slug} slug={c.slug} />)}</div></Section>}
      <Section alt><h2>How the work goes</h2><Steps /></Section>
      <Section><h2>Common questions</h2><Faq faqs={s.faqs} /></Section>
      <Section alt><h2>Related services</h2><div className="grid">{s.related.map((r) => <ServiceCard key={r} slug={r} />)}</div></Section>
      <Cta />
    </>
  )
}
