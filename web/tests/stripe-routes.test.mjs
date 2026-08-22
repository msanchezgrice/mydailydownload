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
  delete globalThis.__stripeCharges;
  delete globalThis.__stripeRefunds;
  delete globalThis.__stripeDisputes;
  delete globalThis.__stripeListErrors;
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
    { id: "txn_current", created: 1_720_051_200, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
    { id: "txn_refund", created: 1_720_051_250, currency: "usd", type: "refund", reporting_category: "refund", amount: -500, net: -500 },
    { id: "txn_dispute", created: 1_720_051_275, currency: "usd", type: "adjustment", reporting_category: "dispute", amount: -100, net: -100 },
    { id: "txn_history_same_day", created: 1_720_053_000, currency: "usd", type: "charge", reporting_category: "charge", amount: 100, net: 90 },
    { id: "txn_prior", created: 1_719_446_400, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_current", created: 1_720_051_200, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
    { id: "ch_failed", created: 1_720_051_300, currency: "usd", amount: 1900, paid: false, status: "failed" },
    { id: "ch_prior", created: 1_719_446_400, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
  ];
  globalThis.__stripeRefunds = [{ id: "re_current", created: 1_720_051_300, currency: "usd", amount: 500, status: "succeeded" }];
  globalThis.__stripeDisputes = [{ id: "dp_current", created: 1_720_051_400, currency: "usd", amount: 100, status: "lost" }];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const body = {
    current: { start: 1_720_000_000, end: 1_720_052_000 },
    prior: { start: 1_719_400_000, end: 1_719_500_000 },
    history: { start: 1_719_982_800, end: 1_720_069_200 },
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
  assert.equal(payload.schemaVersion, 2);
  assert.equal(payload.currency, "usd");
  assert.deepEqual(payload.requested, body);
  assert.deepEqual(payload.history.days, [{ date: "2024-07-03", grossCents: 2000 }]);
  assert.equal(Object.hasOwn(payload, "transactions"), false);
});

test("portfolio revenue omits an unrequested history echo and returns no history rows", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_current", created: 1_720_051_200, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_current", created: 1_720_051_200, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
  ];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const body = {
    current: { start: 1_720_000_000, end: 1_720_100_000 },
    prior: { start: 1_719_400_000, end: 1_719_500_000 },
  };
  const response = await POST(new Request("https://mydailydownload.com/api/internal/portfolio-revenue", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.PORTFOLIO_METRICS_TOKEN}`,
    },
    body: JSON.stringify(body),
  }));

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload.requested, body);
  assert.equal(Object.hasOwn(payload.requested, "history"), false);
  assert.deepEqual(payload.history.days, []);
});

test("portfolio revenue excludes history dates outside the requested half-open business-day bounds", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_partial_day", created: 1_720_051_200, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_current", created: 1_720_051_200, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
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
      history: { start: 1_720_000_000, end: 1_720_100_000 },
    }),
  }));

  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).history.days, []);
});

test("portfolio revenue fails closed instead of labeling non-USD rows as USD", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_eur", created: 1_720_051_200, currency: "eur", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_current", created: 1_720_051_200, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
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

test("portfolio revenue nets an asynchronous payment failure back out of gross and paid conversions", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_pending", created: 1_720_051_200, currency: "usd", type: "payment", reporting_category: "charge", amount: 1900, net: 1814 },
    { id: "txn_failed", created: 1_720_051_300, currency: "usd", type: "payment_failure_refund", reporting_category: "charge_failure", amount: -1900, net: -1814 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_failed", created: 1_720_051_200, currency: "usd", amount: 1900, paid: false, status: "failed" },
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

  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).current, {
    grossCents: 0,
    netCents: 0,
    paidConversions: 0,
    refundCents: 0,
    refunds: 0,
    disputes: 0,
  });
});

test("portfolio revenue preserves signed gross when a reversal lands after its original payment window", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_late_failure", created: 1_720_051_300, currency: "usd", type: "payment_failure_refund", reporting_category: "charge_failure", amount: -1900, net: -1814 },
  ];
  globalThis.__stripeCharges = [];

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

  assert.equal(response.status, 200);
  const current = (await response.json()).current;
  assert.equal(current.grossCents, -1900);
  assert.equal(current.netCents, -1814);
  assert.equal(current.paidConversions, 0);
});

test("portfolio revenue includes partial-capture reversals and refund failures with signed accounting", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_charge", created: 1_720_051_100, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
    { id: "txn_partial", created: 1_720_051_200, currency: "usd", type: "refund", reporting_category: "partial_capture_reversal", amount: -400, net: -400 },
    { id: "txn_refund", created: 1_720_051_300, currency: "usd", type: "payment_refund", reporting_category: "refund", amount: -500, net: -500 },
    { id: "txn_refund_failed", created: 1_720_051_400, currency: "usd", type: "refund_failure", reporting_category: "refund_failure", amount: 500, net: 500 },
    { id: "txn_dispute", created: 1_720_051_500, currency: "usd", type: "adjusted_for_overdraft_transaction", reporting_category: "dispute", amount: -100, net: -100 },
    { id: "txn_dispute_reversed", created: 1_720_051_600, currency: "usd", type: "adjustment", reporting_category: "dispute_reversal", amount: 100, net: 100 },
    { id: "txn_validation", created: 1_720_051_700, currency: "usd", type: "validation", reporting_category: "charge", amount: 0, net: 0 },
  ];
  globalThis.__stripeCharges = [
    { id: "ch_succeeded", created: 1_720_051_100, currency: "usd", amount: 1900, paid: true, status: "succeeded" },
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

  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).current, {
    grossCents: 1500,
    netCents: 1414,
    paidConversions: 1,
    refundCents: 0,
    refunds: 0,
    disputes: 0,
  });
});

test("portfolio revenue fails closed on an invalid reporting-category/type pairing", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_bad_matrix", created: 1_720_051_200, currency: "usd", type: "refund", reporting_category: "charge_failure", amount: -1900, net: -1900 },
  ];
  globalThis.__stripeCharges = [];

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

test("portfolio revenue ignores a generic adjustment in an unrelated reporting category", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_other_adjustment", created: 1_720_051_200, currency: "usd", type: "adjustment", reporting_category: "other_adjustment", amount: 700, net: 700 },
  ];
  globalThis.__stripeCharges = [];

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

  assert.equal(response.status, 200);
  const current = (await response.json()).current;
  assert.equal(current.grossCents, 0);
  assert.equal(current.netCents, 0);
});

test("portfolio revenue fails closed when Stripe does not provide a supported category for a payment reversal", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { id: "txn_payment_reversal", created: 1_720_051_200, currency: "usd", type: "payment_reversal", reporting_category: "other_adjustment", amount: -1900, net: -1900 },
  ];
  globalThis.__stripeCharges = [];

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

for (const resource of ["charges", "refunds", "disputes"]) {
  test(`portfolio revenue fails closed when the current ${resource} query fails`, async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_product";
    process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
    globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
    globalThis.__stripeBalanceTransactions = [];
    globalThis.__stripeCharges = [];
    globalThis.__stripeRefunds = [];
    globalThis.__stripeDisputes = [];
    globalThis.__stripeListErrors = [resource];

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
}

test("portfolio revenue fails closed when Stripe returns malformed rows", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [
    { created: 1_720_051_200, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 },
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

test("portfolio revenue fails closed when Stripe returns a malformed dispute", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [];
  globalThis.__stripeCharges = [];
  globalThis.__stripeRefunds = [];
  globalThis.__stripeDisputes = [
    { id: "dp_incomplete", created: 1_720_051_200, currency: "usd" },
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

test("portfolio revenue fails closed when Stripe returns a negative refund amount", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [];
  globalThis.__stripeCharges = [];
  globalThis.__stripeRefunds = [
    { id: "re_negative", created: 1_720_051_200, currency: "usd", amount: -500, status: "succeeded" },
  ];
  globalThis.__stripeDisputes = [];

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

test("portfolio revenue counts only succeeded refunds", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripeBalanceTransactions = [];
  globalThis.__stripeCharges = [];
  globalThis.__stripeRefunds = [
    { id: "re_succeeded", created: 1_720_051_200, currency: "usd", amount: 500, status: "succeeded" },
    { id: "re_failed", created: 1_720_051_210, currency: "usd", amount: 400, status: "failed" },
    { id: "re_canceled", created: 1_720_051_220, currency: "usd", amount: 300, status: "canceled" },
    { id: "re_pending", created: 1_720_051_230, currency: "usd", amount: 200, status: "pending" },
    { id: "re_requires_action", created: 1_720_051_240, currency: "usd", amount: 100, status: "requires_action" },
  ];
  globalThis.__stripeDisputes = [];

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

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.current.refundCents, 500);
  assert.equal(payload.current.refunds, 1);
});

test("portfolio revenue fails closed on duplicate ids within any Stripe list page", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];

  const { POST } = await import("../app/api/internal/portfolio-revenue/route.ts");
  const resources = [
    ["__stripeBalanceTransactions", { id: "txn_duplicate", created: 1_720_051_200, currency: "usd", type: "charge", reporting_category: "charge", amount: 1900, net: 1814 }],
    ["__stripeCharges", { id: "ch_duplicate", created: 1_720_051_200, currency: "usd", amount: 1900, paid: true, status: "succeeded" }],
    ["__stripeRefunds", { id: "re_duplicate", created: 1_720_051_200, currency: "usd", amount: 500, status: "succeeded" }],
    ["__stripeDisputes", { id: "dp_duplicate", created: 1_720_051_200, currency: "usd", amount: 500, status: "lost" }],
  ];

  for (const [resource, row] of resources) {
    globalThis.__stripeBalanceTransactions = [];
    globalThis.__stripeCharges = [];
    globalThis.__stripeRefunds = [];
    globalThis.__stripeDisputes = [];
    globalThis[resource] = [{ ...row }, { ...row }];

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

    assert.equal(response.status, 502, `${resource} duplicate ids must fail closed`);
    assert.deepEqual(await response.json(), { error: "Revenue provider query failed" });
  }
});

test("portfolio revenue fails closed when pagination exceeds the page cap", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_live_product";
  process.env.PORTFOLIO_METRICS_TOKEN = "portfolio-token-with-enough-entropy";
  globalThis.__stripeAccounts = [{ id: "acct_1Tf4DDPnLtm1veVC" }];
  globalThis.__stripePageSize = 1;
  globalThis.__stripeBalanceTransactions = Array.from({ length: 101 }, (_, index) => ({
    id: `txn_${index}`,
    created: 1_720_000_000 + index,
    currency: "usd",
    type: "charge",
    reporting_category: "charge",
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
