import { Suspense } from "react";
import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

const SITE_URL = "https://mydailydownload.com";

export const metadata: Metadata = {
  title: "Create your My Daily Download briefing",
  description:
    "Choose your role and start a source-cited daily AI briefing personalized to your career.",
  alternates: { canonical: `${SITE_URL}/onboarding` },
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen w-full flex items-center justify-center"
          style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}
        >
          Loading…
        </div>
      }
    >
      <OnboardingClient />
    </Suspense>
  );
}
