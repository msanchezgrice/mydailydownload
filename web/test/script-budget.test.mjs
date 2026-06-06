import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const APP_DIR = join(process.cwd(), "app");
const THIRD_PARTY_SCRIPT_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "connect.facebook.net",
  "facebook.com/tr",
  "posthog.com",
  "js.stripe.com",
];
const THIRD_PARTY_SCRIPT_MARKERS = [
  ...THIRD_PARTY_SCRIPT_HOSTS,
  "dataLayer",
  "gtag(",
  "fbq(",
  "posthog",
  "Stripe(",
];
const EARLY_SCRIPT_STRATEGIES = ["beforeInteractive", "afterInteractive"];

function readSourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return readSourceFiles(path);
    return /\.(tsx?|jsx?)$/.test(entry)
      ? [{ path, source: readFileSync(path, "utf8") }]
      : [];
  });
}

function componentBlocks(source, componentName) {
  const pattern = new RegExp(`<${componentName}\\b[\\s\\S]*?(?:/>|</${componentName}>)`, "g");
  return source.match(pattern) ?? [];
}

test("third-party analytics and ad scripts are not loaded before browser idle", () => {
  const violations = [];

  for (const file of readSourceFiles(APP_DIR)) {
    for (const block of componentBlocks(file.source, "Script")) {
      const isThirdPartyScript = THIRD_PARTY_SCRIPT_MARKERS.some((marker) =>
        block.includes(marker),
      );
      if (!isThirdPartyScript) continue;

      for (const strategy of EARLY_SCRIPT_STRATEGIES) {
        if (block.includes(`strategy="${strategy}"`)) {
          violations.push(`${file.path}: ${strategy} used for ${block.slice(0, 90)}`);
        }
      }

      assert.match(
        block,
        /strategy="lazyOnload"/,
        `${file.path}: third-party launch scripts must use strategy="lazyOnload"`,
      );
    }
  }

  assert.deepEqual(violations, []);
});

test("browser font loading stays self-hosted and free of external font CDNs", () => {
  const externalFontReferences = readSourceFiles(APP_DIR)
    .flatMap((file) =>
      ["fonts.googleapis.com", "fonts.gstatic.com"].flatMap((host) =>
        file.source.includes(host) ? [`${file.path}: ${host}`] : [],
      ),
    );

  assert.deepEqual(externalFontReferences, []);
});
