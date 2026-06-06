import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("Google Ads env-gated base tag and conversion labels are declared in one helper", () => {
  const helperPath = "app/lib/googleAds.ts";
  assert.equal(existsSync(join(root, helperPath)), true, `${helperPath} should exist`);

  const helper = read(helperPath);
  for (const envName of [
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL",
    "NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL",
    "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL",
  ]) {
    assert.match(helper, new RegExp(envName), `${helperPath} should declare ${envName}`);
  }

  for (const forbiddenPayload of [
    "email",
    "linkedin",
    "resume",
    "customer_email",
    "stripe_customer",
    "client_reference_id",
  ]) {
    assert.doesNotMatch(
      helper.toLowerCase(),
      new RegExp(forbiddenPayload),
      `${helperPath} should not include personal or payment identifiers in ad conversion payloads`,
    );
  }
});

test("Google Ads conversions are wired to confirmed subscribe, checkout start, and paid success", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /GOOGLE_ADS_CONVERSION_ID/);
  assert.match(layout, /gtag\('config'/);

  assert.match(read("app/api/confirm/route.ts"), /GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL/);
  assert.match(read("app/api/confirm/route.ts"), /googleAdsConversionSnippet/);

  assert.match(read("app/onboarding/OnboardingClient.tsx"), /GOOGLE_ADS_BEGIN_CHECKOUT_LABEL/);
  assert.match(read("app/onboarding/OnboardingClient.tsx"), /navigateAfterGoogleAdsConversion/);

  assert.match(read("app/page.tsx"), /GOOGLE_ADS_PURCHASE_LABEL/);
  assert.match(read("app/page.tsx"), /sendGoogleAdsConversion/);
});
