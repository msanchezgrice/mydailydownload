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
  assert.doesNotMatch(robots, /"\/archive\/"/);
  assert.doesNotMatch(robots, /"\/briefing\/"/);
});

test("homepage declares the production root as its canonical URL", () => {
  const homePage = read("app/page.tsx");

  assert.match(homePage, /export const metadata:\s*Metadata/);
  assert.match(
    homePage,
    /alternates:\s*\{\s*canonical:\s*"https:\/\/mydailydownload\.com\/"\s*\}/,
  );
});

test("sitemap includes evergreen pages, category hubs, and the SEO article cluster", () => {
  const sitemap = read("app/sitemap.ts");
  const careerContent = read("app/lib/careerContent.ts");
  const articleContent = read("app/lib/seoArticles.ts");

  assert.match(sitemap, /export const revalidate = 86400/);

  for (const route of ["/", "/sample", "/onboarding", "/privacy", "/terms", "/blog"]) {
    assert.match(sitemap, new RegExp(`\\$\\{SITE_URL\\}${route === "/" ? "\\/" : route}`));
  }

  const careerIds = [...careerContent.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(careerIds.length, 15);
  assert.match(sitemap, /careerCategories\.map/);
  assert.match(sitemap, /seoArticles\.map/);

  const articleSlugs = [...articleContent.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(articleSlugs.length, 23);
  assert.equal(new Set(articleSlugs).size, 23);
  for (const slug of articleSlugs) {
    assert.match(sitemap, new RegExp(`\\$\\{SITE_URL\\}/blog/\\$\\{article\\.slug\\}`));
    assert.ok(!slug.includes("_"), `${slug} should be URL-safe`);
  }
  assert.doesNotMatch(sitemap, /archive|briefing|seniority/i);
});

test("parameter-heavy public pages declare canonical URLs", () => {
  const onboardingPage = read("app/onboarding/page.tsx");
  const samplePage = read("app/sample/page.tsx");

  assert.match(onboardingPage, /alternates:\s*\{\s*canonical:\s*`\$\{SITE_URL\}\/onboarding`/);
  assert.match(samplePage, /alternates:\s*\{\s*canonical:\s*`\$\{SITE_URL\}\/sample`/);
});

test("SEO article cluster has production routes, metadata, internal links, and honest-source guardrails", () => {
  const articleContent = read("app/lib/seoArticles.ts");
  const blogIndex = read("app/blog/page.tsx");
  const blogArticle = read("app/blog/[slug]/page.tsx");
  const careerPage = read("app/ai-for/[career]/page.tsx");
  const homeClient = read("app/HomeClient.tsx");

  const articleSlugs = [...articleContent.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(articleSlugs.length, 23);
  assert.equal(new Set(articleSlugs).size, 23);

  assert.match(blogIndex, /seoArticles/);
  assert.match(blogIndex, /Latest AI career guides/);
  assert.match(blogArticle, /generateStaticParams/);
  assert.match(blogArticle, /generateMetadata/);
  assert.match(blogArticle, /alternates:\s*\{\s*canonical:/);
  assert.match(blogArticle, /"@type":\s*"Article"/);
  assert.match(blogArticle, /"@type":\s*"BreadcrumbList"/);
  assert.match(blogArticle, /"@type":\s*"FAQPage"/);
  assert.match(blogArticle, /Frequently asked questions/);
  assert.match(blogArticle, /Related marketing workflows/);
  assert.match(blogArticle, /article\.contextualLinks\.map/);
  assert.match(blogArticle, /replace\(\/<\/g,\s*"\\\\u003c"\)/);
  assert.match(blogArticle, /Related guides/);
  // MDD is now part of My AI Skill Tutor: signup CTAs funnel to the free
  // MAST assessment with per-career utm_content.
  assert.match(blogArticle, /Get your free AI-readiness score/);
  assert.match(blogArticle, /mastAssessmentUrl\("career_hub", article\.careerId\)/);
  assert.match(careerPage, /mastAssessmentUrl\("career_hub", cat\.id\)/);
  assert.match(careerPage, /seoArticles/);
  assert.match(homeClient, /href="\/blog"/);

  for (const forbidden of [
    "zero competitors",
    "500+",
    "$5.8B",
    "$17.8B",
    "$291.85B",
    "65% of job seekers",
    "38% higher",
  ]) {
    assert.doesNotMatch(articleContent, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});

test("marketing workflow cluster is deep, current, and contextually interlinked", () => {
  const articleContent = read("app/lib/seoArticles.ts");

  assert.match(articleContent, /faq\?:\s*SeoArticleFaq\[\]/);
  assert.match(articleContent, /contextualLinks\?:\s*SeoArticleContextualLink\[\]/);

  const clusterSlugs = [
    "best-ai-tools-for-marketers-2026",
    "how-to-write-a-content-brief-with-ai",
    "how-to-summarize-marketing-performance-with-ai",
    "how-to-turn-customer-reviews-into-marketing-copy-with-ai",
  ];

  for (const slug of clusterSlugs) {
    const start = articleContent.indexOf(`slug: "${slug}"`);
    assert.notEqual(start, -1, `missing marketing cluster page: ${slug}`);

    const next = articleContent.indexOf("\n  {\n    slug:", start + 1);
    const articleBlock = articleContent.slice(start, next === -1 ? undefined : next);

    assert.match(articleBlock, /updatedAt:\s*CONTENT_REFRESH_AT/);
    assert.ok(
      (articleBlock.match(/question:\s*"/g) ?? []).length >= 4,
      `${slug} needs at least four useful FAQs`,
    );
    assert.ok(
      (articleBlock.match(/href:\s*"\/blog\//g) ?? []).length >= 3,
      `${slug} needs at least three contextual article links`,
    );
    assert.ok(
      articleBlock.split(/\s+/).length >= 650,
      `${slug} needs substantive workflow content, not a thin landing page`,
    );
  }
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
