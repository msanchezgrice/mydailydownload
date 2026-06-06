# Session: my-daily-download-t08-performance-script-budget
Updated: 2026-06-06T05:12:00-05:00

## Goal
Protect mobile LCP and conversion routes from analytics/ad script drag. Done when the script-budget guardrail is in code, the third-party script plan is documented, desktop/mobile smoke passes, and T08 launch-pack status is closed with evidence.

## Constraints
- Use TDD for production behavior changes.
- Do not revert unrelated launch-stream edits in the shared dirty worktree.
- No secrets in files, logs, or status updates.
- Public heartbeat requires `PORTFOLIO_TRACKER_SETUP_WRITE_TOKEN`; it was not present in this shell.

## Key Decisions
- Use `next/script` `strategy="lazyOnload"` for the Google tag loader and inline `gtag` init so analytics waits for browser idle.
- Guard future analytics/ad/payment scripts with `web/test/script-budget.test.mjs`, including inline analytics init snippets.
- Treat direct Google Fonts CDN references in legacy/design surfaces as out of current production scope, but document them as reopen conditions if those surfaces become production.

## State
- Done: Added `web/test/script-budget.test.mjs` and `npm run test:script-budget`.
- Done: Observed red test against `afterInteractive`, changed GA/gtag loading to `lazyOnload`, then verified green.
- Done: Fixed React lint warnings on touched smoke surfaces by scheduling client restore/animation state updates.
- Done: Documented script plan at `launcher/performance-script-budget.md` and launch evidence at `launch-runs/T08/script-budget-plan.md`.
- Now: Final launch-pack status and heartbeat closeout.
- Next: None for T08 unless final heartbeat fails or a new third-party script is added.

## Open Questions
- UNCONFIRMED: Public hosted heartbeat remains unwritten from this shell because `PORTFOLIO_TRACKER_SETUP_WRITE_TOKEN` is absent.
- UNCONFIRMED: Production deployment/live domain verification is owned by other launch tasks; T08 only verified the built app locally.

## Working Set
- Branch: `main` in `/Users/miguel/MyDailyDownload`, already ahead of `origin/main` with unrelated launch-stream edits.
- Key files: `web/app/layout.tsx`, `web/test/script-budget.test.mjs`, `web/package.json`, `launcher/performance-script-budget.md`.
- Test cmd: `npm run test:script-budget`
- Build cmd: `npm run build`
