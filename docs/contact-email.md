# Contact email setup

The existing React/Vite form posts to the existing Vercel function at `/api/contact`. Resend sends the notification and acknowledgement; Zoho continues receiving and managing the company's mailbox. No deployment, production environment settings, Resend account changes, or DNS changes are performed by the application setup scripts.

## Confirmed identity

- Company: **Eleven B Site-Sense Nigeria Limited**
- Website: **https://elevenbsitesense.com**
- Sender: **Eleven B Site-Sense <info@elevenbsitesense.com>**
- Enquiry destination and acknowledgement Reply-To: **info@elevenbsitesense.com**
- Customer acknowledgements: **approved; `AUTOREPLY=true`**

## Environment variables to configure manually

Set these in **Vercel → Project → Settings → Environment Variables → Production** before an approved deployment. A redeployment is needed to apply changed production variables; this guide does not deploy. Use `.env.local` for `vercel dev`. The checked-in `.env.example` is a template, and the ignored `.env.local` already contains the approved non-secret values with empty credential slots.

| Variable | Value | Requirement |
| --- | --- | --- |
| `RESEND_API_KEY` | Your Resend API key with sending permission for the verified domain | Required secret; server only |
| `CONTACT_FROM` | `Eleven B Site-Sense <info@elevenbsitesense.com>` | Approved sender; enter without surrounding quotes in the Vercel UI |
| `CONTACT_TO` | `info@elevenbsitesense.com` | Approved notification destination |
| `AUTOREPLY` | `true` | Enables the approved customer acknowledgement; unset or other values disable it |
| `UPSTASH_REDIS_REST_URL` | Your database's HTTPS REST endpoint, such as `https://<database>.upstash.io` | Required for distributed rate limits and receipts |
| `UPSTASH_REDIS_REST_TOKEN` | Your database's REST read/write token | Required secret; a read-only token cannot coordinate delivery |
| `ALLOWED_ORIGINS` | Leave empty for the approved project defaults; see [README](../README.md#contact-api-origins-on-vercel) for the explicit value | Optional comma-separated exact HTTPS origins and the one approved project pattern (Preview only) |
| `CONTACT_ALLOWED_ORIGINS` | Leave empty for the normal setup | Existing optional comma-separated **exact HTTPS origins**, added alongside `ALLOWED_ORIGINS` |

Do not prefix credentials with `VITE_`, put them in `src/`, or commit `.env.local`. Never place an API key or Redis token in public HTML, browser storage, or an email template.

The production origins `https://elevenbsitesense.com`, `https://www.elevenbsitesense.com`, and `https://elevenbsitesense.vercel.app` are built in. The default project list also includes the exact `elevenbsitesense11-git-main-adewalepolicy75-uxs-projects.vercel.app` alias and, in Preview only, the scoped `elevenbsitesense11-*-adewalepolicy75-uxs-projects.vercel.app` pattern. `ALLOWED_ORIGINS` can replace that project list while retaining the official origins. Current exact `VERCEL_URL`/`VERCEL_BRANCH_URL` origins are allowed in Preview; in Production these runtime exceptions are restricted to the approved project. `CONTACT_ALLOWED_ORIGINS` remains an additional exact-origin setting. Localhost and 127.0.0.1 on ports 3000, 5173, 4173, and 4183 are allowed only in development. There is no wildcard allowance for other Vercel projects. See the README for the Vercel value and redeployment instructions.

`VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `NODE_ENV` are supplied by the hosting/development runtime; do not manually imitate production runtime settings. `BROWSER_PATH`, `SITE_URL`, and `BROWSER_DEBUG_PORT` are optional local browser-check overrides and are not production mail settings.

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

1. The endpoint requires POST JSON, an approved Origin, a valid UUID `Idempotency-Key`, and a payload no larger than 16 KiB. Client and server share field validation and the eight-service catalogue. The server derives the service title; client recipient/sender overrides are rejected.
2. Redis atomically checks rate limits and reserves the reference. Limits are five new enquiries and 30 requests per client per ten minutes, plus global caps of 100 new enquiries and 300 requests per ten minutes. Requests from other hosting contexts use their socket address; Vercel uses its documented client-IP helper.
3. The required notification is sent to `CONTACT_TO` with the validated customer address as Reply-To. Its independent provider key is `contact/<reference>/notification`.
4. Only after Resend accepts that notification does the endpoint return `{ ok: true, status: "accepted", enquiryId: "<reference>" }`. The frontend verifies this explicit JSON response rather than treating arbitrary HTTP 200 HTML as delivery.
5. With `AUTOREPLY=true`, Vercel `waitUntil` keeps the approved acknowledgement task running after the response. It uses `contact/<reference>/acknowledgement`, sends to the submitted email, and routes replies to the Zoho business inbox. It thanks the customer, confirms receipt, names their selected service, and says the team will review and respond.
6. Acknowledgement failures are logged with an enquiry reference, controlled status/code, and a sanitized provider message. Configured values and customer details are redacted; raw errors and provider response bodies are never logged. These failures never change notification success. A failed required notification never triggers an acknowledgement.

Delivery receipts store references, payload fingerprints, timestamps, lease information, and delivery statuses, with no customer names, addresses, messages, or raw IPs. Rate-limit IP identifiers are keyed hashes. Receipt keys intentionally have no expiry; deleting/evicting them removes the long-term duplicate protection.

Resend retains provider idempotency keys for 24 hours. Unknown notification outcomes may resume for 23 hours using the same key and identical content, then require manual checking rather than risking a duplicate after provider expiry. Completed receipts continue to acknowledge retries beyond that window. Optional unfinished acknowledgements older than the safe window are abandoned without changing required notification success.

The form keeps its reference in component memory. Unchanged retries reuse it; editing the payload or starting another enquiry creates a fresh reference. A full page reload clears that memory, as it clears the existing form fields. Prepared-brief preview, email sharing, and downloads remain available when `company.contactFormEndpoint` is empty.

Provider requests time out after seven seconds; storage requests after two seconds. Missing credentials or unavailable coordination produce controlled errors instead of sending without rate limiting. The function has a 30-second maximum and 45-second leases. If a notification is accepted but its receipt cannot be committed, acceptance is preserved and optional delivery is skipped; safe recovery still uses the existing provider key.

## Production failure logs

In Vercel, open the latest production deployment's **Logs**, filter to errors for `/api/contact`, then reproduce the failed submission. Server-side `console.error` entries include an event name and a diagnostic object. The browser still receives the existing controlled response, without configuration details.

| Log event | Fields to inspect | Meaning |
| --- | --- | --- |
| `contact_configuration_error` | `reason` or `code`, `variables` | Missing or invalid configuration; `variables` lists names only |
| `contact_storage_unavailable` | `provider`, `code`, `status`, `variables`, sanitized `message` when available | Redis coordination failed before email delivery; HTTP 401/403 points to the REST token, and rejected commands can indicate insufficient permissions |
| `contact_notification_failed` | `provider: "resend"`, `code`, `status`, sanitized `message` | Required enquiry notification failed; the Resend HTTP status and error message identify a provider rejection |
| `contact_acknowledgement_failed` | `provider`, `code`, `status`, sanitized `message` | Optional customer acknowledgement failed after the required notification succeeded |
| `contact_receipt_update_failed` | `provider`, `code`, `status` | Redis could not save the delivery receipt; existing provider idempotency keys still protect recovery retries |

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

The example status/message is illustrative; the log records the actual provider status and sanitized message. Non-JSON error responses use a fixed description rather than exposing arbitrary response content. Network failures and timeouts have controlled codes without raw exception text. A `503 service_unavailable` indicates configuration or coordination failure; a required Resend rejection retains the existing `502 notification_unavailable` response.

## Checks and local development

```sh
npm test
npm run lint
npm run build
npm run check:client
```

Unit tests execute the production Redis Lua through a local interpreter with Redis-command and HTTP-provider fixtures. They cover validation, rate limits, concurrent reservations, provider ambiguity, duplicate protection, acknowledgements, and controlled errors. They send no real emails. `check:client` checks built metadata and verifies that credentials and server mail implementation were not bundled, including any supplied server-only build sentinels.

For frontend/browser checks, start `npm run dev` or `npm run preview`, then run `npm run check:browser`. `SITE_URL` can point to the chosen local port. Contact requests are intercepted and fulfilled locally; these checks do not submit real enquiries. Existing homepage mobile layout warnings are recorded separately from the contact-flow checks.

For actual local function execution use **`vercel dev`** with the ignored local environment file populated. Vite's standalone dev/preview server does not run `/api/contact`. Verify real provider/inbox delivery only after manual configuration and with approved test addresses. Deployment and production DNS changes require separate permission.
