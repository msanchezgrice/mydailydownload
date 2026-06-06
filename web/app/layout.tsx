import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_ID,
  googleTagIds,
} from "./lib/googleAds";
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
        {googleTagIds.length > 0 && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagIds[0]}`}
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
      </body>
    </html>
  );
}
