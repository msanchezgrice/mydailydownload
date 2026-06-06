# Session: my-daily-download-t07-analytics-attribution
Updated: 2026-06-06T00:19:21-05:00

## Goal
Define and implement the launch analytics/attribution surface for My Daily Download: event taxonomy, UTM/click ID capture, PostHog, GA4, Google Ads, and Meta signals. Completion requires a documented event map, explicit PII exclusions, and provider receipt or network proof.

## Constraints
- Use TDD for production behavior changes.
- Do not revert unrelated launch-stream edits in the shared dirty worktree.
- No secrets in files, logs, status, or handoff notes.
- Do not start recurring daily automations until launch workstreams are complete or explicitly deferred, production launch evidence is recorded, and Miguel approves the recurring phase.
- Provider/account mutations, paid spend, public posting, billing, domain, and customer-email changes remain action-time approval gates.

## Key Decisions
- Keep analytics properties deliberately coarse: anonymous IDs, event IDs, career ids, seniority buckets, plan names, funnel steps, UTM/click IDs, and aggregate counts.
- Strip email addresses, LinkedIn URLs, resume references, employer/company/job-title fields, consent IP/text, Stripe customer IDs, and payment data before any provider dispatch.
- Use first-touch attribution stored client-side under `mdd_attribution` and share a generated `event_id` across provider payloads for later dedupe.
- Add PostHog client initialization and `/ingest` rewrites, but leave sending gated behind `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` because no My Daily Download PostHog project was visible in read-only provider inspection.
- Preserve existing Google Ads browser conversions while adding server-side analytics dispatch paths for PostHog, GA4 Measurement Protocol, and Meta CAPI.

## State
- Done: Added analytics taxonomy, attribution capture, sanitizer, provider payload builder, server dispatch, and `/api/analytics`.
- Done: Wired homepage, onboarding, subscribe, confirm, Stripe webhook, and unsubscribe funnel events.
- Done: Added env-gated PostHog client init, Meta Pixel PageView, and PostHog `/ingest` rewrites.
- Done: Documented event map, PII exclusions, provider envs, evidence, and follow-ups in `web/docs/analytics-attribution.md`.
- Done: Verified focused tests, lint, build, local network proof, and public GA4 tag proof.
- Now: Launch state is `waiting_external` for provider/env setup and shared production deployment.

## Open Questions
- UNCONFIRMED: My Daily Download PostHog project does not exist in the visible read-only provider account context; create or select the project before setting the client project token.
- UNCONFIRMED: `GA4_API_SECRET`, `NEXT_PUBLIC_META_PIXEL_ID`, and `META_CAPI_ACCESS_TOKEN` are not configured locally and must be set only through the appropriate deployment/provider flow.
- UNCONFIRMED: Production currently serves the existing GA4 tag, but not the new local T07 code until shared launch changes deploy.

## Working Set
- Launch pack: `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z`
- Product repo: `/Users/miguel/MyDailyDownload`
- Branch: `main`, shared dirty worktree with multiple concurrent launch-stream edits.
- Core files: `web/app/lib/analytics.ts`, `web/app/lib/analyticsServer.ts`, `web/app/lib/clientAnalytics.ts`, `web/app/api/analytics/route.ts`, `web/instrumentation-client.ts`, `web/next.config.ts`, `web/app/layout.tsx`.
- Tests: `web/app/lib/analytics.test.mjs`, `web/tests/analytics-route.test.mjs`, `web/tests/analytics-wiring.test.mjs`.
- Documentation: `web/docs/analytics-attribution.md`, launch-pack `launch-runs/T07/status.md`, `warm-start-primitives.json`.

## Verification
- `npm run test:analytics`
- `npm run test:script-budget`
- `npm run test:stripe`
- `node --test tests/google-ads-wiring.test.mjs`
- `npm run test:seo`
- `node --test tests/legal-compliance.test.mjs`
- `npm run lint`
- `npm run build`
- Local render proof: `http://localhost:3000/?utm_source=google&utm_medium=cpc&gclid=test-local-proof` returned HTTP 200.
- Local analytics API proof: `POST http://localhost:3000/api/analytics` returned `ok:true`; provider receipts skipped only because required env values were absent.
- Public proof: `https://mydailydownload.com` served GA4 measurement ID `G-X27FVHNW9T`.

## Residual Risk
- `npm audit --audit-level=moderate` reports a Next/PostCSS advisory whose automated fix would force a breaking Next downgrade; do not run `npm audit fix --force`.
- Live provider receipts still need production envs and deployment.
