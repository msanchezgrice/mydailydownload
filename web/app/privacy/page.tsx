import Link from "next/link";
import type { Metadata } from "next";

const UPDATED = "June 5, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How My Daily Download collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
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

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm" style={{ color: "var(--text-secondary)" }}>
          Last updated {UPDATED}
        </p>

        <div
          className="space-y-6 text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <Section title="Who we are">
            My Daily Download (&quot;we&quot;, &quot;us&quot;) operates the daily,
            career-personalized AI newsletter at mydailydownload.com. Owner and
            legal contact: Miguel Sanchez-Grice. Questions:{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>

          <Section title="What we collect">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong style={{ color: "var(--text-primary)" }}>Email address</strong> —
                to send the newsletter you ask for.
              </li>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>
                  Career details you provide
                </strong>{" "}
                — your role, seniority, and interests, so we can tailor the briefing.
                If you upload a resume, we use its text only to suggest a role; you can
                always correct it.
              </li>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>Usage data</strong> —
                opens, clicks, funnel step events, anonymized event IDs, coarse
                career-category labels, coarse seniority-tier labels, and aggregate
                counts to improve the product.
              </li>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>Consent record</strong> —
                the time, IP, and the exact wording you agreed to when subscribing.
              </li>
            </ul>
          </Section>

          <Section title="How we use it">
            To send and personalize your daily briefing, confirm your subscription
            (double opt-in), measure engagement, and operate the service. We do
            <strong style={{ color: "var(--text-primary)" }}> not</strong> sell your
            personal information. The news items we feature link to their original
            third-party sources; we are not responsible for those sites&apos; content or
            privacy practices.
          </Section>

          <Section title="Analytics and advertising data handling">
            Do not send to analytics or advertising platforms: Email addresses,
            LinkedIn profile URLs, parsed resume text, employer/company, job title,
            raw profile fields, resume file contents or filenames, Consent-log fields
            such as IP address and checkbox text, Stripe customer identifiers, or
            payment data. Allowed analytics fields are anonymized event IDs, coarse
            career-category and seniority-tier labels, funnel step events, and
            aggregate counts. In short, we only use{" "}
            <span>coarse career-category and seniority-tier labels</span> in analytics.
          </Section>

          <Section title="Your choices & rights">
            Every email includes a one-click unsubscribe, honored promptly. You may
            request access, correction, or deletion of your data, or opt out of
            analytics, by emailing{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            . We honor applicable rights under GDPR (EU/UK), CASL (Canada), and CAN-SPAM
            (US).
          </Section>

          <Section title="Data retention & security">
            We keep your subscription data while your account is active and for a
            reasonable period afterward to meet legal obligations, prevent abuse, and
            honor unsubscribes. Profile data stays in Supabase with access controls
            and is not sent to client analytics payloads.
          </Section>

          <Section title="Changes">
            We may update this policy; material changes will be noted here with a new
            &quot;last updated&quot; date.
          </Section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link href="/terms" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Terms of Service →
          </Link>
          <Link href="/contact" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Contact →
          </Link>
        </div>
      </div>
    </div>
  );
}
