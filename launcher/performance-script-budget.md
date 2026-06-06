# Performance Script Budget

Task: T08 Performance / script budget
Date: 2026-06-06
Scope: production Next.js app in `/Users/miguel/MyDailyDownload/web`.

## Current Third-Party Browser Script Inventory

- GA4 uses measurement id `G-X27FVHNW9T`.
- Google Ads support is env-gated through `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` and label env vars in `web/app/lib/googleAds.ts`.
- `web/app/layout.tsx` loads a single Google tag loader from `https://www.googletagmanager.com/gtag/js` with `strategy="lazyOnload"`.
- The inline `gtag` init snippet also uses `strategy="lazyOnload"`.
- Meta Pixel support is env-gated through `NEXT_PUBLIC_META_PIXEL_ID` and the inline loader uses `strategy="lazyOnload"`.
- No PostHog or Stripe client script loads were found in `web/app`.
- Stripe checkout remains a server-created hosted Checkout redirect. Do not add `js.stripe.com` to landing, sample, or onboarding unless the script budget test is extended and the load is browser-idle gated.
- JSON-LD in `/ai-for/[career]` is a native structured-data `<script>`, not a third-party runtime script.
- Fonts use `next/font/google`; Next self-hosts the font files and removes browser requests to Google Fonts.

## Rules

- Analytics/ad scripts on launch conversion routes must use `next/script` with `strategy="lazyOnload"`.
- `beforeInteractive` and `afterInteractive` are not allowed for analytics, ads, pixels, or hosted payment scripts on `/`, `/onboarding`, `/sample`, or `/ai-for/[career]`.
- New third-party browser hosts must be added to `web/test/script-budget.test.mjs` before shipping.
- Do not send email addresses, LinkedIn URLs, resume data, job titles, employer names, Stripe identifiers, or consent-log fields to analytics/ad platforms.
- Allowed client analytics payloads are coarse career category, seniority tier, funnel step names, anonymized ids, and aggregate counts.
- Keep fonts self-hosted through `next/font` or local static assets. Do not add production `fonts.googleapis.com` or `fonts.gstatic.com` browser requests.

## Verification

Run from `web/`:

```bash
npm run test:script-budget
npm run lint
npm run build
```

Smoke route set:

- Desktop: `/`, `/onboarding`, `/sample`
- Mobile 390x844: `/`, `/onboarding`
- Optional expansion after analytics/ad changes: `/sample?career=marketing`, `/sample?career=product-management`, `/sample?career=entrepreneurship`, `/ai-for/marketing`, `/ai-for/product-management`, `/ai-for/entrepreneurship`

Latest T08 smoke used `next start` at `http://localhost:3000` and Playwright MCP navigation for the desktop and mobile routes above.

## Reopen Conditions

Reopen T08 if any of these happen:

- A new analytics/ad/payment browser script is added to `web/app`.
- Any third-party script changes to `beforeInteractive` or `afterInteractive`.
- PostHog, Google Ads, Stripe.js, another tag manager, or a new Meta Pixel path is added without updating the script budget test and PII exclusions.
- Production routes start requesting Google Fonts or another external font CDN.
- Mobile smoke at 390px shows conversion CTA overflow, inaccessible controls, blank content, or route errors.
- Lighthouse/Web Vitals shows mobile LCP regression after adding provider scripts or creative assets.
- The legacy Vite app or design preview becomes production again. Those older surfaces include direct Google Fonts CDN references and must be converted before launch use.
