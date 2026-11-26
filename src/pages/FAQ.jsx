import { useState } from 'react'
import { Seo, Hero, Cta, Section } from '../components/Parts.jsx'
import { BRAND, breadcrumbLd } from '../data/site.js'
import { faqs } from '../data/faqs.js'

const ALL = 'All questions'
const categories = [ALL, ...new Set(faqs.map((f) => f.category))]
const crumbs = [['/', 'Home'], ['/faq/', 'FAQ']]
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
}

export default function FAQ() {
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState('')
  const q = query.toLowerCase().trim()
  const shown = faqs.filter((f) => (category === ALL || f.category === category) && `${f.question} ${f.answer}`.toLowerCase().includes(q))
  return (
    <>
      <Seo path="/faq/" title={`Frequently Asked Questions | ${BRAND}`}
        desc="Answers about swimming pools, building and finishing services, quotations, timelines, materials and how to contact ELEVEN B SITE SENSE in Nigeria." ld={[breadcrumbLd(crumbs), faqLd]} />
      <Hero h1="Good questions. Clear answers." p="The practical details of planning a project, choosing materials and working with us." crumbs={crumbs} buttons={false} />
      <Section>
        <div className="faq-tools">
          <div className="faq-cats" role="group" aria-label="Filter questions by topic">
            {categories.map((c) => <button type="button" key={c} aria-pressed={category === c} className={category === c ? 'is-active' : ''} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <label className="sr-only" htmlFor="faq-search">Search questions</label>
          <input id="faq-search" className="faq-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a question or topic" />
        </div>
        <p className="faq-count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? 'question' : 'questions'}</p>
        {shown.length ? (
          <div className="faq-list">
            {shown.map((f) => <details className="faq-item" key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
          </div>
        ) : (
          <p className="faq-empty">No matching questions. Try another word, or <button type="button" onClick={() => { setCategory(ALL); setQuery('') }}>view all questions</button>.</p>
        )}
      </Section>
      <Cta heading="Still have a question? Talk to us" />
    </>
  )
}
