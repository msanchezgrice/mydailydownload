import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("PostHog client init is env-gated and proxied through /ingest", () => {
  assert.equal(existsSync(join(root, "instrumentation-client.ts")), true);
  const instrumentation = read("instrumentation-client.ts");
  assert.match(instrumentation, /posthog-js/);
  assert.match(instrumentation, /NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN/);
  assert.match(instrumentation, /api_host:\s*"\/ingest"/);
  assert.doesNotMatch(instrumentation, /phc_[A-Za-z0-9]/);

  const nextConfig = read("next.config.ts");
  assert.match(nextConfig, /rewrites/);
  assert.match(nextConfig, /\/ingest\/:path\*/);
  assert.match(nextConfig, /https:\/\/us\.i\.posthog\.com\/:path\*/);
  assert.match(nextConfig, /skipTrailingSlashRedirect:\s*true/);
});

test("Meta pixel and client analytics are env-gated without personal identifiers", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /NEXT_PUBLIC_META_PIXEL_ID/);
  assert.match(layout, /fbq\('init'/);
  assert.match(layout, /strategy="lazyOnload"/);

  const client = read("app/lib/clientAnalytics.ts");
  assert.match(client, /mdd_anonymous_id/);
  assert.match(client, /mdd_attribution/);
  assert.match(client, /\/api\/analytics/);
  assert.match(client, /X-MDD-Anonymous-ID/);
  for (const forbidden of ["email", "linkedinUrl", "resumeFileName", "stripe_customer_id"]) {
    assert.doesNotMatch(client, new RegExp(forbidden));
  }
});

test("key funnel surfaces call the shared analytics event route", () => {
  assert.match(read("app/page.tsx"), /trackAnalyticsEvent\("landing_viewed"/);
  assert.match(read("app/page.tsx"), /trackAnalyticsEvent\("pro_purchase_completed"/);
  assert.match(read("app/onboarding/OnboardingClient.tsx"), /trackAnalyticsEvent\("onboarding_started"/);
  assert.match(read("app/onboarding/OnboardingClient.tsx"), /trackAnalyticsEvent\("subscribe_submitted"/);
  assert.match(read("app/onboarding/OnboardingClient.tsx"), /trackAnalyticsEvent\("checkout_started"/);
  assert.match(read("app/api/subscribe/route.ts"), /dispatchAnalyticsEvent/);
  assert.match(read("app/api/confirm/route.ts"), /dispatchAnalyticsEvent/);
  assert.match(read("app/api/stripe-webhook/route.ts"), /dispatchAnalyticsEvent/);
  assert.match(read("app/api/unsubscribe/route.ts"), /dispatchAnalyticsEvent/);
});
