/**
 * My Daily Download — career content data layer.
 *
 * Single source of truth for the frontend, keyed by the BACKEND SLUG IDs
 * (see newsletter-backend/config.py CAREER_CATEGORIES). Every symbol the
 * pages import is exported from here.
 *
 * Content below is SAMPLE content for the marketing site — it reads as a
 * representative example of a briefing, never as fabricated real news.
 */

/* ──────────────────────────── Types ──────────────────────────── */

export interface QuickHit {
  headline: string;
  description: string;
}

/** Day-of-week hero rotation keys (see plan: Mon Setup … Weekend Read). */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "weekend";

/** A category email layout family. Drives the per-category block rendering. */
export type FormatId = "marketing" | "product" | "founder" | "default";

export interface FundingItem {
  label: string;
  amount: string;
}

/**
 * A briefing = the full shape consumed by SampleEmail / NewsletterPreview.
 * Keyed by backend slug. Carries both the slug (`careerId`) and display
 * names (`careerName` / `career`) so every consumer's field works.
 */
export interface SampleNewsletter {
  /** Backend slug id, e.g. "product-management". */
  careerId: CareerId;
  /** Display name, e.g. "Product Manager". */
  careerName: string;
  /** Alias of careerName, kept for legacy `.career` reads. */
  career: string;
  /** Which layout family this category uses. */
  format: FormatId;

  subject: string;
  greeting: string;

  /** Hero block content (day-of-week rotation chooses the label/eyebrow). */
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;

  topStory: { headline: string; summary: string; source: string };
  tool: { name: string; description: string };
  quickHits: QuickHit[];
  howTo: { title: string; content: string };
  stats: { value1: string; label1: string; value2: string; label2: string };
  upcoming: { event: string; date: string };

  /** Marketing-format extras. */
  prompt?: string;
  channelWatch?: string[];
  /** Product-format extras. */
  teardown?: { title: string; body: string };
  benchmarks?: string[];
  /** Founder-format extras. */
  funding?: FundingItem[];
  theAsk?: string;
}

/* ─────────────────── Career categories (slug-keyed) ─────────────────── */

export interface CareerCategory {
  id: string;
  name: string;
  /** lucide-react icon name (resolved via an icon map in the page). */
  icon: string;
  description: string;
}

/**
 * 15 categories — slugs match newsletter-backend/config.py exactly.
 */
export const careerCategories: CareerCategory[] = [
  { id: "product-management", name: "Product Manager", icon: "Layout", description: "AI roadmap tools, capability shifts, and teardown-driven strategy." },
  { id: "marketing", name: "Marketing", icon: "Megaphone", description: "New AI ad tools, copy-paste prompts, and platform changes that move ROAS." },
  { id: "sales", name: "Sales", icon: "TrendingUp", description: "AI prospecting, outreach playbooks, and pipeline intelligence." },
  { id: "operations", name: "Operations", icon: "Settings", description: "Workflow automation, process discovery, and ops tooling." },
  { id: "hr-people", name: "HR & People", icon: "Users", description: "Recruiting AI, people analytics, and policy automation." },
  { id: "design", name: "Design", icon: "Palette", description: "Generative design, AI prototyping, and design-system tooling." },
  { id: "finance", name: "Finance", icon: "BarChart3", description: "Forecasting AI, fintech tooling, and reconciliation automation." },
  { id: "engineering", name: "Engineering", icon: "Code", description: "AI coding tools, agentic dev workflows, and benchmark updates." },
  { id: "data-science", name: "Data Science", icon: "Database", description: "ML tooling, AI analytics, and reliable data pipelines." },
  { id: "customer-success", name: "Customer Success", icon: "HeartHandshake", description: "Support automation, AI CRM, and retention tooling." },
  { id: "content-creation", name: "Content Creation", icon: "PenTool", description: "Video AI, AI writing, and repurposing workflows." },
  { id: "consulting", name: "Consulting", icon: "Briefcase", description: "Enterprise AI, deck automation, and transformation playbooks." },
  { id: "legal", name: "Legal", icon: "Scale", description: "Contract AI, legal research, and regulatory tracking." },
  { id: "healthcare", name: "Healthcare", icon: "Stethoscope", description: "Clinical decision support, ambient documentation, and health tech." },
  { id: "entrepreneurship", name: "Entrepreneurship", icon: "Rocket", description: "Funding signals, founder tooling, and the one ask that moves the needle." },
];

/** Union of valid slug ids. */
export type CareerId = (typeof careerCategories)[number]["id"];

/* ─────────────────── Onboarding option lists ─────────────────── */

export const seniorityLevels = [
  "Junior",
  "Mid Level",
  "Senior",
  "Lead / Manager",
  "Director+",
] as const;

export type SeniorityLevel = (typeof seniorityLevels)[number];

export const interestOptions = [
  "AI Tools",
  "Automation",
  "Prompts",
  "Funding & M&A",
  "Product Strategy",
  "Growth",
  "Data & Analytics",
  "Career Growth",
] as const;

/**
 * Maps a (best-effort) LinkedIn vanity-slug keyword to a backend career slug.
 * Used only as a lightweight demo heuristic; always user-correctable.
 */
export const linkedInSlugToCareer: Record<string, CareerId> = {
  pm: "product-management",
  product: "product-management",
  productmanager: "product-management",
  marketing: "marketing",
  marketer: "marketing",
  growth: "marketing",
  sales: "sales",
  ae: "sales",
  ops: "operations",
  operations: "operations",
  hr: "hr-people",
  people: "hr-people",
  recruiter: "hr-people",
  design: "design",
  designer: "design",
  ux: "design",
  finance: "finance",
  cfo: "finance",
  eng: "engineering",
  engineer: "engineering",
  developer: "engineering",
  swe: "engineering",
  data: "data-science",
  ds: "data-science",
  ml: "data-science",
  cs: "customer-success",
  success: "customer-success",
  support: "customer-success",
  content: "content-creation",
  creator: "content-creation",
  writer: "content-creation",
  consultant: "consulting",
  consulting: "consulting",
  legal: "legal",
  lawyer: "legal",
  counsel: "legal",
  health: "healthcare",
  healthcare: "healthcare",
  clinical: "healthcare",
  founder: "entrepreneurship",
  ceo: "entrepreneurship",
  entrepreneur: "entrepreneurship",
};

/* ─────────────────── Sample / preview careers (Sample.tsx) ─────────────────── */

/** Ordered list of career slugs for the Sample-page selector + grid. */
export const careers: CareerId[] = careerCategories.map((c) => c.id);

/** Slug -> display label. */
export const careerLabels: Record<CareerId, string> = careerCategories.reduce(
  (acc, c) => {
    acc[c.id] = c.name;
    return acc;
  },
  {} as Record<CareerId, string>
);

/** Legacy alias kept for any `Career` type imports. */
export type Career = CareerId;

/* ─────────────────── Sample briefings (slug-keyed) ─────────────────── */

const DEFAULT_HERO_EYEBROW = "📡 THE SETUP";

function makeDefaultBriefing(
  id: CareerId,
  name: string,
  partial: Partial<SampleNewsletter>
): SampleNewsletter {
  return {
    careerId: id,
    careerName: name,
    career: name,
    format: "default",
    subject: `Your AI edge for ${name} — sample issue`,
    greeting: `Good morning! Here's your sample AI edge for ${name}.`,
    heroEyebrow: DEFAULT_HERO_EYEBROW,
    heroTitle: `The week ahead in AI for ${name.toLowerCase()}s`,
    heroBody:
      "A quick look at what to watch this week — the tools, releases, and shifts most likely to matter for your role.",
    topStory: {
      headline: `AI tooling keeps reshaping ${name.toLowerCase()} work`,
      summary:
        "A representative lead story: new capabilities are changing day-to-day workflows, with early adopters reporting meaningful time savings.",
      source: "Sample Source",
    },
    tool: {
      name: "Sample Tool",
      description:
        "A spotlighted AI tool matched to your role, with a one-line use case and a quick-start nudge.",
    },
    quickHits: [
      { headline: "A notable launch this week", description: "Short, scannable context on why it matters for your role." },
      { headline: "A funding or platform move", description: "What changed and the one takeaway for your work." },
      { headline: "A trend worth tracking", description: "An early signal you can act on before it's mainstream." },
    ],
    howTo: {
      title: `Automate a ${name.toLowerCase()} task in 10 minutes`,
      content:
        "Pick one repetitive task, describe it in a prompt, test it with your AI tool of choice, refine, and wire it into your workflow.",
    },
    stats: {
      value1: "—",
      label1: "Sample metric for your role",
      value2: "—",
      label2: "Second sample metric",
    },
    upcoming: { event: "A relevant AI event", date: "Sample date" },
    ...partial,
  };
}

/**
 * The briefing archive, keyed by backend slug. The three launch categories
 * (marketing / product-management / entrepreneurship) carry rich,
 * format-specific sample content matching the plan-review mockups; the other
 * 12 inherit the default layout with role-tuned sample copy.
 */
export const sampleNewsletters: Record<CareerId, SampleNewsletter> = {
  /* ───── MARKETING (Tool-hero + Prompt + ChannelWatch + Numbers) ───── */
  marketing: {
    careerId: "marketing",
    careerName: "Marketing",
    career: "Marketing",
    format: "marketing",
    subject: "Your AI edge for Marketing — sample issue",
    greeting: "Good morning! Here's your sample AI edge for Marketing.",
    heroEyebrow: "🔥 TOOL TUESDAY",
    heroTitle: "Generate 50 on-brand ad variants from one product URL",
    heroBody:
      "Paste a product page and an example tool spins up dozens of creative variants, then auto-kills the losers by ROAS. (Sample spotlight.)",
    topStory: {
      headline: "A major ad platform opens its AI creative API to all advertisers",
      summary:
        "What it means for your campaigns: you could A/B hundreds of AI-generated creatives without manual upload. (Representative sample story.)",
      source: "Sample Source",
    },
    tool: {
      name: "AI Creative Studio (sample)",
      description:
        "End-to-end AI campaign tooling — plan, write, and launch multi-channel creative from one dashboard, with brand-voice training.",
    },
    quickHits: [
      { headline: "Search platform adds asset-level reporting", description: "Finally see which AI assets actually drive conversions." },
      { headline: "Short-video platform opens AI avatar ads", description: "Spin up spokesperson creative without a shoot." },
      { headline: "Social platform sunsets manual placements", description: "Plan for automated, AI-optimized delivery." },
    ],
    howTo: {
      title: "Turn one blog post into 30 social posts",
      content:
        "Paste your article into your AI writer, extract 5 takeaways, and rewrite each across 6 formats — thread, caption, teaser, carousel, short script, LinkedIn post. Schedule the batch.",
    },
    stats: {
      value1: "+32%",
      label1: "sample ROAS lift with AI creative",
      value2: "2.4×",
      label2: "faster creative cycle (sample)",
    },
    upcoming: { event: "AI Marketing World (sample)", date: "Spring" },
    prompt:
      "Write 5 hook variations for a {product} short-video ad targeting {ICP} — each under 12 words, pattern-interrupt first line.",
    channelWatch: [
      "Search PMax adds asset-level reporting",
      "Short-video platform opens AI avatar ads",
      "Social platform sunsets manual placements",
    ],
  },

  /* ───── PRODUCT (Playbook-hero + Teardown + Benchmark) ───── */
  "product-management": {
    careerId: "product-management",
    careerName: "Product Manager",
    career: "Product Manager",
    format: "product",
    subject: "Your AI edge for Product — sample issue",
    greeting: "Good morning! Here's your sample AI edge for Product Managers.",
    heroEyebrow: "📐 PLAYBOOK WEDNESDAY",
    heroTitle: "Turn 40 support tickets into a ranked PRD in 15 minutes",
    heroBody:
      "1) Export tickets  2) Cluster by theme with a prompt  3) Auto-draft problem statements + RICE scores. (Sample playbook.)",
    topStory: {
      headline: "Structured outputs ship for agent tools",
      summary:
        "What it means for your roadmap: reliable JSON unblocks the agent features you shelved. (Representative sample story.)",
      source: "Sample Source",
    },
    tool: {
      name: "Docs Q&A (sample)",
      description:
        "Query your PRDs, research, and meeting notes in natural language and get answers with source links.",
    },
    quickHits: [
      { headline: "Analytics tool adds churn prediction", description: "Spot at-risk cohorts two weeks earlier." },
      { headline: "Issue tracker auto-drafts release notes", description: "Generate notes from merged PRs in seconds." },
      { headline: "Research tool adds AI synthesis", description: "Cluster interview themes automatically." },
    ],
    howTo: {
      title: "Write a PRD in 10 minutes with AI",
      content:
        "Start with a one-sentence idea, expand it into a full PRD with user stories, acceptance criteria, and edge cases, then layer in your product context and iterate.",
    },
    stats: {
      value1: "2.4×",
      label1: "faster spec writing (sample)",
      value2: "—",
      label2: "sample benchmark metric",
    },
    upcoming: { event: "Product-Led AI Summit (sample)", date: "Spring" },
    teardown: {
      title: "How a team shipped AI issue triage",
      body: "Routed 60% of inbound to the right team on day one — here's the architecture. (Sample teardown.)",
    },
    benchmarks: [
      "Frontier model: 2M-token context now GA",
      "New leader on a key coding benchmark",
      "Cheaper embeddings cut RAG cost ~40%",
    ],
  },

  /* ───── FOUNDER / ENTREPRENEURSHIP (Funding-hero + Tool Stack + The Ask) ───── */
  entrepreneurship: {
    careerId: "entrepreneurship",
    careerName: "Entrepreneurship",
    career: "Founder",
    format: "founder",
    subject: "Your AI edge for Founders — sample issue",
    greeting: "Good morning! Here's your sample AI edge for Founders.",
    heroEyebrow: "📈 FUNDING SIGNAL",
    heroTitle: "This week's notable AI raises",
    heroBody:
      "A snapshot of where capital is flowing in AI — by stage and category. (Sample funding board.)",
    topStory: {
      headline: "A top accelerator's latest batch is majority AI-native",
      summary:
        "What it means for your raise: investors increasingly expect an AI-native wedge plus a data moat. (Representative sample story.)",
      source: "Sample Source",
    },
    tool: {
      name: "AI Co-Founder Stack (sample)",
      description:
        "Draft investor updates, model projections, and analyze competitor moves — your leverage in one workspace.",
    },
    quickHits: [
      { headline: "Incorporation tool adds AI setup assistant", description: "Pick entity, state, and cap table via chat." },
      { headline: "Banking tool forecasts runway", description: "Project burn 90 days out with scenario modeling." },
      { headline: "Investor-matching tool launches", description: "Match to angels by thesis and portfolio fit." },
    ],
    howTo: {
      title: "Write an investor update that gets replies",
      content:
        "Feed your metrics, changelog, and team updates to an AI writer and ask for: 3 wins, 1 challenge + fix, and 1 specific ask for the network.",
    },
    stats: {
      value1: "—",
      label1: "sample share of AI-native deals",
      value2: "—",
      label2: "sample capital into AI startups",
    },
    upcoming: { event: "Founder + AI Summit (sample)", date: "Spring" },
    funding: [
      { label: "Vertical AI for ops", amount: "$22M A" },
      { label: "AI voice agents", amount: "$40M B" },
      { label: "Dev-tools copilot", amount: "$8M seed" },
      { label: "Legal AI", amount: "$300M D" },
    ],
    theAsk:
      "Turn my metrics into a tight investor update: 3 wins, 1 challenge + fix, 1 specific ask. Paste dashboard below.",
  },

  /* ───── The remaining 12 inherit the default format ───── */
  sales: makeDefaultBriefing("sales", "Sales", {
    heroTitle: "The week ahead in AI for sales teams",
    tool: { name: "AI Outreach (sample)", description: "Enrich prospects and personalize every email with relevant triggers, synced to your CRM." },
    howTo: {
      title: "Personalize 50 cold emails in under 5 minutes",
      content: "Enrich your prospect list with recent news and triggers, then use an AI writer with a templated opener and export to your sequencer.",
    },
    upcoming: { event: "Revenue AI Summit (sample)", date: "Spring" },
  }),
  operations: makeDefaultBriefing("operations", "Operations", {
    tool: { name: "Workflow Automation (sample)", description: "Describe a process in plain language and have the automation built for you." },
    howTo: {
      title: "Automate your weekly reporting in 15 minutes",
      content: "For each report, wire a workflow that pulls data, formats it into an executive summary with AI, and emails stakeholders on a schedule.",
    },
    upcoming: { event: "Operations AI Forum (sample)", date: "Spring" },
  }),
  "hr-people": makeDefaultBriefing("hr-people", "HR & People", {
    tool: { name: "AI HR Assistant (sample)", description: "Handle employee queries, automate onboarding, and draft policy docs." },
    howTo: {
      title: "Screen 100 resumes in 10 minutes",
      content: "Define your must-have criteria, let an AI screen rank candidates with evidence, then review the top 20 and schedule interviews.",
    },
    upcoming: { event: "HR Tech AI Summit (sample)", date: "Spring" },
  }),
  design: makeDefaultBriefing("design", "Design", {
    tool: { name: "Generative Design (sample)", description: "Generate mockups and brand illustrations from prompts with strong consistency." },
    howTo: {
      title: "Build a mood board in 5 minutes",
      content: "Write a detailed aesthetic prompt, generate a dozen variations, and drag your favorites into a board with extracted color swatches.",
    },
    upcoming: { event: "Design + AI Conference (sample)", date: "Spring" },
  }),
  finance: makeDefaultBriefing("finance", "Finance", {
    tool: { name: "Finance Copilot (sample)", description: "Ask complex questions about portfolio risk, sector trends, and macro indicators." },
    howTo: {
      title: "Build a dynamic financial model with AI",
      content: "Describe your business model and ask for a multi-year model with formulas and sensitivity tables, then customize the assumptions.",
    },
    upcoming: { event: "AI in Finance Summit (sample)", date: "Spring" },
  }),
  engineering: makeDefaultBriefing("engineering", "Engineering", {
    tool: { name: "AI Code Editor (sample)", description: "Edit files in natural language, auto-debug stack traces, and chat with your codebase." },
    howTo: {
      title: "Debug production issues faster with AI",
      content: "Paste the stack trace and ask the assistant to find the root cause in your codebase and propose a patch, then review, test, and deploy.",
    },
    upcoming: { event: "AI for Engineers Summit (sample)", date: "Spring" },
  }),
  "data-science": makeDefaultBriefing("data-science", "Data Science", {
    tool: { name: "AI Data Notebook (sample)", description: "Explore data with natural-language queries and auto-generate visualizations." },
    howTo: {
      title: "Build an auto-documenting ETL pipeline",
      content: "Wrap transformation code with AI-generated docstrings explaining inputs, outputs, and business logic across your repo.",
    },
    upcoming: { event: "MLOps & AI Data Conference (sample)", date: "Spring" },
  }),
  "customer-success": makeDefaultBriefing("customer-success", "Customer Success", {
    tool: { name: "AI Support Copilot (sample)", description: "Draft replies, summarize accounts, and surface churn risk from product signals." },
    howTo: {
      title: "Turn tickets into a weekly health summary",
      content: "Aggregate ticket themes with AI into an account-health digest, flag at-risk accounts, and route them to the right CSM.",
    },
    upcoming: { event: "Customer Success AI Forum (sample)", date: "Spring" },
  }),
  "content-creation": makeDefaultBriefing("content-creation", "Content Creation", {
    tool: { name: "AI Video Studio (sample)", description: "Turn scripts into short videos and repurpose long content into clips." },
    howTo: {
      title: "Repurpose one video into a week of content",
      content: "Transcribe, extract highlight moments with AI, and auto-cut clips with captions for each platform's native format.",
    },
    upcoming: { event: "Creator AI Summit (sample)", date: "Spring" },
  }),
  consulting: makeDefaultBriefing("consulting", "Consulting", {
    tool: { name: "AI Productivity Suite (sample)", description: "Draft client decks, analyze data in spreadsheets, and summarize long documents." },
    howTo: {
      title: "Build a client-ready deck in 30 minutes",
      content: "Prompt for a structured strategy outline, populate it with your firm's methodology, and add client-specific data points.",
    },
    upcoming: { event: "Consulting AI Transformation Summit (sample)", date: "Spring" },
  }),
  legal: makeDefaultBriefing("legal", "Legal", {
    tool: { name: "AI Legal Assistant (sample)", description: "Run document review, legal research, and contract analysis in natural language." },
    howTo: {
      title: "Review a long contract in 15 minutes",
      content: "Upload the contract with a clause checklist, compare against your playbook, and dive into the AI-flagged deviations.",
    },
    upcoming: { event: "Legal AI Innovation Forum (sample)", date: "Spring" },
  }),
  healthcare: makeDefaultBriefing("healthcare", "Healthcare", {
    tool: { name: "Clinical Decision Support (sample)", description: "Generate a ranked differential and evidence-based options with source citations." },
    howTo: {
      title: "Draft a clinical note in 2 minutes",
      content: "Use an ambient documentation tool during the encounter to draft a structured note, then review for accuracy and sign.",
    },
    upcoming: { event: "AI in Healthcare Summit (sample)", date: "Spring" },
  }),
};

/**
 * Alias kept for Onboarding.tsx, which imports `careerNewsletters`.
 * Same slug-keyed map as `sampleNewsletters`.
 */
export const careerNewsletters: Record<CareerId, SampleNewsletter> = sampleNewsletters;

/* ─────────────────── Category formats config (block layouts) ─────────────────── */

/** Day-of-week rotation labels (overlays the format's hero). */
export const DAY_ROTATION: Record<DayKey, { eyebrow: string; theme: string }> = {
  mon: { eyebrow: "📡 THE SETUP", theme: "The Setup" },
  tue: { eyebrow: "🔥 TOOL TUESDAY", theme: "Tool Tuesday" },
  wed: { eyebrow: "📐 PLAYBOOK WEDNESDAY", theme: "Playbook Wednesday" },
  thu: { eyebrow: "📊 SIGNAL THURSDAY", theme: "Signal Thursday" },
  fri: { eyebrow: "🗞️ THE ROUNDUP", theme: "The Roundup" },
  weekend: { eyebrow: "📖 WEEKEND READ", theme: "Weekend Read" },
};

/** Ordered DayKeys, indexable by JS Date.getDay() (0 = Sun). */
export const DAY_KEYS_BY_INDEX: DayKey[] = [
  "weekend", // Sun
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "weekend", // Sat
];

export function dayKeyForDate(d: Date = new Date()): DayKey {
  return DAY_KEYS_BY_INDEX[d.getDay()];
}

/**
 * CATEGORY_FORMATS — per-format block order + the day-of-week hero each
 * format promotes. Data-driven so layouts can be tuned without code changes.
 * Blocks reference the data fields rendered by NewsletterPreview.
 */
export interface CategoryFormat {
  /** Hero block kind for this format. */
  hero: "tool" | "playbook" | "funding";
  /** Ordered list of blocks rendered below the hero. */
  blocks: string[];
  /** The day-of-week theme this format leans into for its hero. */
  signatureDay: DayKey;
}

export const CATEGORY_FORMATS: Record<FormatId, CategoryFormat> = {
  marketing: {
    hero: "tool",
    blocks: ["bigStory", "prompt", "channelWatch", "byTheNumbers"],
    signatureDay: "tue",
  },
  product: {
    hero: "playbook",
    blocks: ["bigStory", "teardown", "benchmarkBoard"],
    signatureDay: "wed",
  },
  founder: {
    hero: "funding",
    blocks: ["bigStory", "toolStack", "theAsk"],
    signatureDay: "thu",
  },
  default: {
    hero: "tool",
    blocks: ["bigStory", "toolDrop", "quickHits", "playbook", "byTheNumbers", "eventRadar"],
    signatureDay: "mon",
  },
};

/** Resolve the format config for a given briefing. */
export function formatFor(n: SampleNewsletter): CategoryFormat {
  return CATEGORY_FORMATS[n.format] ?? CATEGORY_FORMATS.default;
}
