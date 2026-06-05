# Daily AI Edge — Newsletter Backend

A complete daily newsletter generation system that:
1. **Analyzes career profiles** from LinkedIn URLs or resume text (via LLM)
2. **Researches AI news** relevant to each career category (via LLM + web search)
3. **Compiles personalized newsletters** with top stories, tools, how-tos, and stats
4. **Delivers via email** (via Resend API)
5. **Runs on a cron schedule** (daily at your configured time)

## Quick Start

### 1. Install dependencies
```bash
cd newsletter-backend
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

Required:
- **OpenAI API key** or **Anthropic API key** (for LLM-powered analysis and content generation)
- **Resend API key** (for email delivery — free tier: 3,000 emails/day)

### 3. Add your first subscriber
```bash
python run.py --add-subscriber your@email.com product-management
```

### 4. Send a test newsletter
```bash
python run.py --test product-management your@email.com
```

### 5. Run the daily scheduler
```bash
python run.py --schedule
```

Or run once manually:
```bash
python run.py --once
```

## Architecture

```
run.py                  — Main entry point (CLI + scheduler)
career_analyzer.py      — LLM-powered profile extraction
newsletter_generator.py — Research + content compilation + HTML rendering
email_sender.py         — Resend API integration
subscribers.py          — SQLite database for subscriber management
config.py               — Configuration and career categories
```

## Career Categories

15 career verticals are supported out of the box:

| ID | Name |
|----|------|
| product-management | Product Manager |
| marketing | Marketing |
| sales | Sales |
| operations | Operations |
| hr-people | HR & People |
| design | Design |
| finance | Finance |
| engineering | Engineering |
| data-science | Data Science |
| customer-success | Customer Success |
| content-creation | Content Creation |
| consulting | Consulting |
| legal | Legal |
| healthcare | Healthcare |
| entrepreneurship | Entrepreneurship |

## Deployment Options

### Option A: VPS / Cloud Server (Recommended)
Run the scheduler as a systemd service or use PM2:
```bash
# Using PM2
pm2 start run.py --name daily-ai-edge -- --schedule
pm2 save
pm2 startup
```

### Option B: Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py", "--schedule"]
```

### Option C: GitHub Actions (Free cron)
Use GitHub Actions' scheduled workflows to run daily at no cost.

### Option D: AWS Lambda + EventBridge
Serverless deployment with scheduled triggers.

## Database Schema

SQLite database with a single `subscribers` table:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| email | TEXT UNIQUE | Subscriber email |
| career_id | TEXT | Career category ID |
| seniority | TEXT | Entry/Mid/Senior/Director/C-Suite |
| interests | TEXT (JSON) | Array of interest tags |
| plan | TEXT | free or pro |
| delivery_time | TEXT | morning/midday/evening |
| profile_json | TEXT (JSON) | Full LLM-analyzed profile |
| is_active | INTEGER | 1=active, 0=unsubscribed |
| created_at | TEXT | ISO timestamp |
| last_sent_at | TEXT | ISO timestamp |

## CLI Reference

```bash
# Send newsletters now (one-time run)
python run.py --once

# Start daily scheduler
python run.py --schedule

# Send test email
python run.py --test product-management your@email.com

# Show subscriber stats
python run.py --stats

# Add subscriber
python run.py --add-subscriber your@email.com product-management

# Unsubscribe
python run.py --unsubscribe your@email.com
```

## Cost Estimates

At 1,000 subscribers across 15 career categories:

| Component | Cost |
|-----------|------|
| LLM (OpenAI gpt-4o-mini) | ~$0.50/day for 15 career newsletters |
| Email (Resend) | Free (under 3,000/day) |
| Hosting (VPS) | $5-10/month |
| **Total** | **~$20-35/month** |

## Production Checklist

- [ ] Switch from LLM-simulated news to real news APIs (NewsAPI, Google Custom Search)
- [ ] Implement LinkedIn profile scraping (Proxycurl API or similar)
- [ ] Implement resume PDF parsing (pdfplumber)
- [ ] Set up proper email templates with unsubscribe tracking
- [ ] Add analytics (open rates, click tracking via Resend webhooks)
- [ ] Add rate limiting and retry logic for email sends
- [ ] Set up monitoring and alerts
- [ ] Implement subscriber preference management UI
- [ ] Add A/B testing for subject lines
