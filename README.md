# Eleven B Site Sense, Option B

Multi-page static site (one real page per service, for SEO) with the building-section drawing, animated service galleries, and the same `/api/contact` enquiry function as the first project.

## Put it online as a second project
1. Create a new GitHub repo (for example `elevenbsitesense-option-b`) and push this folder to it.
2. In Vercel: Add New > Project > import that repo. Leave the framework as "Other". `vercel.json` already sets everything.
3. In the new project's Settings > Environment Variables, copy the same values as the first project: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CONTACT_FROM`, `CONTACT_TO`, `AUTOREPLY`.
4. Add this project's own URL (for example `https://elevenbsitesense-option-b.vercel.app`) to `ALLOWED_ORIGINS`, then redeploy. Without this the form is refused.
5. Send the client both links and let them choose.

## Point the domain at the winner
Vercel > the chosen project > Settings > Domains > add `elevenbsitesense.com` and `www.elevenbsitesense.com`. If the first project holds the domain, remove it there first. Change only the web records (A / CNAME) that Vercel shows you. Do not touch the MX, SPF, DKIM or DMARC records, because they keep the Zoho and Resend email working.

## Edit and rebuild
Edit `build.py` (phones, copy, services), run `python3 build.py`, commit the updated `public/` folder. Photos: put files in `images/<service>/1.jpg`, `images/work/1.jpg` (names as in the service slugs), rebuild.
