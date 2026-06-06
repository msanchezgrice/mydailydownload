"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SampleEmail from "../components/SampleEmail";
import {
  careers,
  type Career,
  careerLabels,
  sampleNewsletters,
} from "../lib/careerContent";
import { TrendingUp, Zap, Mail, ArrowRight } from "lucide-react";

const featureCards = [
  {
    icon: TrendingUp,
    title: "1 Top Story",
    description:
      "The single most important AI development for your career, with context on why it matters.",
  },
  {
    icon: Zap,
    title: "1 Curated Tool",
    description:
      "An AI tool hand-picked for your role, with a quick-start guide and use case.",
  },
  {
    icon: Mail,
    title: "3 Quick Hits",
    description:
      "Short, scannable updates on funding rounds, launches, and trends you can't miss.",
  },
];

function getTodayDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SamplePage() {
  const [selectedCareer, setSelectedCareer] = useState<Career>("product-management");
  const [emailKey, setEmailKey] = useState(0);
  const [todayDate, setTodayDate] = useState<string>("");

  // Honor ?career= on mount + compute date client-side (avoids hydration drift)
  useEffect(() => {
    const restore = setTimeout(() => {
      setTodayDate(getTodayDate());
      const params = new URLSearchParams(window.location.search);
      const careerParam = params.get("career");
      if (careerParam && careers.includes(careerParam as Career)) {
        setSelectedCareer(careerParam as Career);
      }
    }, 0);

    return () => clearTimeout(restore);
  }, []);

  const handleCareerChange = useCallback((career: Career) => {
    setSelectedCareer(career);
    setEmailKey((k) => k + 1);
    const params = new URLSearchParams(window.location.search);
    params.set("career", career);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, []);

  const careerContent = sampleNewsletters[selectedCareer];

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[rgba(11,12,16,0.85)] border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-bold text-[#E6E8EE] hover:text-[#F2A900] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A900]" aria-hidden />
            My Daily Download
          </Link>
          <Link
            href="/onboarding"
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-6 flex flex-col items-center text-center">
        <div className="max-w-[720px]">
          <Link
            href="/"
            className="text-[#8A91A0] text-sm hover:text-[#E6E8EE] transition-colors mb-8 flex items-center gap-1 mx-auto w-fit"
          >
            ← Back to Home
          </Link>

          <div className="section-label mb-4">Sample Briefing</div>

          <h1 className="text-[clamp(40px,8vw,80px)] font-bold text-[#E6E8EE] leading-[1.05] tracking-[-0.02em]">
            Your Morning Edge
          </h1>

          <p className="mt-6 text-lg text-[#8A91A0] max-w-[560px] mx-auto leading-relaxed">
            See what a personalized My Daily Download briefing looks like for your
            role.
          </p>

          <div className="mt-12">
            <label
              htmlFor="career-select"
              className="block text-sm font-medium text-[#8A91A0] mb-3"
            >
              Choose a career to preview:
            </label>
            <select
              id="career-select"
              value={selectedCareer}
              onChange={(e) => handleCareerChange(e.target.value as Career)}
              className="bg-[#1A1D23] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#E6E8EE] min-w-[280px] text-sm focus:outline-none focus:border-[#F2A900] transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A91A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "40px",
              }}
            >
              {careers.map((career) => (
                <option key={career} value={career}>
                  {careerLabels[career]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Newsletter Preview */}
      <section className="pb-[120px] px-6">
        <SampleEmail
          key={emailKey}
          content={careerContent}
          careerName={careerLabels[selectedCareer]}
          todayDate={todayDate || undefined}
        />
      </section>

      {/* CTA */}
      <section className="py-[80px] px-6 text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-[#E6E8EE]">
            Get this in your inbox every morning
          </h2>
          <p className="mt-4 text-base text-[#8A91A0]">
            Free. Personalized. 2-minute read.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-[#F2A900] text-[#0B0C10] font-semibold px-8 py-3.5 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
            >
              Subscribe Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding?plan=pro"
              className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-transparent text-[#E6E8EE] font-semibold px-8 py-3.5 rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-[120px] px-6 bg-[#1A1D23]">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="section-label mb-4">Your Daily Briefing</div>
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] mb-16">
            Every Morning, You&apos;ll Receive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="bg-[#0B0C10] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(242,169,0,0.1)] flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-[#F2A900]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E6E8EE] mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-[#8A91A0] leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Grid */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE] mb-4">
            Personalized for Every Profession
          </h2>
          <p className="text-base text-[#8A91A0] mb-12 max-w-[560px] mx-auto">
            Click any career to see how My Daily Download adapts to your field.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {careers.map((career) => (
              <button
                key={career}
                onClick={() => handleCareerChange(career)}
                className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  selectedCareer === career
                    ? "bg-[#F2A900] text-[#0B0C10] border-[#F2A900]"
                    : "bg-[#1A1D23] text-[#E6E8EE] border-[rgba(255,255,255,0.08)] hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1"
                }`}
              >
                {careerLabels[career]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-[120px] px-6 text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-[#E6E8EE]">
            This Could Be Your Inbox Tomorrow.
          </h2>
          <p className="mt-4 text-base text-[#8A91A0]">
            Free, personalized, and ready in 60 seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-[#F2A900] text-[#0B0C10] font-semibold px-10 py-4 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200 text-base"
            >
              Get My Daily Edge
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-[#8A91A0] hover:text-[#E6E8EE] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[rgba(255,255,255,0.06)] text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#8A91A0]">
          <span>
            © {new Date().getFullYear()} My Daily Download. Every item cites a real
            source.
          </span>
          <Link href="/privacy" className="hover:text-[#F2A900]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#F2A900]">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-[#F2A900]">
            Contact
          </Link>
          <Link href="/refunds" className="hover:text-[#F2A900]">
            Refunds
          </Link>
        </div>
      </footer>
    </div>
  );
}
