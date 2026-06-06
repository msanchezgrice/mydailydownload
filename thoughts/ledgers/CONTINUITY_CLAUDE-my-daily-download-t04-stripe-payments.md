# Session: my-daily-download-t04-stripe-payments
Updated: 2026-06-06T00:07:13-05:00

## Goal
Complete launch workstream T04 for My Daily Download. Done means product-specific Stripe price evidence is recorded, checkout starts for an allowed path, unsigned webhook payloads reject, launch-pack status files are current, and heartbeat closeout is posted without exposing secrets.

## Constraints
- Product repo: `/Users/miguel/MyDailyDownload`; active app: `/Users/miguel/MyDailyDownload/web`.
- Launch pack: `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z`.
- Use TDD before production behavior changes.
- Stop at action-time gates: MFA, CAPTCHA, paid spend, public posting, billing/account mutations, domain/customer-email changes, destructive or irreversible actions.
- Use existing Vercel GitHub integration by default; avoid claimable deployments.
- Do not print, store, or expose secrets. Do not read `.env.local` values.
- Public heartbeat requires `PORTFOLIO_TRACKER_SETUP_WRITE_TOKEN`; it was unavailable at startup, so only local heartbeat was posted.

## Key Decisions
- Active checkout route is `web/app/api/checkout/route.ts`; active webhook route is `web/app/api/stripe-webhook/route.ts`.
- Use subscription Checkout with Stripe Prices and omit `payment_method_types` so Stripe dynamic payment methods remain enabled.
- Current spec leaves price range as `$15-19/mo`; existing product docs/code record `$19/mo`, so T04 should preserve the locked existing price unless provider evidence contradicts it.

## State
- Done: Read launch pack state, spec/design brief, Stripe guidance, Next route handler docs, active checkout/webhook routes. Posted local heartbeat as `running`. Spawned read-only explorer for price/provider evidence. Added focused TDD coverage, confirmed red on hardcoded `payment_method_types`, removed that field, and reached green on `npm run test:stripe`, `npm run lint`, and `npm run build`. Live smoke passed: `/api/stripe-webhook` unsigned returns 400 and `/api/checkout` returns an unpaid `checkout.stripe.com` `cs_live_...` URL. Updated product docs and launch-pack T04 status/evidence/manifest/ledger/primitives.
- Now: T04 closeout heartbeat.
- Next: Coordinate a clean/shared GitHub to Vercel deployment of the small dynamic-payment-method cleanup; do not push the mixed concurrent worktree from this T04 thread.

## Open Questions
- UNCONFIRMED: Direct provider retrieval of recorded price `price_1Tf5maPnLtm1veVCknVonjFS` remains unavailable through current local CLI/connector because those read paths are authenticated to a different Stripe account context.
- UNCONFIRMED: Whether public heartbeat can be posted later if token becomes available in this shell.

## Working Set
- Branch: `main` ahead of `origin/main` by 11 at session start; untracked `../.playwright-mcp/` pre-existing. Worktree later received concurrent edits from other launch tasks, so no push/commit was made from T04.
- Key files: `web/app/api/checkout/route.ts`, `web/app/api/stripe-webhook/route.ts`, `web/tests/stripe-routes.test.mjs`, `web/tests/stripe-route-loader.mjs`, `web/docs/stripe-payments.md`, launch-pack `launch-runs/T04/status.md`, `launch-runs/T04/stripe-payments-evidence.md`, `task-manifest.json`, `TASKS.md`, `launch-ledger.md`, `warm-start-primitives.json`.
- Test cmd target: `npm run test:stripe`.
- Build cmd: `npm run build` from `web/`.
