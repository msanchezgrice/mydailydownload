import Link from "next/link";
import type { Metadata } from "next";

const UPDATED = "June 5, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of My Daily Download.",
  alternates: { canonical: "/terms" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "var(--bg-void)" }}>
      <div className="max-w-[720px] mx-auto">
        <Link href="/" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
          ← My Daily Download
        </Link>

        <h1
          className="mt-8 mb-2 text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Terms of Service
        </h1>
        <p className="mb-10 text-sm" style={{ color: "var(--text-secondary)" }}>
          Last updated {UPDATED}
        </p>

        <div
          className="space-y-6 text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <Section title="Acceptance">
            By subscribing to or using My Daily Download (mydailydownload.com), you
            agree to these Terms. If you don&apos;t agree, please don&apos;t use the
            service.
          </Section>

          <Section title="The service">
            We send a daily, career-personalized AI news briefing by email. A free tier
            is available; a Pro tier may be offered as a paid subscription. Features and
            pricing may change. By subscribing you consent to receive recurring emails;
            you can unsubscribe at any time via the link in every email.
          </Section>

          <Section title="Content & accuracy">
            Our briefings summarize and link to third-party news from their original
            sources. We aim for accuracy and always cite sources, but we don&apos;t
            guarantee that any item is complete, current, or error-free, and the content
            is for general information only — not professional, financial, legal, or
            investment advice. Trademarks and articles belong to their respective owners;
            we link to originals and do not claim ownership of third-party content.
          </Section>

          <Section title="Acceptable use">
            Don&apos;t misuse the service: no scraping or resale of our content, no
            attempts to disrupt the service, and no unlawful use. We may suspend accounts
            that violate these Terms.
          </Section>

          <Section title="Payment (Pro)">
            Paid subscriptions are billed through our payment processor (Stripe). You can
            cancel anytime; cancellation stops future renewals. After cancellation,
            access continues through the paid period. Pro-rated refunds are not offered by default, but
            billing issues and exceptional cases are reviewed case-by-case. Contact{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>{" "}
            for billing questions.
          </Section>

          <Section title="Disclaimers & liability">
            The service is provided &quot;as is&quot; without warranties. To the maximum
            extent permitted by law, My Daily Download is not liable for indirect or
            consequential damages, and our total liability is limited to the amount you
            paid us in the prior 12 months (or $0 for free users).
          </Section>

          <Section title="Changes & contact">
            We may update these Terms; material changes will be posted here with a new
            date. Owner and legal contact: Miguel Sanchez-Grice. Questions:{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link href="/privacy" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Privacy Policy →
          </Link>
          <Link href="/refunds" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Refund Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
