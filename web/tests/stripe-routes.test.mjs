import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRO_PRICE_ID;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete globalThis.__stripeConstructors;
  delete globalThis.__stripeCheckoutSessions;
  delete globalThis.__stripeConstructedEvents;
});

test("checkout creates a subscription session for the product price without hardcoded payment methods", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_route";
  process.env.STRIPE_PRO_PRICE_ID = "price_mdd_pro_1900_monthly";

  const { POST } = await import("../app/api/checkout/route.ts");
  const response = await POST(
    new Request("https://mydailydownload.com/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: " Pro.User@Example.COM " }),
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    url: "https://checkout.stripe.test/session/cs_test_route",
  });

  assert.equal(globalThis.__stripeCheckoutSessions?.length, 1);
  const session = globalThis.__stripeCheckoutSessions[0];
  assert.equal(session.mode, "subscription");
  assert.deepEqual(session.line_items, [
    { price: "price_mdd_pro_1900_monthly", quantity: 1 },
  ]);
  assert.equal(session.allow_promotion_codes, true);
  assert.equal(session.customer_email, "pro.user@example.com");
  assert.equal(session.client_reference_id, "pro.user@example.com");
  assert.equal(session.success_url, "https://mydailydownload.com/?pro=success");
  assert.equal(session.cancel_url, "https://mydailydownload.com/onboarding?pro=cancel");
  assert.equal(Object.hasOwn(session, "payment_method_types"), false);
});

test("stripe webhook rejects unsigned payloads before processing", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_route";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_route";

  const { POST } = await import("../app/api/stripe-webhook/route.ts");
  const response = await POST(
    new Request("https://mydailydownload.com/api/stripe-webhook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "checkout.session.completed" }),
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Missing stripe-signature header",
  });
  assert.equal(globalThis.__stripeConstructedEvents, undefined);
});
