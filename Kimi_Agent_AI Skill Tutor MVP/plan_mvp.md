# MVP Plan: AI Career Newsletter

## Product: "The Daily AI Edge" — Personalized AI Newsletter for Your Career

## Deliverables

### 1. Frontend: React SPA (3 pages)
- **Landing Page**: Hero section, social proof, how it works, pricing, FAQ, CTA
- **Onboarding Flow**: Multi-step wizard
  - Step 1: LinkedIn URL (optional) + Resume PDF upload (optional) + Email
  - Step 2: LLM-analyzed career profile (editable) + Category dropdown picker
  - Step 3: Confirmation + sample newsletter preview
- **Sample Newsletter Page**: Shows what the daily email looks like for a chosen career

### 2. Backend: Python Newsletter Engine
- `newsletter_generator.py`: Daily cron job that:
  1. Loads subscriber career categories
  2. Does web research on AI news/tools per category
  3. Uses LLM to compile personalized newsletter content
  4. Outputs HTML email ready to send
- `email_sender.py`: Integration with email provider (Resend/SendGrid)
- `career_analyzer.py`: LLM pipeline to extract career info from LinkedIn/resume text

### 3. Architecture
- Frontend: React + Tailwind + shadcn/ui
- Backend: Python scripts (run as cron jobs)
- LLM: OpenAI/Anthropic API for content generation
- Email: Resend API (simple, modern, free tier: 3K emails/day)

## Build Order
1. Init project with webapp-building-swarm
2. Design (Pro_Designer subagent)
3. Build frontend (landing + onboarding + sample newsletter)
4. Build backend scripts (newsletter generator + career analyzer)
5. Deploy frontend
