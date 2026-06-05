# Launch Notes — My Daily Download

## Known blockers
- **API keys pending** (see `provider-intent.md`): OpenAI, Resend, Supabase, AgentMail, Exa, Tavily, Proxycurl, Stripe, GA4. None block Phase 0 (local demo); they gate Phase 1+.
- **Sending reputation:** mydailydownload.com is a cold domain → 3–4 week warmup + double-opt-in required before any real broadcast.

## Missing assets / access
- support@mydailydownload.com mailbox (create).
- Logo / wordmark mark (currently text wordmark + amber dot; `/design-consultation` to produce a real mark + OG/social art).
- X handles for the 5 verticals (register/authorize); confirm naming convention.
- Confirm PostHog target project (new "My Daily Download" vs existing).

## Unclear / pending decisions
- **Brand name:** confirmed **My Daily Download** (matches domain).
- **Pricing:** Free + Pro **$15–19** — pick the exact number before billing copy ships (recommend $15).
- **Newsletter cadence:** daily for the email/archive; public SEO hubs refresh weekly (not daily).
- **Seniority tiers:** 3 (e.g., IC / Senior / Lead+) — confirm labels.

## Legal / compliance (load-bearing)
- **No fabricated news/stats/quotes, ever** — every item cites a real primary source; hard guard rejects any rendered URL not in the fetched set. This is the #1 product invariant.
- **CAN-SPAM / GDPR / CASL:** double opt-in, physical address in footer, unguessable unsubscribe token + RFC 8058 one-click header, consent log (ts+IP+checkbox text), bounce/complaint → deactivate.
- **Newsletter ingestion = discovery-only:** parse incumbent newsletters to find stories, then **cite the primary source + original prose**; never reproduce their blurbs/ledes/lineups (the *AP v. Meltwater* line). Keep a per-source ToS log.

## Dependencies on Miguel
- Provide API keys (priority order in `provider-intent.md`).
- Confirm: exact Pro price, seniority-tier labels, X handle naming, PostHog project, support mailbox.
- Approve each public/paid/customer-email action when surfaced.

## Founder notes affecting workstream selection
- CEO-mode scope: real LinkedIn parsing + full 45-variant matrix from day one + real archive + SEO/social growth engine.
- Launch verticals: **Marketing, Product, Founder** first; social verticals add **Sales, Design**.
- GTM launcher will consume this package; Phase 0 demo is the sign-off surface (localhost:6990 plan page + :5273 app demo).

---

## Live status (as of this build)
- **Site LIVE:** https://mydailydownload.com (Vite app; Next.js migration in progress in `web/` → will cut over after verification).
- **Working:** real double-opt-in signups (Supabase + consent), confirmation + welcome emails (Resend, verified domain), one-click unsubscribe, Privacy/Terms, briefing archive (9 in Supabase), per-category example briefings.
- **Email DNS:** DKIM/SPF/DMARC + inbound MX verified.
- **In progress:** daily send cron (GitHub Actions), Next.js migration + SEO hubs (`/ai-for/[career]`), Stripe Pro checkout.
- **Launch blocker:** physical mailing address placeholder in email footers (CAN-SPAM) — needs a real PO box / virtual address.
