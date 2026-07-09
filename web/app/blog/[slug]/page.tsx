import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mastAssessmentUrl } from "../../lib/mastFunnel";
import {
  getCareerName,
  getRelatedArticles,
  getSeoArticle,
  seoArticles,
} from "../../lib/seoArticles";

const SITE_URL = "https://mydailydownload.com";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return seoArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getSeoArticle(slug);
  if (!article) return {};

  const url = `${SITE_URL}/blog/${article.slug}`;
  const title = article.title;
  const description = article.description;

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
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
      images: [
        {
          url: "/brand-assets/og-default.png",
          width: 1200,
          height: 630,
          alt: `${article.title} - My Daily Download`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand-assets/og-default.png"],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getSeoArticle(slug);
  if (!article) notFound();

  const careerName = getCareerName(article.careerId);
  const relatedArticles = getRelatedArticles(article);
  const assessmentHref = mastAssessmentUrl("career_hub", article.careerId);
  const url = `${SITE_URL}/blog/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "My Daily Download" },
    publisher: { "@type": "Organization", name: "My Daily Download" },
    mainEntityOfPage: url,
    image: `${SITE_URL}/brand-assets/og-default.png`,
    articleSection: article.tags,
    isPartOf: { "@type": "WebSite", name: "My Daily Download", url: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(11,12,16,0.85)] border-b border-white/[0.06]">
        <div className="max-w-[860px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold text-[#E6E8EE] hover:text-[#F2A900] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
            My Daily Download
          </Link>
          <a
            href={assessmentHref}
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2 rounded-lg hover:bg-[#D49500] transition-colors"
          >
            Get your free AI score
          </a>
        </div>
      </nav>

      <article className="max-w-[760px] mx-auto px-6 pt-16 pb-24">
        <div className="mb-10">
          <Link
            href="/blog"
            className="text-sm font-semibold text-[#F2A900] hover:underline"
          >
            All guides
          </Link>
        </div>

        <header>
          <div className="flex flex-wrap gap-2 mb-5">
            <Link
              href={`/ai-for/${article.careerId}`}
              className="text-xs px-2.5 py-1 rounded-full bg-[#F2A900] text-[#0B0C10] font-semibold"
            >
              {careerName}
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-[#8A91A0]">
              {article.readingTime}
            </span>
          </div>
          <h1 className="text-[clamp(34px,6vw,56px)] font-bold text-[#E6E8EE] leading-[1.08]">
            {article.title}
          </h1>
          <p className="mt-5 text-lg text-[#8A91A0] leading-relaxed">
            {article.description}
          </p>
          <p className="mt-5 text-sm text-[#8A91A0]">
            Updated {article.updatedAt}
          </p>
        </header>

        <div className="mt-12 border-t border-white/[0.08] pt-10">
          <p className="text-lg text-[#E6E8EE] leading-relaxed">{article.intro}</p>
        </div>

        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold text-[#E6E8EE] leading-snug">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[#8A91A0] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-lg border border-white/[0.08] bg-[#14171D] p-6">
          <p className="section-label mb-4">Key takeaways</p>
          <ul className="space-y-3">
            {article.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-3 text-[#E6E8EE]">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F2A900]" aria-hidden />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-lg border border-[#F2A900]/30 bg-[#14171D] p-7 text-center">
          <p className="section-label mb-3">Get your free AI-readiness score</p>
          <h2 className="text-2xl font-bold text-[#E6E8EE]">
            How ready are you for AI as {article.audience.toLowerCase()}?
          </h2>
          <p className="mt-3 text-[#8A91A0] leading-relaxed">
            My Daily Download is now part of My AI Skill Tutor. Take the free
            assessment to get a 0-100 AI-readiness score for your role plus a
            skill-gap report — about 2 minutes, no account required.
          </p>
          <a
            href={assessmentHref}
            className="inline-block mt-6 px-8 py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] transition-colors"
          >
            Take the free assessment
          </a>
        </section>

        <section className="mt-14 pt-10 border-t border-white/[0.08]">
          <p className="section-label mb-4">Related guides</p>
          <div className="grid gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="block rounded-lg border border-white/[0.08] bg-[#14171D] p-5 hover:border-[#F2A900] transition-colors"
              >
                <h3 className="text-lg font-semibold text-[#E6E8EE]">
                  {related.title}
                </h3>
                <p className="mt-2 text-sm text-[#8A91A0] leading-relaxed">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </article>

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
