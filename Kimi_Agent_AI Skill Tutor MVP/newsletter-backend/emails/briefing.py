"""Briefing email renderer.

Thin wrapper over the existing, guardrail-safe newsletter_generator so we don't
duplicate the rendering pipeline. Used by mailer.send_briefing when a caller
passes a *structured* briefing (no pre-rendered html) rather than the output of
generate_newsletter().

Returns (html, text, subject). Every URL is real — the underlying engine's
guardrail guarantees it.
"""
from datetime import datetime


def render_briefing_email(sub: dict, briefing: dict, unsub_token: str):
    """Render a structured briefing (from news_engine.build_briefing) into a
    sendable (html, text, subject) using the existing generator's renderers."""
    from newsletter_generator import (
        compile_newsletter, render_html_email, _render_text_email,
    )
    from config import CAREER_ID_MAP

    career_id = briefing.get("category_id") or sub.get("career_id", "")
    career = CAREER_ID_MAP.get(career_id, {"id": career_id, "name": briefing.get("category_name", career_id)})

    content = compile_newsletter(career, briefing)
    subscriber_id = unsub_token  # drives the unsubscribe/preferences links in the body
    html = render_html_email(career["name"], content, subscriber_id)
    text = _render_text_email(career["name"], content, subscriber_id)
    subject = f"Your AI briefing for {career['name']} — {datetime.now().strftime('%B %d, %Y')}"
    return html, text, subject
