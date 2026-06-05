import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { careerCategories, sampleNewsletters } from "../../lib/careerContent";
import { getSupabaseAdmin } from "../../lib/supabaseServer";

/**
 * /ai-for/[career] — the SEO hub. Server-rendered (SSG + ISR) page that pulls
 * the most recent Mid Level briefing for this career from Supabase `briefings`
 * and renders the REAL, cited items + intro + signup CTA.
 *
 * The hash-routed Vite SPA cannot do this — these pages are the SEO foundation.
 */

export const revalidate = 3600; // ISR: refresh hourly
export const dynamicParams = false; // only the 15 known slugs

const SITE_URL = "https://mydailydownload.com";

/* ── shapes pulled from briefings.blocks_json (see backend compile_newsletter) ── */
interface BriefItem {
  headline: string;
  summary?: string;
  description?: string;
  source: string;
  url: string;
  published?: string;
}
interface BriefingBlocks {
  topStory?: BriefItem | null;
  quickHits?: BriefItem[];
  sources?: { name: string; url: string }[];
  dow_theme?: string | null;
  dow_blurb?: string | null;
  date?: string;
}

export function generateStaticParams() {
  return careerCategories.map((c) => ({ career: c.id }));
}

function categoryFor(slug: string) {
  return careerCategories.find((c) => c.id === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ career: string }>;
}): Promise<Metadata> {
  const { career } = await params;
  const cat = categoryFor(career);
  if (!cat) return {};
  const title = `AI for ${cat.name} — My Daily Download`;
  const description = `The AI news, tools, and tactics that matter for ${cat.name.toLowerCase()}s — personalized, source-cited, every morning. ${cat.description}`;
  const url = `${SITE_URL}/ai-for/${cat.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "My Daily Download",
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

async function fetchLatestBriefing(careerId: string): Promise<{
  blocks: BriefingBlocks | null;
  date: string | null;
}> {
  const sb = getSupabaseAdmin();
  if (!sb) return { blocks: null, date: null };
  try {
    // Prefer Mid Level; fall back to any seniority for this career.
    const { data } = await sb
      .from("briefings")
      .select("blocks_json, date, seniority")
      .eq("career_id", careerId)
      .order("date", { ascending: false })
      .limit(20);
    if (!data || data.length === 0) return { blocks: null, date: null };
    const mid = data.find((r) => r.seniority === "Mid Level");
    const row = mid ?? data[0];
    return {
      blocks: (row.blocks_json as BriefingBlocks) ?? null,
      date: (row.date as string) ?? null,
    };
  } catch {
    return { blocks: null, date: null };
  }
}

function itemBody(it: BriefItem): string {
  return it.summary || it.description || "";
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return d;
  }
}

export default async function CareerHubPage({
  params,
}: {
  params: Promise<{ career: string }>;
}) {
  const { career } = await params;
  const cat = categoryFor(career);
  if (!cat) notFound();

  const { blocks, date } = await fetchLatestBriefing(cat.id);
  const sample = sampleNewsletters[cat.id];

  const topStory = blocks?.topStory ?? null;
  const quickHits = (blocks?.quickHits ?? []).filter((h) => h && h.headline && h.url);
  const sources = blocks?.sources ?? [];
  const hasRealData = Boolean(topStory && topStory.headline && topStory.url);
  const dowTheme = blocks?.dow_theme;
  const dateLabel = fmtDate(date);

  // JSON-LD: helps the page show up as rich content.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI for ${cat.name}`,
    description: `The AI news, tools, and tactics that matter for ${cat.name.toLowerCase()}s.`,
    url: `${SITE_URL}/ai-for/${cat.id}`,
    isPartOf: { "@type": "WebSite", name: "My Daily Download", url: SITE_URL },
    ...(hasRealData && topStory
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [topStory, ...quickHits].map((it, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: it.headline,
              url: it.url,
            })),
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(11,12,16,0.85)] border-b border-white/[0.06]">
        <div className="max-w-[860px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold text-[#E6E8EE] hover:text-[#F2A900] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
            My Daily Download
          </Link>
          <Link
            href={`/onboarding?career=${cat.id}`}
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2 rounded-lg hover:bg-[#D49500] transition-colors"
          >
            Get this daily
          </Link>
        </div>
      </nav>

      <article className="max-w-[760px] mx-auto px-6 pt-16 pb-24">
        {/* Header / intro */}
        <p className="section-label mb-4">AI for {cat.name}</p>
        <h1 className="text-[clamp(32px,5vw,52px)] font-bold text-[#E6E8EE] leading-[1.1] tracking-[-0.02em]">
          AI news that actually matters to {cat.name.toLowerCase()}s
        </h1>
        <p className="mt-5 text-lg text-[#8A91A0] leading-relaxed max-w-[620px]">
          {cat.description} Below is the most recent briefing — the real, source-cited
          AI moves shaping {cat.name.toLowerCase()} work right now. We send a fresh one
          every morning, personalized to your role and seniority. Every item links to
          its original source.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/onboarding?career=${cat.id}`}
            className="px-7 py-3 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
          >
            Get the {cat.name} briefing — Free
          </Link>
          <Link
            href={`/sample?career=${cat.id}`}
            className="px-7 py-3 border border-white/[0.08] text-[#E6E8EE] font-medium rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
          >
            See the full format
          </Link>
        </div>

        {/* Latest briefing */}
        <div className="mt-16 border-t border-white/[0.08] pt-12">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-8">
            <h2 className="text-2xl font-semibold text-[#E6E8EE]">
              The latest briefing
            </h2>
            {dateLabel && (
              <span className="text-sm text-[#8A91A0]">
                {dowTheme ? `${dowTheme} · ` : ""}
                {dateLabel}
              </span>
            )}
          </div>

          {hasRealData && topStory ? (
            <>
              {/* Big Story */}
              <div className="mb-10">
                <p className="section-label mb-2">The Big Story</p>
                <h3 className="text-xl font-semibold text-[#E6E8EE] leading-snug">
                  {topStory.headline}
                </h3>
                {itemBody(topStory) && (
                  <p className="mt-2 text-[#8A91A0] leading-relaxed">
                    {itemBody(topStory)}
                  </p>
                )}
                <a
                  href={topStory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-[#F2A900] text-sm font-medium hover:underline"
                >
                  Source: {topStory.source} ↗
                </a>
              </div>

              {/* Quick Hits */}
              {quickHits.length > 0 && (
                <div>
                  <p className="section-label mb-4">Quick Hits</p>
                  <ul className="space-y-6">
                    {quickHits.map((h, i) => (
                      <li
                        key={i}
                        className="border-l-2 border-white/[0.08] pl-5 hover:border-[#F2A900] transition-colors"
                      >
                        <h4 className="text-[15px] font-semibold text-[#E6E8EE] leading-snug">
                          {h.headline}
                        </h4>
                        {itemBody(h) && (
                          <p className="mt-1 text-sm text-[#8A91A0] leading-relaxed">
                            {itemBody(h)}
                          </p>
                        )}
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-[#F2A900] text-[13px] font-medium hover:underline"
                        >
                          Source: {h.source} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources roll-up */}
              {sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/[0.08]">
                  <p className="section-label mb-3">All sources cited</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    {sources.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8A91A0] hover:text-[#F2A900] transition-colors"
                        >
                          {s.name} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* No live briefing yet for this category — honest placeholder using the
               representative sample content. Still fully server-rendered + indexable. */
            <div>
              <p className="text-[#8A91A0] leading-relaxed mb-8">
                We&apos;re publishing fresh {cat.name} briefings daily. Here&apos;s a
                representative example of the format you&apos;ll get — the big story,
                why it matters to your role, and quick hits, each with a real source.
              </p>
              {sample && (
                <>
                  <div className="mb-10">
                    <p className="section-label mb-2">The Big Story (sample)</p>
                    <h3 className="text-xl font-semibold text-[#E6E8EE] leading-snug">
                      {sample.topStory.headline}
                    </h3>
                    <p className="mt-2 text-[#8A91A0] leading-relaxed">
                      {sample.topStory.summary}
                    </p>
                  </div>
                  <div>
                    <p className="section-label mb-4">Quick Hits (sample)</p>
                    <ul className="space-y-5">
                      {sample.quickHits.map((h, i) => (
                        <li key={i} className="border-l-2 border-white/[0.08] pl-5">
                          <h4 className="text-[15px] font-semibold text-[#E6E8EE]">
                            {h.headline}
                          </h4>
                          <p className="mt-1 text-sm text-[#8A91A0]">
                            {h.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-white/[0.08] bg-[#14171D] p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold text-[#E6E8EE]">
            Get the {cat.name} AI briefing every morning
          </h2>
          <p className="mt-3 text-[#8A91A0] max-w-[460px] mx-auto">
            Personalized to your role and seniority. Free. Every item cites a real
            source.
          </p>
          <Link
            href={`/onboarding?career=${cat.id}`}
            className="inline-block mt-6 px-8 py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
          >
            Subscribe Free
          </Link>
        </div>

        {/* Other hubs (internal links for SEO) */}
        <div className="mt-16 pt-10 border-t border-white/[0.08]">
          <p className="section-label mb-4">AI for other roles</p>
          <div className="flex flex-wrap gap-2">
            {careerCategories
              .filter((c) => c.id !== cat.id)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/ai-for/${c.id}`}
                  className="px-3 py-1.5 rounded-full text-sm border border-white/[0.08] text-[#8A91A0] hover:border-[#F2A900] hover:text-[#F2A900] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </article>

      <footer className="border-t border-white/[0.08] py-8 px-6 text-center">
        <p className="text-xs text-[#8A91A0]">
          © {new Date().getFullYear()} My Daily Download ·{" "}
          <Link href="/privacy" className="hover:text-[#F2A900]">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-[#F2A900]">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
