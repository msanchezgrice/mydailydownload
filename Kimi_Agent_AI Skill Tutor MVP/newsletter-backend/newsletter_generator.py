"""Daily AI newsletter generator.

For each subscriber's career category:
1. Pull REAL, CITED news from the news engine (RSS-backed, zero API keys
   required). Every item carries a real source name + URL.
2. Optionally rewrite each item's summary with a STRICT grounded LLM prompt
   (only if OPENAI_API_KEY is set) — adds no facts, keeps every URL.
3. Render an HTML email in which every fact/headline links to a real source.

NO-FABRICATION GUARANTEE (load-bearing):
  - There is NO code path that invents a headline, stat, quote, tool, or URL.
  - The old `search_ai_news()` (LLM-as-source) and `_fallback_*` invented
    stats have been deleted.
  - Blocks that genuinely require curation we cannot derive from RSS
    (Tool of the Day, By-the-Numbers stats, Upcoming events) are OMITTED
    rather than fabricated. They only render if a real, sourced value exists.
  - news_engine.validate() enforces that every rendered URL came from the
    fetched feed set (hard invariant).
"""
import re
import json
from datetime import datetime
from typing import List, Dict
from jinja2 import Template
from config import (
    CAREER_CATEGORIES, MAX_NEWS_ITEMS,
)
from news_engine import build_briefing


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
.src { font-size: 12px; color: #7A8194; margin: 8px 0 0; }
.src a { color: #F2A900; text-decoration: none; }
.sources-list { margin: 20px 0 0; }
.sources-list .src-item { font-size: 12px; color: #555; margin: 0 0 6px; }
.sources-list a { color: #F2A900; text-decoration: none; word-break: break-all; }
.dow { font-size: 12px; color: #7A8194; margin: 0 0 16px; font-style: italic; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>My Daily Download</h1>
    <p>Your morning briefing for {{ career_name }} &middot; {{ date }}</p>
  </div>

  <div class="body">
    <p class="greeting">Good morning! Here's your AI briefing for <strong>{{ career_name }}</strong>.</p>
    {% if dow_theme %}<p class="dow">{{ dow_theme }} &mdash; {{ dow_blurb }}</p>{% endif %}

    {% if top_story %}
    <div class="section-label">The Big Story</div>
    <div class="top-story">
      <h2>{{ top_story.headline }}</h2>
      {% if top_story.summary %}<p>{{ top_story.summary }}</p>{% endif %}
      <p class="src">Source: <a href="{{ top_story.url }}">{{ top_story.source }}</a></p>
    </div>
    {% endif %}

    {# Tool of the Day renders ONLY if a real, sourced tool exists. We never fabricate it. #}
    {% if tool and tool.url %}
    <div class="section-label">Tool of the Day</div>
    <div class="tool-box">
      <p class="name">{{ tool.name }}</p>
      <p class="desc">{{ tool.description }}</p>
      <p class="src">Source: <a href="{{ tool.url }}">{{ tool.source }}</a></p>
    </div>
    {% endif %}

    {% if quick_hits %}
    <div class="section-label">Quick Hits</div>
    <div class="quick-hits">
      {% for hit in quick_hits %}
      <div class="hit">
        <h4>{{ hit.headline }}</h4>
        {% if hit.description %}<p>{{ hit.description }}</p>{% endif %}
        <p class="src">Source: <a href="{{ hit.url }}">{{ hit.source }}</a></p>
      </div>
      {% endfor %}
    </div>
    {% endif %}

    {# By-the-Numbers stats render ONLY with a real cited source. Never invented. #}
    {% if stats and stats.source_url %}
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
    <p class="src">Source: <a href="{{ stats.source_url }}">{{ stats.source }}</a></p>
    {% endif %}

    {% if sources %}
    <div class="section-label">Sources</div>
    <div class="sources-list">
      {% for s in sources %}
      <p class="src-item">&middot; {{ s.name }}: <a href="{{ s.url }}">{{ s.url }}</a></p>
      {% endfor %}
    </div>
    {% endif %}

    <div class="cta">
      <a href="https://mydailydownload.com">Upgrade to Pro for the full briefing &rarr;</a>
    </div>
  </div>

  <div class="footer">
    <p>You're receiving this because you subscribed to My Daily Download.</p>
    <p><a href="{{ unsubscribe_url }}">Unsubscribe</a> &middot; <a href="{{ preferences_url }}">Update preferences</a></p>
    <p style="margin-top: 12px;">&copy; 2026 My Daily Download</p>
  </div>
</div>
</body>
</html>
"""


def search_ai_news(career: dict) -> List[Dict]:
    """REAL, CITED news for a career category — drawn from the news engine.

    This replaces the old LLM-fabrication path. Returns a list of real feed
    items, each with a real source URL. NEVER invents headlines or sources.

    Returns items shaped:
        {headline, description, source, url, published, is_major, trending_score}
    """
    briefing = build_briefing(career["id"])
    items: List[Dict] = []
    top = briefing.get("topStory")
    if top:
        items.append({
            "headline": top["headline"],
            "description": top["summary"],
            "source": top["source"],
            "url": top["url"],
            "published": top.get("published", ""),
            "is_major": True,
            "trending_score": top.get("trending_score", 1),
        })
    for hit in briefing.get("quickHits", []):
        items.append({
            "headline": hit["headline"],
            "description": hit["summary"],
            "source": hit["source"],
            "url": hit["url"],
            "published": hit.get("published", ""),
            "is_major": False,
            "trending_score": hit.get("trending_score", 1),
        })
    return items


def compile_newsletter(career: dict, briefing: dict) -> dict:
    """Shape a validated briefing into the structure the template renders.

    No LLM fabrication occurs here. Every field maps directly from real,
    guardrail-validated feed items. Blocks that require curation we cannot
    derive from RSS (tool of the day, by-the-numbers stats, upcoming events)
    are passed through as-is from the briefing — i.e. None — and the template
    omits them. We never synthesize them.
    """
    top = briefing.get("topStory")
    return {
        "topStory": {
            "headline": top["headline"],
            "summary": top["summary"],
            "source": top["source"],
            "url": top["url"],
        } if top else None,
        # Curation-only blocks: only render if the engine supplied a REAL,
        # sourced value. Today the engine returns None (honest omission).
        "toolOfTheDay": briefing.get("toolOfTheDay"),   # None -> omitted
        "stats": briefing.get("byTheNumbers"),          # None -> omitted
        "quickHits": [
            {
                "headline": h["headline"],
                "description": h["summary"],
                "source": h["source"],
                "url": h["url"],
            }
            for h in briefing.get("quickHits", [])
        ],
        "sources": briefing.get("sources", []),
        "dow_theme": briefing.get("dow_theme"),
        "dow_blurb": briefing.get("dow_blurb"),
    }


def render_html_email(career_name: str, content: dict, subscriber_id: str = "") -> str:
    """Render validated, sourced content into the HTML email."""
    template = Template(EMAIL_TEMPLATE)
    return template.render(
        career_name=career_name,
        date=datetime.now().strftime("%B %d, %Y"),
        dow_theme=content.get("dow_theme"),
        dow_blurb=content.get("dow_blurb"),
        top_story=content["topStory"],
        tool=content.get("toolOfTheDay"),
        quick_hits=content["quickHits"],
        stats=content.get("stats"),
        sources=content.get("sources", []),
        unsubscribe_url=f"https://mydailydownload.com/unsubscribe?token={subscriber_id}",
        preferences_url=f"https://mydailydownload.com/preferences?token={subscriber_id}",
    )


def _render_text_email(career_name: str, content: dict, subscriber_id: str = "") -> str:
    """Plain-text version — every item carries its real source URL."""
    lines = [
        f"My Daily Download - {career_name} Briefing - {datetime.now().strftime('%B %d, %Y')}",
    ]
    if content.get("dow_theme"):
        lines.append(f"{content['dow_theme']} - {content['dow_blurb']}")
    lines.append("")

    top = content.get("topStory")
    if top:
        lines.append("THE BIG STORY")
        lines.append(top["headline"])
        if top["summary"]:
            lines.append(top["summary"])
        lines.append(f"Source: {top['source']} - {top['url']}")
        lines.append("")

    if content["quickHits"]:
        lines.append("QUICK HITS")
        for h in content["quickHits"]:
            lines.append(f"* {h['headline']}")
            if h["description"]:
                lines.append(f"  {h['description']}")
            lines.append(f"  Source: {h['source']} - {h['url']}")
        lines.append("")

    if content.get("sources"):
        lines.append("SOURCES")
        for s in content["sources"]:
            lines.append(f"- {s['name']}: {s['url']}")
        lines.append("")

    lines.append("---")
    lines.append("You're receiving this because you subscribed to My Daily Download.")
    lines.append(f"Unsubscribe: https://mydailydownload.com/unsubscribe?token={subscriber_id}")
    return "\n".join(lines)


def generate_newsletter(career_id: str, subscriber_id: str = "") -> dict:
    """Generate a complete, REAL, CITED newsletter for a career category.

    Pipeline: news_engine.build_briefing() (fetch real RSS -> canonicalize ->
    dedupe -> rank -> grounded-summarize -> GUARDRAIL) -> shape -> render.

    Every emitted fact/headline links to a real source URL present in the
    fetched feed set. There is no fabrication path.

    Returns: {career_id, career_name, subject, html, text}
    """
    career = next((c for c in CAREER_CATEGORIES if c["id"] == career_id), CAREER_CATEGORIES[0])

    # Step 1: real, cited, guardrail-validated briefing.
    briefing = build_briefing(career["id"])

    # Step 2: shape into render-ready content (no fabrication).
    content = compile_newsletter(career, briefing)

    # Step 3 + 4: render HTML + plain text, both with source URLs.
    html = render_html_email(career["name"], content, subscriber_id)
    text = _render_text_email(career["name"], content, subscriber_id)

    return {
        "career_id": career_id,
        "career_name": career["name"],
        "subject": f"Your AI briefing for {career['name']} - {datetime.now().strftime('%B %d, %Y')}",
        "html": html,
        "text": text,
    }


# --- CLI for testing ---
if __name__ == "__main__":
    import sys
    career_id = sys.argv[1] if len(sys.argv) > 1 else "product-management"
    result = generate_newsletter(career_id)
    print(f"Subject: {result['subject']}")
    print(f"\nHTML length: {len(result['html'])} chars")
    print(f"\nText:\n{result['text']}")
