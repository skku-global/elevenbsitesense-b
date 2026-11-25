import { Seo, Hero, ServiceCard, Cta, Section } from '../components/Parts.jsx'
import { BRAND, POOL, OTHER, breadcrumbLd } from '../data/site.js'

const crumbs = [['/', 'Home'], ['/services/', 'Services']]
export default function Services() {
  return (
    <>
      <Seo path="/services/" title={`Pool Construction & Building Services | ${BRAND}`}
        desc="Swimming pool construction, general building, P.O.P. ceilings, tiling, interlock paving, interior design and painting in Nigeria." ld={[breadcrumbLd(crumbs)]} />
      <Hero h1="Our services" p="Swimming pools first, plus everything needed to build and finish the rest of your property." crumbs={crumbs} buttons={false} />
      <section className="pool-section"><div className="w"><h2>Swimming pools</h2><div className="grid service-grid">{POOL.map((s) => <ServiceCard key={s.slug} slug={s.slug} />)}</div></div></section>
      <Section alt><h2>Other services</h2><div className="grid service-grid">{OTHER.map((s) => <ServiceCard key={s.slug} slug={s.slug} />)}</div></Section>
      <Cta />
    </>
  )
}
