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
  assert.match(
    helper,
    /DEFAULT_GOOGLE_ADS_CONVERSION_ID = "AW-18217096122"/,
    "Google Ads should default to Miguel-provided AW tag",
  );
  assert.match(
    helper,
    /DEFAULT_GOOGLE_ADS_PURCHASE_LABEL = "gdreCOj5yLkcELqny-5D"/,
    "Google Ads should default to the Purchase label visible in Google Ads",
  );
  assert.match(
    helper,
    /DEFAULT_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL = "x_yyCO_qk7ocELqny-5D"/,
    "Google Ads should default to the Begin checkout label visible in Google Ads",
  );
  assert.match(
    helper,
    /DEFAULT_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL = "Gu4HCPLqk7ocELqny-5D"/,
    "Google Ads should default to the Sign-up label visible in Google Ads",
  );
  assert.match(
    helper,
    /GOOGLE_ADS_CONVERSION_ID,[\s\S]*GA_MEASUREMENT_ID/,
    "Google tag script should load the AW tag when Ads is configured",
  );
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

  assert.match(helper, /value\?: number/, "Purchase conversions should support numeric value");
  assert.match(helper, /currency\?: string/, "Purchase conversions should support currency");
  assert.doesNotMatch(
    helper,
    /transaction_id:\s*""/,
    "Google Ads payloads should not send an empty transaction id",
  );
});

test("Google Ads conversions are wired to confirmed subscribe, checkout start, and paid success", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /GOOGLE_ADS_CONVERSION_ID/);
  assert.match(layout, /gtag\('config'/);

  const confirmRoute = read("app/api/confirm/route.ts");
  assert.match(confirmRoute, /GOOGLE_TAG_SCRIPT_ID/);

  assert.match(confirmRoute, /GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL/);
  assert.match(confirmRoute, /googleAdsConversionSnippet/);
  assert.match(
    confirmRoute,
    /value':\s*1\.0/,
    "Confirmed subscribe snippet should send Google Ads provider value",
  );
  assert.match(
    confirmRoute,
    /currency':\s*'USD'/,
    "Confirmed subscribe snippet should send Google Ads provider currency",
  );

  const onboarding = read("app/onboarding/OnboardingClient.tsx");
  assert.match(onboarding, /GOOGLE_ADS_BEGIN_CHECKOUT_LABEL/);
  assert.match(onboarding, /navigateAfterGoogleAdsConversion/);
  assert.match(
    read("app/lib/googleAds.ts"),
    /dedupeKey:\s*`begin_checkout:\$\{url\}`[\s\S]*value:\s*1\.0[\s\S]*currency:\s*"USD"/,
    "Begin checkout conversion should send the provider value and currency",
  );

  const homePage = read("app/page.tsx");
  assert.match(homePage, /GOOGLE_ADS_PURCHASE_LABEL/);
  assert.match(homePage, /sendGoogleAdsConversion/);
  assert.match(homePage, /value:\s*1\.0/, "Purchase conversion should send the provider value");
  assert.match(homePage, /currency:\s*"USD"/, "Purchase conversion should send the provider currency");
});
