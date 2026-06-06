# My Daily Download Content Calendar

Updated: 2026-06-06

## Purpose
This is the Warm Start handoff for the post-launch `blog_post_live` automation. Do not activate recurring daily automation until launch workstreams are complete or explicitly deferred, production evidence is recorded, and Miguel approves the recurring phase.

## Content Strategy
- Primary audience: working professionals who want AI news tied to their role and seniority.
- Launch verticals: Marketing, Product, Founder.
- Indexed surfaces: the 15 `/ai-for/[career]` category hubs, evergreen pages, `/blog`, and the initial 20 evergreen `/blog/[slug]` guides. Daily issues, seniority variants, and gated archive content stay out of the public index.
- Source rule: do not publish fabricated news, stats, quotes, headlines, sources, funding numbers, or archive counts. Every current-news item needs a real source URL.
- CTA rule: every content piece should route to the matching career onboarding path, for example `/onboarding?career=marketing`.

## Initial 20 SEO Articles

Created locally on 2026-06-06 under `/Users/miguel/MyDailyDownload/web/app/lib/seoArticles.ts`, exposed through `/blog` and `/blog/[slug]`, and included in `web/app/sitemap.ts`.

| Article | URL |
|---|---|
| Best AI tools for marketers in 2026 | `/blog/best-ai-tools-for-marketers-2026` |
| Best AI tools for product managers in 2026 | `/blog/best-ai-tools-for-product-managers-2026` |
| Best AI tools for founders in 2026 | `/blog/best-ai-tools-for-founders-2026` |
| What to look for in an AI newsletter for marketers | `/blog/ai-newsletter-for-marketers` |
| What to look for in an AI newsletter for product managers | `/blog/ai-newsletter-for-product-managers` |
| What to look for in an AI newsletter for founders | `/blog/ai-newsletter-for-founders` |
| How marketers can turn one AI briefing into 30 useful posts | `/blog/turn-one-ai-briefing-into-30-marketing-posts` |
| How PMs can turn support tickets into a ranked PRD with AI | `/blog/turn-support-tickets-into-ranked-prd-with-ai` |
| How founders can write better investor updates with AI | `/blog/write-investor-updates-with-ai` |
| AI prompts for marketing campaigns that keep strategy intact | `/blog/ai-prompts-for-marketing-campaigns` |
| AI prompts for product strategy that PMs can actually use | `/blog/ai-prompts-for-product-strategy` |
| AI prompts for founder operations | `/blog/ai-prompts-for-founder-operations` |
| AI for sales teams: a practical prospecting workflow | `/blog/ai-for-sales-teams-prospecting-workflow` |
| AI for design teams: faster prototype reviews without losing taste | `/blog/ai-for-design-teams-prototype-reviews` |
| AI for engineering managers: code review and delivery signal | `/blog/ai-for-engineering-managers-code-review` |
| AI for customer success: turning account noise into retention signals | `/blog/ai-for-customer-success-retention-signals` |
| AI for operations teams: workflow automation that survives reality | `/blog/ai-for-operations-teams-workflow-automation` |
| AI for data science: analysis triage before deeper modeling | `/blog/ai-for-data-science-analysis-triage` |
| AI for consultants: client-ready synthesis without generic decks | `/blog/ai-for-consultants-client-ready-synthesis` |
| A weekly AI roundup template for busy professionals | `/blog/weekly-ai-roundup-template` |

## First 4 Weeks

| Week | Content | Target URL/Surface | Notes |
|---|---|---|---|
| 1 | Best AI tools for marketers in 2026 | New evergreen article or hub section linked from `/ai-for/marketing` | Use real tool/source links only. |
| 1 | Best AI tools for product managers in 2026 | New evergreen article or hub section linked from `/ai-for/product-management` | Tie tools to roadmap, research, and PRD workflows. |
| 1 | Best AI tools for founders in 2026 | New evergreen article or hub section linked from `/ai-for/entrepreneurship` | Focus on fundraising, ops leverage, and founder workflows. |
| 2 | How marketers can turn one briefing into 30 posts | Blog/evergreen article linked from Marketing hub | Repurpose workflow, no unsupported performance claims. |
| 2 | How PMs can turn support tickets into a ranked PRD | Blog/evergreen article linked from Product hub | Include source-cited examples when using recent AI launches. |
| 2 | How founders can write investor updates with AI | Blog/evergreen article linked from Founder hub | Include concrete prompt structure and CTA to Founder briefing. |
| 3 | AI for sales teams hub refresh | `/ai-for/sales` | Use real latest briefing data when available; otherwise keep sample clearly labeled. |
| 3 | AI for designers hub refresh | `/ai-for/design` | Use hub update plus social draft, approval-gated. |
| 3 | Launch vertical cross-links refresh | Existing 15 hubs | Add contextual internal links among adjacent roles. |
| 4 | Weekly AI roundup for marketers | Blog/evergreen article linked from Marketing hub | Friday roundup format, source-cited. |
| 4 | Weekly AI roundup for PMs | Blog/evergreen article linked from Product hub | Focus on product decisions and tool changes. |
| 4 | Weekly AI roundup for founders | Blog/evergreen article linked from Founder hub | Funding, startup tools, and one ask. |

## Recurring Blog Automation Inputs
- Brand brief: `/Users/miguel/MyDailyDownload/launcher/spec.md`
- SEO strategy: `/Users/miguel/MyDailyDownload/launcher/seo-strategy.md`
- Content calendar: `/Users/miguel/MyDailyDownload/launcher/content-calendar.md`
- Indexing URL set: `/Users/miguel/MyDailyDownload/launcher/indexing-url-set.md`

## Approval Gates
- Public posting and social publishing remain approval-gated.
- Search Console manual submission or URL inspection actions remain action-time gated if the UI reaches an irreversible submit/request step.
- No recurring automation should start from T09 itself.
