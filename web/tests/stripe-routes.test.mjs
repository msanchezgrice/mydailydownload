import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRO_PRICE_ID;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.PORTFOLIO_METRICS_TOKEN;
  delete globalThis.__stripeConstructors;
  delete globalThis.__stripeCheckoutSessions;
  delete globalThis.__stripeConstructedEvents;
  delete globalThis.__stripeAccounts;
  delete globalThis.__stripeBalanceTransactions;
  delete globalThis.__stripeRefunds;
  delete globalThis.__stripeDisputes;
  delete globalThis.__stripePageSize;
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

test("portfolio revenue returns only authenticated, account-pinned aggregates", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripePageSize = 1;
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_current", created: 1_720_051_200, type: "charge", amount: 1900, net: 1814 },
    { id: "txn_refund", created: 1_720_051_250, type: "refund", amount: -500, net: -500 },
    { id: "txn_dispute", created: 1_720_051_275, type: "dispute", amount: -100, net: -100 },
    { id: "txn_prior", created: 1_719_446_400, type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
  ];
  globalThis.__stripeRefunds = [{ id: "re_current", created: 1_720_051_300, amount: 500 }];
  globalThis.__stripeDisputes = [{ id: "dp_current", created: 1_720_051_400 }];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const body = {
    current: { start: 1_720_000_000, end: 1_720_100_000 },
    prior: { start: 1_719_400_000, end: 1_719_500_000 },
    history: { start: 1_720_000_000, end: 1_720_100_000 },
  };
  const unauthorized = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer wrong" },
    body: JSON.stringify(body),
  }));
  assert.equal(unauthorized.status, 401);

  const response = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.PORTFOLIO_METRICS_TOKEN}`,
    },
    body: JSON.stringify(body),
  }));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const payload = await response.json();
  assert.deepEqual(payload.current, {
    grossCents: 1900,
    netCents: 1214,
    paidConversions: 1,
    refundCents: 500,
    refunds: 1,
    disputes: 1,
  });
  assert.deepEqual(payload.prior, { grossCents: 1900, netCents: 1814, paidConversions: 1 });
  assert.equal(payload.accountId, "acct_1Tf4DDPnLtm1veVC");
  assert.equal(payload.mode, "live");
  assert.deepEqual(payload.history.days, [{ date: "2024-07-03", grossCents: 1900 }]);
  assert.equal(Object.hasOwn(payload, "transactions"), false);
});

test("portfolio revenue fails closed when Stripe returns malformed rows", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { created: 1_720_051_200, type: "charge", amount: 1900, net: 1814 },
  ];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const response = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.PORTFOLIO_METRICS_TOKEN}`,
    },
    body: JSON.stringify({
      current: { start: 1_720_000_000, end: 1_720_100_000 },
      prior: { start: 1_719_400_000, end: 1_719_500_000 },
    }),
  }));

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Revenue provider query failed" });
});

test("portfolio revenue fails closed when pagination exceeds the page cap", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripePageSize = 1;
  globalThis.__stripeBalanceTransactions = Array.from({ length: 101 }, (_, index) => ({
    id: `txn_${index}`,
    created: 1_720_000_000 + index,
    type: "charge",
    amount: 100,
    net: 95,
  }));

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const response = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.PORTFOLIO_METRICS_TOKEN}`,
    },
    body: JSON.stringify({
      current: { start: 1_720_000_000, end: 1_720_100_000 },
      prior: { start: 1_719_400_000, end: 1_719_500_000 },
    }),
  }));

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Revenue provider query failed" });
});

test("portfolio revenue fails closed on malformed windows and account mismatch", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_wrong" }];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.PORTFOLIO_METRICS_TOKEN}`,
  };
  const malformed = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers,
    body: JSON.stringify({ current: { start: 2, end: 1 } }),
  }));
  assert.equal(malformed.status, 400);

  const mismatch = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers,
    body: JSON.stringify({
      current: { start: 1_720_000_000, end: 1_720_100_000 },
      prior: { start: 1_719_400_000, end: 1_719_500_000 },
    }),
  }));
  assert.equal(mismatch.status, 502);
  assert.deepEqual(await mismatch.json(), { error: "Revenue provider identity check failed" });
});
