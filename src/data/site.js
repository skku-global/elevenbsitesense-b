import { company } from './company.js'
import { content } from './content.js'

export const SITE = 'https://elevenbsitesense.com'
export const BRAND = 'Eleven B Site Sense'
export const LEGAL = company.companyName
export const RC = company.rcNumber
export const EMAIL = company.email
export const PHONES = company.phoneNumbers
export const WA = company.whatsapp
export const ADDR = `${company.postalAddress.streetAddress}, ${company.postalAddress.addressLocality}, ${company.postalAddress.addressRegion}`

export const services = content.services
export const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]))
export const POOL = services.filter((s) => s.group === 'pool')
export const OTHER = services.filter((s) => s.group === 'other')
export const MAIN = POOL[0]
export const steps = content.steps
export const abroad = content.abroad
export const abroadFaqs = content.abroadFaqs

export const firstSentence = (s) => `${s.intro.split('.')[0]}.`

export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([u, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })),
})
export const faqLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

// Photos: drop files in src/assets/images/<service-slug>/1.jpg (and images/work/ for the home slider).
const found = import.meta.glob('./../assets/images/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' })
export const photosFor = (key) =>
  Object.entries(found)
    .filter(([p]) => p.includes(`/images/${key}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url)

export const galleryFor = (slug) => {
  if (slug === 'work') return { t: 'Our work', s: photosFor('work'), n: 8, h: 195 }
  const sv = bySlug[slug]
  const i = services.indexOf(sv)
  const pool = sv.group === 'pool'
  return { t: sv.title, d: sv.intro, i: sv.includes.slice(0, 4), u: `/${slug}/`, s: photosFor(slug), n: pool ? 6 : 4, h: pool ? 190 : (30 + 40 * i) % 360 }
}
