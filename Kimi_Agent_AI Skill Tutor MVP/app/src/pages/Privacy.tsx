import { Link } from "react-router";

const UPDATED = "June 5, 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "var(--bg-void)" }}>
      <div className="max-w-[720px] mx-auto">
        <Link
          to="/"
          className="text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
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
            My Daily Download ("we", "us") operates the daily, career-personalized AI
            newsletter at mydailydownload.com. Questions: {""}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            .
          </Section>

          <Section title="What we collect">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--text-primary)" }}>Email address</strong> — to send the newsletter you ask for.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Career details you provide</strong> — your role, seniority, and interests, so we can tailor the briefing. If you upload a resume, we use its text only to suggest a role; you can always correct it.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Usage data</strong> — opens, clicks, and basic site analytics (via Google Analytics and PostHog) to improve the product.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Consent record</strong> — the time, IP, and the exact wording you agreed to when subscribing.</li>
            </ul>
          </Section>

          <Section title="How we use it">
            To send and personalize your daily briefing, confirm your subscription
            (double opt-in), measure engagement, and operate the service. We do
            <strong style={{ color: "var(--text-primary)" }}> not</strong> sell your personal
            information. The news items we feature link to their original third-party
            sources; we are not responsible for those sites' content or privacy
            practices.
          </Section>

          <Section title="Your choices & rights">
            Every email includes a one-click unsubscribe, honored promptly. You may
            request access, correction, or deletion of your data, or opt out of
            analytics, by emailing{" "}
            <a href="mailto:support@mydailydownload.com" style={{ color: "var(--accent)" }}>
              support@mydailydownload.com
            </a>
            . We honor applicable rights under GDPR (EU/UK), CASL (Canada), and
            CAN-SPAM (US).
          </Section>

          <Section title="Data retention & security">
            We keep your subscription data while your account is active and for a
            reasonable period afterward to meet legal obligations. We use industry-standard
            providers (Supabase, Resend, Vercel) and reasonable safeguards to protect it.
          </Section>

          <Section title="Changes">
            We may update this policy; material changes will be noted here with a new
            "last updated" date.
          </Section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link to="/terms" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
