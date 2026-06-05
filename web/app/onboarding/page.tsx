import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

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
