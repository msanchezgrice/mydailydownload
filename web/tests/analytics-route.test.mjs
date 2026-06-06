import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

afterEach(() => {
  for (const key of [
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN",
    "NEXT_PUBLIC_POSTHOG_HOST",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "GA4_API_SECRET",
    "NEXT_PUBLIC_META_PIXEL_ID",
    "META_CAPI_ACCESS_TOKEN",
  ]) {
    delete process.env[key];
  }
  delete globalThis.__analyticsFetches;
  globalThis.fetch = globalThis.__originalFetch;
});

if (!globalThis.__originalFetch) {
  globalThis.__originalFetch = globalThis.fetch;
}

test("analytics route dispatches provider payloads with shared event id and no PII", async () => {
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test_project_token";
  process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
  process.env.GA4_API_SECRET = "ga4_api_secret";
  process.env.NEXT_PUBLIC_META_PIXEL_ID = "123456789012345";
  process.env.META_CAPI_ACCESS_TOKEN = "meta_capi_token";

  globalThis.__analyticsFetches = [];
  globalThis.fetch = async (url, init = {}) => {
    globalThis.__analyticsFetches.push({
      url: String(url),
      method: init.method,
      body: init.body ? JSON.parse(init.body) : null,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const { POST } = await import("../app/api/analytics/route.ts");
  const response = await POST(
    new Request("https://mydailydownload.com/api/analytics", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        eventName: "subscription_confirmed",
        eventId: "evt_shared_123",
        anonymousId: "anon_123",
        url: "https://mydailydownload.com/api/confirm",
        attribution: {
          utm_source: "meta",
          utm_medium: "paid-social",
          fbclid: "fb-456",
        },
        properties: {
          career_id: "founder",
          seniority: "Executive",
          email: "person@example.com",
          linkedinUrl: "https://linkedin.com/in/person",
          resumeFileName: "resume.pdf",
          stripe_customer_id: "cus_123",
        },
      }),
    }),
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.eventId, "evt_shared_123");
  assert.equal(globalThis.__analyticsFetches.length, 3);

  const urls = globalThis.__analyticsFetches.map((call) => call.url);
  assert.ok(urls.some((url) => url === "https://us.i.posthog.com/capture/"));
  assert.ok(
    urls.some((url) =>
      url.startsWith("https://www.google-analytics.com/mp/collect?measurement_id=G-TEST123"),
    ),
  );
  assert.ok(
    urls.some((url) =>
      url.startsWith("https://graph.facebook.com/v20.0/123456789012345/events"),
    ),
  );

  const serialized = JSON.stringify(globalThis.__analyticsFetches);
  assert.match(serialized, /evt_shared_123/);
  assert.doesNotMatch(serialized, /person@example\.com/);
  assert.doesNotMatch(serialized, /linkedin\.com\/in\/person/);
  assert.doesNotMatch(serialized, /resume\.pdf/);
  assert.doesNotMatch(serialized, /cus_123/);
});
