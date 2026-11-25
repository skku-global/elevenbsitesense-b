import { Seo, Hero, Steps, Faq, Cta, Section } from '../components/Parts.jsx'
import { BRAND, abroad, abroadFaqs, breadcrumbLd, faqLd } from '../data/site.js'

const crumbs = [['/', 'Home'], ['/build-from-abroad/', 'Build from abroad']]
export default function Abroad() {
  return (
    <>
      <Seo path="/build-from-abroad/" title={`Build in Nigeria From Abroad | ${BRAND}`}
        desc="How we build swimming pools and homes in Nigeria for clients living abroad: weekly video updates, staged payments and a named site manager."
        ld={[breadcrumbLd(crumbs), faqLd(abroadFaqs)]} />
      <Hero h1="Build in Nigeria while you live abroad" p="Clear updates, clear prices and payments that follow the work. This is how we manage projects for clients overseas." crumbs={crumbs} slug="general-building-contracting" />
      <section className="sand-section"><div className="w"><h2>What you can expect</h2>
        <div className="grid assurance-grid">{abroad.map((a, index) => <div className="card" key={a.title}><span className="assurance-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{a.title}</h3><p>{a.text}</p></div>)}</div></div></section>
      <Section alt><h2>How a project works</h2><Steps /></Section>
      <Section><h2>Common questions</h2><Faq faqs={abroadFaqs} /></Section>
      <Cta heading="Start your project from anywhere" />
    </>
  )
}
