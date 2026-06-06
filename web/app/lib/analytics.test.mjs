import assert from "node:assert/strict";
import test from "node:test";

import {
  ANALYTICS_EVENT_TAXONOMY,
  PII_EXCLUDED_FIELDS,
  buildProviderPayloads,
  buildAttributionFromUrl,
  sanitizeAnalyticsProperties,
} from "./analytics.ts";

test("captures allowed UTM and click identifiers while excluding PII inputs", () => {
  const attribution = buildAttributionFromUrl(
    "https://mydailydownload.com/onboarding?utm_source=google&utm_medium=cpc&utm_campaign=founder-launch&utm_term=miguel@example.com&utm_content=hero&gclid=g-123&fbclid=fb-456&linkedin_url=https%3A%2F%2Flinkedin.com%2Fin%2Fmiguel&company=Acme"
  );

  assert.deepEqual(attribution, {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "founder-launch",
    utm_content: "hero",
    gclid: "g-123",
    fbclid: "fb-456",
  });
});

test("sanitizes analytics properties before provider dispatch", () => {
  const sanitized = sanitizeAnalyticsProperties({
    event_id: "evt_123",
    anonymous_id: "anon_123",
    career_id: "marketing",
    seniority: "Senior",
    email: "person@example.com",
    linkedinUrl: "https://linkedin.com/in/person",
    resumeFileName: "resume.pdf",
    consent_ip: "127.0.0.1",
    stripe_customer_id: "cus_123",
    nested: {
      employer: "Acme",
      plan: "pro",
    },
  });

  assert.deepEqual(sanitized, {
    event_id: "evt_123",
    anonymous_id: "anon_123",
    career_id: "marketing",
    seniority: "Senior",
    nested: {
      plan: "pro",
    },
  });
});

test("event taxonomy documents primary conversion and explicit PII exclusions", () => {
  assert.equal(ANALYTICS_EVENT_TAXONOMY.subscription_confirmed.primaryConversion, true);
  assert.deepEqual(ANALYTICS_EVENT_TAXONOMY.subscription_confirmed.providers, [
    "posthog",
    "ga4",
    "google_ads",
    "meta",
  ]);
  assert.ok(PII_EXCLUDED_FIELDS.includes("email"));
  assert.ok(PII_EXCLUDED_FIELDS.includes("linkedin_url"));
  assert.ok(PII_EXCLUDED_FIELDS.includes("resume_text"));
  assert.ok(PII_EXCLUDED_FIELDS.includes("stripe_customer_id"));
});

test("provider payloads share event_id and exclude PII", () => {
  const payloads = buildProviderPayloads({
    eventName: "subscription_confirmed",
    eventId: "evt_123",
    anonymousId: "anon_123",
    url: "https://mydailydownload.com/api/confirm",
    userAgent: "Mozilla/5.0",
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
      stripe_customer_id: "cus_123",
    },
  });

  assert.equal(payloads.posthog.event, "subscription_confirmed");
  assert.equal(payloads.posthog.distinct_id, "anon_123");
  assert.equal(payloads.posthog.properties.event_id, "evt_123");
  assert.equal(payloads.ga4.client_id, "anon_123");
  assert.equal(payloads.ga4.events[0].params.event_id, "evt_123");
  assert.equal(payloads.meta.data[0].event_name, "CompleteRegistration");
  assert.equal(payloads.meta.data[0].event_id, "evt_123");
  assert.equal(payloads.meta.data[0].user_data.external_id, "anon_123");

  const serialized = JSON.stringify(payloads);
  assert.equal(serialized.includes("person@example.com"), false);
  assert.equal(serialized.includes("linkedin.com/in/person"), false);
  assert.equal(serialized.includes("cus_123"), false);
});
