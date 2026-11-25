import Drawing from '../components/Drawing.jsx'
import { ProjectImage } from '../components/Visuals.jsx'
import { BeforeAfter } from '../components/Trust.jsx'
import Slider from '../components/Slider.jsx'
import { galleryFor } from '../components/GalleryData.js'
import { useGallery } from '../components/GalleryModal.jsx'
import { Seo, Hero, ServiceCard, Steps, Faq, Cta, Section } from '../components/Parts.jsx'
import { BRAND, SITE, bySlug, POOL, breadcrumbLd, faqLd } from '../data/site.js'

export default function Service({ slug }) {
  const s = bySlug[slug]
  const isPool = s.group === 'pool'
  const first = slug === POOL[0].slug
  const gallery = galleryFor(slug)
  const openGallery = useGallery()
  const preview = gallery.photos[0]
  const heroDesign = first ? gallery.photos.find((photo) => photo.kind === 'inspiration') : undefined
  const path = `/${slug}/`
  const crumbs = [['/', 'Home'], ...(isPool ? (first ? [] : [[`/${POOL[0].slug}/`, 'Swimming pools']]) : [['/services/', 'Services']]), [path, s.title]]
  const ld = [
    breadcrumbLd(crumbs), faqLd(s.faqs),
    { '@context': 'https://schema.org', '@type': 'Service', name: s.h1, description: s.meta, areaServed: 'Nigeria', provider: { '@type': 'GeneralContractor', name: BRAND, url: SITE } },
  ]
  return (
    <>
      <Seo path={path} title={`${s.h1} | ${BRAND}`} desc={s.meta} ld={ld} />
      <Hero h1={s.h1} p={s.intro} crumbs={crumbs} slug={slug} imagePhoto={heroDesign}
        side={<aside className="plate"><Drawing active={s.part} name={s.title} />
          <div className="cap"><span className="cn"><b>{s.title}</b></span><span className="cl">Highlighted in the building</span></div></aside>} />
      <section><div className="w cols">
        <div><h2>What’s included</h2><ul className="tick">{s.includes.map((i) => <li key={i}>{i}</li>)}</ul></div>
        {preview ? <button className="service-gallery-preview" type="button" aria-label={`Enlarge ${preview.alt}`} onClick={(e) => openGallery(slug, e.currentTarget, 0)}>
          <ProjectImage src={preview.src} alt={preview.alt} width={preview.width} height={preview.height} className="feature-image" />
          <span className="photo-tag">{preview.label}</span>
        </button> : <ProjectImage slug={slug} alt={`${s.title} project detail`} className="feature-image" />}
      </div></section>
      {gallery.photos.length > 0 && <Section><h2>Gallery</h2><div className="service-gallery"><Slider d={gallery} eagerFirst onOpen={(index, from) => openGallery(slug, from, index)} /></div></Section>}
      {first && <Section alt><h2>Types of pool we build</h2><div className="grid service-grid">{POOL.slice(1).map((c) => <ServiceCard key={c.slug} slug={c.slug} />)}</div></Section>}
      <Section alt><h2>How the work goes</h2><Steps /></Section>
      {slug === 'pool-renovation-and-repair' && <BeforeAfter />}
      <Section><h2>Common questions</h2><Faq faqs={s.faqs} /></Section>
      <Section alt><h2>Related services</h2><div className="grid service-grid">{s.related.map((r) => <ServiceCard key={r} slug={r} />)}</div></Section>
      <Cta />
    </>
  )
}
