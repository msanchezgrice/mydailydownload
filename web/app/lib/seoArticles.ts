import { careerCategories, type CareerId } from "./careerContent";

export interface SeoArticleSection {
  heading: string;
  body: string[];
}

export interface SeoArticle {
  slug: string;
  title: string;
  description: string;
  careerId: CareerId;
  audience: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  tags: string[];
  intro: string;
  sections: SeoArticleSection[];
  takeaways: string[];
  relatedSlugs: string[];
}

const PUBLISHED_AT = "2026-06-06";

export const seoArticles: SeoArticle[] = [
  {
    slug: "best-ai-tools-for-marketers-2026",
    title: "Best AI tools for marketers in 2026",
    description:
      "A practical framework for choosing AI marketing tools by workflow, not hype: research, creative, lifecycle, analytics, and repurposing.",
    careerId: "marketing",
    audience: "Marketers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "7 min read",
    tags: ["Marketing", "AI tools", "Workflow"],
    intro:
      "The best AI marketing stack is not the longest list of apps. It is the smallest set of tools that helps a marketer research faster, produce cleaner creative, learn from performance, and reuse winning ideas without losing brand voice.",
    sections: [
      {
        heading: "Start with the job, not the tool category",
        body: [
          "Most teams shop by logo and end up with overlapping tools. A better starting point is the weekly marketing workflow: audience research, message testing, creative production, channel adaptation, reporting, and next-action planning.",
          "For each workflow, define the decision the tool should improve. If a tool cannot help you decide which audience, message, channel, or experiment deserves focus, it is probably a nice demo rather than a core marketing system.",
        ],
      },
      {
        heading: "Use a five-part evaluation map",
        body: [
          "A useful AI marketing stack usually covers five functions: research synthesis, copy and creative drafting, asset variation, campaign QA, and performance explanation. The exact vendor matters less than whether the team can move from brief to testable asset with fewer handoffs.",
          "Rate every candidate on source handling, brand controls, review workflow, export format, and analytics fit. If the output cannot be checked or routed into the channels you already use, the tool will create more operational work than it removes.",
        ],
      },
      {
        heading: "Keep humans in the high-risk steps",
        body: [
          "AI can speed up message angles, hooks, and variants, but campaign claims still need human review. Do not let a tool invent customer stats, performance benchmarks, awards, or competitive claims.",
          "The clean handoff is simple: AI drafts options, a marketer picks the strongest angle, and the final proof step checks audience fit, legal risk, channel rules, and measurement tags before launch.",
        ],
      },
      {
        heading: "Turn daily inputs into a weekly learning loop",
        body: [
          "The strongest marketers use AI to tighten the loop between what changed in the market and what gets tested in the next campaign. A daily role-specific briefing can feed fresh hooks, objections, platform changes, and customer education themes.",
          "Archive the prompts, winning variants, and lessons in one place. Over time, your AI stack becomes less about producing more copy and more about building a reusable marketing memory.",
        ],
      },
    ],
    takeaways: [
      "Choose tools by workflow coverage, not by the longest feature list.",
      "Reject outputs that cannot be verified, reviewed, or exported cleanly.",
      "Use AI for speed, but keep humans responsible for claims and final campaign judgment.",
    ],
    relatedSlugs: [
      "turn-one-ai-briefing-into-30-marketing-posts",
      "ai-prompts-for-marketing-campaigns",
      "ai-newsletter-for-marketers",
    ],
  },
  {
    slug: "best-ai-tools-for-product-managers-2026",
    title: "Best AI tools for product managers in 2026",
    description:
      "How product managers should evaluate AI tools for discovery, synthesis, prioritization, PRDs, and roadmap communication.",
    careerId: "product-management",
    audience: "Product managers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "7 min read",
    tags: ["Product", "AI tools", "Roadmap"],
    intro:
      "Product managers do not need AI tools that merely write longer documents. They need tools that compress discovery, sharpen tradeoffs, and make roadmap decisions easier to explain.",
    sections: [
      {
        heading: "Separate synthesis from decision-making",
        body: [
          "AI is useful for summarizing interviews, tickets, win-loss notes, and usage patterns. It is not a substitute for deciding which customer pain is strategic enough to solve now.",
          "The best setup keeps evidence and decisions distinct. Let AI cluster themes and quote supporting inputs, then have the PM write the actual problem statement, constraints, and decision rationale.",
        ],
      },
      {
        heading: "Evaluate tools by the artifacts they improve",
        body: [
          "A practical product AI stack should improve a few artifacts: research briefs, opportunity maps, PRDs, release notes, stakeholder updates, and experiment reviews.",
          "If a tool only produces generic requirements, it will not help much. Look for workflow support that preserves source context, shows assumptions, and makes it easy to turn raw inputs into a decision-ready draft.",
        ],
      },
      {
        heading: "Protect customer context",
        body: [
          "Product data often contains customer names, revenue signals, support details, and sensitive account context. Keep private data out of broad analytics and ad systems, and avoid pasting confidential material into tools that are not approved for it.",
          "A safer pattern is to summarize or anonymize inputs before using AI, then keep detailed evidence inside systems that already have the right access controls.",
        ],
      },
      {
        heading: "Use AI to improve communication cadence",
        body: [
          "Roadmap alignment is usually a communication problem, not a document-length problem. AI can help turn one decision into versions for executives, sales, engineering, customer success, and customers.",
          "The PM still owns the narrative: what changed, why it matters, what is not changing, and what the team will learn next.",
        ],
      },
    ],
    takeaways: [
      "Use AI to synthesize evidence, not to outsource product judgment.",
      "Measure tools by better PRDs, clearer updates, and faster discovery cycles.",
      "Keep sensitive product and customer context in approved systems.",
    ],
    relatedSlugs: [
      "turn-support-tickets-into-ranked-prd-with-ai",
      "ai-prompts-for-product-strategy",
      "ai-newsletter-for-product-managers",
    ],
  },
  {
    slug: "best-ai-tools-for-founders-2026",
    title: "Best AI tools for founders in 2026",
    description:
      "A founder-focused AI tool framework for fundraising, sales, hiring, support, operations, and investor communication.",
    careerId: "entrepreneurship",
    audience: "Founders",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "7 min read",
    tags: ["Founders", "AI tools", "Operations"],
    intro:
      "Founders need AI tools that reduce decision load. The right stack helps you write clearer updates, research customers faster, turn messy notes into operating plans, and keep the company moving without adding process theater.",
    sections: [
      {
        heading: "Prioritize leverage across founder bottlenecks",
        body: [
          "A founder's calendar usually breaks around customer discovery, sales follow-up, hiring, investor communication, product triage, and internal alignment. AI tools should remove drag from those exact bottlenecks.",
          "Do not buy a large tool suite before mapping the weekly work you repeat. The first useful AI workflow is often a simple research, draft, review, and send loop around a task you already do every week.",
        ],
      },
      {
        heading: "Use AI for first drafts and second thoughts",
        body: [
          "AI is useful for a first draft of an investor update, launch email, sales follow-up, or hiring scorecard. It is also useful as a second thought: what is unclear, what is missing, and what objection would a skeptical reader raise?",
          "The founder should still own facts, commitments, numbers, and claims. A tool can help pressure-test the story, but it cannot know the company's real state unless you provide it carefully.",
        ],
      },
      {
        heading: "Build a lightweight operating memory",
        body: [
          "The biggest compounding benefit comes from saving decisions, customer objections, roadmap changes, and investor questions in a reusable format. That context turns generic AI into a company-specific assistant.",
          "Keep the memory factual. Avoid padded summaries, invented market stats, or optimism that was never validated. Future decisions are only as good as the context you preserve.",
        ],
      },
      {
        heading: "Connect daily signals to one weekly ask",
        body: [
          "Founders do not need every AI headline. They need the few changes that affect product, distribution, fundraising, hiring, or cost structure.",
          "A strong workflow ends each week with one ask: one customer segment to contact, one experiment to run, one investor note to send, or one internal operating change to make.",
        ],
      },
    ],
    takeaways: [
      "Choose AI tools around founder bottlenecks, not broad categories.",
      "Keep ownership of facts, numbers, commitments, and claims.",
      "Turn daily AI signals into one weekly operating ask.",
    ],
    relatedSlugs: [
      "write-investor-updates-with-ai",
      "ai-prompts-for-founder-operations",
      "ai-newsletter-for-founders",
    ],
  },
  {
    slug: "ai-newsletter-for-marketers",
    title: "What to look for in an AI newsletter for marketers",
    description:
      "A marketer's guide to choosing an AI newsletter that delivers actionable channel, creative, and measurement context instead of generic hype.",
    careerId: "marketing",
    audience: "Marketers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Marketing", "Newsletter", "AI news"],
    intro:
      "A useful AI newsletter for marketers should make tomorrow's campaign decisions easier. It should not simply recap every model launch or tool announcement.",
    sections: [
      {
        heading: "Look for role-specific interpretation",
        body: [
          "The same AI story can matter differently to a performance marketer, lifecycle lead, content strategist, or brand team. A good briefing translates the news into channel impact, creative implications, and measurement risk.",
          "If every reader gets the same takeaway, the newsletter is probably a tech digest, not a marketing operating input.",
        ],
      },
      {
        heading: "Demand source visibility",
        body: [
          "Marketing teams move fast, but they still need to know where a claim came from. A newsletter should link to the original source when it describes a product release, policy update, platform change, or public company statement.",
          "Source links also make it easier to decide whether an item deserves action today or just belongs in a backlog of things to monitor.",
        ],
      },
      {
        heading: "Prefer prompts tied to real workflows",
        body: [
          "The best prompt in a marketing newsletter is not a novelty. It should help with a real task: turning a customer objection into ad angles, adapting one campaign to multiple channels, or summarizing a test result into next actions.",
          "A strong prompt includes inputs, constraints, review criteria, and the expected output format.",
        ],
      },
    ],
    takeaways: [
      "Choose newsletters that explain what changed for marketing work.",
      "Prefer source-cited updates over unsourced summaries.",
      "Look for prompts that map to campaign and channel workflows.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-marketers-2026",
      "turn-one-ai-briefing-into-30-marketing-posts",
      "ai-prompts-for-marketing-campaigns",
    ],
  },
  {
    slug: "ai-newsletter-for-product-managers",
    title: "What to look for in an AI newsletter for product managers",
    description:
      "How PMs should evaluate AI newsletters for roadmap signal, discovery context, tool changes, and decision support.",
    careerId: "product-management",
    audience: "Product managers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Product", "Newsletter", "AI news"],
    intro:
      "A product manager does not need every AI update. A PM needs the product implications: what changed for users, what changed for builders, and what decision deserves attention.",
    sections: [
      {
        heading: "The briefing should separate signal from novelty",
        body: [
          "A model release can be interesting without changing your roadmap. A small platform policy change can matter more if it affects integrations, user expectations, or cost.",
          "Useful PM briefings explain the likely product consequence, not just the announcement.",
        ],
      },
      {
        heading: "Good AI news improves product conversations",
        body: [
          "A strong newsletter gives PMs better questions for design, engineering, sales, support, and leadership. It should help you ask what customers can now do, where trust may break, and what competitor expectations may shift.",
          "If an item cannot become a better product conversation, it probably does not belong near the top of a PM briefing.",
        ],
      },
      {
        heading: "Source links matter for roadmap decisions",
        body: [
          "Product teams should avoid building strategy on paraphrased rumors. When a newsletter cites official docs, release notes, or direct company posts, the PM can inspect the source before changing priorities.",
          "That source trail is especially important for AI because capabilities, pricing, terms, and safety constraints can change quickly.",
        ],
      },
    ],
    takeaways: [
      "A PM AI newsletter should explain product consequences.",
      "Useful updates create better cross-functional questions.",
      "Roadmap decisions need direct source trails.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-product-managers-2026",
      "turn-support-tickets-into-ranked-prd-with-ai",
      "ai-prompts-for-product-strategy",
    ],
  },
  {
    slug: "ai-newsletter-for-founders",
    title: "What to look for in an AI newsletter for founders",
    description:
      "A founder's checklist for AI news that informs product, distribution, fundraising, hiring, and operating decisions.",
    careerId: "entrepreneurship",
    audience: "Founders",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Founders", "Newsletter", "AI news"],
    intro:
      "Founders need AI updates that compress the market into decisions. A useful newsletter should help you decide what to build, what to sell, what to watch, and what to ignore.",
    sections: [
      {
        heading: "Founder relevance is different from tech relevance",
        body: [
          "A technical breakthrough may not change your company this week. A distribution shift, pricing change, enterprise adoption pattern, or customer expectation can matter more.",
          "The right founder briefing turns AI news into operating implications: product wedge, go-to-market angle, cost risk, hiring need, or investor narrative.",
        ],
      },
      {
        heading: "One action beats ten interesting links",
        body: [
          "A founder's inbox is already full. A useful AI newsletter should end with a clear action: contact this customer segment, test this workflow, update this deck, or ask this question in the next team meeting.",
          "The action does not need to be large. It needs to be specific enough to move the company forward.",
        ],
      },
      {
        heading: "Avoid unsourced market claims",
        body: [
          "Founders should be especially skeptical of unsupported market size, adoption, and productivity claims. Those numbers can leak into decks, investor updates, and strategy docs before anyone verifies them.",
          "A good newsletter is comfortable saying what is known, what is uncertain, and what still needs direct validation.",
        ],
      },
    ],
    takeaways: [
      "Founder AI news should map to operating implications.",
      "One specific action is better than a pile of links.",
      "Do not reuse unsourced market claims in company materials.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-founders-2026",
      "write-investor-updates-with-ai",
      "ai-prompts-for-founder-operations",
    ],
  },
  {
    slug: "turn-one-ai-briefing-into-30-marketing-posts",
    title: "How marketers can turn one AI briefing into 30 useful posts",
    description:
      "A repeatable workflow for turning one source-cited AI briefing into channel-specific social, email, and sales enablement assets.",
    careerId: "marketing",
    audience: "Marketers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Marketing", "Repurposing", "Content workflow"],
    intro:
      "Repurposing works when each asset has a job. One source-cited AI briefing can become a useful content batch if you keep the source intact, choose one angle per channel, and avoid turning every post into the same summary.",
    sections: [
      {
        heading: "Extract the three reusable ingredients",
        body: [
          "Start by pulling three things from the briefing: the change, the audience affected, and the action a marketer could take. Those ingredients can become posts for education, point of view, objection handling, and internal enablement.",
          "Do not copy the briefing into every post. Translate it for the channel and reader intent.",
        ],
      },
      {
        heading: "Build a balanced asset mix",
        body: [
          "A 30-post batch can include short social posts, longer threads, LinkedIn carousels, email snippets, sales enablement bullets, ad angle tests, and FAQ entries.",
          "The goal is not volume for its own sake. The goal is to give each team a useful version of the same source-backed idea.",
        ],
      },
      {
        heading: "Keep the source trail visible",
        body: [
          "When a post references a product release, policy, partnership, or public claim, keep the original source link available in the draft or approval notes.",
          "That makes review faster and keeps the team from accidentally turning a cautious update into a stronger claim than the source supports.",
        ],
      },
      {
        heading: "Review by risk level",
        body: [
          "Low-risk educational posts can move quickly. Posts that mention competitors, performance claims, customer impact, pricing, or compliance need a stricter review path.",
          "Use AI to produce variants, but use humans to decide which statements the brand is willing to stand behind.",
        ],
      },
    ],
    takeaways: [
      "Repurpose the change, audience, and action, not the whole briefing.",
      "Match each asset to a channel job.",
      "Keep original source links in the review trail.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-marketers-2026",
      "ai-prompts-for-marketing-campaigns",
      "weekly-ai-roundup-template",
    ],
  },
  {
    slug: "turn-support-tickets-into-ranked-prd-with-ai",
    title: "How PMs can turn support tickets into a ranked PRD with AI",
    description:
      "A practical product workflow for using AI to cluster support tickets, define problems, rank opportunities, and draft PRDs.",
    careerId: "product-management",
    audience: "Product managers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Product", "Support tickets", "PRD"],
    intro:
      "Support tickets are one of the richest product inputs, but they are noisy. AI can help PMs cluster the noise into patterns, as long as the final ranking still comes from strategy, customer value, and engineering judgment.",
    sections: [
      {
        heading: "Prepare the data before asking for answers",
        body: [
          "Remove personal details, account identifiers, and irrelevant internal notes. Keep the issue description, customer segment, severity, frequency, workaround, and any linked product area.",
          "AI works better when the input is structured. A little cleanup prevents the model from over-weighting loud language or duplicate tickets.",
        ],
      },
      {
        heading: "Cluster by problem, not by requested solution",
        body: [
          "Customers often describe fixes, but the PM needs the underlying problem. Ask AI to group tickets by the user goal that failed, the workflow step where it failed, and the business consequence.",
          "Then inspect representative tickets from each cluster. Do not trust a cluster that has no clear examples.",
        ],
      },
      {
        heading: "Rank with transparent criteria",
        body: [
          "A ranked PRD should show why an opportunity moved up or down. Useful criteria include affected segment, frequency, severity, revenue exposure, strategic fit, implementation risk, and confidence.",
          "AI can draft the table. The PM should adjust scores and explain the tradeoffs.",
        ],
      },
      {
        heading: "Write the PRD from evidence",
        body: [
          "The PRD should include problem statement, affected users, evidence, non-goals, proposed solution, risks, launch plan, and measurement plan.",
          "Keep ticket quotes or examples linked internally so reviewers can trace the decision back to real customer input.",
        ],
      },
    ],
    takeaways: [
      "Clean support data before using AI.",
      "Cluster around problems, not requested features.",
      "Use AI to draft ranking tables while PMs own the final tradeoffs.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-product-managers-2026",
      "ai-prompts-for-product-strategy",
      "ai-newsletter-for-product-managers",
    ],
  },
  {
    slug: "write-investor-updates-with-ai",
    title: "How founders can write better investor updates with AI",
    description:
      "A founder workflow for turning operating notes into concise investor updates without inventing numbers, traction, or certainty.",
    careerId: "entrepreneurship",
    audience: "Founders",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Founders", "Investor updates", "Operations"],
    intro:
      "AI can make investor updates faster, but it should not make them fuzzier. The strongest updates are specific, candid, and tied to real operating facts.",
    sections: [
      {
        heading: "Collect the raw operating inputs",
        body: [
          "Before drafting, collect the facts: revenue or pipeline movement, product progress, customer learning, hiring changes, runway context, and one or two asks.",
          "If a number is not final, label it clearly. AI should not round uncertainty into confidence.",
        ],
      },
      {
        heading: "Use a stable update structure",
        body: [
          "A simple structure works: headline, wins, misses or risks, what changed, next priorities, metrics, and asks. Investors learn faster when every update uses the same pattern.",
          "Ask AI to shorten and clarify the draft, not to decorate it.",
        ],
      },
      {
        heading: "Pressure-test the narrative",
        body: [
          "After the first draft, ask what a skeptical investor would question. That second pass often surfaces vague metrics, missing context, or a buried ask.",
          "The goal is not to remove hard news. It is to make the company's state legible.",
        ],
      },
      {
        heading: "Protect trust",
        body: [
          "Never let AI invent customer logos, market stats, funding progress, commitments, or investor interest. An update is a trust artifact, not a marketing page.",
          "Use AI for clarity and cadence. Keep truthfulness with the founder.",
        ],
      },
    ],
    takeaways: [
      "Start from real operating facts, not a blank prompt.",
      "Keep a stable structure so investors can scan quickly.",
      "Use AI to clarify, not to inflate progress.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-founders-2026",
      "ai-prompts-for-founder-operations",
      "ai-newsletter-for-founders",
    ],
  },
  {
    slug: "ai-prompts-for-marketing-campaigns",
    title: "AI prompts for marketing campaigns that keep strategy intact",
    description:
      "Prompt patterns marketers can use for briefs, angles, objections, channel variants, and post-campaign learning.",
    careerId: "marketing",
    audience: "Marketers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Marketing", "Prompts", "Campaigns"],
    intro:
      "Good marketing prompts preserve strategy. They tell the AI what the audience believes now, what the campaign must change, and what constraints the brand will not violate.",
    sections: [
      {
        heading: "Prompt from the brief",
        body: [
          "Start with audience, problem, desired belief, proof points, offer, channel, tone, exclusions, and review criteria. This gives the model enough context to create useful options without inventing the strategy.",
          "If those inputs are missing, pause. AI cannot repair an unclear brief by producing more variations.",
        ],
      },
      {
        heading: "Ask for angle families before copy",
        body: [
          "Instead of asking for ten ads immediately, ask for angle families: pain relief, aspiration, objection, comparison, urgency, education, and proof.",
          "Pick the strongest families first, then generate copy inside those lanes. This keeps the campaign from becoming a random pile of headlines.",
        ],
      },
      {
        heading: "Use constraints as quality controls",
        body: [
          "Strong prompts include what not to say: no unsupported metrics, no fake urgency, no customer claims without proof, no competitor claims that legal has not reviewed.",
          "Constraints make AI more useful because they encode the judgment that experienced marketers already apply.",
        ],
      },
      {
        heading: "Close with a learning prompt",
        body: [
          "After a campaign, feed in the results that are safe to share and ask for patterns, likely explanations, next tests, and what evidence is still missing.",
          "Treat the answer as a hypothesis list, then decide which tests deserve budget or creative resources.",
        ],
      },
    ],
    takeaways: [
      "Use the campaign brief as the core prompt input.",
      "Generate angle families before copy variants.",
      "Include exclusions so AI does not create risky claims.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-marketers-2026",
      "turn-one-ai-briefing-into-30-marketing-posts",
      "ai-newsletter-for-marketers",
    ],
  },
  {
    slug: "ai-prompts-for-product-strategy",
    title: "AI prompts for product strategy that PMs can actually use",
    description:
      "Prompt patterns for opportunity framing, customer evidence, roadmap tradeoffs, PRDs, and stakeholder updates.",
    careerId: "product-management",
    audience: "Product managers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Product", "Prompts", "Strategy"],
    intro:
      "Useful product prompts do not ask AI to choose the roadmap. They ask AI to organize evidence, sharpen tradeoffs, and expose the assumptions behind a decision.",
    sections: [
      {
        heading: "Frame the opportunity",
        body: [
          "Provide the customer segment, job to be done, current workaround, evidence, constraints, and business goal. Ask AI to produce problem statements at different levels of specificity.",
          "Then pick the statement that best matches your actual strategy. Do not let a polished sentence outrank evidence.",
        ],
      },
      {
        heading: "Ask for counterarguments",
        body: [
          "A PM prompt should include skepticism. Ask what would make this opportunity smaller, riskier, or less urgent than it appears.",
          "This is where AI can help most: not by validating the idea, but by widening the review before the team commits.",
        ],
      },
      {
        heading: "Translate for each stakeholder",
        body: [
          "After deciding, ask AI to rewrite the rationale for engineering, sales, support, executives, and customers. Each group needs different context.",
          "Keep the core decision unchanged. The rewrite should improve clarity, not create five different strategies.",
        ],
      },
      {
        heading: "Maintain a decision log",
        body: [
          "Prompt AI to turn final decisions into a short log: decision, date, evidence, owner, tradeoffs, follow-up metric, and reopen condition.",
          "That log becomes a product memory the team can use when priorities shift.",
        ],
      },
    ],
    takeaways: [
      "Use prompts to organize evidence and tradeoffs.",
      "Ask for counterarguments before committing.",
      "Turn decisions into reusable product memory.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-product-managers-2026",
      "turn-support-tickets-into-ranked-prd-with-ai",
      "ai-newsletter-for-product-managers",
    ],
  },
  {
    slug: "ai-prompts-for-founder-operations",
    title: "AI prompts for founder operations",
    description:
      "Prompt patterns founders can use for weekly planning, customer follow-up, hiring, fundraising, and operating reviews.",
    careerId: "entrepreneurship",
    audience: "Founders",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Founders", "Prompts", "Operations"],
    intro:
      "Founder prompts should reduce ambiguity. The best ones turn messy context into decisions, asks, and next actions without pretending the company has more certainty than it does.",
    sections: [
      {
        heading: "Turn weekly notes into priorities",
        body: [
          "Give AI the week's customer notes, product updates, sales friction, cash constraints, and team capacity. Ask for themes, risks, and three priority options with tradeoffs.",
          "Then choose. The model can help frame the decision, but the founder owns the resource allocation.",
        ],
      },
      {
        heading: "Draft customer follow-up with context",
        body: [
          "A good follow-up prompt includes who the customer is, what they care about, what was promised, what is still unknown, and what next action you want.",
          "Ask for a concise email, then verify every commitment before sending.",
        ],
      },
      {
        heading: "Use AI for hiring scorecards",
        body: [
          "Provide role outcomes, must-have skills, interview signals, and red flags. Ask AI to produce a scorecard that separates evidence from opinion.",
          "This helps founders run a tighter process without letting AI make the hiring call.",
        ],
      },
      {
        heading: "Create a weekly operating review",
        body: [
          "Prompt AI to summarize what changed, what is blocked, what needs a decision, and what should be dropped.",
          "The best output is short enough to read before a Monday meeting and concrete enough to assign ownership.",
        ],
      },
    ],
    takeaways: [
      "Founder prompts should produce priorities, asks, and decisions.",
      "Verify every customer or investor commitment before sending.",
      "Use AI to structure process, not to make judgment calls.",
    ],
    relatedSlugs: [
      "best-ai-tools-for-founders-2026",
      "write-investor-updates-with-ai",
      "ai-newsletter-for-founders",
    ],
  },
  {
    slug: "ai-for-sales-teams-prospecting-workflow",
    title: "AI for sales teams: a practical prospecting workflow",
    description:
      "How sales teams can use AI for account research, outbound personalization, call prep, and follow-up without weakening trust.",
    careerId: "sales",
    audience: "Sales teams",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Sales", "Prospecting", "Workflow"],
    intro:
      "AI prospecting works when it makes reps more relevant, not just louder. The goal is sharper account context, better timing, and cleaner follow-up.",
    sections: [
      {
        heading: "Research accounts around triggers",
        body: [
          "Ask AI to summarize public account context around a specific trigger: hiring, product launch, leadership change, regulation, expansion, or stated initiative.",
          "Keep the source trail available so reps can verify the trigger before referencing it.",
        ],
      },
      {
        heading: "Personalize by business problem",
        body: [
          "Weak personalization mentions trivia. Strong personalization connects a likely business problem to a relevant point of view.",
          "Use AI to draft options, then have the rep pick the one they would be comfortable saying live on a call.",
        ],
      },
      {
        heading: "Use call prep to narrow discovery",
        body: [
          "Before a call, ask AI for hypotheses, discovery questions, likely objections, and proof points to avoid until the buyer confirms the problem.",
          "This keeps discovery from becoming a pitch too early.",
        ],
      },
    ],
    takeaways: [
      "AI should make prospecting more relevant, not more generic.",
      "Verify triggers before mentioning them.",
      "Use AI call prep to improve discovery discipline.",
    ],
    relatedSlugs: [
      "weekly-ai-roundup-template",
      "ai-for-customer-success-retention-signals",
      "ai-for-operations-teams-workflow-automation",
    ],
  },
  {
    slug: "ai-for-design-teams-prototype-reviews",
    title: "AI for design teams: faster prototype reviews without losing taste",
    description:
      "A design-team workflow for using AI to review prototypes, summarize feedback, and prepare handoffs while keeping human judgment intact.",
    careerId: "design",
    audience: "Designers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Design", "Prototype", "Workflow"],
    intro:
      "AI can help design teams see consistency issues, summarize feedback, and generate alternatives. It cannot replace taste, product context, or the judgment behind a strong user experience.",
    sections: [
      {
        heading: "Use AI as a structured reviewer",
        body: [
          "Ask AI to review a prototype against explicit criteria: hierarchy, clarity, accessibility, states, edge cases, and copy fit.",
          "Specific review criteria produce better critique than a generic request to make a screen better.",
        ],
      },
      {
        heading: "Summarize feedback into decisions",
        body: [
          "Design feedback often arrives as scattered comments. AI can group feedback by decision area, separate must-fix issues from preferences, and identify unresolved questions.",
          "The designer should still decide which feedback serves the product and which feedback creates noise.",
        ],
      },
      {
        heading: "Prepare cleaner handoffs",
        body: [
          "Use AI to generate implementation notes, state lists, empty/error/loading cases, and QA checklists from the design spec.",
          "A cleaner handoff reduces ambiguity, but the design team should review it for accuracy before engineering uses it.",
        ],
      },
    ],
    takeaways: [
      "Give AI explicit design review criteria.",
      "Use AI to organize feedback, not to replace design judgment.",
      "Review generated handoff notes before implementation.",
    ],
    relatedSlugs: [
      "weekly-ai-roundup-template",
      "ai-for-engineering-managers-code-review",
      "best-ai-tools-for-product-managers-2026",
    ],
  },
  {
    slug: "ai-for-engineering-managers-code-review",
    title: "AI for engineering managers: code review and delivery signal",
    description:
      "How engineering managers can use AI to improve review quality, delivery visibility, and team communication without creating false certainty.",
    careerId: "engineering",
    audience: "Engineering managers",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Engineering", "Code review", "Management"],
    intro:
      "Engineering managers can use AI to scan for review themes, summarize delivery risk, and prepare team updates. The value is in clearer judgment, not automated approval.",
    sections: [
      {
        heading: "Use AI to find review patterns",
        body: [
          "AI can summarize recurring review issues: missing tests, unclear ownership, fragile migrations, repeated accessibility gaps, or risky dependencies.",
          "Those patterns help the manager coach the system rather than only react to individual pull requests.",
        ],
      },
      {
        heading: "Turn delivery noise into risk signals",
        body: [
          "Ask AI to summarize status updates into blocked work, unowned decisions, cross-team dependencies, and launch risk.",
          "Keep the output grounded in actual updates. Do not let a confident summary hide missing information.",
        ],
      },
      {
        heading: "Protect review accountability",
        body: [
          "AI can suggest questions, but humans remain accountable for approving code. Use it to improve coverage and consistency, not to rubber-stamp changes.",
          "For high-risk changes, require explicit human review of tests, rollback plan, observability, and user impact.",
        ],
      },
    ],
    takeaways: [
      "Use AI to identify recurring engineering review patterns.",
      "Summarize delivery risk from actual status, not vibes.",
      "Keep humans accountable for code approval.",
    ],
    relatedSlugs: [
      "ai-for-design-teams-prototype-reviews",
      "ai-for-data-science-analysis-triage",
      "weekly-ai-roundup-template",
    ],
  },
  {
    slug: "ai-for-customer-success-retention-signals",
    title: "AI for customer success: turning account noise into retention signals",
    description:
      "A customer success workflow for using AI to summarize account health, identify risks, and prepare targeted customer outreach.",
    careerId: "customer-success",
    audience: "Customer success teams",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Customer Success", "Retention", "Workflow"],
    intro:
      "Customer success teams sit on a large amount of qualitative signal. AI can help turn calls, tickets, usage notes, and renewal context into clearer account priorities.",
    sections: [
      {
        heading: "Combine signals carefully",
        body: [
          "Account health is not one metric. It includes product usage, support history, stakeholder changes, business goals, open risks, and renewal timing.",
          "Use AI to summarize those inputs, but preserve the original sources so CSMs can inspect the evidence behind a risk label.",
        ],
      },
      {
        heading: "Draft outreach by customer goal",
        body: [
          "AI follow-up should start from the customer's stated goal, not from a generic check-in. Provide context on what they wanted, what changed, and what action would help them now.",
          "The CSM should verify tone, commitments, and next steps before sending.",
        ],
      },
      {
        heading: "Turn recurring issues into product feedback",
        body: [
          "When the same account risk appears across customers, AI can cluster the pattern into product themes and support enablement needs.",
          "That makes customer success a stronger input to roadmap and lifecycle marketing.",
        ],
      },
    ],
    takeaways: [
      "AI can summarize account risk, but CSMs need source visibility.",
      "Customer outreach should start from the customer's goal.",
      "Recurring CS patterns should feed product and lifecycle work.",
    ],
    relatedSlugs: [
      "ai-for-sales-teams-prospecting-workflow",
      "turn-support-tickets-into-ranked-prd-with-ai",
      "ai-for-operations-teams-workflow-automation",
    ],
  },
  {
    slug: "ai-for-operations-teams-workflow-automation",
    title: "AI for operations teams: workflow automation that survives reality",
    description:
      "How operations teams can use AI to map workflows, find bottlenecks, draft SOPs, and automate safely.",
    careerId: "operations",
    audience: "Operations teams",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Operations", "Automation", "SOPs"],
    intro:
      "Operations teams should use AI to make work visible before automating it. A messy workflow automated too early becomes a faster mess.",
    sections: [
      {
        heading: "Map the workflow first",
        body: [
          "Collect the steps, owners, systems, decision points, handoffs, and exception paths. Ask AI to turn that into a simple workflow map and identify unclear ownership.",
          "The map should be reviewed by the people who actually run the process.",
        ],
      },
      {
        heading: "Automate the stable parts",
        body: [
          "Good automation candidates are repeatable, rules-based, low-risk, and easy to verify. Avoid automating ambiguous judgment until the team agrees on the decision criteria.",
          "AI can draft the SOP, checklist, and exception handling notes before the first automation ships.",
        ],
      },
      {
        heading: "Measure failure modes",
        body: [
          "Every automated workflow needs a way to detect bad inputs, missed handoffs, stale data, and silent failures.",
          "Use AI to generate a risk checklist, then assign owners and review cadence. The system is only useful if humans can see when it breaks.",
        ],
      },
    ],
    takeaways: [
      "Map the workflow before automating it.",
      "Start with repeatable, low-risk steps.",
      "Design failure visibility into every AI workflow.",
    ],
    relatedSlugs: [
      "ai-prompts-for-founder-operations",
      "ai-for-customer-success-retention-signals",
      "weekly-ai-roundup-template",
    ],
  },
  {
    slug: "ai-for-data-science-analysis-triage",
    title: "AI for data science: analysis triage before deeper modeling",
    description:
      "A data-science workflow for using AI to triage requests, clarify assumptions, and speed up analysis planning.",
    careerId: "data-science",
    audience: "Data scientists",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Data Science", "Analysis", "Workflow"],
    intro:
      "AI can help data scientists move faster before modeling starts: clarifying the business question, identifying missing data, and drafting an analysis plan.",
    sections: [
      {
        heading: "Clarify the question",
        body: [
          "Many analysis requests arrive as vague asks for numbers. Ask AI to turn the request into candidate business questions, required decisions, success criteria, and assumptions.",
          "Then confirm the real decision with the stakeholder before touching the dataset.",
        ],
      },
      {
        heading: "Create an analysis plan",
        body: [
          "Provide the available tables, grain, known caveats, and time window. Ask AI for a plan that lists joins, filters, metrics, sanity checks, and likely limitations.",
          "The data scientist should inspect every suggested step. AI can help plan, but it does not know your warehouse quirks unless you give it context.",
        ],
      },
      {
        heading: "Explain results with uncertainty",
        body: [
          "After analysis, use AI to draft a stakeholder summary that separates finding, confidence, caveat, and recommendation.",
          "That structure prevents a directional analysis from being read as a definitive answer.",
        ],
      },
    ],
    takeaways: [
      "Use AI to clarify the business question before analysis.",
      "Draft analysis plans with explicit caveats and sanity checks.",
      "Communicate findings with confidence levels and limitations.",
    ],
    relatedSlugs: [
      "ai-for-engineering-managers-code-review",
      "ai-for-operations-teams-workflow-automation",
      "weekly-ai-roundup-template",
    ],
  },
  {
    slug: "ai-for-consultants-client-ready-synthesis",
    title: "AI for consultants: client-ready synthesis without generic decks",
    description:
      "A consultant workflow for turning interviews, documents, and research into sharper client narratives and action plans.",
    careerId: "consulting",
    audience: "Consultants",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "5 min read",
    tags: ["Consulting", "Synthesis", "Client work"],
    intro:
      "Consultants can use AI to accelerate synthesis, but client-ready work still depends on judgment, specificity, and a clear recommendation.",
    sections: [
      {
        heading: "Organize evidence before writing slides",
        body: [
          "Feed AI structured inputs: interview themes, document excerpts, constraints, stakeholder goals, and decision deadlines.",
          "Ask for patterns, contradictions, and missing evidence before asking for a narrative.",
        ],
      },
      {
        heading: "Move from findings to recommendations",
        body: [
          "A generic deck lists observations. A useful deck turns evidence into choices, tradeoffs, and next steps.",
          "Ask AI to draft recommendation options with risks and assumptions, then refine the option that best fits the client context.",
        ],
      },
      {
        heading: "Keep client context private",
        body: [
          "Consulting work often includes confidential documents and strategy. Use approved systems and sanitize examples before using AI.",
          "The faster synthesis is only valuable if it preserves trust.",
        ],
      },
    ],
    takeaways: [
      "Synthesize evidence before drafting slides.",
      "Turn observations into choices and recommendations.",
      "Protect confidential client context.",
    ],
    relatedSlugs: [
      "weekly-ai-roundup-template",
      "ai-for-operations-teams-workflow-automation",
      "ai-prompts-for-founder-operations",
    ],
  },
  {
    slug: "weekly-ai-roundup-template",
    title: "A weekly AI roundup template for busy professionals",
    description:
      "A reusable Friday roundup structure for turning daily AI news into decisions, experiments, and next-week priorities.",
    careerId: "product-management",
    audience: "Busy professionals",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    readingTime: "6 min read",
    tags: ["Weekly roundup", "AI news", "Planning"],
    intro:
      "A weekly AI roundup should not be a pile of links. It should help a professional decide what changed, what matters, and what to do next week.",
    sections: [
      {
        heading: "Use five sections",
        body: [
          "A practical roundup has five sections: what changed, why it matters for your role, what to ignore for now, one experiment to run, and one source list for deeper reading.",
          "This structure keeps the roundup useful even when the week is noisy.",
        ],
      },
      {
        heading: "Separate facts from interpretation",
        body: [
          "Facts should link back to sources. Interpretation should explain the role-specific implication. Do not blend the two so tightly that readers cannot tell what is confirmed and what is your analysis.",
          "This distinction builds trust and makes the roundup easier to act on.",
        ],
      },
      {
        heading: "End with one next action",
        body: [
          "The final section should give one practical next action: test a prompt, review a vendor, update a workflow, brief a team, or ask a sharper question.",
          "A roundup that ends in action is more useful than one that ends in information overload.",
        ],
      },
      {
        heading: "Archive the lesson",
        body: [
          "Keep the best item, prompt, and decision from each week in a simple archive. Over time, the archive becomes a practical role-specific AI playbook.",
          "The archive should grow from real briefings and decisions, not fabricated backfill.",
        ],
      },
    ],
    takeaways: [
      "A roundup should turn news into decisions.",
      "Keep facts and interpretation visibly separate.",
      "End each roundup with one practical next action.",
    ],
    relatedSlugs: [
      "ai-newsletter-for-marketers",
      "ai-newsletter-for-product-managers",
      "ai-newsletter-for-founders",
    ],
  },
];

export function getSeoArticle(slug: string): SeoArticle | null {
  return seoArticles.find((article) => article.slug === slug) ?? null;
}

export function getCareerName(careerId: CareerId): string {
  return careerCategories.find((career) => career.id === careerId)?.name ?? "Your role";
}

export function getArticlesForCareer(careerId: CareerId, limit = 3): SeoArticle[] {
  return seoArticles.filter((article) => article.careerId === careerId).slice(0, limit);
}

export function getRelatedArticles(article: SeoArticle): SeoArticle[] {
  const related = article.relatedSlugs
    .map((slug) => getSeoArticle(slug))
    .filter((item): item is SeoArticle => Boolean(item));

  if (related.length >= 3) return related.slice(0, 3);

  const fallback = seoArticles.filter(
    (candidate) =>
      candidate.slug !== article.slug &&
      candidate.careerId === article.careerId &&
      !related.some((item) => item.slug === candidate.slug),
  );

  return [...related, ...fallback].slice(0, 3);
}
