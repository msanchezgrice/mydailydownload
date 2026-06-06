import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../web/package.json", import.meta.url));
const sharp = require("sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const exportsRoot = path.join(here, "exports");
const svgDir = path.join(exportsRoot, "svg");
const pngDir = path.join(exportsRoot, "png");
const jpgDir = path.join(exportsRoot, "jpg");
const publicDir = path.join(repoRoot, "web/public/brand-assets");

const COLORS = {
  void: "#0B0C10",
  surface: "#14171D",
  elevated: "#1A1D23",
  amber: "#F2A900",
  amberDim: "rgba(242,169,0,0.16)",
  mist: "#E6E8EE",
  muted: "#8A91A0",
  line: "rgba(255,255,255,0.08)",
};

const verticals = [
  { key: "brand", tag: "", headline: "AI news that actually matters to your career." },
  { key: "marketing", tag: "Marketing", headline: "The AI download for Marketers." },
  { key: "product", tag: "Product", headline: "The AI download for PMs." },
  { key: "founder", tag: "Founder", headline: "The AI download for Founders." },
  { key: "sales", tag: "Sales", headline: "The AI download for Sales." },
  { key: "design", tag: "Design", headline: "The AI download for Designers." },
];

const careers = [
  { id: "product-management", name: "Product Manager", audience: "product managers" },
  { id: "marketing", name: "Marketing", audience: "marketers" },
  { id: "sales", name: "Sales", audience: "sales teams" },
  { id: "operations", name: "Operations", audience: "operations teams" },
  { id: "hr-people", name: "HR & People", audience: "people teams" },
  { id: "design", name: "Design", audience: "designers" },
  { id: "finance", name: "Finance", audience: "finance teams" },
  { id: "engineering", name: "Engineering", audience: "engineers" },
  { id: "data-science", name: "Data Science", audience: "data scientists" },
  { id: "customer-success", name: "Customer Success", audience: "customer success teams" },
  { id: "content-creation", name: "Content Creation", audience: "content creators" },
  { id: "consulting", name: "Consulting", audience: "consultants" },
  { id: "legal", name: "Legal", audience: "legal teams" },
  { id: "healthcare", name: "Healthcare", audience: "healthcare professionals" },
  { id: "entrepreneurship", name: "Entrepreneurship", audience: "founders" },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <rect width="${width}" height="${height}" fill="${COLORS.void}"/>
  ${body}
</svg>`;
}

function wordmark(x, y, size = 42) {
  const dot = Math.max(8, Math.round(size * 0.32));
  return `<g>
    <circle cx="${x}" cy="${y - size * 0.35}" r="${dot}" fill="${COLORS.amber}"/>
    <text x="${x + dot * 2.2}" y="${y}" fill="${COLORS.mist}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="700" letter-spacing="0">My Daily Download</text>
  </g>`;
}

function downloadMark(cx, cy, scale = 1) {
  const s = scale;
  return `<g fill="none" stroke="${COLORS.amber}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="${cx}" cy="${cy}" r="${96 * s}" fill="${COLORS.amberDim}" stroke="none"/>
    <path d="M ${cx} ${cy - 64 * s} L ${cx} ${cy + 26 * s}" stroke-width="${22 * s}"/>
    <path d="M ${cx - 42 * s} ${cy - 8 * s} L ${cx} ${cy + 38 * s} L ${cx + 42 * s} ${cy - 8 * s}" stroke-width="${22 * s}"/>
    <path d="M ${cx - 70 * s} ${cy + 76 * s} H ${cx + 70 * s}" stroke-width="${22 * s}"/>
  </g>`;
}

function gridMotif(x, y, labels, size = 30) {
  return `<g opacity="0.62">
    ${labels
      .map((label, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const px = x + col * size * 5.4;
        const py = y + row * size * 1.8;
        const width = Math.max(size * 3.7, label.length * size * 0.58);
        return `<g>
          <rect x="${px}" y="${py}" width="${width}" height="${size * 1.15}" rx="${size * 0.58}" fill="${index % 2 === 0 ? COLORS.amberDim : COLORS.surface}" stroke="${COLORS.line}"/>
          <text x="${px + size * 0.62}" y="${py + size * 0.77}" fill="${index % 2 === 0 ? COLORS.amber : COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="${size * 0.48}" font-weight="700">${escapeXml(label)}</text>
        </g>`;
      })
      .join("\n")}
  </g>`;
}

function wrappedText(lines, x, y, size, color = COLORS.mist, weight = 700, lineHeight = 1.1) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="0">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${escapeXml(line)}</tspan>`).join("\n")}
  </text>`;
}

function avatarSvg(width, height, tag = "") {
  const isTiny = width <= 200;
  const markScale = width / 400;
  const tagMarkup = tag && !isTiny
    ? `<g>
      <rect x="${width * 0.22}" y="${height * 0.76}" width="${width * 0.56}" height="${height * 0.095}" rx="${height * 0.047}" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
      <text x="${width * 0.5}" y="${height * 0.825}" text-anchor="middle" fill="${COLORS.amber}" font-family="Inter, Arial, sans-serif" font-size="${width * 0.05}" font-weight="800">${escapeXml(tag)}</text>
    </g>`
    : "";
  return svg(width, height, `
    ${downloadMark(width / 2, height * 0.43, markScale)}
    ${tagMarkup}
  `);
}

function coverSvg(width, height, variant) {
  const headlineLines = variant.key === "brand"
    ? ["AI news that actually", "matters to your career."]
    : [variant.headline];
  return svg(width, height, `
    <rect x="${width * 0.04}" y="${height * 0.08}" width="${width * 0.92}" height="${height * 0.84}" rx="${Math.round(height * 0.045)}" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
    ${wordmark(width * 0.09, height * 0.23, height * 0.076)}
    ${variant.tag ? `<text x="${width * 0.09}" y="${height * 0.39}" fill="${COLORS.amber}" font-family="Inter, Arial, sans-serif" font-size="${height * 0.055}" font-weight="800" text-transform="uppercase">${escapeXml(variant.tag)}</text>` : ""}
    ${wrappedText(headlineLines, width * 0.09, height * 0.58, height * 0.102, COLORS.mist, 800, 1.05)}
    <text x="${width * 0.09}" y="${height * 0.79}" fill="${COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="${height * 0.038}" font-weight="500">Personalized by role + seniority. Real sources only.</text>
    ${downloadMark(width * 0.83, height * 0.52, height / 620)}
  `);
}

function ogSvg(titleLines, kicker = "Every item cites a real source.", accent = "") {
  return svg(1200, 630, `
    <rect x="54" y="54" width="1092" height="522" rx="32" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
    ${wordmark(98, 145, 40)}
    ${accent ? `<text x="98" y="234" fill="${COLORS.amber}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800">${escapeXml(accent)}</text>` : ""}
    ${wrappedText(titleLines, 98, accent ? 320 : 292, 72, COLORS.mist, 800, 1.05)}
    <text x="98" y="510" fill="${COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="500">${escapeXml(kicker)}</text>
    ${gridMotif(745, 354, ["Marketing", "Product", "Founder", "Sales", "Design", "Data"], 36)}
  `);
}

function storySvg(variant) {
  return svg(1080, 1920, `
    <rect x="72" y="96" width="936" height="1728" rx="52" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
    ${wordmark(126, 238, 50)}
    ${downloadMark(540, 640, 1.72)}
    ${variant.tag ? `<text x="126" y="990" fill="${COLORS.amber}" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="800">${escapeXml(variant.tag)}</text>` : ""}
    ${wrappedText(variant.key === "brand" ? ["AI news that", "matters to", "your career."] : [variant.headline.replace("The ", "The"), "Real sources only."], 126, 1120, 78, COLORS.mist, 800, 1.08)}
    <text x="126" y="1668" fill="${COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500">mydailydownload.com</text>
  `);
}

function youtubeBannerSvg() {
  return svg(2560, 1440, `
    <rect x="423" y="508" width="1714" height="424" rx="28" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
    ${wordmark(534, 663, 62)}
    ${wrappedText(["AI news that actually matters to your career."], 534, 793, 58, COLORS.mist, 800, 1.1)}
    <text x="534" y="875" fill="${COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500">Personalized by role + seniority. Real sources only.</text>
    ${downloadMark(1940, 720, 1.25)}
  `);
}

function adSquareSvg(variant) {
  return svg(1080, 1080, `
    <rect x="70" y="70" width="940" height="940" rx="46" fill="${COLORS.surface}" stroke="${COLORS.line}"/>
    ${wordmark(130, 208, 44)}
    ${variant.tag ? `<text x="130" y="330" fill="${COLORS.amber}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800">${escapeXml(variant.tag)}</text>` : ""}
    ${wrappedText([variant.headline, "Every item cites a real source."], 130, 470, 72, COLORS.mist, 800, 1.1)}
    <text x="130" y="896" fill="${COLORS.muted}" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="500">Start at mydailydownload.com</text>
  `);
}

const assets = [];
function addAsset(name, width, height, makeSvg, options = {}) {
  assets.push({ name, width, height, svg: makeSvg(width, height), public: options.public !== false });
}

for (const variant of verticals) {
  addAsset(`avatar-${variant.key}-400`, 400, 400, () => avatarSvg(400, 400, variant.tag));
  addAsset(`x-cover-${variant.key}-1500x500`, 1500, 500, () => coverSvg(1500, 500, variant));
  addAsset(`story-cover-${variant.key}-1080x1920`, 1080, 1920, () => storySvg(variant));
  if (variant.key !== "brand") {
    addAsset(`ad-square-${variant.key}-1080x1080`, 1080, 1080, () => adSquareSvg(variant));
  }
}

addAsset("avatar-brand-1024", 1024, 1024, () => avatarSvg(1024, 1024));
addAsset("facebook-avatar-170", 170, 170, () => avatarSvg(170, 170));
addAsset("facebook-cover-820x312", 820, 312, () => coverSvg(820, 312, verticals[0]));
addAsset("youtube-banner-2560x1440", 2560, 1440, youtubeBannerSvg);
addAsset("youtube-thumbnail-brand-1280x720", 1280, 720, () => ogSvg(["Your daily AI briefing,", "personalized to your role."], "Real sources only.", "Channel art"));
addAsset("og-default", 1200, 630, () => ogSvg(["AI news that actually", "matters to your career."], "Personalized by role + seniority. Real sources only."));

for (const career of careers) {
  addAsset(
    `og-ai-for-${career.id}`,
    1200,
    630,
    () => ogSvg([`AI for ${career.name}`], `Daily source-cited AI news for ${career.audience}.`, career.name),
  );
}

await Promise.all([svgDir, pngDir, jpgDir, publicDir].map((dir) => mkdir(dir, { recursive: true })));

const manifest = [];

for (const asset of assets) {
  const svgPath = path.join(svgDir, `${asset.name}.svg`);
  const pngPath = path.join(pngDir, `${asset.name}.png`);
  const jpgPath = path.join(jpgDir, `${asset.name}.jpg`);
  await writeFile(svgPath, asset.svg, "utf8");
  await sharp(Buffer.from(asset.svg)).png().toFile(pngPath);
  await sharp(Buffer.from(asset.svg)).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toFile(jpgPath);
  if (asset.public) {
    await sharp(Buffer.from(asset.svg)).png().toFile(path.join(publicDir, `${asset.name}.png`));
  }
  manifest.push({
    name: asset.name,
    width: asset.width,
    height: asset.height,
    svg: path.relative(repoRoot, svgPath),
    png: path.relative(repoRoot, pngPath),
    jpg: path.relative(repoRoot, jpgPath),
    publicPng: asset.public ? `/brand-assets/${asset.name}.png` : null,
  });
}

await writeFile(
  path.join(exportsRoot, "asset-manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifest }, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(publicDir, "asset-manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifest.filter((asset) => asset.publicPng) }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${assets.length} brand/social assets.`);
