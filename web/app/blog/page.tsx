import Link from "next/link";
import type { Metadata } from "next";
import { careerCategories } from "../lib/careerContent";
import { mastAssessmentUrl } from "../lib/mastFunnel";
import { seoArticles } from "../lib/seoArticles";

const SITE_URL = "https://mydailydownload.com";

export const metadata: Metadata = {
  title: "Latest AI career guides",
  description:
    "Evergreen AI guides for marketers, product managers, founders, and other professionals who want role-specific AI workflows.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Latest AI career guides",
    description:
      "Role-specific AI workflows from My Daily Download. Practical, source-aware, and built for working professionals.",
    url: `${SITE_URL}/blog`,
    siteName: "My Daily Download",
    type: "website",
    images: [
      {
        url: "/brand-assets/og-default.png",
        width: 1200,
        height: 630,
        alt: "My Daily Download AI career guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest AI career guides",
    description: "Role-specific AI workflows from My Daily Download.",
    images: ["/brand-assets/og-default.png"],
  },
};

function careerName(careerId: string): string {
  return careerCategories.find((career) => career.id === careerId)?.name ?? "AI guide";
}

export default function BlogIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Latest AI career guides",
    description:
      "Evergreen AI guides for professionals by role, workflow, and weekly operating rhythm.",
    url: `${SITE_URL}/blog`,
    isPartOf: { "@type": "WebSite", name: "My Daily Download", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: seoArticles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: `${SITE_URL}/blog/${article.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(11,12,16,0.85)] border-b border-white/[0.06]">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold text-[#E6E8EE] hover:text-[#F2A900] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
            My Daily Download
          </Link>
          <a
            href={mastAssessmentUrl("career_hub")}
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2 rounded-lg hover:bg-[#D49500] transition-colors"
          >
            Get your free AI score
          </a>
        </div>
      </nav>

      <main className="max-w-[1080px] mx-auto px-6 pt-16 pb-24">
        <p className="section-label mb-4">AI career guides</p>
        <div className="max-w-[760px]">
          <h1 className="text-[clamp(34px,6vw,58px)] font-bold text-[#E6E8EE] leading-[1.08]">
            Latest AI career guides
          </h1>
          <p className="mt-5 text-lg text-[#8A91A0] leading-relaxed">
            Practical, role-specific AI workflows for professionals who want useful
            daily signal without a generic firehose. Every guide is written as an
            evergreen operating playbook, not an unsourced news recap.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {seoArticles.map((article) => (
            <article
              key={article.slug}
              className="border border-white/[0.08] bg-[#14171D] rounded-lg p-6"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <Link
                  href={`/ai-for/${article.careerId}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#F2A900] text-[#0B0C10] font-semibold"
                >
                  {careerName(article.careerId)}
                </Link>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-[#8A91A0]">
                  {article.readingTime}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[#E6E8EE] leading-snug">
                <Link
                  href={`/blog/${article.slug}`}
                  className="hover:text-[#F2A900] transition-colors"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-[#8A91A0] leading-relaxed">
                {article.description}
              </p>
              <Link
                href={`/blog/${article.slug}`}
                className="inline-block mt-5 text-sm font-semibold text-[#F2A900] hover:underline"
              >
                Read guide
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/[0.08] py-8 px-6 text-center">
        <p className="text-xs text-[#8A91A0]">
          (c) {new Date().getFullYear()} My Daily Download ·{" "}
          <Link href="/privacy" className="hover:text-[#F2A900]">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-[#F2A900]">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/contact" className="hover:text-[#F2A900]">
            Contact
          </Link>{" "}
          ·{" "}
          <Link href="/refunds" className="hover:text-[#F2A900]">
            Refunds
          </Link>
        </p>
      </footer>
    </div>
  );
}
