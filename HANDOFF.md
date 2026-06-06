# My Daily Download — Build Handoff

**Live:** https://mydailydownload.com · **Repo:** github.com/msanchezgrice/mydailydownload (private) · **Plan:** `~/.claude/plans/analyze-the-folder-kimi-frolicking-matsumoto.md`

A daily, career-personalized AI newsletter. Pivot from myaiskilltutor.com. The product invariant: **never ship a fabricated fact — every news item cites a real primary source** (engine has a hard URL-in-fetched-set guardrail).

## Working & live
- **Landing / onboarding / sample / privacy / terms** — Vite SPA (HashRouter) at the apex.
- **Real double-opt-in signups** — `POST /api/subscribe` → Supabase `subscribers` (consent ts+IP+text, unguessable tokens) → **confirmation email** → `/api/confirm` → **welcome email**. `/api/unsubscribe` one-click. All verified live.
- **Real-news engine** (`newsletter-backend/`) — RSS (38 feeds) + **Exa** + AgentMail-stub lanes → dedup → per career×seniority rank → grounded gpt-4o-mini summarize → guardrail. `news_engine.py build_briefing(...)`.
- **Daily send** — `run_daily.py` (generate-if-missing + idempotent send via `sends` table) on **GitHub Actions cron** `0 11 * * *` (7 secrets set). Verified idempotent.
- **Briefing archive** — Supabase `briefings` (9 seeded: 3 careers × 3 tiers). Examples: `newsletter-backend/examples/*.html`.
- **Email** — Resend, domain mydailydownload.com **verified** (DKIM/SPF/DMARC + inbound MX in Vercel DNS). Address now in footers (8808 Mesa Drive, Austin, TX).

## Infra / accounts / IDs
- **Vercel** team `miguel-sanchezgrices-projects` (user `msanchezgrice-9758`). Live project = **`app`** (apex aliased manually after each `vercel deploy --prod`; deployment protection DISABLED via API). Domain registered in Vercel.
- **Supabase** project `mydailydownload` ref **`wzhnfctutueunirvciol`** (us-east-1). Tables: subscribers, news_items, briefings, sends. ⚠️ direct host is IPv6-only → `db.py` falls back to the IPv4 pooler `aws-1-us-east-1.pooler.supabase.com`.
- **Resend** domain id `d7f12968-7f21-4bca-953e-96a0cc09b771`; from `newsletter@mydailydownload.com`.
- **Stripe** account `acct_1Tf4DDPnLtm1veVC` — **Pro product `prod_UeOZFv6cuF7xpv`, price `price_1Tf5maPnLtm1veVCknVonjFS` ($19/mo)**. ⚠️ keys provided are **LIVE** (sk_live) — recommend rotating + using test mode for checkout dev.
- **GA4** `G-X27FVHNW9T`. **AgentMail** inbox `mydailydownload@agentmail.to` (no newsletters subscribed yet). LinkedIn enrichment SKIPPED (Proxycurl dead).
- **Keys** — all in gitignored `Kimi_Agent_AI Skill Tutor MVP/newsletter-backend/.env`. Vercel `app` project env has SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.

## In progress
- **#2 Next.js migration** — agent building in **`web/`** (new dir), deploying to a **preview** project `mydailydownload-web` (NOT the apex; live site stays up). Goal: parity + port api routes + **server-rendered `/ai-for/[career]` SEO hubs** + sitemap. Check the agent's result; verify `curl <preview>/ai-for/marketing` returns real server-rendered briefing HTML.

## Next (in order)
1. **Verify the Next.js preview** (#2) — SEO hub server-rendered? sitemap? signup works on preview?
2. **#3 Stripe checkout** — build onto the Next.js app: `/api/checkout` (create Checkout Session for `price_1Tf5ma…`), `/api/stripe-webhook` (checkout.session.completed → set plan=pro), wire the Pricing "Go Pro" button. Set STRIPE_SECRET_KEY on Vercel. Verify a session URL (no real charge).
3. **Apex cutover** — once Next.js verified, point mydailydownload.com at `mydailydownload-web` (set env, disable protection, alias apex). Then SEO: submit sitemap to Search Console + IndexNow.
4. **Social** — 5 vertical X accounts (Marketing/Product/Founder/Sales/Design) + repurpose loop (approval-gated).
5. **Launcher** — `launcher/` (8 files) ready to hand off to the GTM launch-checklist tool.

## Gotchas / lessons
- **Vercel api functions must be SELF-CONTAINED** — `_`-prefixed shared files are excluded from the deployment (caused ERR_MODULE_NOT_FOUND). Inline helpers per function.
- **`vercel deploy --prod` does NOT auto-update the apex** (manual alias was used) — `vercel alias set <new-url> mydailydownload.com`. Capture URL via `grep -oE 'https://app-[a-z0-9]+-…vercel.app'`.
- HashRouter → routes are `/#/sample` etc.; SPA can't rank → that's why the Next.js migration.
- `generate_all`/`run_daily` take a few minutes (9 cells × fetch+LLM) → GitHub Actions, not serverless.
- Local `npx tsc -b` does NOT validate `app/api/*` (Vercel compiles those separately).

## Commits (branch main)
`d05b61b` address · `5b6843f` daily cron · `f75a4b8` signups+emails+archive · `e7f96c4` engine+schema+design · `86fbbd5` initial.

## Review surfaces (local)
`:6990` plan · `:6991` design · `:6992` example briefings · `:5273` local app demo.

---

## UPDATE (latest)
- ✅ **#3 Stripe Pro checkout LIVE** ($19/mo) — `app/api/checkout.ts` + `app/api/stripe-webhook.ts` (webhook `we_1Tf5ukPnLtm1veVCJPa4ITej`, secret in Vercel prod env). Onboarding Pro path → Stripe Checkout. Verified `cs_live_…` session (no charge). Commit `b9e0248`.
- ✅ **#1 daily cron**, **#3 Stripe**, **#4 launcher**, mailing address — all DONE.
- ⏳ **ONLY remaining: #2 Next.js migration** (agent building in `web/` → preview `mydailydownload-web`). When it lands:
  1. Verify `curl <preview>/ai-for/marketing` is server-rendered real briefing HTML + `/sitemap.xml` lists 15 hubs + signup works on preview.
  2. **Re-port Stripe** (`api/checkout` + `api/stripe-webhook`) + the GA4 tag (`G-X27FVHNW9T`) into the Next.js app (the Vite app has them; Next.js won't).
  3. **Apex cutover**: set all env (SUPABASE_*, RESEND_API_KEY, STRIPE_*) on the `mydailydownload-web` project, disable deployment protection via API, `vercel alias set <web-prod-url> mydailydownload.com`. Keep the Vite `app` project as fallback.
  4. SEO: submit sitemap to Google Search Console (already DNS-verified) + IndexNow.
- Then post-launch: social X accounts + repurpose loop; subscribe AgentMail inbox to incumbent newsletters to light up Lane C.
- Commits now: `b9e0248` stripe · `d05b61b` address · `5b6843f` cron · `f75a4b8` signups · `e7f96c4` engine · `86fbbd5` init.

## UPDATE 2 — Next.js DONE (preview); apex cutover is the only remaining step
- ✅ **#2 Next.js migration COMPLETE on preview** — project **`mydailydownload-web`** (`prj_Unzgy1KnP58xw4HWhgBwjMmtnYPM`), preview `https://mydailydownload-1inr3s9kx-miguel-sanchezgrices-projects.vercel.app`. Verified: `/ai-for/marketing` server-renders real "Stensul launches MCP server" + URL; sitemap has 15 hubs; `/api/subscribe` works. Committed.
- web/ env set: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (Prod+Dev). Address placeholder FIXED in web/.
- **APEX CUTOVER CHECKLIST (do in a fresh session — touches live):**
  1. Port Stripe into web/: copy `api/checkout` + `api/stripe-webhook` logic as App Router `web/app/api/checkout/route.ts` + `stripe-webhook/route.ts` (self-contained); `npm i stripe` in web/; wire the Pro button. Update the Stripe webhook endpoint URL (currently points at the Vite app's /api/stripe-webhook — same apex path, so it KEEPS WORKING after cutover; verify).
  2. Add GA4 tag `G-X27FVHNW9T` to web/ root layout.
  3. Set STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET on `mydailydownload-web` (Prod). Connect the GitHub repo to the project so Preview env works without inline flags.
  4. Backfill briefings for the other 12 careers (run `run_daily`/`generate_all` for all 15×3) so every hub is live-cited (today only marketing/product-management/entrepreneurship have real data; rest show honest sample fallback).
  5. `vercel deploy --prod` web/ → `vercel alias set <web-prod-url> mydailydownload.com`. Keep `app` (Vite) as instant rollback.
  6. SEO: submit `https://mydailydownload.com/sitemap.xml` to Google Search Console (DNS-verified) + IndexNow.

## UPDATE 3 — APEX CUTOVER COMPLETE ✅ (2026-06-05)
**mydailydownload.com now serves the Next.js app (`mydailydownload-web`).** All cutover steps done + verified live.
- **Apex flipped** → deployment `mydailydownload-dhoas0t1t-…vercel.app` (project `mydailydownload-web`). Verified: `/` 200 (51KB SSR, `__next`+`/_next/`+GA4, no Vite markers), `/ai-for/*` real SSR, `/sitemap.xml` 15 hubs, `/robots.txt` 200.
  - **ROLLBACK (instant):** `vercel alias set app-61b36zzpc-miguel-sanchezgrices-projects.vercel.app mydailydownload.com` (Vite `app` project kept intact).
- **Stripe ported to App Router** — `web/app/api/checkout/route.ts` + `stripe-webhook/route.ts` (self-contained, `req.text()` raw-body verify). `stripe` added to web deps. **Pro button now wired**: onboarding subscribe → if plan=pro, POST `/api/checkout` → redirect to Stripe Checkout (verified live `cs_live_…`, no charge). Success `/?pro=success`, cancel `/onboarding?pro=cancel`.
  - **Price reconciled $12→$19** in `web/app/page.tsx` + `OnboardingClient.tsx` (matches Stripe price `price_1Tf5ma…`).
  - **Webhook secret was NOT recoverable** (Vercel Sensitive vars pull as blank). Solution: minted a NEW endpoint **`we_1Tf6WwPnLtm1veVCNQWstYj0`** (enabled) at the same apex path → captured its signing secret → set on web prod. **Old `we_1Tf5ukPnLtm1veVCJPa4ITej` = DISABLED** (re-enable to revert). Apex webhook verified alive (400 "Missing stripe-signature header" = secret loaded).
  - Web prod env now has: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, **STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET**.
- **GA4** `G-X27FVHNW9T` added to `web/app/layout.tsx` via `next/script` (verified in apex HTML).
- **Backfill DONE** — Mid Level briefings generated for the 12 missing careers (`backend/backfill_hubs.py`); **all 15 careers now have a Mid Level briefing (2026-06-05)**, so every `/ai-for/[career]` hub is live-cited. Junior/Senior fill in on demand via `run_daily`.
- **IndexNow** — key file `web/public/2503e097d56b9a4de0e2276c8ee22c58.txt` live; original 20 URLs were submitted, then the expanded 43-URL sitemap including 20 `/blog/[slug]` articles was resubmitted on 2026-06-06 with HTTP 200.
- **REMAINING (manual, needs your Google login):** submit `https://mydailydownload.com/sitemap.xml` in Google Search Console (domain already DNS-verified). robots.txt already advertises the sitemap, so Google will also auto-discover.
- **Hub copy fix** — the SEO H1 + meta description were pluralizing the category name (`{name}s` → "saless", "marketings", "customer successs" on 14/15 hubs). Added a per-career `AUDIENCE` map in `web/app/ai-for/[career]/page.tsx`; H1 now reads "AI news that actually matters to marketers / founders / sales teams / product managers …". Verified live across hubs.
- **Live browser smoke test** — home, `/ai-for/sales` (real briefing), `/onboarding`: all render correctly, **zero console errors**.
- **Still advisable:** rotate the LIVE Stripe keys (they were pasted in chat). The `app` (Vite) project remains as instant rollback; retire it once the Next.js apex has soaked.
- **Current live deployment:** `mydailydownload-37qzmg8e5-…vercel.app`. Rollback to Vite: `vercel alias set app-61b36zzpc-miguel-sanchezgrices-projects.vercel.app mydailydownload.com`.
