"""Render standalone example briefings for the founder.

Writes examples/{category}.html for the 3 launch categories at Mid Level so they
can be opened directly in a browser. Real, cited content — straight from the
guardrail-validated engine. The compliance footer is appended so the examples
look exactly like what a subscriber receives.

CLI:
    .venv/bin/python render_examples.py
"""
import os
import sys

from news_engine import build_briefing
from newsletter_generator import compile_newsletter, render_html_email
from config import CAREER_ID_MAP
from mailer import _inject_footer_html

EXAMPLE_CATEGORIES = ["marketing", "product-management", "entrepreneurship"]
SENIORITY = "Mid Level"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "examples")


def render_examples() -> list:
    os.makedirs(OUT_DIR, exist_ok=True)
    written = []
    for career_id in EXAMPLE_CATEGORIES:
        career = CAREER_ID_MAP[career_id]
        briefing = build_briefing(career_id, seniority=SENIORITY)
        content = compile_newsletter(career, briefing)
        # subscriber_id "example" -> harmless placeholder unsubscribe link
        html = render_html_email(career["name"], content, subscriber_id="example")
        # Append the same compliance footer real sends carry.
        html = _inject_footer_html(html, "example")

        path = os.path.join(OUT_DIR, f"{career_id}.html")
        with open(path, "w") as f:
            f.write(html)

        top = briefing.get("topStory")
        written.append({
            "career_id": career_id,
            "path": path,
            "bytes": len(html.encode()),
            "top_headline": top["headline"] if top else "(none)",
            "top_url": top["url"] if top else None,
        })
    return written


if __name__ == "__main__":
    rows = render_examples()
    print("=== examples rendered ===")
    for r in rows:
        print(f"\n{r['career_id']}  ->  {r['path']}  ({r['bytes']} bytes)")
        print(f"   top: {r['top_headline']}")
        print(f"   url: {r['top_url']}")
    sys.exit(0)
