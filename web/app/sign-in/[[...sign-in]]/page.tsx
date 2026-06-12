import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_CLIENT_ENABLED,
  CLERK_SIGN_IN_URL,
} from "../../lib/clerk";

export const metadata: Metadata = {
  title: "Sign in",
};

const hasClerkServerConfig = Boolean(
  CLERK_CLIENT_ENABLED && process.env.CLERK_SECRET_KEY?.trim(),
);

export default function SignInPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-[460px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
          My Daily Download
        </Link>

        {hasClerkServerConfig ? (
          <SignIn
            routing="path"
            path={CLERK_SIGN_IN_URL}
            fallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
            signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
            signUpUrl={CLERK_SIGN_IN_URL}
            withSignUp
            appearance={{
              variables: {
                colorPrimary: "#F2A900",
                colorBackground: "#14171D",
                borderRadius: "8px",
              },
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "bg-[#14171D] border border-white/[0.08] shadow-none",
                footer: "bg-[#14171D]",
                headerTitle: "text-[#E6E8EE]",
                headerSubtitle: "text-[#8A91A0]",
                formButtonPrimary:
                  "bg-[#F2A900] text-[#0B0C10] hover:bg-[#D49500]",
                socialButtonsBlockButton:
                  "bg-[#0B0C10] border-white/[0.08] text-[#E6E8EE]",
                formFieldInput:
                  "bg-[#0B0C10] border-white/[0.08] text-[#E6E8EE]",
              },
            }}
          />
        ) : (
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h1 className="text-xl font-semibold">Sign in is not configured yet</h1>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Add Clerk keys to the app environment to turn on authentication.
            </p>
            <pre
              className="mt-5 overflow-x-auto rounded-lg p-4 text-xs leading-6"
              style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}
            >
              {`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...`}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
