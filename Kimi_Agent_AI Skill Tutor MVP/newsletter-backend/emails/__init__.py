"""Email templates for "My Daily Download" (Phase 3).

All renderers return (html, text) — branded HTML (dark void header + amber,
light readable body, per design/DESIGN.md) plus a plain-text alternative.

The compliance footer (unsubscribe link + physical mailing address placeholder
+ © brand line) is injected centrally by mailer.send_email, so these templates
focus on the message body. They never fabricate content: any briefing teaser is
pulled from the real, guardrail-validated news engine.

Public API:
    render_welcome(sub, unsub_token)               -> (html, text)
    render_confirmation(sub, confirm_token, unsub) -> (html, text)
    render_briefing_email(sub, briefing, unsub)    -> (html, text, subject)
"""
from .welcome import render_welcome
from .confirmation import render_confirmation
from .briefing import render_briefing_email

__all__ = ["render_welcome", "render_confirmation", "render_briefing_email"]
