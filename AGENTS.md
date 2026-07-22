# AGENTS.md — solo_mydailydownload

## What the product does

**My Daily Download** (https://mydailydownload.com) is a personalized daily
email briefing of AI news, tools, and tactics, curated per career vertical
(15 professions) and seniority level. Every item cites a real source.
Delivery defaults to 7 AM local time.

The product is now part of **My AI Skill Tutor** (myaiskilltutor.com): all
signup/subscribe CTAs on the MDD site funnel to MAST's free AI-readiness
assessment. Existing subscriptions continue to work.

## Repository structure

- `web/` — the Next.js (App Router) app that serves mydailydownload.com.
  This is the deployable site. See `web/AGENTS.md` for framework-specific rules.
  - `web/app/` — routes: `/`, `/sample`, `/blog`, `/ai-for/[career]`,
    `/onboarding`, `/sign-in`, `/contact`, `/privacy`, `/terms`, `/refunds`,
    plus internal API routes under `app/api/` (subscribe, confirm, unsubscribe,
    analytics, Stripe).
  - `web/public/` — static files served at the site root, including the
    machine-readable agent files: `llms.txt`, `agents.md`,
    `.well-known/agent-card.json`, `.well-known/ai-agent.json`.
- `design/`, `marketing/`, `launcher/`, `plan-review/` — design, launch, and
  marketing artifacts (not part of the served site).
- `Kimi_Agent_AI Skill Tutor MVP/` — strategy/research docs for the parent product.
- `thoughts/` — working notes and ledgers.

## Key routes (production)

| Route | Purpose |
| --- | --- |
| `/` | Landing page (hero, how it works, careers, pricing, FAQ) |
| `/sample` | Full sample guide; `?career=<id>` selects a vertical |
| `/blog`, `/blog/[slug]` | Career-specific AI guides |
| `/ai-for/[career]` | Per-profession hub pages |
| `/onboarding` | Authenticated subscriber profile setup |
| `/sign-in` | Clerk authentication |
| `/contact`, `/privacy`, `/terms`, `/refunds` | Support and policy pages |

## Dev commands (inside `web/`)

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test:analytics` / `test:script-budget` / `test:seo` / `test:stripe` — targeted test suites

## How agents should interact

- Treat `web/` as the only deployable surface; static agent-facing files go in
  `web/public/`.
- Do not modify pre-purchase funnel surfaces (pricing, signup/checkout CTAs)
  or above-the-fold hero content without explicit instruction.
- Primary CTAs carry `data-testid` / `data-agent-action`; destructive or
  payment flows must carry `data-agent-danger` / `data-agent-confirm` if added.
- Support contact: support@mydailydownload.com.
