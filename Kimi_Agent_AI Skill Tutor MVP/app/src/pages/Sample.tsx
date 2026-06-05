import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SampleEmail from "../components/SampleEmail";
import {
  careers,
  type Career,
  careerLabels,
  sampleNewsletters,
} from "../data/careerContent";
import { TrendingUp, Zap, Mail, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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

function getCareerFromQuery(): Career {
  const params = new URLSearchParams(window.location.search);
  const careerParam = params.get("career");
  if (careerParam && careers.includes(careerParam as Career)) {
    return careerParam as Career;
  }
  return "Product Manager";
}

export default function Sample() {
  const navigate = useNavigate();
  const [selectedCareer, setSelectedCareer] = useState<Career>(
    getCareerFromQuery()
  );
  const [emailKey, setEmailKey] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const whatYouGetRef = useRef<HTMLDivElement>(null);
  const careerGridRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  const handleCareerChange = useCallback(
    (career: Career) => {
      setSelectedCareer(career);
      setEmailKey((k) => k + 1);
      const params = new URLSearchParams(window.location.search);
      params.set("career", career);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    },
    []
  );

  // 3D Rotation Heading + Section Reveals
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label reveal
      gsap.fromTo(
        labelRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
          },
        }
      );

      // 3D Character rotation heading
      if (headingRef.current) {
        const chars = headingRef.current.querySelectorAll(".char");
        gsap.set(chars, {
          rotateX: -90,
          translateY: -80,
          opacity: 0,
          transformOrigin: "50% 0%",
        });
        gsap.to(chars, {
          rotateX: 0,
          translateY: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.03,
          ease: "expo.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 75%",
          },
        });
      }

      // Subtitle reveal
      gsap.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
          },
        }
      );

      // Selector reveal
      gsap.fromTo(
        selectorRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          delay: 0.5,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
          },
        }
      );

      // What You Get section reveal
      if (whatYouGetRef.current) {
        gsap.fromTo(
          whatYouGetRef.current.querySelectorAll(".reveal-item"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: whatYouGetRef.current,
              start: "top 75%",
            },
          }
        );
      }

      // CTA section reveal
      if (ctaSectionRef.current) {
        gsap.fromTo(
          ctaSectionRef.current.querySelectorAll(".cta-reveal"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Career grid reveal
      if (careerGridRef.current) {
        gsap.fromTo(
          careerGridRef.current.querySelectorAll(".career-card"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "expo.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: careerGridRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Final CTA reveal
      if (finalCtaRef.current) {
        gsap.fromTo(
          finalCtaRef.current.querySelectorAll(".final-reveal"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: finalCtaRef.current,
              start: "top 80%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const headingText = "Your Morning Edge";
  const careerContent = sampleNewsletters[selectedCareer];
  const todayDate = getTodayDate();

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      {/* Floating Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[rgba(11,12,16,0.85)] border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-[15px] font-bold text-[#E0E2E8] hover:text-[#F2A900] transition-colors"
          >
            My Daily Download
          </button>
          <button
            onClick={() => navigate("/onboarding")}
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Section 1: Page Header */}
      <section
        ref={heroRef}
        className="pt-40 pb-20 px-6 flex flex-col items-center text-center"
      >
        <div className="max-w-[720px]">
          {/* Back link */}
          <button
            onClick={() => navigate("/")}
            className="cta-reveal text-[#7A8194] text-sm hover:text-[#E0E2E8] transition-colors mb-8 flex items-center gap-1 mx-auto"
          >
            &larr; Back to Home
          </button>

          {/* Caption label */}
          <div
            ref={labelRef}
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#F2A900] mb-4"
          >
            Sample Briefing
          </div>

          {/* 3D Rotation Heading */}
          <h1
            ref={headingRef}
            className="text-[clamp(48px,8vw,96px)] font-bold text-[#E0E2E8] leading-[1.05] tracking-[-0.02em]"
            style={{ perspective: "600px" }}
          >
            {headingText.split("").map((char, i) => (
              <span
                key={i}
                className="char inline-block"
                style={{ transformStyle: "preserve-3d" }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="mt-6 text-lg text-[#7A8194] max-w-[560px] mx-auto leading-relaxed"
          >
            See what a personalized My Daily Download briefing looks like for
            your role.
          </p>

          {/* Career Selector */}
          <div ref={selectorRef} className="mt-12">
            <label
              htmlFor="career-select"
              className="block text-sm font-medium text-[#7A8194] mb-3"
            >
              Choose a career to preview:
            </label>
            <select
              id="career-select"
              value={selectedCareer}
              onChange={(e) => handleCareerChange(e.target.value as Career)}
              className="bg-[#1A1D23] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#E0E2E8] min-w-[280px] text-sm focus:outline-none focus:border-[#F2A900] transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8194' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
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

      {/* Section 2: Newsletter Preview */}
      <section className="pb-[120px] px-6">
        <SampleEmail
          key={emailKey}
          content={careerContent}
          careerName={careerLabels[selectedCareer]}
          todayDate={todayDate}
        />
      </section>

      {/* CTA Section Below Email */}
      <section ref={ctaSectionRef} className="py-[80px] px-6 text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="cta-reveal text-[clamp(28px,4vw,40px)] font-bold text-[#E0E2E8]">
            Get this in your inbox every morning
          </h2>
          <p className="cta-reveal mt-4 text-base text-[#7A8194]">
            Free. Personalized. 2-minute read.
          </p>
          <div className="cta-reveal mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center gap-2 bg-[#F2A900] text-[#0B0C10] font-semibold px-8 py-3.5 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200"
            >
              Subscribe Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/onboarding?plan=pro")}
              className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-transparent text-[#E0E2E8] font-semibold px-8 py-3.5 rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: What You Get */}
      <section
        ref={whatYouGetRef}
        className="py-[120px] px-6 bg-[#1A1D23]"
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="reveal-item text-[12px] font-medium uppercase tracking-[0.08em] text-[#F2A900] mb-4">
            Your Daily Briefing
          </div>
          <h2 className="reveal-item text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] mb-16">
            Every Morning, You&apos;ll Receive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="reveal-item bg-[#0B0C10] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(242,169,0,0.1)] flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-[#F2A900]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E0E2E8] mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-[#7A8194] leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Grid */}
      <section ref={careerGridRef} className="py-[120px] px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="reveal-item text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] mb-4">
            Personalized for Every Profession
          </h2>
          <p className="reveal-item text-base text-[#7A8194] mb-12 max-w-[560px] mx-auto">
            Click any career to see how My Daily Download adapts to your field.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {careers.map((career) => (
              <button
                key={career}
                onClick={() => handleCareerChange(career)}
                className={`career-card px-4 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  selectedCareer === career
                    ? "bg-[#F2A900] text-[#0B0C10] border-[#F2A900]"
                    : "bg-[#1A1D23] text-[#E0E2E8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1"
                }`}
              >
                {careerLabels[career]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Final CTA */}
      <section ref={finalCtaRef} className="py-[120px] px-6 text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="final-reveal text-[clamp(28px,4vw,44px)] font-bold text-[#E0E2E8]">
            This Could Be Your Inbox Tomorrow.
          </h2>
          <p className="final-reveal mt-4 text-base text-[#7A8194]">
            Free, personalized, and ready in 60 seconds.
          </p>
          <div className="final-reveal mt-8">
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center gap-2 bg-[#F2A900] text-[#0B0C10] font-semibold px-10 py-4 rounded-lg hover:bg-[#D49500] hover:-translate-y-0.5 transition-all duration-200 glow-pulse text-base"
            >
              Get My Daily Edge
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="final-reveal mt-6 text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[rgba(255,255,255,0.06)] text-center">
        <p className="text-[12px] text-[#7A8194]">
          &copy; {new Date().getFullYear()} My Daily Download. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
