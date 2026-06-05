import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import { useScrollReveal } from "../hooks/useScrollReveal";
import TerminalTyping from "../components/TerminalTyping";
import SampleEmail from "../components/SampleEmail";
import {
  careerCategories,
  sampleNewsletters,
} from "../data/careerContent";

gsap.registerPlugin(ScrollTrigger);

/* ───────── icon map for career categories ───────── */
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

/* ───────── FAQ data ───────── */
const faqData = [
  {
    q: "What makes this different from other AI newsletters?",
    a: "Most AI newsletters send the same content to everyone. We personalize every briefing to your specific career — a Product Manager gets product-focused AI news, while a Marketer gets marketing-focused updates.",
  },
  {
    q: "How does the LinkedIn/resume analysis work?",
    a: "Our AI reads your LinkedIn profile or resume to understand your role, industry, and seniority. This takes about 10 seconds and helps us tune your newsletter to exactly what you need.",
  },
  {
    q: "Can I change my career category later?",
    a: "Yes, you can update your career category, seniority, and interests anytime from your account settings.",
  },
  {
    q: "What time is the newsletter delivered?",
    a: "We deliver at 7 AM in your local timezone by default. You can change this to morning (7 AM), midday (12 PM), or evening (6 PM).",
  },
  {
    q: "How do I cancel?",
    a: "You can cancel anytime with one click. No calls, no emails, no hassle.",
  },
];

/* ───────── How It Works cards ───────── */
const howItWorksCards = [
  {
    icon: Briefcase,
    title: "Tell us your career",
    description:
      "Drop your LinkedIn URL, upload your resume, or pick your career category from 15 professional verticals. We use AI to understand what matters to you.",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "Our AI researches for you",
    description:
      "We scan 50+ sources daily for AI news, tools, and trends relevant to your specific role. No more generic tech hype — just what moves your career forward.",
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

/* ───────── Navigation Component ───────── */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Careers", href: "#careers" },
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
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-bold text-[#E0E2E8] text-lg tracking-tight"
        >
          My Daily Download
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/onboarding")}
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2.5 rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span
            className={`w-5 h-0.5 bg-[#E0E2E8] transition-transform ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-[#E0E2E8] transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-[#E0E2E8] transition-transform ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-16 right-0 w-64 bg-[#1A1D23] border border-white/[0.08] rounded-bl-xl shadow-2xl md:hidden">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-left text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors py-2"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/onboarding");
              }}
              className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-5 py-2.5 rounded-lg hover:bg-[#D49500] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ───────── Section 1: Hero ───────── */
function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const tl = gsap.timeline();

    tl.to(headlineRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease,
      delay: 0.1,
    })
      .to(
        subRef.current,
        { y: 0, opacity: 1, duration: 0.8, ease, delay: 0.15 },
        "-=0.6"
      )
      .to(
        ctaRef.current,
        { y: 0, opacity: 1, duration: 0.8, ease, delay: 0.3 },
        "-=0.5"
      )
      .to(
        terminalRef.current,
        { x: 0, opacity: 1, duration: 1, ease, delay: 0.5 },
        "-=0.6"
      );

    return () => { tl.kill(); };
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center bg-[#0B0C10] overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 40%, rgba(242, 169, 0, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-[1200px] mx-auto w-full px-4 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: text */}
        <div className="max-w-[600px]">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-6">
            Personalized AI Intelligence
          </p>
          <h1
            ref={headlineRef}
            className="text-[clamp(36px,5vw,64px)] font-bold text-[#E0E2E8] leading-[1.1] tracking-[-0.03em] opacity-0 translate-y-10"
          >
            AI news that actually matters to your career
          </h1>
          <p
            ref={subRef}
            className="mt-6 text-lg md:text-xl text-[#7A8194] max-w-[480px] leading-relaxed opacity-0 translate-y-10"
          >
            Get a daily briefing of the AI tools, news, and tactics shaping your
            industry — curated for your specific role, not generic tech hype.
          </p>
          <div
            ref={ctaRef}
            className="flex flex-wrap gap-4 mt-10 opacity-0 translate-y-10"
          >
            <button
              onClick={() => navigate("/onboarding")}
              className="px-8 py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Your Edge — Free
            </button>
            <button
              onClick={() => navigate("/sample")}
              className="px-8 py-3.5 border border-white/[0.08] text-[#E0E2E8] font-medium rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              See a Sample
            </button>
          </div>
        </div>

        {/* Right: Terminal */}
        <div
          ref={terminalRef}
          className="opacity-0 translate-x-16 lg:translate-x-16"
        >
          <TerminalTyping />
        </div>
      </div>
    </section>
  );
}

/* ───────── Section 2: Trust Bar ───────── */
function TrustBar() {
  const ref = useScrollReveal({
    childSelector: ".trust-item",
    stagger: 0.1,
    duration: 0.6,
  });

  const companies = ["Google", "Meta", "Amazon", "McKinsey", "Deloitte", "Salesforce"];

  return (
    <div
      ref={ref}
      className="w-full bg-[#1A1D23] border-y border-white/[0.08] py-8 px-4"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <span className="text-sm text-[#7A8194] whitespace-nowrap trust-item opacity-0">
          Trusted by professionals at
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((name) => (
            <span
              key={name}
              className="trust-item opacity-0 text-[#7A8194]/50 font-semibold text-sm tracking-wide grayscale hover:grayscale-0 hover:text-[#7A8194]/80 transition-all duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 3: How It Works ───────── */
function HowItWorksSection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.15,
    duration: 0.6,
  });

  return (
    <div
      id="how-it-works"
      ref={sectionRef}
      className="w-full bg-[#0B0C10] py-24 md:py-32 px-4"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal-child opacity-0 text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-4">
            How It Works
          </p>
          <h2 className="reveal-child opacity-0 text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] tracking-[-0.02em]">
            Your Daily AI Briefing in 3 Steps
          </h2>
          <p className="reveal-child opacity-0 mt-4 text-lg text-[#7A8194] max-w-[500px] mx-auto">
            From profile to personalized insights — every morning.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksCards.map((card) => (
            <div
              key={card.step}
              className="reveal-child opacity-0 relative bg-[#1A1D23] border border-white/[0.08] rounded-2xl p-8 md:p-10 group hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
            >
              {/* Step number */}
              <span className="absolute top-4 right-6 text-[48px] font-bold text-[rgba(242,169,0,0.15)] leading-none select-none">
                {card.step}
              </span>

              {/* Icon */}
              <card.icon className="w-8 h-8 text-[#F2A900] mb-6" />

              {/* Content */}
              <h3 className="text-xl font-semibold text-[#E0E2E8] mb-3">
                {card.title}
              </h3>
              <p className="text-[#7A8194] leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 4: Career Categories ───────── */
function CareerCategoriesSection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.08,
    duration: 0.6,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
  };

  return (
    <div
      id="careers"
      ref={sectionRef}
      className="w-full bg-[#1A1D23] py-24 md:py-32 px-4"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal-child opacity-0 text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-4">
            For Every Career
          </p>
          <h2 className="reveal-child opacity-0 text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] tracking-[-0.02em]">
            Personalized for every profession
          </h2>
          <p className="reveal-child opacity-0 mt-4 text-lg text-[#7A8194]">
            15 career verticals. Yours is in here.
          </p>
        </div>

        {/* Mobile scroll buttons */}
        <div className="flex md:hidden justify-end gap-2 mb-4">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-[#7A8194] hover:text-[#F2A900] hover:border-[#F2A900] transition-colors"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-[#7A8194] hover:text-[#F2A900] hover:border-[#F2A900] transition-colors"
          >
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>

        {/* Grid / Carousel */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 md:overflow-visible snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {careerCategories.map((career) => {
            const IconComponent = iconMap[career.icon] || Briefcase;
            return (
              <div
                key={career.id}
                className="reveal-child opacity-0 flex-shrink-0 w-[260px] md:w-auto bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-6 group hover:border-[rgba(242,169,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 snap-start cursor-pointer"
              >
                <IconComponent className="w-7 h-7 text-[#F2A900] mb-4" />
                <h3 className="text-[15px] font-semibold text-[#E0E2E8] mb-1.5">
                  {career.name}
                </h3>
                <p className="text-[13px] text-[#7A8194] leading-relaxed">
                  {career.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 5: Sample Newsletter Preview ───────── */
function SamplePreviewSection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.15,
    duration: 0.6,
  });
  const [selectedCareer, setSelectedCareer] = useState("product-management");
  const navigate = useNavigate();

  const careerOptions = Object.values(sampleNewsletters).map((s) => ({
    id: s.careerId,
    name: s.careerName,
  }));

  return (
    <div
      ref={sectionRef}
      className="w-full bg-[#0B0C10] py-24 md:py-32 px-4"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <p className="reveal-child opacity-0 text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-4">
              See It In Action
            </p>
            <h2 className="reveal-child opacity-0 text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] tracking-[-0.02em] mb-4">
              See what you&apos;ll get every morning
            </h2>
            <p className="reveal-child opacity-0 text-base text-[#7A8194] max-w-[440px] leading-relaxed mb-6">
              A clean, scannable email with the AI news and tools that matter
              for your role. No fluff. No generic roundups. Just your edge.
            </p>

            {/* Career selector */}
            <div className="reveal-child opacity-0 mb-6">
              <label className="text-xs text-[#7A8194] mb-2 block">
                Preview for:
              </label>
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="bg-[#1A1D23] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#E0E2E8] focus:outline-none focus:border-[#F2A900] cursor-pointer"
              >
                {careerOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate("/sample")}
              className="reveal-child opacity-0 inline-flex items-center gap-2 px-6 py-3 border border-white/[0.08] text-[#E0E2E8] font-medium rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              View Full Sample →
            </button>
          </div>

          {/* Right: Sample email card */}
          <div className="reveal-child opacity-0">
            <SampleEmail careerId={selectedCareer} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 6: Pricing ───────── */
function PricingSection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.2,
    duration: 0.6,
  });
  const navigate = useNavigate();

  const freeFeatures = [
    "Daily personalized AI briefing",
    "1 career profile",
    "Web archive access (7 days)",
    "Community Discord access",
  ];

  const proFeatures = [
    "Everything in Free",
    "Up to 3 career profiles",
    "Full web archive access",
    "Weekly deep-dive reports",
    "Priority support",
    "Early access to new features",
  ];

  return (
    <div
      id="pricing"
      ref={sectionRef}
      className="w-full bg-[#1A1D23] py-24 md:py-32 px-4"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal-child opacity-0 text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-4">
            Simple Pricing
          </p>
          <h2 className="reveal-child opacity-0 text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] tracking-[-0.02em]">
            Start Free. Upgrade When You&apos;re Hooked.
          </h2>
          <p className="reveal-child opacity-0 mt-4 text-base text-[#7A8194]">
            No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="reveal-child opacity-0 bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-[#E0E2E8] mb-2">
              Free
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-bold text-[#E0E2E8]">$0</span>
              <span className="text-base text-[#7A8194]">/month</span>
            </div>
            <p className="text-sm text-[#7A8194] mb-8">
              Perfect for trying it out.
            </p>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#F2A900] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#E0E2E8]">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/onboarding")}
              className="w-full py-3.5 border border-white/[0.08] text-[#E0E2E8] font-semibold rounded-lg hover:border-[#F2A900] hover:text-[#F2A900] transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="reveal-child opacity-0 relative bg-[#0B0C10] border-2 border-[#F2A900] rounded-2xl p-8 md:p-10">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-[#F2A900] text-[#0B0C10] text-[11px] font-semibold uppercase px-3 py-1.5 rounded-bl-xl rounded-tr-[14px]">
              Most Popular
            </div>

            <h3 className="text-2xl font-semibold text-[#E0E2E8] mb-2">
              Pro
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-bold text-[#F2A900]">$12</span>
              <span className="text-base text-[#7A8194]">/month</span>
            </div>
            <p className="text-sm text-[#7A8194] mb-8">
              For professionals who take AI seriously.
            </p>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#F2A900] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#E0E2E8]">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/onboarding?plan=pro")}
              className="w-full py-3.5 bg-[#F2A900] text-[#0B0C10] font-semibold rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 7: FAQ ───────── */
function FAQSection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.08,
    duration: 0.6,
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      id="faq"
      ref={sectionRef}
      className="w-full bg-[#0B0C10] py-24 md:py-32 px-4"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="reveal-child opacity-0 text-xs font-medium uppercase tracking-[0.12em] text-[#F2A900] mb-4">
            FAQ
          </p>
          <h2 className="reveal-child opacity-0 text-[clamp(28px,4vw,40px)] font-semibold text-[#E0E2E8] tracking-[-0.02em]">
            Questions? Answered.
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-white/[0.08]">
          {faqData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="reveal-child opacity-0">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="text-lg font-medium text-[#E0E2E8] pr-4 group-hover:text-[#F2A900] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#7A8194] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-400 ease-out ${
                    isOpen ? "max-h-96 pb-6" : "max-h-0"
                  }`}
                >
                  <p className="text-base text-[#7A8194] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────── Section 8: Final CTA ───────── */
function FinalCTASection() {
  const sectionRef = useScrollReveal({
    childSelector: ".reveal-child",
    stagger: 0.15,
    duration: 0.6,
  });
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#1A1D23] py-24 md:py-32 px-4">
      <div className="max-w-[640px] mx-auto">
        <div
          ref={sectionRef}
          className="relative bg-[#0B0C10] border border-white/[0.08] rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(242, 169, 0, 0.08) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            <h2 className="reveal-child opacity-0 text-[clamp(28px,5vw,48px)] font-bold text-[#E0E2E8] tracking-[-0.02em]">
              Stay ahead of AI. Stay ahead of your peers.
            </h2>
            <p className="reveal-child opacity-0 mt-6 text-lg text-[#7A8194] max-w-[480px] mx-auto">
              Join 2,000+ professionals who start their day with an AI edge.
            </p>
            <div className="reveal-child opacity-0 mt-10">
              <button
                onClick={() => navigate("/onboarding")}
                className="px-12 py-4 bg-[#F2A900] text-[#0B0C10] font-semibold text-lg rounded-lg hover:bg-[#D49500] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Your Edge — Free
              </button>
            </div>
            <div className="reveal-child opacity-0 mt-4">
              <button
                onClick={() => navigate("/sample")}
                className="text-sm text-[#7A8194] hover:text-[#F2A900] transition-colors"
              >
                Or view a sample first
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Main Home Page ───────── */
export default function Home() {
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
    </div>
  );
}
