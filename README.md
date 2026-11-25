# Eleven B Site Sense, Option B (React)

Vite + React site, pre-rendered to one real HTML page per route (good for Google), with the building-section drawing, animated service galleries, and the `/api/contact` enquiry function (Resend + Upstash).

## Run it
```
npm install
npm run dev       # local preview
npm run build     # writes the pre-rendered site to dist/
```

## Where things live
- `src/data/content.js` – service copy, FAQs, steps (edit text here)
- `src/data/company.js` – phones, email, address, RC number
- `src/pages/` – Home, Service, Services, Abroad, Contact
- `src/components/` – Drawing (SVG), Slider, GalleryModal, Layout
- `src/styles.css` – all styling
- `api/contact.js` + `server/` – contact form backend (unchanged)

## Photos
Put files in `src/assets/images/<service-slug>/1.jpg, 2.jpg…` (for example `src/assets/images/tiling/1.jpg`) and `src/assets/images/work/1.jpg…` for the home slider. Rebuild; they appear automatically in place of the grey placeholders.

## Put it online
1. Push this repo to GitHub.
2. Vercel: Add New > Project > import the repo. `vercel.json` sets the build (`npm run build`, output `dist`).
3. Settings > Environment Variables: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CONTACT_FROM`, `CONTACT_TO`, `AUTOREPLY` (see `.env.example`, `docs/contact-email.md`).
4. Add the project's URL to `ALLOWED_ORIGINS`, then redeploy. Without this the form is refused.
5. Domain: add `elevenbsitesense.com` and `www.elevenbsitesense.com` in Vercel. Change only the A / CNAME records; leave MX, SPF, DKIM and DMARC alone so Zoho and Resend keep working.

New pages: add the service to `src/data/content.js` (it gets its own route automatically). Update `public/sitemap.xml` when you add one.
