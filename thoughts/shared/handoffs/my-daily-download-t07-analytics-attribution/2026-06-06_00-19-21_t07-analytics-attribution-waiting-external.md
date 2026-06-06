---
date: 2026-06-06T00:19:21-05:00
session_name: my-daily-download-t07-analytics-attribution
researcher: Codex
git_commit: c1cef11
branch: main
repository: MyDailyDownload
topic: "T07 Analytics / Attribution Handoff"
tags: [launch, analytics, attribution, posthog, ga4, meta]
status: waiting_external
last_updated: 2026-06-06
last_updated_by: Codex
type: implementation_strategy
root_span_id:
turn_span_id:
---

# Handoff: T07 Analytics / Attribution

## Task(s)
T07 is locally implemented and recorded as `waiting_external`. The event map, PII exclusions, attribution capture, provider wiring, local network proof, and public GA4 tag proof are done. Live PostHog, GA4 server-side, and Meta receipts still require provider assets/envs plus shared production deployment.

## Critical References
- `/Users/miguel/MyDailyDownload/web/docs/analytics-attribution.md`
- `/Users/miguel/MyDailyDownload/web/app/lib/analytics.ts`
- `/Users/miguel/MyDailyDownload/web/app/api/analytics/route.ts`
- `/Users/miguel/MyDailyDownload/web/tests/analytics-route.test.mjs`
- `/Users/miguel/MyDailyDownload/web/tests/analytics-wiring.test.mjs`
- `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z/launch-runs/T07/status.md`
- `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z/warm-start-primitives.json`

## Recent Changes
- Added analytics taxonomy, attribution capture, sanitizer, and provider payload generation.
- Added server-side provider dispatch for PostHog, GA4 Measurement Protocol, and Meta CAPI through `/api/analytics`.
- Added `posthog-js` client initialization and PostHog `/ingest` rewrites.
- Added env-gated Meta Pixel PageView.
- Wired funnel events across landing, onboarding, subscribe, confirmation, Stripe webhook, and unsubscribe flows.
- Added focused tests and `npm run test:analytics`.
- Updated launch-pack status, manifest, tasks, ledger, and Warm Start analytics primitive keys.

## Learnings
- Current public production serves GA4 measurement ID `G-X27FVHNW9T`.
- Read-only PostHog provider inspection did not show a My Daily Download project in the visible account context.
- Playwright MCP was unavailable for final browser/provider proof because another worker held the browser profile lock; local shell HTTP proof was used instead.
- Local provider receipt proof returned structured provider statuses and skipped only because envs were not configured.

## Post-Mortem

### What Worked
- TDD captured the taxonomy, PII stripping, provider payloads, and API dispatch before the funnel wiring was finalized.
- Static wiring tests protected the env-gated PostHog/Meta/client capture integration without depending on live provider secrets.
- Existing Google Ads conversion flow was preserved while broader analytics dispatch was added.

### What Failed
- There is no confirmed PostHog project/token for My Daily Download in the visible provider account context.
- Live server-side provider receipts cannot be produced until production envs and deploy are complete.

### Key Decisions
- Decision: Mark T07 `waiting_external` instead of complete.
  - Reason: The launch completion criteria are satisfied locally with documentation and network proof, but live provider receipts and production deploy remain external.
- Decision: Do not create provider assets or set envs from this thread.
  - Reason: Those are account/deployment mutations and should be handled at the exact action-time gate.

## Artifacts
- `/Users/miguel/MyDailyDownload/web/docs/analytics-attribution.md`
- `/Users/miguel/MyDailyDownload/thoughts/ledgers/CONTINUITY_CLAUDE-my-daily-download-t07-analytics-attribution.md`
- `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z/launch-runs/T07/status.md`

## Action Items & Next Steps
- Create or confirm the My Daily Download PostHog project and set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` plus optional `NEXT_PUBLIC_POSTHOG_HOST`.
- Set `GA4_API_SECRET` if GA4 Measurement Protocol server events should be sent.
- Set `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, and optional `META_TEST_EVENT_CODE`; verify in Meta Events Manager Test Events before any paid spend.
- Deploy the shared launch changes through the existing GitHub/Vercel path after workstream coordination.
- Re-run production `/api/analytics` receipt checks and confirm live events in PostHog, GA4 Realtime/DebugView, and Meta Events Manager.

## Other Notes
Verification already run:
- `npm run test:analytics`
- `npm run test:script-budget`
- `npm run test:stripe`
- `node --test tests/google-ads-wiring.test.mjs`
- `npm run test:seo`
- `node --test tests/legal-compliance.test.mjs`
- `npm run lint`
- `npm run build`

`npm audit --audit-level=moderate` still reports a Next/PostCSS advisory; the automated force fix would install an incompatible Next version and was not run.
