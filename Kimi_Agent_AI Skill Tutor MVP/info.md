# Product Brief: Daily AI Edge — MVP Newsletter

## Product Overview
A personalized daily AI newsletter for working professionals. Users sign up, tell us their career (via LinkedIn/resume upload or manual selection), and get a daily email with AI news, tools, and tips tailored to their specific role.

## Target Audience
Working professionals (non-technical) in roles like: Product Management, Marketing, Sales, Operations, HR, Design, Finance, Consulting, Engineering, Data Science, Customer Success, Content Creation, Entrepreneurship, Legal, Healthcare.

## Key Insight from Research
No AI newsletter offers career-specific personalization. The Rundown (2M subs), Superhuman (1.5M subs), TLDR AI (1.25M subs) all send the same content to everyone. The opportunity is a hyper-personalized daily briefing per career vertical.

## Pages Needed

### 1. Landing Page (/)
- Hero: "AI news that actually matters to your career" — daily briefing personalized to your role
- How it works (3 steps): 1) Share your career 2) We research AI for you 3) Daily email with what matters
- Career categories grid (show all the roles we cover)
- Sample newsletter preview (interactive — click a career to see a sample)
- Social proof ("Join 2,000+ professionals building their AI edge")
- Pricing: Free tier (basic daily briefing), Pro ($12/mo — full analysis + tools + tutorials)
- FAQ section
- CTA section

### 2. Onboarding Flow (/onboarding)
Multi-step wizard:
- Step 1: "Let's understand your career" — LinkedIn URL input (optional) + Resume PDF upload (optional) + Email input. Large friendly form.
- Step 2: "Confirm your career profile" — Show LLM-extracted info (mock): Job title, Company, Industry, Seniority. Editable. Dropdown to pick career category (Product, Marketing, Sales, Ops, etc. 15 options). Sub-categories based on selection.
- Step 3: "You're all set!" — Show sample of what their newsletter will look like. Button to subscribe/confirm. Show delivery time preference (morning/evening).

### 3. Sample Newsletter Page (/sample/:career)
- Show a mock daily newsletter for a specific career
- Header: "Your Daily AI Edge for [Career]"
- Sections: Top News (3 items), New Tools (2-3), How-To Tip, Upcoming Events
- Looks like an email but rendered as a web page
- CTA: "Get this in your inbox every day — free"

## Design Direction
- Clean, modern, professional
- Dark navy/slate primary with warm accent (amber/gold for "edge")
- Trust-building — this is a daily email product, needs to feel reliable
- Not too flashy — business professionals
- Mobile-first for the email but desktop landing page
- Typography: Clean sans-serif, good readability

## Reference Site
myaiskilltutor.com — existing brand, similar audience. Current messaging: "Your dedicated AI copilot for career growth." Current pricing: $49.99/mo. Current features: career modules, AI tutor, daily news, portfolio.

## Newsletter Generation (Backend — separate deliverable)
Python cron job that:
1. For each subscriber's career category, searches latest AI news/tools
2. Uses LLM (GPT-4) to compile into personalized newsletter sections
3. Generates HTML email
4. Sends via Resend API
5. Runs daily at subscriber's preferred time
