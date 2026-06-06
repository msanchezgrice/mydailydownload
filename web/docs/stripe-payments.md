# My Daily Download Stripe Payments

## Product Price Contract

- Product: My Daily Download Pro
- Stripe account recorded from launch handoff: `acct_1Tf4DDPnLtm1veVC`
- Stripe product: `prod_UeOZFv6cuF7xpv`
- Stripe price: `price_1Tf5maPnLtm1veVCknVonjFS`
- Amount: `1900` minor units
- Currency: `usd`
- Billing interval: `month`
- Public display price: `$19/month`

The launch spec allows one Pro price in the `$15-19/mo` range. The current product surfaces and handoff have locked that value to `$19/month`; keep landing, onboarding, email, archive, and Stripe Checkout aligned to that price.

## Runtime Surfaces

- Checkout route: `POST /api/checkout`
- Webhook route: `POST /api/stripe-webhook`
- Success path: `/?pro=success`
- Cancel path: `/onboarding?pro=cancel`
- Required production env names: `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Current webhook endpoint recorded from launch handoff: `we_1Tf6WwPnLtm1veVCNQWstYj0`
- Disabled legacy webhook endpoint recorded from launch handoff: `we_1Tf5ukPnLtm1veVCJPa4ITej`

`POST /api/checkout` creates a Stripe Checkout Session in `subscription` mode using `STRIPE_PRO_PRICE_ID`. The request must not pass `payment_method_types`; payment method eligibility should remain controlled by Stripe Dashboard dynamic payment methods.

`POST /api/stripe-webhook` verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET` before processing. Unsigned payloads must return HTTP `400`.

## Verification Notes

- Local focused test: `npm run test:stripe`
- Vercel env inventory on `miguel-sanchezgrices-projects/mydailydownload-web` showed encrypted production entries for `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`.
- The local Stripe CLI and Stripe connector were authenticated to a different account context than the recorded My Daily Download account, so direct provider retrieval of `price_1Tf5maPnLtm1veVCknVonjFS` was not available from those read paths.
- Do not complete a paid checkout during smoke. A successful Checkout Session URL is enough to prove checkout starts.
