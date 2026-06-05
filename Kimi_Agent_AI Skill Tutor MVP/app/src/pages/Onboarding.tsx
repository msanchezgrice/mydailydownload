import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Upload,
  FileText,
  X,
  Briefcase,
  Megaphone,
  TrendingUp,
  BarChart3,
  Palette,
  Settings,
  Check,
  Mail,
  Sparkles,
  Zap,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import TerminalTyping from "../components/TerminalTyping";
import SampleEmail from "../components/SampleEmail";
import {
  careerCategories,
  seniorityLevels,
  interestOptions,
  linkedInSlugToCareer,
  careerNewsletters,
} from "../data/careerContent";

/* ──────────────────────── Types ──────────────────────── */

interface OnboardingState {
  step: 1 | 2 | 3;
  email: string;
  inputMethod: "linkedin" | "resume" | "manual";
  linkedinUrl: string;
  resumeFile: File | null;
  resumeFileName: string;
  selectedCategory: string;
  seniority: string;
  detectedProfile: {
    role: string;
    seniority: string;
    focusAreas: string[];
    industry: string;
  } | null;
  interests: string[];
  plan: "free" | "pro";
  deliveryTime: "morning" | "midday" | "evening";
  agreeToNewsletter: boolean;
  editingProfile: boolean;
}

const STORAGE_KEY = "onboarding-state";

const DEFAULT_STATE: OnboardingState = {
  step: 1,
  email: "",
  inputMethod: "linkedin",
  linkedinUrl: "",
  resumeFile: null,
  resumeFileName: "",
  selectedCategory: "",
  seniority: "Mid Level",
  detectedProfile: null,
  interests: [],
  plan: "free",
  deliveryTime: "morning",
  agreeToNewsletter: false,
  editingProfile: false,
};

/* ──────────────────────── Career Icon Map ──────────────────────── */

const careerIcons: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
};

/* ──────────────────────── Mock LLM Analysis ──────────────────────── */

const FALLBACK_CAREER = "product-management";

function parseLinkedInUrl(url: string): string {
  try {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    if (!match) return FALLBACK_CAREER;
    const slug = match[1].toLowerCase().replace(/[^a-z]/g, "");
    return linkedInSlugToCareer[slug] || FALLBACK_CAREER;
  } catch {
    return FALLBACK_CAREER;
  }
}

function generateMockProfile(state: OnboardingState) {
  let careerId = FALLBACK_CAREER;

  if (state.inputMethod === "linkedin" && state.linkedinUrl) {
    careerId = parseLinkedInUrl(state.linkedinUrl);
  } else if (state.inputMethod === "resume") {
    const keys = Object.keys(careerNewsletters);
    careerId = keys[Math.floor(Math.random() * keys.length)];
  } else if (state.inputMethod === "manual" && state.selectedCategory) {
    careerId = state.selectedCategory;
  }

  const newsletter = careerNewsletters[careerId] || careerNewsletters[FALLBACK_CAREER];
  const focusAreasMap: Record<string, string[]> = {
    "product-management": ["AI Product Strategy", "User Research", "Roadmap Tools"],
    marketing: ["AI Copywriting", "Growth Hacking", "Ad Automation"],
    sales: ["AI Outreach", "CRM Automation", "Lead Scoring"],
    finance: ["Forecasting AI", "Risk Analysis", "Automation"],
    design: ["Generative Design", "Design Systems", "AI Prototyping"],
    operations: ["Process Automation", "Supply Chain AI", "SOP Generation"],
  };

  return {
    role: newsletter.career,
    seniority: state.seniority || "Mid Level",
    focusAreas: focusAreasMap[careerId] || ["AI Tools", "Automation"],
    industry: "Technology",
    careerId,
  };
}

/* ──────────────────────── Terminal Lines ──────────────────────── */

function getTerminalLines(role: string, seniority: string): string[] {
  return [
    "Parsing career data...",
    "Identifying role signals...",
    `Role detected: ${role}`,
    `Seniority: ${seniority}`,
    "Industry focus: Technology",
    "Generating briefing profile...",
    "Done.",
  ];
}

/* ──────────────────────── Component ──────────────────────── */

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<OnboardingState>(() => {
    // Try to restore from sessionStorage
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed, resumeFile: null };
      }
    } catch {
      // ignore
    }
    // Check for ?plan=pro
    const planParam = searchParams.get("plan");
    if (planParam === "pro") {
      return { ...DEFAULT_STATE, plan: "pro" };
    }
    return { ...DEFAULT_STATE };
  });

  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [shakeEmail, setShakeEmail] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real subscribe submission state (Phase 2 — persists to Supabase).
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [subscribeError, setSubscribeError] = useState<string>("");

  // Persist to sessionStorage on every change
  useEffect(() => {
    const { resumeFile, ...serializable } = state;
    void resumeFile;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [state]);

  const update = useCallback(<K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ── Validation ── */
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);

  const canContinue =
    isEmailValid &&
    state.agreeToNewsletter &&
    ((state.inputMethod === "linkedin" && state.linkedinUrl.trim().length > 0) ||
      (state.inputMethod === "resume" && state.resumeFile !== null) ||
      (state.inputMethod === "manual" && state.selectedCategory !== ""));

  /* ── Handlers ── */
  const handleContinue = () => {
    if (!canContinue) {
      if (!isEmailValid || !state.agreeToNewsletter) {
        setShakeEmail(true);
        setTimeout(() => setShakeEmail(false), 400);
      }
      return;
    }
    // Move to Step 2 and show terminal
    const profile = generateMockProfile(state);
    setTerminalLines(getTerminalLines(profile.role, profile.seniority));
    setShowTerminal(true);
    update("step", 2);
    update("detectedProfile", profile);
  };

  const handleTerminalComplete = () => {
    setShowTerminal(false);
  };

  const handleConfirmProfile = () => {
    update("step", 3);
  };

  const handleEditProfile = () => {
    update("editingProfile", true);
  };

  const handleBackToStep1 = () => {
    update("step", 1);
    update("detectedProfile", null);
    update("editingProfile", false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.match(/\.(doc|docx)$/i))) {
      if (file.size <= 5 * 1024 * 1024) {
        update("resumeFile", file);
        update("resumeFileName", file.name);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      update("resumeFile", file);
      update("resumeFileName", file.name);
    }
  };

  const toggleInterest = (interest: string) => {
    setState((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  /* ── Subscribe (Phase 2: real persistence to Supabase) ── */
  const handleSubscribe = async () => {
    if (subscribeStatus === "submitting") return;
    setSubscribeStatus("submitting");
    setSubscribeError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          careerId: detectedCareerId,
          seniority: state.detectedProfile?.seniority || state.seniority,
          interests: state.interests,
          plan: state.plan,
          consentText:
            "I agree to receive the My Daily Download newsletter. Unsubscribe anytime.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setSubscribeStatus("success");
      } else {
        setSubscribeStatus("error");
        setSubscribeError(
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        );
      }
    } catch {
      setSubscribeStatus("error");
      setSubscribeError("Network error. Please check your connection and try again.");
    }
  };

  /* ── Derived ── */
  const detectedCareerId =
    state.inputMethod === "linkedin"
      ? parseLinkedInUrl(state.linkedinUrl)
      : state.inputMethod === "resume"
      ? (Object.keys(careerNewsletters).find(
          (k) => careerNewsletters[k].career === state.detectedProfile?.role
        ) || FALLBACK_CAREER)
      : state.selectedCategory || FALLBACK_CAREER;

  /* ───────────────────────────── RENDER ───────────────────────────── */

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4 py-10"
      style={{ background: "var(--bg-void)" }}
    >
      {/* Wordmark */}
      <Link
        to="/"
        className="text-lg font-semibold mb-10 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-primary)" }}
      >
        My Daily Download
      </Link>

      {/* Step Indicator */}
      <StepIndicator currentStep={state.step} />

      {/* Card Container */}
      <div
        className="w-full max-w-[640px] rounded-[20px] p-6 md:p-12"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* ═══════════════════ STEP 1 ═══════════════════ */}
        {state.step === 1 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <h1
              className="text-2xl md:text-[28px] font-semibold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Let's Personalize Your AI Briefing
            </h1>
            <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
              We'll analyze your career to deliver tailored AI news every morning.
            </p>

            {/* Tab Switcher */}
            <div
              className="flex rounded-[10px] p-1 mb-8"
              style={{ background: "var(--bg-elevated)" }}
            >
              {(["linkedin", "resume", "manual"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => update("inputMethod", method)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background:
                      state.inputMethod === method ? "var(--accent)" : "transparent",
                    color:
                      state.inputMethod === method
                        ? "#0B0C10"
                        : "var(--text-secondary)",
                  }}
                >
                  {method === "linkedin"
                    ? "LinkedIn"
                    : method === "resume"
                    ? "Resume"
                    : "Manual"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {/* ── LinkedIn Tab ── */}
              {state.inputMethod === "linkedin" && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={state.linkedinUrl}
                    onChange={(e) => update("linkedinUrl", e.target.value)}
                    className="w-full rounded-[10px] px-4 py-3.5 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(242, 169, 0, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                    Paste your public LinkedIn profile URL. We'll scan your headline and
                    experience.
                  </p>
                </div>
              )}

              {/* ── Resume Tab ── */}
              {state.inputMethod === "resume" && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  {!state.resumeFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
                      style={{
                        border: dragOver
                          ? "2px dashed var(--accent)"
                          : "2px dashed var(--border-subtle)",
                        background: dragOver
                          ? "rgba(242, 169, 0, 0.05)"
                          : "transparent",
                      }}
                    >
                      <Upload
                        className="w-8 h-8 mx-auto mb-3"
                        style={{ color: "var(--accent)" }}
                      />
                      <p
                        className="text-base font-normal"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Drop your resume here, or click to browse
                      </p>
                      <p
                        className="text-xs mt-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        PDF, DOC, DOCX up to 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText
                          className="w-5 h-5"
                          style={{ color: "var(--accent)" }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {state.resumeFileName}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          update("resumeFile", null);
                          update("resumeFileName", "");
                        }}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Manual Tab ── */}
              {state.inputMethod === "manual" && (
                <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
                  {/* Category Grid */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Select your career category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {careerCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => update("selectedCategory", cat.id)}
                          className="flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            background: "var(--bg-elevated)",
                            border:
                              state.selectedCategory === cat.id
                                ? "1px solid var(--accent)"
                                : "1px solid var(--border-subtle)",
                            color:
                              state.selectedCategory === cat.id
                                ? "var(--accent)"
                                : "var(--text-primary)",
                            ...(state.selectedCategory === cat.id && {
                              background: "rgba(242, 169, 0, 0.08)",
                            }),
                          }}
                        >
                          {careerIcons[cat.icon]}
                          <span className="text-sm font-medium">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seniority */}
                  {state.selectedCategory && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <label
                        className="block text-sm font-medium mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        What's your seniority level?
                      </label>
                      <div
                        className="flex flex-wrap rounded-[10px] p-1 gap-1"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        {seniorityLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => update("seniority", level)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{
                              background:
                                state.seniority === level ? "var(--accent)" : "transparent",
                              color:
                                state.seniority === level
                                  ? "#0B0C10"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {state.selectedCategory && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <label
                        className="block text-sm font-medium mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Interest areas (optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interestOptions.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border"
                            style={{
                              background: state.interests.includes(interest)
                                ? "rgba(242, 169, 0, 0.08)"
                                : "var(--bg-elevated)",
                              borderColor: state.interests.includes(interest)
                                ? "var(--accent)"
                                : "var(--border-subtle)",
                              color: state.interests.includes(interest)
                                ? "var(--accent)"
                                : "var(--text-secondary)",
                            }}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className={`mt-8 ${shakeEmail ? "animate-shake" : ""}`}>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Your email address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={state.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-[10px] px-4 py-3.5 text-sm outline-none transition-all duration-200"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(242, 169, 0, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Checkbox */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                <div
                  className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    borderColor: state.agreeToNewsletter
                      ? "var(--accent)"
                      : "var(--border-subtle)",
                    background: state.agreeToNewsletter
                      ? "var(--accent)"
                      : "transparent",
                  }}
                  onClick={() => update("agreeToNewsletter", !state.agreeToNewsletter)}
                >
                  {state.agreeToNewsletter && (
                    <Check className="w-3.5 h-3.5" style={{ color: "#0B0C10" }} />
                  )}
                </div>
                <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  I agree to receive the My Daily Download newsletter. Unsubscribe anytime.
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full mt-8 py-3.5 px-8 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#0B0C10",
                opacity: canContinue ? 1 : 0.4,
                cursor: canContinue ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (canContinue) {
                  e.currentTarget.style.background = "var(--accent-hover)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(242, 169, 0, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Analyze My Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══════════════════ STEP 2 ═══════════════════ */}
        {state.step === 2 && (
          <div>
            {showTerminal ? (
              /* ── Terminal Loading State ── */
              <div className="flex flex-col items-center animate-[fadeIn_0.4s_ease-out]">
                <div
                  className="w-full max-w-[480px] rounded-xl overflow-hidden"
                  style={{
                    background: "#0D1117",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <TerminalTyping
                    lines={terminalLines}
                    typingSpeed={35}
                    onComplete={handleTerminalComplete}
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ background: "var(--accent)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Analyzing your profile...
                  </p>
                </div>
              </div>
            ) : (
              /* ── Analysis Results ── */
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Here's What We Found
                </h2>

                {/* Detected Profile Card */}
                <div
                  className="rounded-xl p-6 space-y-4"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Role */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5" style={{ color: "var(--accent)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Career Role
                      </span>
                    </div>
                    {state.editingProfile ? (
                      <select
                        value={state.detectedProfile?.role || ""}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            detectedProfile: prev.detectedProfile
                              ? { ...prev.detectedProfile, role: e.target.value }
                              : null,
                          }))
                        }
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {Object.values(careerNewsletters).map((c) => (
                          <option key={c.career} value={c.career}>
                            {c.career}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {state.detectedProfile?.role}
                      </span>
                    )}
                  </div>

                  {/* Seniority */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" style={{ color: "var(--accent)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Seniority Level
                      </span>
                    </div>
                    {state.editingProfile ? (
                      <select
                        value={state.detectedProfile?.seniority || ""}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            detectedProfile: prev.detectedProfile
                              ? { ...prev.detectedProfile, seniority: e.target.value }
                              : null,
                          }))
                        }
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {seniorityLevels.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {state.detectedProfile?.seniority}
                      </span>
                    )}
                  </div>

                  {/* Focus Areas */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Focus Areas
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {state.detectedProfile?.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: "rgba(242, 169, 0, 0.1)",
                            color: "var(--accent)",
                          }}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Industry
                      </span>
                    </div>
                    {state.editingProfile ? (
                      <select
                        value={state.detectedProfile?.industry || ""}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            detectedProfile: prev.detectedProfile
                              ? { ...prev.detectedProfile, industry: e.target.value }
                              : null,
                          }))
                        }
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"].map(
                          (i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {state.detectedProfile?.industry}
                      </span>
                    )}
                  </div>

                  {/* Career picker if editing */}
                  {state.editingProfile && (
                    <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Change career category
                      </label>
                      <div className="relative">
                        <select
                          value={detectedCareerId}
                          onChange={(e) => {
                            const newCareerId = e.target.value;
                            const nl = careerNewsletters[newCareerId];
                            if (nl && state.detectedProfile) {
                              const focusAreasMap: Record<string, string[]> = {
                                "product-management": ["AI Product Strategy", "User Research", "Roadmap Tools"],
                                marketing: ["AI Copywriting", "Growth Hacking", "Ad Automation"],
                                sales: ["AI Outreach", "CRM Automation", "Lead Scoring"],
                                finance: ["Forecasting AI", "Risk Analysis", "Automation"],
                                design: ["Generative Design", "Design Systems", "AI Prototyping"],
                                operations: ["Process Automation", "Supply Chain AI", "SOP Generation"],
                              };
                              setState((prev) => ({
                                ...prev,
                                detectedProfile: {
                                  ...prev.detectedProfile!,
                                  role: nl.career,
                                  focusAreas: focusAreasMap[newCareerId] || ["AI Tools", "Automation"],
                                },
                              }));
                            }
                          }}
                          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-sm appearance-none outline-none"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {careerCategories.map((cat) => {
                            const nl = careerNewsletters[cat.id];
                            return (
                              <option key={cat.id} value={cat.id}>
                                {nl?.career || cat.name}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown
                          className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div className="mt-8">
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Is this correct?
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmProfile}
                      className="flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200"
                      style={{ background: "var(--accent)", color: "#0B0C10" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-hover)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 0 20px rgba(242, 169, 0, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Yes, Looks Good
                    </button>
                    <button
                      onClick={state.editingProfile ? handleBackToStep1 : handleEditProfile}
                      className="flex-1 py-3 px-6 rounded-lg font-semibold text-sm border transition-all duration-200"
                      style={{
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                    >
                      {state.editingProfile ? "Back to Edit" : "No, Let Me Edit"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ STEP 3 ═══════════════════ */}
        {state.step === 3 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Success Icon */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "rgba(242, 169, 0, 0.15)",
                  border: "2px solid var(--accent)",
                }}
              >
                <Check className="w-8 h-8" style={{ color: "var(--accent)" }} />
              </div>

              <h1
                className="text-3xl md:text-[32px] font-bold mb-3"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                You're All Set!
              </h1>
              <p
                className="text-base max-w-[400px] mx-auto leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Your personalized AI briefing for{" "}
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {state.detectedProfile?.role || "your career"}
                </span>{" "}
                will arrive{" "}
                {state.deliveryTime === "morning"
                  ? "every morning at 7 AM"
                  : state.deliveryTime === "midday"
                  ? "every midday at 12 PM"
                  : "every evening at 6 PM"}{" "}
                in your timezone.
              </p>
            </div>

            {/* Delivery Preferences */}
            <div className="mt-8">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Delivery time
              </label>
              <div className="flex gap-2">
                {[
                  { key: "morning" as const, label: "Morning (7 AM)" },
                  { key: "midday" as const, label: "Midday (12 PM)" },
                  { key: "evening" as const, label: "Evening (6 PM)" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => update("deliveryTime", t.key)}
                    className="flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 border"
                    style={{
                      background:
                        state.deliveryTime === t.key
                          ? "rgba(242, 169, 0, 0.08)"
                          : "var(--bg-elevated)",
                      borderColor:
                        state.deliveryTime === t.key
                          ? "var(--accent)"
                          : "var(--border-subtle)",
                      color:
                        state.deliveryTime === t.key
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div className="mt-8 space-y-3">
              <label
                className="block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Choose your plan
              </label>

              {/* Free Plan */}
              <button
                onClick={() => update("plan", "free")}
                className="w-full flex items-center justify-between rounded-xl p-4 text-left transition-all duration-200 border"
                style={{
                  background:
                    state.plan === "free" ? "rgba(242, 169, 0, 0.05)" : "var(--bg-elevated)",
                  borderColor:
                    state.plan === "free" ? "var(--accent)" : "var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: state.plan === "free" ? "var(--accent)" : "var(--border-subtle)",
                    }}
                  >
                    {state.plan === "free" && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Free
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Daily briefing + weekly roundup
                    </p>
                  </div>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  $0
                  <span className="text-xs font-normal" style={{ color: "var(--text-secondary)" }}>
                    /mo
                  </span>
                </span>
              </button>

              {/* Pro Plan */}
              <button
                onClick={() => update("plan", "pro")}
                className="w-full flex items-center justify-between rounded-xl p-4 text-left transition-all duration-200 border"
                style={{
                  background:
                    state.plan === "pro" ? "rgba(242, 169, 0, 0.05)" : "var(--bg-elevated)",
                  borderColor:
                    state.plan === "pro" ? "var(--accent)" : "var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: state.plan === "pro" ? "var(--accent)" : "var(--border-subtle)",
                    }}
                  >
                    {state.plan === "pro" && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Pro
                      </p>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          background: "var(--accent)",
                          color: "#0B0C10",
                        }}
                      >
                        BEST VALUE
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Everything in Free + full archive, deeper insights
                    </p>
                  </div>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  $12
                  <span className="text-xs font-normal" style={{ color: "var(--text-secondary)" }}>
                    /mo
                  </span>
                </span>
              </button>
            </div>

            {/* Pro Features (if Pro selected) */}
            {state.plan === "pro" && (
              <div
                className="mt-4 rounded-xl p-4 space-y-2"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {[
                  "Full archive access (500+ past briefings)",
                  "Deep-dive analysis pieces weekly",
                  "Priority support & custom topic requests",
                  "Exclusive AI tool discount codes",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sample Preview */}
            <div className="mt-8">
              <SampleEmail careerId={detectedCareerId} />
            </div>

            {/* Final CTA */}
            <button
              onClick={handleSubscribe}
              disabled={subscribeStatus === "submitting" || subscribeStatus === "success"}
              className="w-full mt-8 py-4 px-8 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#0B0C10",
                opacity: subscribeStatus === "submitting" ? 0.7 : 1,
                cursor: subscribeStatus === "submitting" || subscribeStatus === "success" ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (subscribeStatus === "submitting" || subscribeStatus === "success") return;
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(242, 169, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {subscribeStatus === "submitting"
                ? "Subscribing…"
                : subscribeStatus === "success"
                ? "Check your inbox to confirm ✓"
                : "Subscribe — Start Free"}
            </button>
            {subscribeError && (
              <p className="text-xs text-center mt-3" style={{ color: "#ff6b6b" }}>
                {subscribeError}
              </p>
            )}
            <p
              className="text-xs text-center mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              No credit card required for free tier. Upgrade anytime.
            </p>

            {/* Info Cards */}
            <div className="mt-8 space-y-3">
              {[
                {
                  icon: <Mail className="w-5 h-5" style={{ color: "var(--accent)" }} />,
                  title: "Check Your Inbox",
                  desc: "A welcome email is on its way to confirm your subscription.",
                },
                {
                  icon: <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />,
                  title: "Tomorrow Morning",
                  desc: `Your first personalized AI briefing arrives at ${
                    state.deliveryTime === "morning"
                      ? "7 AM"
                      : state.deliveryTime === "midday"
                      ? "12 PM"
                      : "6 PM"
                  }.`,
                },
                {
                  icon: <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />,
                  title: "Stay Ahead",
                  desc: "Upgrade to Pro anytime for deeper insights and full archive access.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="flex items-start gap-4 rounded-xl p-4"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">{card.icon}</div>
                  <div>
                    <p
                      className="text-sm font-semibold mb-0.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {card.title}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link
                to="/"
                className="text-sm transition-colors hover:underline"
                style={{ color: "var(--text-secondary)" }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Already subscribed link */}
      <p className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Already subscribed?{" "}
        <Link
          to="/"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Sign in
        </Link>
      </p>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
