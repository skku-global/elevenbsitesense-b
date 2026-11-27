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
- `src/pages/` – Home, Service, Services, Projects, FAQ, Abroad and Contact
- `src/components/` – Drawing (SVG), Slider, GalleryModal, Layout
- `src/styles.css` – all styling
- `api/contact.js` and `server/` – contact form, Resend email and optional Supabase enquiry storage
- `src/admin/` – the owner's private enquiry inbox and traffic overview at `/admin/`. [Supabase setup](docs/owner-dashboard.md)

## Project media
The project photo cards on `/projects/` use `src/data/projectPhotos.js` and images in `src/assets/images/projects/`. The original service galleries use their service image manifests. The nine local project videos and their matching poster images are in `public/media/projects/`.

Run `npm run build:site` to regenerate the pages and `npm run preview` to open the build locally. Both `npm run dev` and `npm run preview` serve the contact API. Set the three server credentials in `.env.local` to send real emails from your local copy.

## Put it online
1. In Resend, confirm that `elevenbsitesense.com` shows **Verified** and obtain a sending API key for that domain.
2. Open **elevenbsitesense-b → Settings → Environment Variables** in Vercel. The connected Upstash database supplies `KV_REST_API_URL` and the writable `KV_REST_API_TOKEN`. Set `RESEND_API_KEY` in Production and set `AUTOREPLY=true` if you want a confirmation sent to the customer.
3. Deploy the updated project root, including `api/` and `server/`, to this Vercel project. `vercel.json` sets the build command and output directory. The origin `https://elevenbsitesense-b.vercel.app` is already allowed.
4. Submit a quote from the deployed contact page using an inbox you control. Check the notification at `info@elevenbsitesense.com` and the acknowledgement in the submitting inbox. [Detailed contact email settings](docs/contact-email.md)

New pages: add the service to `src/data/content.js` (it gets its own route automatically). Update `public/sitemap.xml` when you add one.
