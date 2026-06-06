import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("robots advertises the sitemap and excludes non-indexable private surfaces", () => {
  const robots = read("app/robots.ts");

  assert.match(robots, /sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/);
  assert.match(robots, /disallow:\s*\[[\s\S]*"\/api\/"/);
  assert.match(robots, /disallow:\s*\[[\s\S]*"\/archive\/"/);
  assert.match(robots, /disallow:\s*\[[\s\S]*"\/briefing\/"/);
});

test("sitemap includes evergreen pages and all category hubs only", () => {
  const sitemap = read("app/sitemap.ts");
  const careerContent = read("app/lib/careerContent.ts");

  for (const route of ["/", "/sample", "/onboarding", "/privacy", "/terms"]) {
    assert.match(sitemap, new RegExp(`\\$\\{SITE_URL\\}${route === "/" ? "\\/" : route}`));
  }

  const careerIds = [...careerContent.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(careerIds.length, 15);
  assert.match(sitemap, /careerCategories\.map/);
  assert.doesNotMatch(sitemap, /archive|briefing|seniority/i);
});

test("IndexNow key file is present and self-verifying", () => {
  const publicDir = path.join(root, "public");
  const keyFiles = fs
    .readdirSync(publicDir)
    .filter((file) => /^[a-f0-9]{32}\.txt$/.test(file));

  assert.equal(keyFiles.length, 1);
  const key = keyFiles[0].replace(/\.txt$/, "");
  assert.equal(read(`public/${keyFiles[0]}`).trim(), key);
});

test("social link cards have public assets and metadata references", () => {
  const layout = read("app/layout.tsx");
  const careerPage = read("app/ai-for/[career]/page.tsx");
  const careerContent = read("app/lib/careerContent.ts");
  const careerIds = [...careerContent.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((match) => match[1]);

  assert.match(layout, /\/brand-assets\/og-default\.png/);
  assert.match(layout, /openGraph:[\s\S]*images:/);
  assert.match(layout, /twitter:[\s\S]*images:/);
  assert.match(careerPage, /`\/brand-assets\/og-ai-for-\$\{cat\.id\}\.png`/);
  assert.match(careerPage, /openGraph:[\s\S]*images:/);
  assert.match(careerPage, /twitter:[\s\S]*images:/);

  assert.ok(fs.existsSync(path.join(root, "public/brand-assets/og-default.png")));
  for (const careerId of careerIds) {
    assert.ok(
      fs.existsSync(path.join(root, `public/brand-assets/og-ai-for-${careerId}.png`)),
      `missing OG asset for ${careerId}`,
    );
  }
});
