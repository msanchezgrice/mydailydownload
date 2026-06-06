# SEO Strategy — My Daily Download

> Note: no dedicated `seo` skill exists in the toolset — this is authored directly. Technical implementation uses Next.js (App Router) on Vercel (`/vercel:nextjs`, `/vercel:next-forge`) for sitemap, ISR metadata, and IndexNow.

## Thesis
The product *is* the content engine. Every daily 45-variant generation accretes a real archive → a thin, high-intent public surface ranks for "AI for [profession]" intent, and feeds the newsletter signup. **Forward-only** (no fabricated backfill).

## Index strategy (thin-content–safe by design)
- **Index 15 category hubs:** `/ai-for/[career]` (one per profession), refreshed ~weekly from that category's recent real briefings.
- **Index the initial 20 evergreen article cluster:** `/blog` plus 20 `/blog/[slug]` guides. These are evergreen role/workflow guides, not fabricated current-news recaps.
- **`noindex` everything else:** the 3 seniority variants per category, and the daily issues, live in the email + the gated rolling-2-week archive — never in the public index. This eliminates Google "scaled content abuse" / thin-content exposure (45 near-dupes/day is the trap we avoid).
- **Gated archive:** signup → rolling **last 14 days** of the user's category (real, accretes from launch). Honest replacement for the fabricated "500+ archive."

## Keyword clusters (per launch vertical)
- **Head:** "AI for marketers", "AI for product managers", "AI for founders/startups".
- **Body:** "best AI [marketing/PM/founder] tools 2026", "AI [vertical] newsletter", "AI tools for [seniority] [vertical]".
- **Long-tail (from briefing how-tos):** "how to [generate 30 social posts / write a PRD with AI / write an investor update] with AI".
- Each hub interlinks: hub → its evergreen how-tos → signup; hubs cross-link to adjacent verticals.

## Technical SEO
- Next.js metadata API per hub (title/description/canonical/OG), JSON-LD `Article`/`ItemList`.
- `/sitemap.xml` (15 hubs + evergreen pages only), `/robots.txt` (disallow `/archive/*` variant URLs).
- **IndexNow** key file + ping on hub refresh; **Google Search Console** property (DNS-verified) for coverage/queries.
- Canonical: seniority/daily variant URLs `rel=canonical` → the category hub (or `noindex`).

## Launch content calendar (first 4 weeks)
- **Initial article cluster created 2026-06-06:** 20 evergreen `/blog/[slug]` guides cover Marketing, Product, Founder, Sales, Design, Engineering, Customer Success, Operations, Data Science, Consulting, and weekly roundup workflows.
- **Wk 1:** 3 launch hubs live (Marketing, Product, Founder) + 1 evergreen pillar each ("Best AI tools for [vertical] 2026"). Submit to Search Console + IndexNow after production deploy.
- **Wk 2:** 3 more pillars (how-to long-tail per vertical); start daily newsletter (real, cited) to seed the archive.
- **Wk 3:** add Sales + Design supporting guides and social repurpose drafts.
- **Wk 4:** first "Weekly Roundup" long-form pillar; review Search Console coverage.

## Social repurpose loop (growth)
- **5 vertical X accounts** — Marketing, Product, Founder, Sales, Design — + brand master; **Facebook page Mydailydownload**.
- Each daily issue's top items → auto-drafted threads/posts (per vertical) → **human-approve → post** (gated). CTA → category signup.
- Track UTM per channel; non-openers sunset at 30–60 days (protects sender reputation, a real cost lever).

## Measurement
PostHog (signup funnel, activation = first issue opened), GA4 + Search Console (organic queries/coverage), Resend (open/click), Stripe (Pro conversion). North-star: confirmed-subscriber growth + D7/D14 open rate.
