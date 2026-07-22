# Agents guide — mydailydownload.com

## What the product does

My Daily Download is a personalized daily email briefing of AI news, tools, and
tactics. Each briefing is tailored to the subscriber's career vertical (15
supported professions) and seniority level, and every item cites a real source.
Delivery defaults to 7 AM in the subscriber's local timezone.

My Daily Download is now part of My AI Skill Tutor (myaiskilltutor.com). All
signup/subscribe CTAs on this site link to MAST's free AI-readiness assessment;
existing subscriptions continue to work.

## Key routes

- `/` — landing page: hero, how it works, career verticals, sample preview, pricing, FAQ
- `/sample` — full sample guide (query param `?career=<id>` selects a vertical)
- `/blog` and `/blog/<slug>` — career-specific AI guides
- `/ai-for/<career-id>` — per-profession hub pages (e.g. `/ai-for/product-management`)
- `/onboarding` — authenticated subscriber profile setup
- `/sign-in` — Clerk authentication
- `/contact`, `/privacy`, `/terms`, `/refunds` — support and policy pages
- `/llms.txt`, `/agents.md`, `/.well-known/agent-card.json`, `/.well-known/ai-agent.json` — machine-readable files

## How agents should interact

- **Reading/citing**: Freely read and cite public pages (`/`, `/sample`, `/blog/*`, `/ai-for/*`, policy pages). Content is static and SSR'd.
- **Primary CTAs** are tagged with `data-testid` and `data-agent-action`. They navigate to the external MAST assessment; no payment happens on this site.
- **Forms**: The only public interactive control is a career preview `<select>` on the home and sample pages. Account/profile forms live behind sign-in at `/onboarding`.
- **Do not** attempt purchases, account creation, or sign-in on a user's behalf without explicit user instruction. Subscription cancellation is handled by emailing support@mydailydownload.com or the one-click unsubscribe link in every email — there is no self-serve cancel button on the site.
- **API**: `/api/*` routes are internal (subscribe, confirm, unsubscribe, analytics, Stripe webhooks) and disallowed in robots.txt. Do not call them except the documented one-click unsubscribe flow (`/api/unsubscribe?token=...`) when acting on an explicit user request with a token from their email.

## Contact

support@mydailydownload.com
