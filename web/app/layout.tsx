import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_ID,
  GOOGLE_TAG_SCRIPT_ID,
} from "./lib/googleAds";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_CLIENT_ENABLED,
  CLERK_SIGN_IN_URL,
} from "./lib/clerk";
import "./globals.css";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const clerkLocalization = {
  signIn: {
    start: {
      title: "Continue to My Daily Download",
      titleCombined: "Continue to My Daily Download",
      subtitle: "Sign in or create your account to manage your briefing.",
      subtitleCombined: "Sign in or create your account to manage your briefing.",
    },
  },
  signUp: {
    start: {
      title: "Create your My Daily Download account",
      titleCombined: "Create your My Daily Download account",
      subtitle: "Use the same email you subscribed with.",
      subtitleCombined: "Use the same email you subscribed with.",
    },
  },
};

export const SITE_URL = "https://mydailydownload.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "My Daily Download — AI news that actually matters to your career",
    template: "%s — My Daily Download",
  },
  description:
    "Your daily AI briefing, personalized to your role. Every item cites a real source.",
  openGraph: {
    title: "My Daily Download",
    description:
      "AI news that actually matters to your career. Personalized by role + seniority. Real sources only.",
    url: SITE_URL,
    siteName: "My Daily Download",
    type: "website",
    images: [
      {
        url: "/brand-assets/og-default.png",
        width: 1200,
        height: 630,
        alt: "My Daily Download - AI news that actually matters to your career",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Daily Download",
    description: "AI news that actually matters to your career.",
    images: ["/brand-assets/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyContent = (
    <>
      {children}
      {GOOGLE_TAG_SCRIPT_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_SCRIPT_ID}`}
          strategy="lazyOnload"
        />
      )}
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
${GOOGLE_ADS_CONVERSION_ID ? `gtag('config', '${GOOGLE_ADS_CONVERSION_ID}');` : ""}`}
      </Script>
      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="3HOyldboGt4zv2IDpiFwPQ"
          async
        />
      </head>
      <body className="min-h-full flex flex-col">
        {CLERK_CLIENT_ENABLED ? (
          <ClerkProvider
            signInUrl={CLERK_SIGN_IN_URL}
            signInFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
            signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
            localization={clerkLocalization}
          >
            {bodyContent}
          </ClerkProvider>
        ) : (
          bodyContent
        )}
      </body>
    </html>
  );
}
