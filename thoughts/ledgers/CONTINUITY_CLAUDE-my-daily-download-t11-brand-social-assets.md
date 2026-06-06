# Session: my-daily-download-t11-brand-social-assets
Updated: 2026-06-06T05:08:00Z

## Goal
Complete T11: save brand/social assets, configure or block priority social profiles with exact handoff steps, update Warm Start primitives, and report evidence without public posting.

## Constraints
- No public posts, account mutations, paid spend, MFA/CAPTCHA, billing, or irreversible actions without action-time approval.
- Use My Daily Download brand system: void `#0B0C10`, amber `#F2A900`, wordmark-led, no fabricated stats.
- Preserve unrelated dirty worktree changes from other launch workstreams.
- TDD applies to production behavior changes; SEO/social metadata wiring uses `web/test/seo-contract.test.mjs`.

## Key Decisions
- Asset source of truth is `launcher/brand-assets/`; public OG/link-card PNGs are mirrored to `web/public/brand-assets/`.
- X handles are treated as blocked/unconfirmed until authenticated ownership or reservation is visible.
- Facebook URL can be checked from launch docs/public surface, but stable page IDs require authenticated Meta context.

## State
- Done: required launch-pack docs, spec/design, product design system, and provider intent read; initial local heartbeat posted.
- Now: generate brand/social assets and wire public OG metadata.
- Next: verify/block social surfaces, update primitives and T11 status files/heartbeat.

## Open Questions
- UNCONFIRMED: exact X handle naming and reservation ownership.
- UNCONFIRMED: Facebook page stable ID and owning Meta business/page context.
- UNCONFIRMED: YouTube channel URL or product-owned video surface.

## Working Set
- Branch: `main` in `/Users/miguel/MyDailyDownload` (dirty shared worktree).
- Key files: `launcher/brand-assets/`, `web/public/brand-assets/`, `web/app/layout.tsx`, `web/app/ai-for/[career]/page.tsx`, `web/test/seo-contract.test.mjs`.
- Test cmd: `npm run test:seo` from `/Users/miguel/MyDailyDownload/web`.
- Launch pack: `/Users/miguel/Portfolio tracker/data/launch-packs/my-daily-download-2026-06-06T04-51-05-692Z`.
