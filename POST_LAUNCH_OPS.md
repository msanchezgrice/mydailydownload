# My Daily Download Post-Launch Ops

Updated: 2026-06-06T04:59:19Z
Owner: Miguel Sanchez-Grice
Domain: https://mydailydownload.com
Support: support@mydailydownload.com
Launch phase: launch workstreams in progress; recurring automation activation remains gated.

## Operating Principles

- Do not send customer emails, publish social posts, activate paid spend, change billing, mutate DNS/customer-email setup, or start recurring automations without explicit action-time approval from Miguel.
- Use real provider data before closing a daily check. Local green is not enough for production-health, email, analytics, billing, indexing, or social evidence.
- Never fabricate news, stats, archive counts, sources, or deliverability status. If evidence is unavailable, record the exact blocker.
- Keep personal data out of analytics and ads: no emails, LinkedIn URLs, parsed resume text, employer, title, resume filenames, consent-log IPs/text, Stripe customer ids, or payment data.
- Treat Warm Start recurring automations as a handoff only until launch workstreams are complete or explicitly deferred, production evidence is recorded, and Miguel approves recurring activation.

## First 24 Hours

Run this after launch evidence is recorded, before recurring automation activation.

1. Production health
   - Check `https://mydailydownload.com`, `/onboarding`, `/sample`, `/privacy`, `/terms`, `/sitemap.xml`, and `/robots.txt`.
   - Verify the live build is the intended Vercel production deployment, not a preview or stale project.
   - Confirm 15 `/ai-for/[career]` hubs are reachable or record the exact missing set.

2. Signup and consent
   - Run one seed signup with an owned test inbox only.
   - Confirm double opt-in gates sending and records consent timestamp plus checkbox text without exposing those fields to analytics.
   - Confirm unconfirmed subscribers do not enter the daily-send queue.

3. Email deliverability
   - Confirm Resend domain status, DKIM/SPF/DMARC, inbound MX/support route, bounce/complaint webhook readiness, and footer physical address.
   - Send only seed/test emails unless Miguel approves the first customer broadcast.
   - Check Gmail inbox placement and one-click unsubscribe headers.

4. News and archive integrity
   - Verify the daily generation job has grounded items for Marketing, Product, and Founder.
   - Confirm every rendered source URL is in the fetched-source set.
   - Confirm send idempotency: rerunning the same date inserts zero duplicate `sends` rows.
   - Confirm archive counts show only real accreted briefings and the rolling 14-day boundary.

5. Analytics and attribution
   - Confirm PostHog/GA4 events fire only with anonymized ids and coarse role/seniority labels.
   - Confirm primary conversion is confirmed double opt-in; Pro purchase remains secondary.
   - Confirm Google Ads and Meta receive no profile data or raw PII.

6. Billing
   - Confirm the exact Pro price is locked before live billing copy or Stripe live-mode checkout is considered complete.
   - Test mode is acceptable for verification; live billing changes require explicit approval.

7. SEO and indexing
   - Confirm canonical host, sitemap, robots, and category hub metadata.
   - Submit or request indexing only through approved Search Console/IndexNow paths; record provider account/property evidence.

8. Social and paid ads
   - Draft only. Do not public-post or activate spend.
   - Confirm social pages/handles and ad accounts from signed-in provider surfaces before recording them as ready.

## Week-One Daily Checklist

Run daily for the first seven launch days.

- Production routes: home, onboarding, sample, privacy, terms, sitemap, robots, and category hubs return healthy responses.
- Signup funnel: at least one owned seed path or real provider metric confirms landing to double opt-in.
- Confirmed subscribers: unconfirmed users are excluded; confirmed users are eligible for sends.
- Daily send: job ran or exact blocker recorded; grounded-source guard passed; duplicate-send count is zero.
- Deliverability: Resend sends, bounces, complaints, unsubscribes, and support replies are reconciled.
- Archive: real trailing-14-day data visible; no fabricated counts or backfill claims.
- Analytics: PostHog/GA4 conversion counts reconcile with Supabase/Resend within expected delay.
- SEO: sitemap and hub coverage checked; Search Console/IndexNow status recorded when provider access allows.
- Support: support inbox checked; customer-impacting replies are drafted or sent only within approved mode.
- Paid/social: campaigns remain paused unless Miguel approved spend; social posts remain drafts unless Miguel approved publishing.
- Evidence: save screenshots, provider ids, log snippets, or report paths, then post checklist evidence through Warm Start once recurring phase is approved.

## Weekly Operating Checklist

Run every week after the first seven days.

- Review D7/D14 open rate, click rate, confirmed-subscriber growth, churn/unsubscribes, complaints, and bounce rate.
- Audit sample issues for source integrity, duplicated stories, missing primary-source URLs, and claims risk.
- Refresh public SEO hubs from real recent briefings; keep seniority/daily variants noindex.
- Review Search Console coverage, queries, crawl errors, and sitemap discovery.
- Reconcile PostHog, GA4, Resend, Supabase, Stripe, Google Ads, and Meta metrics.
- Check Pro checkout status, failed payments, support complaints, and refund/cancel requests.
- Review social drafts and ad creatives for claims compliance before Miguel approval.
- Confirm the support mailbox is receiving and that replies meet the current approval mode.
- Update launch notes and Warm Start primitives when non-secret provider/account URLs or blockers change.

## Provider Reconciliation

Use signed-in Chrome for provider dashboards when account ownership matters. Record the visible account, page, property, or project in evidence.

| Provider | Reconcile | Approval gate |
|---|---|---|
| Vercel | Production deployment, domain, environment ownership, cron schedule, DNS records | DNS/domain/env mutations |
| GitHub | Main branch, Actions daily-send job, deploy-trigger commits | Destructive git actions |
| Supabase | Subscribers, consent, confirmed_at, briefings, sends uniqueness, archive rows | Schema/data destructive actions |
| Resend | Domain verification, broadcast/test sends, bounces, complaints, unsubscribe headers, support routing | Customer emails and mailbox/domain changes |
| Stripe | Exact price, test checkout, webhook status, Pro subscription reporting | Live billing, refunds, price changes |
| PostHog | Product project, event taxonomy, PII exclusion, funnel counts | New project/account mutation if ambiguous |
| GA4 | Property id, pageviews, conversion events, no PII | Account/property mutation |
| Search Console | Property, sitemap submission, indexing coverage | New property/DNS verification if not pre-approved |
| IndexNow | Key file, submitted URL set, response logs | None unless provider/domain changes are needed |
| Google Ads | Conversion action, tag firing, campaign state, no PII | Paid spend, campaign activation |
| Meta | Pixel/dataset, page/ad account, campaign state, no PII | Paid spend, public posting |
| X/Facebook/YouTube | Owned account/page/channel, drafts, UTM links | Public posting |

## Escalation Rules

Stop and ask Miguel at the exact action point for:

- MFA, CAPTCHA, login recovery, or ambiguous account ownership.
- Paid spend, campaign activation, or budget changes.
- Public posting to social channels.
- Customer emails or first real newsletter broadcast.
- Live billing, refunds, price changes, or Stripe live-mode changes.
- DNS, domain, support mailbox, or provider-account mutations.
- Destructive or irreversible changes.

Record these as blockers only when the task has reached that exact action point. Until then, continue with read-only checks, drafts, local configuration, and provider inspection.

## Warm Start Handoff

Recurring topics to activate only after explicit approval:

- `funnel_refresh`: source-of-truth provider metrics, tracked through T07.
- `blog_post_live`: real content/SEO artifact publication, tracked through T09.
- `tweets_news`: draft or approved posts, tracked through T11.
- `channel_video`: video publish evidence, tracked through T11.
- `fb_page_post`: Facebook page publish evidence, tracked through T11.
- `index_pages`: Search Console/IndexNow evidence, tracked through T09.
- `cs_tickets_replied`: support sweep evidence, tracked through T05.

Until activation, this file is the operating runbook and evidence contract only.
