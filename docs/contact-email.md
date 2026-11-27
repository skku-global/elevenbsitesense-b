# Contact email setup

The quote form at `https://elevenbsitesense-b.vercel.app/contact/` posts directly to `/api/contact/`, the canonical URL under this project's Vercel trailing-slash setting. Resend sends enquiries to the company's Zoho inbox. Replying to that notification addresses the customer. With `AUTOREPLY=true`, the customer also receives a confirmation.

## Confirmed identity

- Company: **Eleven B Site-Sense Nigeria Limited**
- Website: **https://elevenbsitesense.com**
- Sender: **Eleven B Site-Sense <info@elevenbsitesense.com>**
- Enquiry destination and acknowledgement Reply-To: **info@elevenbsitesense.com**
- Customer acknowledgements: **approved; `AUTOREPLY=true`**

## Environment variables to configure manually

Open **elevenbsitesense-b → Settings → Environment Variables** in Vercel. The connected database supplies the two Redis settings below. Set `RESEND_API_KEY` for **Production** and set `AUTOREPLY=true` for customer confirmations. If Preview also needs email delivery, configure its environment as well. Deploy the updated project root including `api/` and `server/` after saving the settings.

| Variable | Value | Requirement |
| --- | --- | --- |
| `RESEND_API_KEY` | Your Resend API key with sending permission for the verified domain | Required secret; server only |
| `CONTACT_FROM` | `Eleven B Site-Sense <info@elevenbsitesense.com>` | Built-in default. Enter without quotes if setting explicitly in Vercel. |
| `CONTACT_TO` | `info@elevenbsitesense.com` | Built-in notification destination. |
| `AUTOREPLY` | `true` | Enables the approved customer acknowledgement; unset or other values disable it |
| `KV_REST_API_URL` | The connected Upstash database's HTTPS REST endpoint | Supplied by the Vercel integration |
| `KV_REST_API_TOKEN` | The same database's REST read/write token | Supplied by the Vercel integration |
| `ALLOWED_ORIGINS` | Leave empty for the current project | Optional comma-separated exact HTTPS origins for additional domains |
| `CONTACT_ALLOWED_ORIGINS` | Leave empty for the normal setup | Existing optional comma-separated **exact HTTPS origins**, added alongside `ALLOWED_ORIGINS` |

Existing environments can use the pair `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If both complete pairs exist, that pair takes precedence. Keep the credentials in server-side environment variables.

The API accepts the production address `https://elevenbsitesense-b.vercel.app`, the existing company domains and the exact deployment and branch hostnames supplied by Vercel. When copying settings from an earlier project, leave the optional origin fields empty unless you need another exact HTTPS origin.

Vercel supplies its runtime variables automatically. The local server also accepts localhost and 127.0.0.1 on ports 3000, 5173, 4173, 4183 and 55380 in development.

Create a Redis database suitable for persistent storage, **disable eviction**, and keep delivery receipts durable. Prefer separate Redis credentials for preview and production. Neither the Resend key nor Redis credentials are currently supplied in this repository.

## Existing public DNS inspected on November 21, 2026

The domain's nameservers resolve to `dns1.registrar-servers.com` and `dns2.registrar-servers.com`, consistent with Namecheap DNS. The following mail records were found:

| Host | Type | Existing value | Priority |
| --- | --- | --- | --- |
| `@` | MX | `mx.zoho.com` | 10 |
| `@` | MX | `mx2.zoho.com` | 20 |
| `@` | MX | `mx3.zoho.com` | 50 |
| `@` | TXT | `v=spf1 include:zohomail.com ~all` | — |
| `@` | TXT | `zoho-verification=zb83957716.zmverify.zoho.com` | — |
| `zmail._domainkey` | TXT | Existing Zoho `v=DKIM1; k=rsa; p=…` public key | — |

No records were returned for `send`, `rsend`, `resend._domainkey`, or `_dmarc` in the queries performed. Recheck the live zone before making any additions, since this is an inspection snapshot rather than an exported DNS zone.

**Preserve all of the Zoho records above, including their priorities and values.** Additional existing Zoho records must also remain intact. Root MX records deliver incoming mail to Zoho. Root SPF authorizes Zoho sending. The existing DKIM selector signs Zoho mail.

## Resend DNS additions

In your Resend account, add/verify the sending domain **`elevenbsitesense.com`**, matching the approved `info@elevenbsitesense.com` From address. Keep **Receiving disabled** in Resend. Use the default `send` Return-Path, whose bounce routing is separate from the root mailbox.

Resend's current documentation states that domains created after August 2026 may use **two CNAME records** for sending instead of the older MX/TXT pair. The domain's **Records** tab is the authority for its exact record types, names, targets, and selected region. The account-specific targets and DKIM public key cannot be inferred from the existing public DNS or the supplied email address; no values have been invented here.

For a domain displaying the newer CNAME setup, add:

| Namecheap Host | Type | Value to copy | Why |
| --- | --- | --- | --- |
| `resend._domainkey` | TXT, as shown by Resend | The complete Resend-generated DKIM public-key value | Authorizes Resend signatures for the confirmed sending domain, alongside Zoho's separate selector |
| `send` | CNAME | The exact target shown for `send.elevenbsitesense.com` | Resend's outgoing Return-Path configuration |
| `rsend` | CNAME | The exact target shown for `rsend.elevenbsitesense.com` | The required companion Return-Path record |

If the Records tab instead displays the older MX/SPF setup, use the following **alternative**, alongside the displayed DKIM record:

| Namecheap Host | Type | Value | Priority | Why |
| --- | --- | --- | --- | --- |
| `send` | MX | Copy the exact Resend regional target; the US East example is `feedback-smtp.us-east-1.amazonses.com` | Copy Resend's displayed priority, normally 10 | Routes bounce/complaint handling for the Return-Path subdomain |
| `send` | TXT | Copy Resend's displayed SPF value; the documented example is `v=spf1 include:amazonses.com ~all` | — | Authorizes the Return-Path sender |

Add the CNAME setup **or** the MX/TXT setup shown in your account. A CNAME cannot coexist with MX/TXT records at the same `send` host. In Namecheap's Host field use the relative host (`send`, `rsend`, or `resend._domainkey`), not the repeated full domain. Use the displayed TTL or Automatic.

The `send` SPF record is at a different DNS name from the root Zoho SPF record. **Do not replace the root SPF, add a second root SPF record, or merge Amazon sending into the root record for this setup.** Do not add Resend receiving MX records at `@`. Do not change Namecheap's mail preset or clear existing MX entries while adding records. If the dashboard's instructions conflict with existing mail settings, review that conflict before making a DNS change.

DMARC is optional for this implementation and was not found in the queried DNS. A future approved rollout can begin with a monitoring policy such as `v=DMARC1; p=none;` at `_dmarc`. It is not a required Resend verification record, and this implementation does not publish one or introduce an enforcement policy.

After **you approve the DNS change** and add the exact records, verify the domain in Resend. Verify that Zoho's original root MX, SPF, and DKIM records still resolve and that incoming mail continues reaching Zoho. The code cannot complete domain verification or prove live inbox delivery until these manual steps and credentials are supplied.

Official references consulted:

- [Resend: existing MX coexistence](https://resend.com/docs/knowledge-base/how-do-i-avoid-conflicting-with-my-mx-records)
- [Resend: custom Return-Path and companion CNAME](https://resend.com/docs/dashboard/domains/custom-return-path)
- [Resend: Namecheap DNS fields](https://resend.com/docs/guides/dns/namecheap)
- [Resend: provider idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)

## Delivery and retry behavior

1. The endpoint requires POST JSON, an approved Origin, a valid UUID `Idempotency-Key`, and a payload no larger than 16 KiB. The form and server support all eleven service pages and the “Multiple services / not sure yet” option. The server derives the service title and validates the submitted fields.
2. Redis atomically checks rate limits and reserves the reference. Limits are five new enquiries and 30 requests per client per ten minutes, plus global caps of 100 new enquiries and 300 requests per ten minutes. Requests from other hosting contexts use their socket address; Vercel uses its documented client-IP helper.
3. When the Supabase owner inbox is configured, the server saves the enquiry under its reference after Redis admits the request. It then sends a notification to `CONTACT_TO` with the customer address as Reply-To and the provider key `contact/<reference>/notification`.
4. The form confirms receipt once the enquiry reaches the owner inbox or Resend accepts it in email-only mode. The frontend requires `{ ok: true, status: "accepted", enquiryId: "<reference>" }`. If email fails after the enquiry is saved, the owner can open the enquiry in `/admin/` to follow up. The notification status records whether Resend accepted the request.
5. With `AUTOREPLY=true`, Vercel `waitUntil` keeps the approved acknowledgement task running after the response. It uses `contact/<reference>/acknowledgement`, sends to the submitted email, and routes replies to the Zoho business inbox. It thanks the customer, confirms receipt, names their selected service, and says the team will review and respond.
6. Acknowledgement failures are logged with an enquiry reference, controlled status/code, and a sanitized provider message. Configured values and customer details are redacted; raw errors and provider response bodies are never logged. These failures never change notification success. A failed required notification never triggers an acknowledgement.

Redis delivery receipts store references, payload fingerprints, timestamps, lease information, and delivery statuses. Rate-limit IP identifiers are keyed hashes. Receipt keys have no expiry. When configured, Supabase stores the enquiry and contact details for the owner's dashboard.

Resend retains provider idempotency keys for 24 hours. Retries may resume an outstanding notification for 23 hours using the same key and identical content. After that window, completed receipts and receipts recording a saved owner-inbox copy continue to confirm the enquiry without resending email. An unconfirmed email-only enquiry requires manual checking.

The form keeps its reference in memory. Retrying the same enquiry reuses that reference, and a changed enquiry gets a new one. Reloading the page clears this memory. Direct telephone, WhatsApp and email links remain available while the form is loading or if JavaScript is unavailable.

Resend requests time out after seven seconds, Redis requests after two seconds, and contact database writes after 4.5 seconds. The function has a 30-second maximum and 45-second leases. If Redis cannot reserve the submission, the server returns a retryable error. If Resend accepts the notification before a Redis write fails, the visitor still sees a confirmation.

## Production failure logs

In Vercel, open the serving deployment's **Logs** and filter to requests for the contact function. Include warnings when investigating 403 responses and errors when investigating configuration or delivery failures. Each application log entry includes an event name and diagnostic details.

| Log event | Fields to inspect | Meaning |
| --- | --- | --- |
| `contact_origin_rejected` | `reason`, `requestId` when available | The contact function rejected the request before contacting Upstash or Resend. Match the reference shown in the form to the Vercel runtime warning. |
| `contact_configuration_error` | `reason` or `code`, `variables` | Missing or invalid configuration; `variables` lists names only |
| `contact_storage_unavailable` | `provider`, `code`, `status`, `variables`, sanitized `message` when available | Redis coordination failed before email delivery; HTTP 401/403 points to the REST token, and rejected commands can indicate insufficient permissions |
| `contact_notification_failed` | `provider: "resend"`, `code`, `status`, sanitized `message` | Email notification failed. The Resend HTTP status and message identify provider rejections. |
| `contact_journal_write_failed` | `provider: "supabase"`, `reason`, `status` | The configured owner inbox could not save the enquiry. Check the Supabase schema and server key. |
| `contact_journal_status_failed` | `provider: "supabase"`, `reason`, `status` | The enquiry was saved and its email status could not be updated. |
| `contact_acknowledgement_failed` | `provider`, `code`, `status`, sanitized `message` | Optional customer acknowledgement failed after the required notification succeeded |
| `contact_receipt_update_failed` | `provider`, `code`, `status` | Redis could not save the delivery receipt; existing provider idempotency keys still protect recovery retries |

For a 403, open the browser's Network panel and inspect the response to the contact POST. JSON containing `origin_not_allowed` identifies the application's address check. Compare the browser's Origin header to the approved project address. If you use a separate company-owned HTTPS alias, add its exact origin (scheme and hostname, without a trailing slash) to `ALLOWED_ORIGINS` and redeploy. If the Origin is missing or `null`, open the public contact page directly in a browser tab.

If the 403 contains a Vercel access page or another response code, use the request time and the response's `x-vercel-id` (when present) to look up the request in the target deployment and its Firewall logs. In email-only mode, an Upstash failure returns 503 and a Resend rejection returns 502.

For example, if the mail variables are present but Redis credentials are absent:

```text
contact_configuration_error {
  enquiryId: "<submission reference>",
  reason: "missing_environment_variables",
  variables: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]
}
```

Both Redis variables are required in addition to the mail settings. Set them in the deployment's correct environment and redeploy to apply any changes. `CONTACT_FROM` and `CONTACT_TO` retain their official defaults when unset; `AUTOREPLY` is an optional switch. Invalid sender/destination formatting and malformed optional origins identify only the affected variable names.

On a Resend rejection, look for a log like:

```text
contact_notification_failed {
  enquiryId: "<submission reference>",
  provider: "resend",
  code: "provider_rejected",
  status: 403,
  message: "The sending domain is not verified. [REDACTED]"
}
```

The log records the actual provider status and a sanitized message. A `503 service_unavailable` can indicate configuration, Redis coordination, or an owner inbox write failure. A `502 notification_unavailable` means Resend failed in email-only mode. Use the reference shown by the form to find the corresponding runtime error.

## Checks and local development

```sh
npm test
npm run lint
npm run build
npm run check:seo
```

The unit tests cover gallery behavior and assets. The SEO check validates the generated site's search and sharing metadata after the build.

For frontend checks, start `npm run dev` or build the site and run `npm run preview`. Open a service page, follow its quote link, and check that the form selects that service. Disable JavaScript when visiting the built contact page to check its direct-contact links.

To send email locally, copy `.env.example` to `.env.local`, enter the sending key and Redis REST credentials, and restart `npm run dev` or `npm run preview`. Both serve `/api/contact` using the same handler as the deployed Vercel function. A configured local POST sends real email. To check the deployed setup, submit one enquiry using an email address you control. Look for the notification at `info@elevenbsitesense.com` and, with autoreply enabled, the confirmation in your test inbox.
