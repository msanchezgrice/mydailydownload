import Link from "next/link";
import type { Metadata } from "next";

const UPDATED = "June 5, 2026";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "My Daily Download cancellation and refund policy for Pro subscriptions.",
  alternates: { canonical: "/refunds" },
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

export default function RefundsPage() {
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
          Refund Policy
        </h1>
        <p className="mb-10 text-sm" style={{ color: "var(--text-secondary)" }}>
          Last updated {UPDATED}
        </p>

        <div
          className="space-y-6 text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
            <Section title="Monthly Pro subscriptions">
              My Daily Download Pro is a monthly subscription billed through Stripe. You
              can cancel anytime; cancellation stops future renewals and access continues
              through the paid period. Your{" "}
              <span>access continues through the paid period</span>.
            </Section>

          <Section title="Refund stance">
            Pro-rated refunds are not offered by default. Billing mistakes,
            duplicate charges, or unusual circumstances are reviewed case-by-case via{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>

          <Section title="How to request help">
            Email{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>{" "}
            with the email address used for checkout and a short description of the
            billing issue. Do not send card numbers or other payment details by email.
          </Section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link href="/terms" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Terms →
          </Link>
          <Link href="/contact" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Contact →
          </Link>
        </div>
      </div>
    </div>
  );
}
