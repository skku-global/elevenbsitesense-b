import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { content } from '../src/data/content.js'
import { company } from '../src/data/company.js'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const routes = ['', 'services', 'projects', 'faq', 'build-from-abroad', 'contact', ...content.services.map((service) => service.slug)]
const htmlFiles = readdirSync(dist, { recursive: true }).filter((file) => file.endsWith('index.html'))
assert.equal(htmlFiles.length, routes.length + 1, 'Public pages and owner sign-in must each pre-render once')
const admin = new JSDOM(readFileSync(join(dist, 'admin', 'index.html'), 'utf8'))
assert.match(admin.window.document.querySelector('meta[name="robots"]')?.content || '', /noindex/i)
admin.window.close()
assert.ok(!readFileSync(join(dist, 'sitemap.xml'), 'utf8').includes('/admin/'), 'Keep the owner page out of the public sitemap')
const titles = new Set()

for (const route of routes) {
  const dom = new JSDOM(readFileSync(join(dist, route, 'index.html'), 'utf8'))
  const document = dom.window.document
  const canonical = company.websiteUrl.replace(/\/$/, '') + '/' + (route ? route + '/' : '')
  const description = document.querySelector('meta[name="description"]')?.content
  assert.equal(document.querySelectorAll('h1').length, 1, `One H1 required: ${route}`)
  assert.ok(document.title && !titles.has(document.title), `Unique title required: ${route}`)
  titles.add(document.title)
  assert.ok(description?.trim(), `Description required: ${route}`)
  assert.equal(document.querySelector('link[rel="canonical"]')?.href, canonical, `Canonical mismatch: ${route}`)
  assert.equal(document.querySelector('meta[property="og:url"]')?.content, canonical, `OG URL mismatch: ${route}`)
  assert.equal(document.querySelector('meta[property="og:title"]')?.content, document.title, `OG title mismatch: ${route}`)
  assert.equal(document.querySelector('meta[property="og:description"]')?.content, description, `OG description mismatch: ${route}`)
  assert.ok(!document.querySelector('meta[name="robots"]')?.content.includes('noindex'), `Unexpected noindex: ${route}`)
  const service = content.services.find((item) => item.slug === route)
  if (service) {
    assert.equal(description, service.meta, `Service description changed: ${route}`)
    assert.equal(document.querySelector('h1').textContent, service.h1, `Service H1 changed: ${route}`)
  }
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
  assert.ok(schemas.length, `Structured data required: ${route}`)
  for (const script of schemas) {
    const schema = JSON.parse(script.textContent)
    assert.equal(schema['@context'], 'https://schema.org', `Invalid JSON-LD context: ${route}`)
    assert.ok(schema['@type'], `Missing JSON-LD type: ${route}`)
  }
  dom.window.close()
}

console.log(`SEO checks passed for all ${routes.length} pre-rendered pages.`)
