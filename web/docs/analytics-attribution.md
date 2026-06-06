# My Daily Download Analytics And Attribution

Updated: 2026-06-06

## Scope

T07 defines the event taxonomy, first-touch attribution capture, provider dispatch, and PII exclusions for My Daily Download. The primary conversion is confirmed double-opt-in subscribe.

## Event Map

| Event | Trigger | Providers | Properties allowed |
|---|---|---|---|
| `landing_viewed` | Homepage loads | PostHog, GA4 | page, UTM/click IDs |
| `career_hub_viewed` | `/ai-for/[career]` hub loads | PostHog, GA4 | career_id, page, UTM/click IDs |
| `cta_clicked` | Primary CTA click | PostHog, GA4 | cta_id, destination, career_id |
| `onboarding_started` | Onboarding page opens | PostHog, GA4 | plan, career_id, UTM/click IDs |
| `profile_preview_generated` | Editable profile preview is generated | PostHog | input_method, career_id, seniority |
| `profile_confirmed` | User confirms/corrects profile | PostHog, GA4 | career_id, seniority |
| `subscribe_submitted` | Double-opt-in form submitted | PostHog, GA4 | career_id, seniority, plan, interest_count |
| `confirmation_email_requested` | Server saved subscriber and attempted confirmation email | PostHog, GA4 | career_id, seniority, plan, interest_count, emailed, already_subscribed |
| `subscription_confirmed` | User clicks confirmation link | PostHog, GA4, Google Ads, Meta | career_id, confirmed_now |
| `checkout_started` | Pro checkout starts | PostHog, GA4, Google Ads, Meta | plan, career_id, seniority |
| `checkout_session_created` | Stripe Checkout Session created | PostHog, GA4 | plan |
| `pro_purchase_completed` | Stripe webhook or checkout return marks Pro | PostHog, GA4, Google Ads, Meta | plan, source, stripe_event_type |
| `unsubscribe_completed` | One-click or token unsubscribe succeeds | PostHog | method |

All provider payloads share a generated `event_id` so browser and server signals can dedupe once Meta/Google labels are configured.

## Attribution Capture

The client stores a non-PII anonymous ID in `localStorage` under `mdd_anonymous_id` and attribution under `mdd_attribution`.

Captured query parameters:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `fbclid`
- `msclkid`
- `ttclid`
- `li_fat_id`

Values are trimmed, length-limited, and dropped when they look like an email address, LinkedIn profile URL, or resume filename.

## PII Exclusions

Never send these to PostHog, GA4, Google Ads, or Meta:

- Email addresses
- LinkedIn profile URLs
- Parsed resume text
- Resume file contents or filenames
- Employer, company, or job title
- Consent IP or consent checkbox text
- Stripe customer IDs
- Payment data

Allowed analytics fields are anonymized event IDs, anonymous browser IDs, coarse `career_id`, coarse `seniority`, funnel step names, plan labels, and aggregate counts.

## Provider Wiring

| Provider | Current wiring | Required env/config |
|---|---|---|
| PostHog | `instrumentation-client.ts` initializes `posthog-js`; `/api/analytics` can dispatch server events to `/capture/`; `/ingest` rewrites proxy client traffic. | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, optional `NEXT_PUBLIC_POSTHOG_HOST` |
| GA4 | Base tag uses `G-X27FVHNW9T`; `/api/analytics` supports Measurement Protocol dispatch. | `NEXT_PUBLIC_GA_MEASUREMENT_ID` optional override, `GA4_API_SECRET` for server dispatch |
| Google Ads | Existing env-gated helper handles conversion labels for confirmed subscribe, begin checkout, and purchase. | `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`, conversion label env vars |
| Meta | Root layout has env-gated Pixel PageView; `/api/analytics` supports CAPI dispatch. | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, optional `META_TEST_EVENT_CODE` |

## Evidence

- Focused tests:
  - `node --test app/lib/analytics.test.mjs`
  - `node --loader ./tests/analytics-route-loader.mjs --test tests/analytics-route.test.mjs`
  - `node --test tests/analytics-wiring.test.mjs`
  - `npm run test:script-budget`
  - `npm run test:stripe`
  - `node --test tests/google-ads-wiring.test.mjs`
  - `npm run test:seo`
  - `npm run lint`
  - `npm run build`
- Network proof:
  - Local render check: `http://localhost:3000/?utm_source=google&utm_medium=cpc&gclid=test-local-proof` returned HTTP 200 with 49733 bytes.
  - Local analytics API check: `POST http://localhost:3000/api/analytics` with `eventId=evt_local_proof` returned `ok: true` and provider receipts: PostHog skipped for missing project token, GA4 skipped for missing API secret, Meta skipped for missing Pixel/CAPI token. The payload included deliberate PII-like inputs; tests prove those are stripped before provider dispatch.
  - Public production check: `https://mydailydownload.com` currently serves GA4 measurement ID `G-X27FVHNW9T`.

## Follow-Ups

- Create or confirm a PostHog project named My Daily Download, then set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.
- Set `GA4_API_SECRET` if server-side GA4 Measurement Protocol events should be sent.
- Set Meta `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN`; verify via Events Manager Test Events before enabling any paid spend.
- Deploy through the existing GitHub to Vercel integration after shared launch workstream changes are ready to merge.
