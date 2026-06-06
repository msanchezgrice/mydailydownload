"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  Mail,
  Check,
  ChevronDown,
  Layout,
  Megaphone,
  TrendingUp,
  Settings,
  Users,
  Palette,
  BarChart3,
  Code,
  Database,
  HeartHandshake,
  PenTool,
  Scale,
  Stethoscope,
  Rocket,
} from "lucide-react";
import TerminalTyping from "./components/TerminalTyping";
import SampleEmail from "./components/SampleEmail";
import { careerCategories, sampleNewsletters } from "./lib/careerContent";
import {
  GOOGLE_ADS_PURCHASE_LABEL,
  sendGoogleAdsConversion,
} from "./lib/googleAds";
import { captureCurrentAttribution, trackAnalyticsEvent } from "./lib/clientAnalytics";

/* icon map for career categories */
const iconMap: Record<string, React.ElementType> = {
  Layout,
  Megaphone,
  TrendingUp,
  Settings,
  Users,
  Palette,
  BarChart3,
  Code,
  Database,
  HeartHandshake,
  PenTool,
  Briefcase,
  Scale,
  Stethoscope,
  Rocket,
};

const faqData = [
  {
    q: "What makes this different from other AI newsletters?",
    a: "Most AI newsletters send the same content to everyone. We personalize every briefing to your specific career — a Product Manager gets product-focused AI news, while a Marketer gets marketing-focused updates.",
  },
  {
    q: "How does the LinkedIn/resume analysis work?",
    a: "At launch, LinkedIn and resume inputs are used only to suggest a correctable briefing profile. You always confirm or edit your career category and seniority before subscribing.",
  },
  {
    q: "Can I change my career category later?",
    a: "Yes. Email support@mydailydownload.com and we can update your career category, seniority, or interests.",
  },
  {
    q: "What time is the newsletter delivered?",
    a: "We deliver at 7 AM in your local timezone by default. You can change this to morning (7 AM), midday (12 PM), or evening (6 PM).",
  },
  {
    q: "How do I cancel?",
    a: "You can cancel anytime. Pro access continues through the paid period; pro-rated refunds are not offered by default but are reviewed case-by-case through support.",
  },
];

const howItWorksCards = [
  {
    icon: Briefcase,
    title: "Tell us your career",
    description:
      "Drop your LinkedIn URL, upload your resume, or pick your career category from 15 professional verticals. You confirm the final profile before subscribing.",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "Our AI researches for you",
    description:
      "We assemble source-cited AI news, tools, and trends relevant to your role. No generic tech hype, just the items that move your work forward.",
    step: "02",
  },
  {
    icon: Mail,
    title: "Get your daily edge",
    description:
      "Every morning, a curated email hits your inbox with the AI news, tools, and tactics that actually matter for your career — with clear explanations and action steps.",
    step: "03",
  },
];

/* ───────── Navigation ───────── */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Careers", href: "#careers" },
    { label: "Guides", href: "/blog" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(11,12,16,0.85)] backdrop-blur-xl border-b border-white/[0.08]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto w-full px-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-semibold text-[#E6E8EE] text-lg tracking-tight"
        >
          <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
          My Daily Download
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith("#") ? (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-sm text-[#8A91A0] hover:text-[#E6E8EE] transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-[#8A91A0] hover:text-[#E6E8EE] transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
          <Link
            href="/onboarding"
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2.5 rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span
            className={`w-5 h-0.5 bg-[#E6E8EE] transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-[#E6E8EE] transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-[#E6E8EE] transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-16 right-0 w-64 bg-[#1A1D23] border border-white/[0.08] rounded-bl-xl shadow-2xl md:hidden">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-sm text-[#8A91A0] hover:text-[#E6E8EE] transition-colors py-2"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-left text-sm text-[#8A91A0] hover:text-[#E6E8EE] transition-colors py-2"
                >
                  {link.label}
                </Link>
              )
            ))}
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2.5 rounded-lg hover:bg-[#D49500] transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ───────── Hero ───────── */
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center bg-[#0B0C10] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 40%, rgba(242, 169, 0, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-[1200px] mx-auto w-full px-4 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="max-w-[600px]">
          <p className="section-label mb-6">Personalized AI Intelligence</p>
          <h1 className="text-[clamp(36px,5vw,64px)] font-bold text-[#E6E8EE] leading-[1.1] tracking-[-0.03em]">
            AI news that actually matters to your career
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#8A91A0] max-w-[480px] leading-relaxed">
            Get a daily briefing of the AI tools, news, and tactics shaping your
            industry — curated for your specific role, not generic tech hype.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/onboarding"
              className="px-8 py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Your Edge — Free
            </Link>
            <Link
              href="/sample"
              className="px-8 py-3.5 border border-white/[0.08] text-[#E6E8EE] font-medium rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              See a Guide
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#8A91A0]">
            Every item cites a real source.
          </p>
        </div>

        <div>
          <TerminalTyping />
        </div>
      </div>
    </section>
  );
}

/* ───────── Trust Bar ───────── */
function TrustBar() {
  const trustPoints = [
    "Double opt-in",
    "One-click unsubscribe",
    "Real sources only",
    "No profile data in ads",
  ];
  return (
    <div className="w-full bg-[#1A1D23] border-y border-white/[0.08] py-8 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <span className="text-sm text-[#8A91A0] whitespace-nowrap">
          Built for inbox trust
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {trustPoints.map((name) => (
            <span
              key={name}
              className="text-[#8A91A0]/70 font-semibold text-sm tracking-wide hover:text-[#F2A900] transition-all duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── How It Works ───────── */
function HowItWorksSection() {
  return (
    <div id="how-it-works" className="w-full bg-[#0B0C10] py-24 md:py-32 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">How It Works</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] tracking-[-0.02em]">
            Your Daily AI Briefing in 3 Steps
          </h2>
          <p className="mt-4 text-lg text-[#8A91A0] max-w-[500px] mx-auto">
            From profile to personalized insights — every morning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksCards.map((card) => (
            <div
              key={card.step}
              className="relative bg-[#1A1D23] border border-white/[0.08] rounded-2xl p-8 md:p-10 group hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
            >
              <span className="absolute top-4 right-6 text-[48px] font-bold text-[rgba(242,169,0,0.15)] leading-none select-none">
                {card.step}
              </span>
              <card.icon className="w-8 h-8 text-[#F2A900] mb-6" />
              <h3 className="text-xl font-semibold text-[#E6E8EE] mb-3">
                {card.title}
              </h3>
              <p className="text-[#8A91A0] leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Career Categories ───────── */
function CareerCategoriesSection() {
  return (
    <div id="careers" className="w-full bg-[#1A1D23] py-24 md:py-32 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">For Every Career</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] tracking-[-0.02em]">
            Personalized for every profession
          </h2>
          <p className="mt-4 text-lg text-[#8A91A0]">
            15 career verticals. Yours is in here.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {careerCategories.map((career) => {
            const IconComponent = iconMap[career.icon] || Briefcase;
            return (
              <Link
                key={career.id}
                href={`/ai-for/${career.id}`}
                className="bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-6 group hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer block"
              >
                <IconComponent className="w-7 h-7 text-[#F2A900] mb-4" />
                <h3 className="text-[15px] font-semibold text-[#E6E8EE] mb-1.5">
                  {career.name}
                </h3>
                <p className="text-[13px] text-[#8A91A0] leading-relaxed">
                  {career.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────── Sample Newsletter Preview ───────── */
function SamplePreviewSection() {
  const [selectedCareer, setSelectedCareer] = useState("product-management");

  const careerOptions = Object.values(sampleNewsletters).map((s) => ({
    id: s.careerId,
    name: s.careerName,
  }));

  return (
    <div className="w-full bg-[#0B0C10] py-24 md:py-32 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-4">See It In Action</p>
            <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] tracking-[-0.02em] mb-4">
              See what you&apos;ll get every morning
            </h2>
            <p className="text-base text-[#8A91A0] max-w-[440px] leading-relaxed mb-6">
              A clean, scannable email with the AI news and tools that matter for
              your role. No fluff. No generic roundups. Just your edge.
            </p>

            <div className="mb-6">
              <label className="text-xs text-[#8A91A0] mb-2 block">
                Preview for:
              </label>
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="bg-[#1A1D23] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#E6E8EE] focus:outline-none focus:border-[#F2A900] cursor-pointer"
              >
                {careerOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/sample"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.08] text-[#E6E8EE] font-medium rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              View Full Guide →
            </Link>
          </div>

          <div>
            <SampleEmail careerId={selectedCareer} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Pricing ───────── */
function PricingSection() {
  const freeFeatures = [
    "Daily personalized AI briefing",
    "1 career profile",
    "Rolling trailing 2-week archive",
    "One-click unsubscribe",
  ];
  const proFeatures = [
    "Everything in Free",
    "Friday Roundup deep-dive",
    "Full archive access",
    "Tool and prompt extras",
    "Priority support",
  ];

  return (
    <div id="pricing" className="w-full bg-[#1A1D23] py-24 md:py-32 px-4">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Simple Pricing</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] tracking-[-0.02em]">
            Start Free. Upgrade When You&apos;re Hooked.
          </h2>
          <p className="mt-4 text-base text-[#8A91A0]">
            No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-[#E6E8EE] mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-bold text-[#E6E8EE]">$0</span>
              <span className="text-base text-[#8A91A0]">/month</span>
            </div>
            <p className="text-sm text-[#8A91A0] mb-8">Perfect for trying it out.</p>
            <ul className="space-y-4 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#F2A900] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#E6E8EE]">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="block text-center w-full py-3.5 border border-white/[0.08] text-[#E6E8EE] font-semibold rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          <div className="relative bg-[#0B0C10] border-2 border-[#F2A900] rounded-2xl p-8 md:p-10">
            <div className="absolute top-0 right-0 bg-[#F2A900] text-[#0B0C10] text-[11px] font-semibold uppercase px-3 py-1.5 rounded-bl-xl rounded-tr-[14px]">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold text-[#E6E8EE] mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-bold text-[#F2A900]">$19</span>
              <span className="text-base text-[#8A91A0]">/month</span>
            </div>
            <p className="text-sm text-[#8A91A0] mb-8">
              For professionals who take AI seriously.
            </p>
            <ul className="space-y-4 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#F2A900] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#E6E8EE]">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding?plan=pro"
              className="block text-center w-full py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Subscribe to Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── FAQ ───────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div id="faq" className="w-full bg-[#0B0C10] py-24 md:py-32 px-4">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">FAQ</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] tracking-[-0.02em]">
            Questions? Answered.
          </h2>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {faqData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="text-lg font-medium text-[#E6E8EE] pr-4 group-hover:text-[#F2A900] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8A91A0] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-400 ease-out ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}
                >
                  <p className="text-base text-[#8A91A0] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────── Final CTA ───────── */
function FinalCTASection() {
  return (
    <section className="w-full bg-[#1A1D23] py-24 md:py-32 px-4">
      <div className="max-w-[640px] mx-auto">
        <div className="relative bg-[#0B0C10] border border-white/[0.08] rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(242, 169, 0, 0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-[clamp(28px,5vw,48px)] font-bold text-[#E6E8EE] tracking-[-0.02em]">
              Stay ahead of AI. Stay ahead of your peers.
            </h2>
            <p className="mt-6 text-lg text-[#8A91A0] max-w-[480px] mx-auto">
              Start your day with an AI edge tailored to your role.
            </p>
            <div className="mt-10">
              <Link
                href="/onboarding"
                className="inline-block px-12 py-4 bg-[#F2A900] text-[#0B0C10] font-semibold text-lg rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Your Edge — Free
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/sample"
                className="text-sm text-[#8A91A0] hover:text-[#F2A900] transition-colors"
              >
                Or view a guide first
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Footer ───────── */
function SiteFooter() {
  return (
    <footer className="w-full bg-[#0B0C10] border-t border-white/[0.08] py-12 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-[#E6E8EE] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
          My Daily Download
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8A91A0]">
          <Link href="/sample" className="hover:text-[#F2A900] transition-colors">
            Guide
          </Link>
          <Link href="/blog" className="hover:text-[#F2A900] transition-colors">
            Guides
          </Link>
          <Link href="/privacy" className="hover:text-[#F2A900] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#F2A900] transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-[#F2A900] transition-colors">
            Contact
          </Link>
          <Link href="/refunds" className="hover:text-[#F2A900] transition-colors">
            Refunds
          </Link>
        </div>
        <p className="text-xs text-[#8A91A0]">
          © {new Date().getFullYear()} My Daily Download. Every item cites a real
          source.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  useEffect(() => {
    captureCurrentAttribution();
    trackAnalyticsEvent("landing_viewed", { page: "home" });

    if (!GOOGLE_ADS_PURCHASE_LABEL) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") !== "success") return;

    const dedupeKey = "my-daily-download:google-ads:purchase";
    if (window.sessionStorage.getItem(dedupeKey)) return;
    trackAnalyticsEvent("pro_purchase_completed", {
      plan: "pro",
      source: "stripe_checkout_return",
    });

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      const sent = sendGoogleAdsConversion(GOOGLE_ADS_PURCHASE_LABEL, {
        dedupeKey,
        value: 1.0,
        currency: "USD",
      });
      if (sent) window.sessionStorage.setItem(dedupeKey, "1");
      if (sent || attempts >= 8) window.clearInterval(interval);
    }, 400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0B0C10]">
      <Navigation />
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <CareerCategoriesSection />
      <SamplePreviewSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <SiteFooter />
    </div>
  );
}
