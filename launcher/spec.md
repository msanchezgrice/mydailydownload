# My Daily Download — Product Spec

## 1. Product Basics

| Field | Value |
|---|---|
| **Product name** | My Daily Download |
| **Production domain** | mydailydownload.com (already added to Vercel domains) |
| **Owner / legal contact** | Miguel Sanchez-Grice |
| **Support email** | support@mydailydownload.com |
| **One-sentence product promise** | A daily AI briefing personalized to your exact career — every item cites a real primary source. |
| **Target user** | Working professionals (initially Marketing, Product, and Founder roles) who want AI news that matters to *their* job, not a generic firehose. |
| **Primary job the product does** | Each morning, deliver a short, role-tailored email of AI news, tools, and one actionable play — grounded in real, citable sources. |
| **Definition of "launched"** | Three categories (Marketing, Product, Founder) live; double-opt-in subscribe flow working end-to-end; daily sends reliable for 14 consecutive days from `mydailydownload.com` with one-click unsubscribe; complaint rate < 0.10%; Pro tier purchasable via Stripe at one price; 15 SEO category hubs indexable. |

---

## 2. Core Product Spec

### 2.1 End-to-end user journey (first screen → success)

1. **Landing (`/`)** — Hero promise + "how it works" (share career → we research AI for you → daily email). Career grid. Interactive sample preview (pick a career → see a real recent issue). Pricing (Free + Pro). CTA: enter email + career.
2. **Onboarding (`/onboarding`)** — Multi-step:
   - Step 1: Email + optional LinkedIn URL + optional resume PDF upload.
   - Step 2: Confirm profile. We show **real** parsed fields (Proxycurl LinkedIn + resume text) mapped to career + seniority. **Always user-correctable** (dropdown of 15 careers, 3 seniority tiers). No fabricated inference is asserted.
   - Step 3: Delivery time preference (morning/evening) + consent checkbox. Submit.
3. **Confirm email** — Double opt-in: confirmation email sent. Sending is gated until the user clicks confirm (records `confirmed_at`).
4. **Success state** — After confirm: "You're in" page → access to the **rolling trailing 2-week archive** of their category's briefings.
5. **Daily success loop** — Each morning at the user's local delivery hour, a role+seniority-tailored email lands in the inbox with a working one-click unsubscribe and a footer physical address.
6. **Upgrade path** — Free users hit a Pro upsell (deeper weekly analysis + full gated archive) → Stripe Checkout → Pro.

### 2.2 Primary conversion event

**Confirmed double-opt-in subscribe** (the user clicks the confirmation link → `confirmed_at` set). This is the primary conversion. Pro purchase is a secondary/monetization conversion.

### 2.3 Pricing, tiers, refund stance, free/paid boundary

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Daily personalized briefing (core blocks); rolling trailing 2-week archive of their category. |
| **Pro** | **$15–19/mo** (ONE price, identical on every surface — landing, checkout, email, archive) | Everything in Free + deeper weekly analysis (Friday Roundup deep-dive), full archive access, tool/prompt extras. |

- **Refund stance:** Monthly subscription; cancel anytime, access continues through the paid period; pro-rated refunds not offered by default but honored case-by-case via support@mydailydownload.com (state plainly on the billing page).
- **Free/paid boundary:** Free = the daily email + 2-week rolling archive. Paid = deeper weekly analysis + full (non-rolling) archive depth + extras. The daily core briefing is never paywalled (it is the acquisition engine).

> **Pricing note (missing decision):** The exact Pro price within $15–19 is **not yet locked to a single number**. Marked as a Miguel decision in `launch-notes.md`. Whatever single value is chosen MUST be identical across all surfaces.

### 2.4 MVP scope

**Required now (launch):**
- 3 launch categories: **Marketing, Product, Founder**.
- 45-variant generation matrix capability (15 professions × 3 seniority tiers), **forward-only**, live from launch (no historical backfill). Launch *sends* focus on the 3 categories; the matrix capability and SEO hubs cover all 15.
- 3-lane news ingestion (RSS backbone + Exa + Tavily + AgentMail discovery + dailyaibrief.com) → canonicalize/dedup → grounded gpt-4o-mini summarization → **URL-in-fetched-set guardrail** (no item renders a URL not in the fetched set).
- Real profile parsing (Proxycurl LinkedIn + resume PDF), user-correctable.
- Double opt-in, unguessable unsubscribe token, RFC 8058 one-click `List-Unsubscribe`, footer physical address, consent log (ts + IP + checkbox text + source), bounce/complaint webhook → deactivate.
- Per-category block composition + day-of-week rotation email format.
- Rolling trailing 2-week gated archive backed by the real `briefings` table.
- 15 indexed SEO category hubs `/ai-for/[career]` (~weekly refresh); seniority/daily variants `noindex`.
- Stripe Pro tier at one price.
- Send idempotency (`sends` UNIQUE on `(subscriber_id, briefing_date)`, `ON CONFLICT DO NOTHING`).

**Explicitly deferred (post-launch):**
- Categories 4–15 *as active daily sends* (Sales, Design, Operations, Engineering, Data Science, etc.) — capability exists; activation gated.
- 5 vertical X accounts repurpose **auto-posting** (pipeline built, posting approval-gated; full automation deferred).
- Higher-liability verticals (Healthcare, Legal, Finance) as active sends.
- Native mobile app (email + responsive web only at launch).

**Explicitly out of scope:**
- Any LLM-invented news, headlines, sources, funding numbers, or stats (`search_ai_news()` LLM-as-source and `_fallback_*` invented stats are removed entirely).
- Reproducing any newsletter's blurb/lede/lineup (AgentMail/directories are discovery-only).
- Historical archive backfill.
- "Zero competitors" / fabricated TAM marketing claims (see §2.8).

### 2.5 Acceptance criteria for launch

- Every rendered news item links to a real, live **primary source URL present in the fetched set**; grep of any send for a stat/quote lacking a source link returns **zero**.
- Confirmation email gates sending; unconfirmed addresses are never emailed a daily.
- Unsubscribe token is unguessable (UUID/HMAC, not a raw PK) and honored within 2 days; one-click `List-Unsubscribe` works from Gmail/Yahoo.
- Re-running the send job for the same date inserts **0** new `sends` rows (idempotency verified).
- Test send lands in Gmail **inbox** (mail-tester ≥ 9/10) with footer physical address.
- 3 categories generate cleanly across 3 seniority buckets; human reviewer signs off 5 consecutive days.
- 15 `/ai-for/[career]` hubs render server-side, are in `/sitemap.xml`, and are indexable; seniority/daily variants return `noindex`.
- Signed-in user sees the **last 14 days** of their category (no fabricated counts).
- Pro is purchasable via Stripe; the displayed price is identical on landing, checkout, email, and archive.
- Daily send reliable for 14 days; complaint rate < 0.10%; opens tracked.

### 2.6 Required mobile states

- **Email**: mobile-first, single-column, max-width 640px, inline CSS, dark header (#0B0C10) + amber accent (#F2A900); tappable source links ≥ 44px targets; renders correctly in Gmail iOS/Android and Apple Mail.
- **Landing/onboarding/archive web**: responsive down to 360px; sticky CTA on mobile; resume upload and LinkedIn input usable one-handed; sample preview swipeable.

### 2.7 Loading, error, empty, and failure states

| State | Behavior |
|---|---|
| **Loading** | Onboarding profile parse shows honest progress ("Reading your LinkedIn…", "Parsing your resume…") — labeled best-effort, never asserting a false inference. Archive/sample show skeleton blocks. |
| **Error** | Proxycurl/resume parse failure → fall back to manual career + seniority selection with a friendly note ("We couldn't read that — pick your role and we'll tailor it"). Stripe checkout error → retry + support link. |
| **Empty** | New category with < 14 days of archive → show what exists + "more arrives daily." Block with no grounded items → **omit the block gracefully** (never fabricate to fill). |
| **Failure** | News-API/lane outage → generate from available lanes; if a category has zero grounded items for a day, **skip the send** for that variant rather than send fabricated content. Resend send failure → retry with backoff; bounce/complaint webhook → set `is_active=0`. |

### 2.8 Privacy-sensitive data — must NOT be sent to analytics/ad platforms

Do **not** send to PostHog / GA4 / Google Ads / Meta Ads:
- Email addresses (use hashed/anonymized IDs only).
- LinkedIn profile URLs, parsed resume text, employer/company, job title, or any raw profile field.
- Resume file contents or filenames.
- Consent-log fields (IP, checkbox text).
- Stripe customer identifiers / payment data.

Allowed in analytics: anonymized event IDs, coarse career-category and seniority-tier labels (non-identifying), funnel step events, aggregate counts. Profile data stays in Supabase (RLS-protected), not in client analytics payloads.

### 2.9 Allowed claims vs claims to avoid

**Allowed claims:**
- "Personalized to your career and seniority."
- "Every item cites a real primary source."
- "AI news that matters to your role — not a generic firehose."
- "Personalization within one product, across any career" (the honest wedge).
- Real, verifiable subscriber/market anchors only if accurate at the time (e.g., newsletter CPM ranges as industry context) — sourced.

**Claims to avoid (hard rule — emphasized):**
- **No fabricated news, stats, quotes, headlines, sources, or funding numbers.** Every item must cite a real primary source present in the fetched set.
- **No "zero competitors" / "no one does career personalization."** This is false (Mindstream, The Rundown University role-based onboarding, Refind/Particle per-interest personalization exist).
- **No fabricated TAM/market stats** (drop "$5.8B skills-assessment", "$17.8B newsletter by 2028", "$291.85B/41.5% CAGR", "65% of job seekers / 38% higher hire rates" — all unverified/misquoted).
- **No fabricated archive counts** (e.g., "500+ archive"). Show the real, accreting count only.
- **No false inference about a user's own data** (no `Math.random()` career assignment presented as "analysis"; parsing is labeled best-effort + correctable).
