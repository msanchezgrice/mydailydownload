import Link from "next/link";
import type { Metadata } from "next";

const UPDATED = "June 5, 2026";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact My Daily Download for support, billing, privacy, and legal questions.",
  alternates: { canonical: "/contact" },
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

export default function ContactPage() {
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
          Contact
        </h1>
        <p className="mb-10 text-sm" style={{ color: "var(--text-secondary)" }}>
          Last updated {UPDATED}
        </p>

        <div
          className="space-y-6 text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <Section title="Support">
            For subscription, billing, unsubscribe, privacy, or data requests, email{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>

          <Section title="Owner and legal contact">
            My Daily Download is operated by Miguel Sanchez-Grice. Legal, privacy, and
            billing notices can be sent to{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>

          <Section title="Response expectations">
            We review support and privacy requests as promptly as practical. Every
            newsletter also includes a one-click unsubscribe link for immediate
            subscription changes.
          </Section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link href="/privacy" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Privacy Policy →
          </Link>
          <Link href="/terms" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Terms →
          </Link>
        </div>
      </div>
    </div>
  );
}
