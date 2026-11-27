import { Seo, Hero, Cta, Section } from '../components/Parts.jsx'
import { BRAND, breadcrumbLd } from '../data/site.js'
import { poolWorkPhotos } from '../data/projectPhotos.js'
import projectVideos from '../data/projectVideos.json'
import './Projects.css'

const crumbs = [['/', 'Home'], ['/projects/', 'Projects']]

export default function Projects() {
  return (
    <>
      <Seo path="/projects/" title={`Our Work: Swimming Pool Projects | ${BRAND}`}
        desc="Photographs of swimming pools built and finished by ELEVEN B SITE SENSE in Nigeria, from mosaic tiling and dark coping to curved pools with waterfalls." ld={[breadcrumbLd(crumbs)]} />
      <Hero h1="Our work" p="Photographs of our pool work, before filling and after, including tiling, coping, steps and finishing." crumbs={crumbs} buttons={false} />
      <Section>
        <div className="pw-grid">
          {poolWorkPhotos.map((p) => (
            <figure className="pw-item" key={p.title}>
              <img src={p.image} srcSet={p.srcSet} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" width={p.width} height={p.height} alt={p.alt} loading="lazy" decoding="async" />
              <figcaption><strong>{p.title}</strong><span>{p.description}</span></figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section alt>
        <h2>Project videos</h2>
        <div className="pw-grid pw-video-grid">
          {projectVideos.map(({ file, title }) => (
            <figure className="pw-item" key={file}>
              <video controls playsInline preload="none" poster={`/media/projects/${file}.jpg`} aria-labelledby={`title-${file}`}>
                <source src={`/media/projects/${file}.mp4`} type="video/mp4" />
                <a href={`/media/projects/${file}.mp4`}>Watch {title}</a>
              </video>
              <figcaption id={`title-${file}`}><strong>{title}</strong></figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Cta />
    </>
  )
}
