"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  Newspaper,
} from "lucide-react";
import {
  careerCategories,
  careerLabels,
  careers,
  type Career,
  type CareerId,
} from "../lib/careerContent";

export interface BriefingGuideItem {
  headline: string;
  summary?: string;
  description?: string;
  source: string;
  url: string;
  published?: string;
}

export interface BriefingGuide {
  careerId: CareerId;
  careerName: string;
  date: string | null;
  dowTheme: string | null;
  dowBlurb: string | null;
  topStory: BriefingGuideItem;
  quickHits: BriefingGuideItem[];
  sources: { name: string; url: string }[];
}

interface SampleGuideClientProps {
  initialCareer: CareerId;
  guides: Partial<Record<CareerId, BriefingGuide>>;
}

const featureCards = [
  {
    icon: Newspaper,
    title: "1 sourced lead",
    description:
      "The most relevant AI move for the selected profession, linked to the original source.",
  },
  {
    icon: CheckCircle2,
    title: "Action steps",
    description:
      "A short checklist for turning the news into a practical workflow decision.",
  },
  {
    icon: Mail,
    title: "Quick hits",
    description:
      "Additional source-cited launches, research, and market signals worth scanning.",
  },
];

const guideLens: Record<
  CareerId,
  { audience: string; focus: string; actionTitle: string; actions: string[] }
> = {
  "product-management": {
    audience: "product managers",
    focus:
      "Use the item to decide whether an AI capability belongs in discovery, roadmap planning, or a customer-facing workflow.",
    actionTitle: "Product pass",
    actions: [
      "Add the source to your next roadmap review and note the user problem it could affect.",
      "Check whether the capability changes build, buy, or partner assumptions.",
      "Draft one acceptance criterion for a small experiment before assigning engineering time.",
    ],
  },
  marketing: {
    audience: "marketers",
    focus:
      "Read it through the lens of channel mix, creative production, measurement, and brand governance.",
    actionTitle: "Campaign pass",
    actions: [
      "Identify which live campaign or lifecycle moment the update could improve.",
      "Write one testable hypothesis tied to CAC, conversion rate, retention, or production speed.",
      "Save the source with the campaign notes so the team can verify the claim before rollout.",
    ],
  },
  sales: {
    audience: "sales teams",
    focus:
      "Treat the update as a signal for prospect research, account prioritization, rep enablement, or pipeline inspection.",
    actionTitle: "Pipeline pass",
    actions: [
      "Pick one active segment and decide whether the update changes your outreach angle.",
      "Turn the source into one discovery question and one objection-handling note.",
      "Test the workflow on five accounts before adding it to a sequence or CRM field.",
    ],
  },
  operations: {
    audience: "operations teams",
    focus:
      "Evaluate whether the update can remove manual handoffs, improve reporting, or tighten process controls.",
    actionTitle: "Workflow pass",
    actions: [
      "Map the update to one recurring process with clear inputs and outputs.",
      "Mark the approval, data access, and audit requirements before automating anything.",
      "Run a small shadow workflow and compare cycle time, error rate, and escalation volume.",
    ],
  },
  "hr-people": {
    audience: "people teams",
    focus:
      "Review it for hiring, onboarding, internal support, policy, security, and employee trust implications.",
    actionTitle: "People ops pass",
    actions: [
      "Decide whether this belongs in recruiting, employee support, learning, or policy review.",
      "Check bias, privacy, and manager-approval requirements before piloting.",
      "Turn the source into one plain-language note employees can understand.",
    ],
  },
  design: {
    audience: "designers",
    focus:
      "Use the update to sharpen prototyping, design-system maintenance, research synthesis, or creative production.",
    actionTitle: "Design pass",
    actions: [
      "Identify whether the update helps exploration, production, critique, or handoff.",
      "Test it against one existing brand or component constraint instead of a blank prompt.",
      "Document what changed in quality, speed, or consistency before adopting the workflow.",
    ],
  },
  finance: {
    audience: "finance teams",
    focus:
      "Read for forecasting, accounting operations, controls, spend visibility, risk, and decision support.",
    actionTitle: "Controls pass",
    actions: [
      "Map the update to a finance workflow with owner, data source, and review cadence.",
      "Check whether the output needs audit evidence, approval routing, or reconciliation.",
      "Run it beside the current process once before changing a reporting or close workflow.",
    ],
  },
  engineering: {
    audience: "engineers",
    focus:
      "Judge the update by developer workflow, system reliability, security, evaluation quality, and maintainability.",
    actionTitle: "Engineering pass",
    actions: [
      "Tie the update to one bottleneck in coding, testing, review, deployment, or incident response.",
      "Define the failure mode and verification step before using it in production work.",
      "Capture one concrete metric: cycle time, escaped defects, review load, or build stability.",
    ],
  },
  "data-science": {
    audience: "data scientists",
    focus:
      "Assess the signal for model evaluation, data pipelines, feature quality, governance, and decision intelligence.",
    actionTitle: "Model ops pass",
    actions: [
      "Decide whether the update affects data prep, modeling, evaluation, deployment, or monitoring.",
      "Write down the dataset, baseline, and metric needed to test it honestly.",
      "Save the source with experiment notes so conclusions stay tied to evidence.",
    ],
  },
  "customer-success": {
    audience: "customer success teams",
    focus:
      "Translate the update into support quality, account health, churn risk, onboarding, or expansion motions.",
    actionTitle: "Account pass",
    actions: [
      "Pick one customer segment where the update could improve response quality or time to value.",
      "Turn the source into a CSM enablement note with one approved use and one clear limit.",
      "Measure impact with resolution time, escalation rate, activation, or renewal-risk movement.",
    ],
  },
  "content-creation": {
    audience: "content creators",
    focus:
      "Review it for ideation, scripting, editing, repurposing, distribution, and rights management.",
    actionTitle: "Production pass",
    actions: [
      "Choose one content format where the update can improve quality or production speed.",
      "Create a before-and-after draft while keeping human review on voice and accuracy.",
      "Track the source beside the asset so claims and tool references stay verifiable.",
    ],
  },
  consulting: {
    audience: "consultants",
    focus:
      "Frame the update as a client advisory signal: operating model, transformation roadmap, procurement, or risk.",
    actionTitle: "Client pass",
    actions: [
      "Translate the source into one client implication and one question for discovery.",
      "Decide whether it belongs in strategy, process redesign, technology selection, or change management.",
      "Add a proof point and a caveat before it goes into a deck.",
    ],
  },
  legal: {
    audience: "legal teams",
    focus:
      "Read it for contract workflows, legal research, privilege, governance, regulatory exposure, and review quality.",
    actionTitle: "Legal ops pass",
    actions: [
      "Classify the update by matter intake, research, review, drafting, compliance, or knowledge management.",
      "Check confidentiality, jurisdiction, and human-review requirements before using it on client work.",
      "Capture the source in the matter or playbook note for later verification.",
    ],
  },
  healthcare: {
    audience: "healthcare professionals",
    focus:
      "Treat the update as operational or clinical-adjacent until validated by the right governance and evidence review.",
    actionTitle: "Clinical ops pass",
    actions: [
      "Separate administrative value from clinical decision support before acting on the update.",
      "Check evidence, privacy, safety, and review requirements with the responsible owner.",
      "Pilot on a low-risk workflow and measure time saved, accuracy, and escalation needs.",
    ],
  },
  entrepreneurship: {
    audience: "founders",
    focus:
      "Use the signal to refine product wedge, distribution, operating leverage, fundraising narrative, or market timing.",
    actionTitle: "Founder pass",
    actions: [
      "Write the one sentence implication for your product, market, or go-to-market motion.",
      "Decide whether the update changes what you build, what you sell, or what you stop doing.",
      "Turn it into one customer question or investor-update note this week.",
    ],
  },
};

function formatDate(date: string | null): string {
  if (!date) return "Today";
  try {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return date;
  }
}

function itemBody(item: BriefingGuideItem): string {
  return item.summary || item.description || "";
}

function GuidePreview({
  guide,
  careerId,
}: {
  guide?: BriefingGuide;
  careerId: CareerId;
}) {
  const lens = guideLens[careerId];
  const label = careerLabels[careerId];

  if (!guide) {
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B07A00]">
          Guide refresh pending
        </div>
        <h2 className="mt-3 text-xl font-bold text-[#1A1D23]">
          The {label} guide is being prepared.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#666]">
          The source-cited guide for this profession has not reached the archive yet.
          Choose another profession or check back after the next briefing run.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-4 bg-[#0B0C10] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F2A900]">
            <span className="text-[11px] font-extrabold text-[#0B0C10]">D</span>
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#E6E8EE]">
            My Daily Download
          </span>
        </div>
        <span className="text-right text-[11px] text-[#8A91A0]">
          {guide.careerName} · {guide.dowTheme ?? "Daily Guide"} ·{" "}
          {formatDate(guide.date)}
        </span>
      </div>

      <div className="p-6 text-[#1A1D23]">
        <div className="mb-5 rounded-xl border-l-[3px] border-[#F2A900] bg-[#FFF8E7] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B07A00]">
            Today&apos;s guide for {lens.audience}
          </div>
          <h2 className="text-[16px] font-bold leading-snug text-[#1A1D23]">
            {guide.topStory.headline}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#555]">
            {lens.focus}
          </p>
          {guide.dowBlurb && (
            <p className="mt-2 text-[12px] leading-relaxed text-[#666]">
              {guide.dowBlurb}
            </p>
          )}
        </div>

        <SectionLabel>The Big Story</SectionLabel>
        <h3 className="text-[15px] font-semibold leading-snug text-[#1A1D23]">
          {guide.topStory.headline}
        </h3>
        {itemBody(guide.topStory) && (
          <p className="mt-1 text-[13px] leading-relaxed text-[#555]">
            {itemBody(guide.topStory)}
          </p>
        )}
        <SourceLink item={guide.topStory} />

        <div className="mt-6 rounded-lg bg-[#F8F9FA] p-4">
          <SectionLabel>{lens.actionTitle}</SectionLabel>
          <ul className="space-y-2">
            {lens.actions.map((action) => (
              <li key={action} className="flex gap-2 text-[13px] leading-relaxed text-[#444]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#B07A00]" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {guide.quickHits.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Quick Hits</SectionLabel>
            <ul className="space-y-4">
              {guide.quickHits.map((hit) => (
                <li key={hit.url} className="border-l-2 border-[#ECEEF3] pl-4">
                  <h4 className="text-[13px] font-semibold leading-snug text-[#1A1D23]">
                    {hit.headline}
                  </h4>
                  {itemBody(hit) && (
                    <p className="mt-1 text-[12px] leading-relaxed text-[#666]">
                      {itemBody(hit)}
                    </p>
                  )}
                  <SourceLink item={hit} compact />
                </li>
              ))}
            </ul>
          </div>
        )}

        {guide.sources.length > 0 && (
          <div className="mt-6 border-t border-[#ECEEF3] pt-4">
            <SectionLabel>Sources</SectionLabel>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {guide.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7A8194] hover:text-[#B07A00]"
                >
                  {source.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-[#0B0C10] px-4 py-3 text-center">
          <Link
            href={`/onboarding?career=${careerId}`}
            className="text-[13px] font-semibold text-[#F2A900] hover:underline"
          >
            Get the {guide.careerName} briefing daily →
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B07A00]">
      {children}
    </div>
  );
}

function SourceLink({
  item,
  compact = false,
}: {
  item: BriefingGuideItem;
  compact?: boolean;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-medium text-[#B07A00] hover:underline ${
        compact ? "mt-1 text-[12px]" : "mt-2 text-[13px]"
      }`}
    >
      Source: {item.source}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default function SampleGuideClient({
  initialCareer,
  guides,
}: SampleGuideClientProps) {
  const [selectedCareer, setSelectedCareer] = useState<Career>(initialCareer);

  const handleCareerChange = useCallback((career: Career) => {
    setSelectedCareer(career);
    const params = new URLSearchParams(window.location.search);
    params.set("career", career);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, []);

  const selectedGuide = guides[selectedCareer];
  const selectedCategory = careerCategories.find((career) => career.id === selectedCareer);

  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(11,12,16,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-bold text-[#E6E8EE] transition-colors hover:text-[#F2A900]"
          >
            <span className="h-2 w-2 rounded-full bg-[#F2A900]" aria-hidden />
            My Daily Download
          </Link>
          <Link
            href={`/onboarding?career=${selectedCareer}`}
            className="rounded-lg bg-[#F2A900] px-5 py-2 text-sm font-semibold text-[#0B0C10] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D49500]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center px-6 pb-20 pt-40 text-center">
        <div className="max-w-[740px]">
          <Link
            href="/"
            className="mx-auto mb-8 flex w-fit items-center gap-1 text-sm text-[#8A91A0] transition-colors hover:text-[#E6E8EE]"
          >
            ← Back to Home
          </Link>

          <div className="section-label mb-4">Profession Guide</div>

          <h1 className="text-[clamp(40px,8vw,80px)] font-bold leading-[1.05] tracking-[-0.02em] text-[#E6E8EE]">
            Your Morning Edge
          </h1>

          <p className="mx-auto mt-6 max-w-[590px] text-lg leading-relaxed text-[#8A91A0]">
            A real, source-cited guide for {selectedCategory?.name ?? "your role"}.
            Switch professions to see the briefing and action steps built for each
            field.
          </p>

          <div className="mt-12">
            <label
              htmlFor="career-select"
              className="mb-3 block text-sm font-medium text-[#8A91A0]"
            >
              Choose a profession:
            </label>
            <select
              id="career-select"
              value={selectedCareer}
              onChange={(e) => handleCareerChange(e.target.value as Career)}
              className="min-w-[280px] cursor-pointer appearance-none rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#1A1D23] px-4 py-3 text-sm text-[#E6E8EE] transition-colors focus:border-[#F2A900] focus:outline-none"
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

      <section className="px-6 pb-[120px]">
        <GuidePreview guide={selectedGuide} careerId={selectedCareer} />
      </section>

      <section className="px-6 py-[80px] text-center">
        <div className="mx-auto max-w-[560px]">
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-[#E6E8EE]">
            Get this in your inbox every morning
          </h2>
          <p className="mt-4 text-base text-[#8A91A0]">
            Free. Personalized. 2-minute read.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/onboarding?career=${selectedCareer}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F2A900] px-8 py-3.5 font-semibold text-[#0B0C10] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D49500]"
            >
              Subscribe Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/onboarding?career=${selectedCareer}&plan=pro`}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-transparent px-8 py-3.5 font-semibold text-[#E6E8EE] transition-all duration-200 hover:border-[#F2A900] hover:text-[#F2A900]"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#1A1D23] px-6 py-[120px]">
        <div className="mx-auto max-w-[1200px] text-center">
          <div className="section-label mb-4">Your Daily Briefing</div>
          <h2 className="mb-16 text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE]">
            Every Morning, You&apos;ll Receive
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0C10] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(242,169,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(242,169,0,0.1)]">
                  <card.icon className="h-6 w-6 text-[#F2A900]" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#E6E8EE]">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#8A91A0]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-[120px]">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="mb-4 text-[clamp(28px,4vw,40px)] font-semibold text-[#E6E8EE]">
            Built for Every Profession
          </h2>
          <p className="mx-auto mb-12 max-w-[560px] text-base text-[#8A91A0]">
            Click any profession to see how My Daily Download adapts the daily AI
            guide to the work that person actually does.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {careers.map((career) => (
              <button
                key={career}
                onClick={() => handleCareerChange(career)}
                className={`rounded-xl border px-4 py-4 text-sm font-medium transition-all duration-200 ${
                  selectedCareer === career
                    ? "border-[#F2A900] bg-[#F2A900] text-[#0B0C10]"
                    : "border-[rgba(255,255,255,0.08)] bg-[#1A1D23] text-[#E6E8EE] hover:-translate-y-1 hover:border-[rgba(242,169,0,0.3)]"
                }`}
              >
                {careerLabels[career]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-[120px] text-center">
        <div className="mx-auto max-w-[560px]">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-[#E6E8EE]">
            This Could Be Your Inbox Tomorrow.
          </h2>
          <p className="mt-4 text-base text-[#8A91A0]">
            Free, personalized, and ready in 60 seconds.
          </p>
          <div className="mt-8">
            <Link
              href={`/onboarding?career=${selectedCareer}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F2A900] px-10 py-4 text-base font-semibold text-[#0B0C10] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D49500]"
            >
              Get My Daily Edge
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-[#8A91A0] transition-colors hover:text-[#E6E8EE]"
          >
            ← Back to Home
          </Link>
        </div>
      </section>

      <footer className="border-t border-[rgba(255,255,255,0.06)] px-6 py-8 text-center">
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
