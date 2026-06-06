import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-X27FVHNW9T";

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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}
