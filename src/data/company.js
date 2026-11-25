import { TIKTOK_PROFILE } from './tiktok.js'

// Company-approved identity, content, and contact details.
// Phone numbers retain their local display format and international link format.
const registeredName = 'ELEVEN B SITE-SENSE NIGERIA LIMITED'
const slogan = 'WE BUILD IT BETTER.'

export const company = {
  companyName: registeredName,
  brandName: 'ELEVEN B SITE SENSE',
  legalSuffix: 'NIGERIA LIMITED',
  rcNumber: '7650068',
  registrationDate: 'July 04, 2024',
  registrationDateISO: '2024-07-04',
  registrationStatus: 'ACTIVE',
  socialImage: '/social-card.png',
  slogan,
  tagline: slogan,
  headline: 'We Build It Better.',
  contactPerson: 'Ganiyu Taiwo',
  phoneNumbers: [
    { number: '08034456275', international: '2348034456275' },
    { number: '08072791980', international: '2348072791980' },
    { number: '08124025129', international: '2348124025129' },
  ],
  primaryWhatsAppIndex: 0,
  get phone() { return this.phoneNumbers[0]?.number || '' },
  get whatsapp() { return this.phoneNumbers[this.primaryWhatsAppIndex]?.international || '' },
  get whatsappDisplay() { return this.phoneNumbers[this.primaryWhatsAppIndex]?.number || '' },
  email: 'info@elevenbsitesense.com',
  postalAddress: {
    streetAddress: '4th Floor, Lister Building, Ring Road',
    addressLocality: 'Ibadan', addressRegion: 'Oyo State', addressCountry: 'NG',
  },
  get addressLines() { return [`${this.postalAddress.streetAddress},`, `${this.postalAddress.addressLocality}, ${this.postalAddress.addressRegion}, Nigeria.`] },
  get address() { return this.addressLines.join('\n') },
  descriptionShort: 'Swimming pool construction, maintenance, repairs and waterfall features, with building and finishing services across Nigeria.',
  description: [
    `${registeredName} is a dynamic and reliable general building contractor dedicated to exceptional construction and finishing services. With expertise across residential, commercial, and specialised projects, we bring practical skill and considered design to the task of turning ideas into reality.`,
    'From building construction and swimming pools to P.O.P. ceilings, tiling, interlock paving, artwork design, imported stamped interlocks, and painting, every project is guided by a commitment to excellence, durability, and beauty.',
  ],
  mission: "Our mission is to build lasting relationships with our clients by consistently exceeding their expectations and delivering outstanding construction projects. We believe in the power of collaboration and innovation to bring our clients' visions to life.",
  missionBrief: 'Swimming pools, building and finishing, planned around your space and budget.',
  goal: "To stand out as a trusted contractor of choice by consistently delivering projects that reflect excellence, add value to clients' investments and enhance the beauty of the built environment.",
  strengths: [
    'A skilled team of professionals with diverse expertise.',
    'Creativity combined with functionality.',
    'A commitment to safety and industry best practices.',
    'A strong supplier network for access to quality materials.',
    'Flexibility for projects of different scales, from small renovations to large construction contracts.',
  ],
  serviceArea: 'Across Nigeria, including Lagos, Ibadan and Abuja.',
  serviceCities: ['Lagos', 'Ibadan', 'Abuja'],
  socialLinks: [TIKTOK_PROFILE],
  websiteUrl: 'https://elevenbsitesense.com',
  contactFormEndpoint: '/api/contact', // Vercel function (api/contact.js) that emails enquiries via Resend.
}

export function getPhoneUrl(contact) {
  const phone = contact?.international?.replace(/\D/g, '') || ''
  return /^\d{7,15}$/.test(phone) ? `tel:+${phone}` : null
}

export function getWhatsAppUrl(message = `Hello ${company.contactPerson}, I would like to discuss a project with ${company.brandName}.`, number = company.whatsapp) {
  const phone = (number || '').replace(/\D/g, '')
  return /^\d{7,15}$/.test(phone)
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : null
}

export function getEmailUrl(subject = '', body = '') {
  if (!company.email) return null
  const query = new URLSearchParams()
  if (subject) query.set('subject', subject)
  if (body) query.set('body', body)
  return `mailto:${company.email}${query.size ? `?${query.toString().replaceAll('+', '%20')}` : ''}`
}

export function getCompanySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${company.websiteUrl}/#business`,
    name: 'Eleven B Site Sense Nigeria Limited',
    legalName: company.companyName,
    alternateName: company.brandName,
    slogan: company.slogan,
    description: company.descriptionShort,
    identifier: { '@type': 'PropertyValue', propertyID: 'RC', value: company.rcNumber },
    email: company.email,
    telephone: `+${company.phoneNumbers[0].international}`,
    contactPoint: company.phoneNumbers.map((contact) => ({
      '@type': 'ContactPoint', name: company.contactPerson,
      telephone: `+${contact.international}`, contactType: 'customer enquiries',
    })),
    address: { '@type': 'PostalAddress', ...company.postalAddress },
    areaServed: [{ '@type': 'Country', name: 'Nigeria' }, ...company.serviceCities.map(name => ({ '@type': 'City', name }))],
    sameAs: company.socialLinks,
    ...(company.websiteUrl ? { url: company.websiteUrl } : {}),
  }
}
