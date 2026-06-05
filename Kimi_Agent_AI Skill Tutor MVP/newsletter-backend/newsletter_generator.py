"""Daily AI newsletter generator.

For each subscriber's career category:
1. Search for latest AI news relevant to that career
2. Use LLM to compile personalized newsletter content
3. Generate HTML email using Jinja2 template
"""
import re
import json
import sqlite3
from datetime import datetime
from typing import List, Dict
from jinja2 import Template
from config import (
    LLM_PROVIDER, OPENAI_API_KEY, ANTHROPIC_API_KEY, LLM_MODEL,
    CAREER_CATEGORIES, MAX_NEWS_ITEMS, MAX_TOOLS,
)


# ─── HTML Email Template ───
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Daily AI Edge for {{ career_name }}</title>
<style>
body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.container { max-width: 640px; margin: 0 auto; background: #ffffff; }
.header { background: #0B0C10; padding: 24px 32px; text-align: center; }
.header h1 { color: #F2A900; font-size: 20px; margin: 0; font-weight: 700; }
.header p { color: #7A8194; font-size: 13px; margin: 6px 0 0; }
.body { padding: 32px; }
.section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #F2A900; margin: 0 0 8px; }
.top-story h2 { font-size: 18px; color: #1A1D23; margin: 0 0 12px; line-height: 1.4; }
.top-story p { font-size: 14px; color: #555; line-height: 1.7; margin: 0; }
.tool-box { background: #FFF8E7; border-left: 3px solid #F2A900; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0; }
.tool-box .name { font-size: 15px; font-weight: 600; color: #1A1D23; margin: 0 0 4px; }
.tool-box .desc { font-size: 13px; color: #555; margin: 0; line-height: 1.6; }
.quick-hits { margin: 20px 0; }
.hit { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
.hit:last-child { border-bottom: none; }
.hit h4 { font-size: 14px; color: #1A1D23; margin: 0 0 4px; }
.hit p { font-size: 13px; color: #555; margin: 0; line-height: 1.5; }
.how-to { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
.how-to h3 { font-size: 15px; color: #1A1D23; margin: 0 0 8px; }
.how-to p { font-size: 13px; color: #555; margin: 0; line-height: 1.7; }
.stats { display: table; width: 100%; margin: 20px 0; }
.stat { display: table-cell; width: 50%; text-align: center; padding: 16px; background: #f8f9fa; }
.stat:first-child { border-radius: 8px 0 0 8px; border-right: 4px solid #fff; }
.stat:last-child { border-radius: 0 8px 8px 0; }
.stat .value { font-size: 28px; font-weight: 700; color: #F2A900; }
.stat .label { font-size: 11px; color: #555; margin-top: 4px; line-height: 1.4; }
.upcoming { margin: 20px 0; font-size: 13px; color: #555; }
.upcoming strong { color: #1A1D23; }
.footer { background: #f8f9fa; padding: 24px 32px; text-align: center; font-size: 12px; color: #7A8194; }
.footer a { color: #F2A900; text-decoration: none; }
.cta { background: #0B0C10; padding: 24px 32px; text-align: center; margin: 24px -32px -32px; }
.cta a { color: #F2A900; font-size: 14px; font-weight: 600; text-decoration: none; }
.greeting { font-size: 14px; color: #1A1D23; margin: 0 0 24px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Daily AI Edge</h1>
    <p>Your morning briefing for {{ career_name }} &middot; {{ date }}</p>
  </div>

  <div class="body">
    <p class="greeting">Good morning! Here's your AI edge for <strong>{{ career_name }}</strong>.</p>

    <div class="section-label">The Big Story</div>
    <div class="top-story">
      <h2>{{ top_story.headline }}</h2>
      <p>{{ top_story.summary }}</p>
    </div>

    <div class="section-label">Tool of the Day</div>
    <div class="tool-box">
      <p class="name">{{ tool.name }}</p>
      <p class="desc">{{ tool.description }}</p>
    </div>

    <div class="section-label">Quick Hits</div>
    <div class="quick-hits">
      {% for hit in quick_hits %}
      <div class="hit">
        <h4>{{ hit.headline }}</h4>
        <p>{{ hit.description }}</p>
      </div>
      {% endfor %}
    </div>

    <div class="section-label">Quick How-To</div>
    <div class="how-to">
      <h3>{{ how_to.title }}</h3>
      <p>{{ how_to.content }}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="value">{{ stats.value1 }}</div>
        <div class="label">{{ stats.label1 }}</div>
      </div>
      <div class="stat">
        <div class="value">{{ stats.value2 }}</div>
        <div class="label">{{ stats.label2 }}</div>
      </div>
    </div>

    <div class="upcoming">
      <strong>Coming up:</strong> {{ upcoming.event }} &mdash; {{ upcoming.date }}
    </div>

    <div class="cta">
      <a href="https://dailyaiedge.com">Upgrade to Pro for the full briefing &rarr;</a>
    </div>
  </div>

  <div class="footer">
    <p>You're receiving this because you subscribed to Daily AI Edge.</p>
    <p><a href="{{ unsubscribe_url }}">Unsubscribe</a> &middot; <a href="{{ preferences_url }}">Update preferences</a></p>
    <p style="margin-top: 12px;">&copy; 2026 Daily AI Edge</p>
  </div>
</div>
</body>
</html>
"""


def get_llm_client():
    """Initialize LLM client."""
    if LLM_PROVIDER == "anthropic":
        import anthropic
        return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    else:
        import openai
        return openai.OpenAI(api_key=OPENAI_API_KEY)


def call_llm(system: str, user: str, json_mode: bool = False) -> str:
    """Call LLM and return text response."""
    client = get_llm_client()

    if LLM_PROVIDER == "anthropic":
        resp = client.messages.create(
            model=LLM_MODEL,
            max_tokens=4000,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return resp.content[0].text
    else:
        kwargs = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.5,
            "max_tokens": 4000,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content


def search_ai_news(career: dict) -> List[Dict]:
    """Search for latest AI news relevant to a career category.

    In production, this would use:
    - News API (newsapi.org)
    - Google Custom Search API
    - RSS feeds (TechCrunch, The Verge, etc.)
    - Twitter/X API for trending topics
    - Reddit API for discussions

    For the MVP, we simulate with LLM-generated realistic content.
    """
    system = """You are an AI news researcher. Find the latest (2026) AI news, tools,
    and developments relevant to a specific career. Return a JSON array of news items.

    Each item should have:
    - headline: compelling headline
    - description: 2-3 sentence summary
    - source: likely source (e.g., "TechCrunch", "The Verge")
    - is_major: true if this is the top story

    Include a mix of: product launches, funding news, research breakthroughs,
    and practical tool announcements. Make them realistic and specific."""

    user = f"Career: {career['name']}\nSearch context: {career['search_terms']}\n\nReturn {MAX_NEWS_ITEMS} news items as JSON."

    result = call_llm(system, user, json_mode=True)

    try:
        data = json.loads(result)
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        if isinstance(data, dict):
            # Try to find array in values
            for v in data.values():
                if isinstance(v, list):
                    return v[:MAX_NEWS_ITEMS]
        if isinstance(data, list):
            return data[:MAX_NEWS_ITEMS]
    except (json.JSONDecodeError, KeyError):
        pass

    # Fallback: return realistic items
    return _fallback_news(career["name"])


def compile_newsletter(career: dict, news_items: List[Dict]) -> dict:
    """Use LLM to compile news items into a structured newsletter."""
    # Pick the major story as top story, rest as quick hits
    major = next((n for n in news_items if n.get("is_major")), news_items[0]) if news_items else None
    others = [n for n in news_items if n != major][:3]

    system = f"""You are an expert newsletter editor for "Daily AI Edge," a personalized
    AI briefing for {career['name']}s. Create engaging, scannable content.

    Return ONLY a JSON object with this exact structure:
    {{
        "topStory": {{"headline": "...", "summary": "..."}},
        "toolOfTheDay": {{"name": "...", "description": "..."}},
        "howTo": {{"title": "...", "content": "..."}},
        "stats": {{"value1": "X%", "label1": "...", "value2": "Yx", "label2": "..."}},
        "upcoming": {{"event": "...", "date": "Month Day, 2026"}}
    }}"""

    news_text = "\n\n".join([
        f"- {n['headline']}: {n['description']}"
        for n in news_items
    ])

    user = f"Career: {career['name']}\n\nNews items:\n{news_text}\n\nCompile these into a newsletter."

    result = call_llm(system, user, json_mode=True)

    try:
        compiled = json.loads(result)
    except json.JSONDecodeError:
        compiled = _fallback_compiled(career["name"])

    return {
        "topStory": compiled.get("topStory", compiled.get("top_story", {"headline": "AI Update", "summary": "Latest developments in AI."})),
        "toolOfTheDay": compiled.get("toolOfTheDay", compiled.get("tool_of_the_day", {"name": "ChatGPT", "description": "General-purpose AI assistant."})),
        "quickHits": [
            {"headline": n["headline"], "description": n["description"]}
            for n in others
        ] if others else [{"headline": "AI Market Update", "description": "Continued growth in AI adoption."}],
        "howTo": compiled.get("howTo", compiled.get("how_to", {"title": "Get Started with AI", "content": "Pick one AI tool and use it for 15 minutes daily."})),
        "stats": compiled.get("stats", {"value1": "75%", "label1": "of teams using AI", "value2": "2.5x", "label2": "productivity gain"}),
        "upcoming": compiled.get("upcoming", {"event": "AI Summit 2026", "date": "March 2026"}),
    }


def render_html_email(career_id: str, career_name: str, content: dict, subscriber_id: str = "") -> str:
    """Render newsletter content into HTML email."""
    template = Template(EMAIL_TEMPLATE)
    return template.render(
        career_name=career_name,
        date=datetime.now().strftime("%B %d, %Y"),
        top_story=content["topStory"],
        tool=content["toolOfTheDay"],
        quick_hits=content["quickHits"],
        how_to=content["howTo"],
        stats=content["stats"],
        upcoming=content["upcoming"],
        unsubscribe_url=f"https://dailyaiedge.com/unsubscribe?id={subscriber_id}",
        preferences_url=f"https://dailyaiedge.com/preferences?id={subscriber_id}",
    )


def generate_newsletter(career_id: str, subscriber_id: str = "") -> dict:
    """Generate a complete newsletter for a career category.

    Returns:
        {
            "career_id": "product-management",
            "career_name": "Product Manager",
            "subject": "Your AI Edge for Product Manager — June 6, 2026",
            "html": "<html>...</html>",
            "text": "Plain text version..."
        }
    """
    career = next((c for c in CAREER_CATEGORIES if c["id"] == career_id), CAREER_CATEGORIES[0])

    # Step 1: Search for relevant news
    news_items = search_ai_news(career)

    # Step 2: Compile into structured content
    content = compile_newsletter(career, news_items)

    # Step 3: Render HTML
    html = render_html_email(career_id, career["name"], content, subscriber_id)

    # Step 4: Generate plain text
    text = f"""Daily AI Edge — {career['name']} Briefing — {datetime.now().strftime('%B %d, %Y')}

{content['topStory']['headline']}
{content['topStory']['summary']}

TOOL OF THE DAY: {content['toolOfTheDay']['name']}
{content['toolOfTheDay']['description']}

QUICK HITS:
""" + "\n\n".join([f"• {h['headline']}: {h['description']}" for h in content['quickHits']]) + f"""

HOW-TO: {content['howTo']['title']}
{content['howTo']['content']}

IN NUMBERS:
{content['stats']['value1']} — {content['stats']['label1']}
{content['stats']['value2']} — {content['stats']['label2']}

COMING UP: {content['upcoming']['event']} — {content['upcoming']['date']}

---
You're receiving this because you subscribed to Daily AI Edge.
Unsubscribe: https://dailyaiedge.com/unsubscribe?id={subscriber_id}
"""

    return {
        "career_id": career_id,
        "career_name": career["name"],
        "subject": f"Your AI Edge for {career['name']} — {datetime.now().strftime('%B %d, %Y')}",
        "html": html,
        "text": text,
    }


# ─── Fallback data generators ───

def _fallback_news(career_name: str) -> List[Dict]:
    return [
        {
            "headline": f"Major AI Platform Launches Career-Specific Features for {career_name}s",
            "description": f"A leading AI company announced specialized tools designed specifically for {career_name.lower()}s, promising 40% productivity gains.",
            "source": "TechCrunch",
            "is_major": True,
        },
        {
            "headline": "OpenAI Releases New Enterprise API with Enhanced Security",
            "description": "The update includes SOC 2 compliance, audit logs, and team management features for organizations.",
            "source": "The Verge",
        },
        {
            "headline": "Google DeepMind Publishes Breakthrough Research on AI Reasoning",
            "description": "The new model demonstrates significant improvements in multi-step reasoning tasks.",
            "source": "MIT Technology Review",
        },
    ]


def _fallback_compiled(career_name: str) -> dict:
    return {
        "topStory": {"headline": f"AI Tools Reshaping {career_name} Work", "summary": f"New AI capabilities are transforming how {career_name.lower()}s approach their daily work, with early adopters reporting significant productivity gains."},
        "toolOfTheDay": {"name": "ChatGPT Team", "description": "Collaborative AI workspace for teams. Share conversations, build custom GPTs, and maintain team knowledge."},
        "howTo": {"title": f"Automate a {career_name} Task in 10 Minutes", "content": "Identify one repetitive task you do daily. Write a simple prompt describing the task and desired output. Test with ChatGPT or Claude, refine the prompt, and integrate into your workflow."},
        "stats": {"value1": "73%", "label1": f"of {career_name.lower()}s using AI tools", "value2": "2.4x", "label2": "productivity improvement"},
        "upcoming": {"event": f"AI for {career_name}s Summit", "date": "March 15, 2026"},
    }


# ─── CLI for testing ───
if __name__ == "__main__":
    import sys
    career_id = sys.argv[1] if len(sys.argv) > 1 else "product-management"
    result = generate_newsletter(career_id)
    print(f"Subject: {result['subject']}")
    print(f"\nHTML length: {len(result['html'])} chars")
    print(f"\nText preview:\n{result['text'][:500]}...")
