import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assertIncludes(path, expected) {
  const text = read(path);
  assert.match(
    text,
    new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `${path} should include ${expected}`
  );
}

test("legal routes exist for privacy, terms, contact, and refunds", () => {
  for (const path of [
    "app/privacy/page.tsx",
    "app/terms/page.tsx",
    "app/contact/page.tsx",
    "app/refunds/page.tsx",
  ]) {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  }
});

test("privacy policy discloses sensitive data excluded from analytics and ad platforms", () => {
  const privacy = "app/privacy/page.tsx";
  for (const copy of [
    "Do not send to analytics or advertising platforms",
    "Email addresses",
    "LinkedIn profile URLs",
    "parsed resume text",
    "employer/company",
    "job title",
    "resume file contents or filenames",
    "Consent-log fields",
    "Stripe customer identifiers",
    "coarse career-category and seniority-tier labels",
  ]) {
    assertIncludes(privacy, copy);
  }
});

test("terms and refund page match the subscription refund stance", () => {
  for (const path of ["app/terms/page.tsx", "app/refunds/page.tsx"]) {
    for (const copy of [
      "cancel anytime",
      "access continues through the paid period",
      "Pro-rated refunds are not offered by default",
      "case-by-case",
      "support@mydailydownload.com",
    ]) {
      assertIncludes(path, copy);
    }
  }
});

test("contact page includes support and owner/legal contact", () => {
  assertIncludes("app/contact/page.tsx", "support@mydailydownload.com");
  assertIncludes("app/contact/page.tsx", "Miguel Sanchez-Grice");
});

test("primary footers link to legal, contact, and refund routes", () => {
  for (const path of [
    "app/page.tsx",
    "app/sample/page.tsx",
    "app/ai-for/[career]/page.tsx",
  ]) {
    for (const href of ['href="/privacy"', 'href="/terms"', 'href="/contact"', 'href="/refunds"']) {
      assertIncludes(path, href);
    }
  }
});

test("sitemap exposes contact and refund routes", () => {
  assertIncludes("app/sitemap.ts", "/contact");
  assertIncludes("app/sitemap.ts", "/refunds");
});

test("launch copy avoids unsupported implementation claims", () => {
  const checkedFiles = ["app/page.tsx", "app/onboarding/OnboardingClient.tsx"];
  for (const path of checkedFiles) {
    const text = read(path);
    for (const unsupported of [
      "Trusted by professionals at",
      "50+ sources",
      "Our AI reads your LinkedIn profile or resume",
      "We use AI to understand what matters to you",
      "account settings",
      "Web archive access (7 days)",
      "Community Discord access",
      "Up to 3 career profiles",
      "Full archive access (500+ past briefings)",
      "Start Free Trial",
      "Math.random",
    ]) {
      assert.doesNotMatch(text, new RegExp(unsupported.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
});

test("pricing and archive copy match the spec boundary", () => {
  assertIncludes("app/page.tsx", "Rolling trailing 2-week archive");
  assertIncludes("app/page.tsx", "Friday Roundup deep-dive");
  assertIncludes("app/onboarding/OnboardingClient.tsx", "rolling 2-week archive");
  assertIncludes("app/onboarding/OnboardingClient.tsx", "full archive access");
});
