# DNS records — mydailydownload.com (managed in Vercel DNS)

Domain is registered in Vercel (team `miguel-sanchezgrices-projects`), nameservers on Vercel DNS ✔. Apply each with:
`vercel dns add mydailydownload.com <name> <type> <value> [mx_priority] --scope miguel-sanchezgrices-projects`

## Receiving (Resend Inbound → AWS SES)  — REQUESTED, blocked on full value
| Name | Type | Value | TTL | Priority | Status |
|---|---|---|---|---|---|
| `@` | MX | `inbound-smtp.<REGION>.amazonaws.com` (region truncated in screenshot — need full host) | 60 | 10 | ✅ added (rec_ce7819260b3de547) |

> ⚠️ An MX on `@` routes **all** inbound mail for the apex to Resend Inbound. If `support@mydailydownload.com` should be a normal human mailbox (e.g. Google Workspace), prefer a **subdomain for ingestion** (`inbox.mydailydownload.com` MX → Resend) and keep the apex MX for the mailbox. Confirm intent.

## Sending (Resend domain auth) — pending RESEND_API_KEY (I can pull + add all automatically)
| Name | Type | Value | Purpose |
|---|---|---|---|
| `resend._domainkey` (or similar) | TXT/CNAME | (from Resend) | DKIM |
| `send` / `@` | TXT | `v=spf1 include:amazonses.com ~all` (from Resend) | SPF |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:...` | DMARC |
| `send.mydailydownload.com` | MX | feedback-smtp.<region>.amazonses.com | bounce/return-path |

**To finish automatically:** send `RESEND_API_KEY` → I `GET https://api.resend.com/domains/d7f12968-7f21-4bca-953e-96a0cc09b771` → add every returned record via `vercel dns add` in one pass.

---

## ✅ STATUS: email DNS complete (verified)
- DKIM `resend._domainkey` TXT — ✅ verified
- SPF `send` TXT (`v=spf1 include:amazonses.com ~all`) — ✅ verified
- SPF `send` MX (`feedback-smtp.us-east-1.amazonses.com` pri 10) — ✅ verified
- Inbound `@` MX (`inbound-smtp.us-east-1.amazonaws.com` pri 10) — ✅ added + verified
- DMARC `_dmarc` TXT (`v=DMARC1; p=none; rua=mailto:dmarc@mydailydownload.com`) — ✅ added (monitor mode for warmup)

Resend domain `d7f12968-…` → **status: verified · sending: enabled · receiving: enabled**. Phase 3 sending unblocked.
Keys stored (gitignored): RESEND_API_KEY, TAVILY_API_KEY. Stripe: account `acct_1Tf4DDPnLtm1veVC`, product `prod_UeOZFv6cuF7xpv`, and Pro price `price_1Tf5maPnLtm1veVCknVonjFS` are recorded; Vercel Production env inventory shows encrypted `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` for `mydailydownload-web`.
