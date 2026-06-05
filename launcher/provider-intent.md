# Provider Intent — My Daily Download

Domain: **mydailydownload.com** (registered in Vercel, team `miguel-sanchezgrices-projects`, nameservers on Vercel DNS ✔). Secrets are shared out-of-band (never in repo). Status legend: **NEW** = create now · **HAVE** = token/access already available to the build · **PENDING** = waiting on Miguel.

| Provider | Need | Status | Purpose | What I need from you |
|---|---|---|---|---|
| **Vercel** | yes | HAVE (CLI authed as `msanchezgrice-9758`) | Hosting, Vercel Cron, DNS for mydailydownload.com | Authorized — I'll create the project + DNS records |
| **GitHub** | yes | HAVE (`gh` authed as `msanchezgrice`) | Repo `mydailydownload` | Authorized — I'll create a dedicated repo (not your home repo) |
| **OpenAI** | yes | PENDING | gpt-4o-mini grounded summarization | `OPENAI_API_KEY` |
| **Resend** | yes | PENDING (you said token may exist) | Email send + domain auth (SPF/DKIM/DMARC) + bounce webhook | `RESEND_API_KEY` (+ confirm I can verify mydailydownload.com) |
| **Supabase** | yes | PENDING (you said token may exist) | Postgres (subscribers, news_items, briefings, sends) | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (or authorize the Supabase plugin) |
| **AgentMail** | yes | PENDING | Newsletter-discovery inbox (subscribe to incumbents) | `AGENTMAIL_API_KEY` (Developer tier ~$20/mo) |
| **Exa** | yes | PENDING | Neural news search / recall | `EXA_API_KEY` |
| **Tavily** | yes | PENDING | News search gap-fill | `TAVILY_API_KEY` |
| **Proxycurl** | yes | PENDING (approved) | Real LinkedIn profile parsing | `PROXYCURL_API_KEY` |
| **Stripe** | yes | PENDING | Pro $15–19 checkout | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (test mode first) |
| **PostHog** | yes | HAVE (MCP connected) | Product analytics | confirm target project (current MCP project = "Surgery Viz"; likely want a NEW "My Daily Download" project) |
| **GA4** | yes | PENDING (you said access exists) | Web analytics | GA4 Measurement ID (`G-XXXX`) for mydailydownload.com |
| **Google Search Console** | yes | PENDING (you said access exists) | SEO indexing/measurement | verify mydailydownload.com property (I'll add the DNS TXT or you confirm access) |
| **IndexNow** | yes | NEW | Instant SEO submission | none — I generate the key file |
| **X / Twitter** | yes | PENDING | 5 vertical handles: Marketing, Product, Founder, Sales, Design + brand master | create handles (or authorize); confirm naming (e.g. `@MDD_Marketing`) |
| **Facebook** | yes | HAVE (page **Mydailydownload**) | Social presence | confirm page id / access |
| **Support inbox** | yes | PENDING | support@mydailydownload.com | create the mailbox (Google Workspace / forwarding) |

## ACTION — keys to send me (out-of-band), in priority order

**Phase 1 (real-news engine):** `OPENAI_API_KEY`, `EXA_API_KEY`, `TAVILY_API_KEY`, `AGENTMAIL_API_KEY`, Supabase URL+service key.
**Phase 2 (onboarding/parsing):** `PROXYCURL_API_KEY`.
**Phase 3 (sending/compliance):** `RESEND_API_KEY` (+ OK to verify the domain), confirm support@ mailbox.
**Phase 3–4 (billing/analytics/SEO):** `STRIPE_SECRET_KEY`, GA4 `G-XXXX`, confirm Search Console access, confirm/create the PostHog project.

Nothing above blocks **Phase 0** (the local demo) — that needs no keys.
