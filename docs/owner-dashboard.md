# Owner dashboard setup

The site owner signs in at **/admin/**. The dashboard shows new enquiries, contact details, email notification status, follow-up status, daily page views and the most viewed pages over the last seven UTC days. Collection starts when Supabase is connected and the updated site is deployed.

## Connect Supabase

1. Create a Supabase project or open the one you want to use for Eleven B.
2. Open **SQL Editor → New query**. Paste the contents of [admin.sql](../supabase/admin.sql) and click **Run**. You can run the file again when updating the site.
3. Under **Authentication → Users → Add user → Create new user**, create the owner's account with an email and password and confirm the email. Copy the **User UID** from that account.
4. In a new SQL Editor query, replace the placeholder below with that UID and run it.

   ```sql
   insert into public.site_admins (user_id)
   values ('PASTE-THE-OWNER-USER-UID-HERE')
   on conflict do nothing;
   ```

## Connect the website

In Vercel, open **elevenbsitesense-b → Settings → Environment Variables**. Add these to **Production** using this Supabase project's **Connect** or **Settings → API Keys** screens.

| Vercel variable | Value from Supabase |
| --- | --- |
| `SUPABASE_URL` | The Project URL, usually `https://YOUR-PROJECT-REF.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key, beginning with `sb_publishable_` |
| `SUPABASE_SECRET_KEY` | Server secret key, beginning with `sb_secret_` |

Enter the secret directly in Vercel. It belongs only in the server environment. For projects using legacy keys, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are supported. The contact form also uses the existing writable Upstash REST URL/token for rate limiting and safe retries, and `RESEND_API_KEY` for email notifications.

Publish the updated source from the GitHub repository connected to the Vercel project. If the code is already published, redeploy Production after saving the variables. For localhost, put the same settings in the project's ignored `.env.local` and restart the server.

## Check it

Open the public website, visit a couple of pages and sign in at **/admin/**. Click **Refresh** to see the page views. A view is a page visit, including a page reload. The counter stores a daily total per public page and excludes the admin area. Open a new enquiry to see the message and update its follow-up status. An email notification marked **Accepted by email provider** means Resend accepted it for sending. The saved message stays in the inbox even if the notification fails.
