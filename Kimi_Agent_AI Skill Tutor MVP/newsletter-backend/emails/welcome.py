"""Welcome email — warm, branded, with a REAL teaser of today's briefing.

Pulls the top story for the subscriber's category from the news engine so the
welcome shows the product is real on day one. If the engine is slow/unavailable
the teaser is omitted (never fabricated).
"""
import html as _html

from ._base import (
    AMBER, INK, BODY, META, TINT, RULE, FONT,
    header_band, section_label, page, today_str,
    category_label, delivery_time_label,
)


def _teaser(career_id: str):
    """Return (headline, summary, source, url) for today's top story, or None.

    Sourced from the real, guardrail-validated engine. Never invented.
    """
    try:
        from news_engine import build_briefing
        b = build_briefing(career_id)
        top = b.get("topStory")
        if not top:
            return None
        return (top["headline"], top.get("summary", ""), top["source"], top["url"])
    except Exception:  # noqa: BLE001 — a slow/failed teaser must not block welcome
        return None


def render_welcome(sub: dict, unsub_token: str, teaser=None):
    """Return (html, text). `teaser` may be passed in to avoid a second engine
    call (generate_all/CLI can reuse a briefing it already built)."""
    cat = category_label(sub.get("career_id", ""), sub.get("career_name"))
    when = delivery_time_label(sub)
    if teaser is None:
        teaser = _teaser(sub.get("career_id", ""))

    # ── Teaser block (real story or honest omission) ──
    if teaser:
        h, summary, source, url = teaser
        summary_html = (f'<p style="font-size:14px;color:{BODY};line-height:1.7;margin:0 0 10px;font-family:{FONT};">'
                        f'{_html.escape(summary[:280])}</p>') if summary else ""
        teaser_html = f"""
    {section_label("A taste of today &mdash; " + _html.escape(cat))}
    <div style="background:{TINT};border-left:3px solid {AMBER};border-radius:0 8px 8px 0;padding:16px 18px;margin:0 0 24px;">
      <p style="font-size:16px;font-weight:600;color:{INK};margin:0 0 8px;line-height:1.4;font-family:{FONT};">{_html.escape(h)}</p>
      {summary_html}
      <p style="font-size:12px;color:{META};margin:0;font-family:{FONT};">Source: <a href="{url}" style="color:{AMBER};text-decoration:none;">{_html.escape(source)}</a></p>
    </div>"""
        teaser_text = (
            f"\nA TASTE OF TODAY — {cat}\n"
            f"{h}\n"
            f"{(summary[:280] + chr(10)) if summary else ''}"
            f"Source: {source} — {url}\n"
        )
    else:
        teaser_html = f"""
    <div style="background:{TINT};border-left:3px solid {AMBER};border-radius:0 8px 8px 0;padding:16px 18px;margin:0 0 24px;">
      <p style="font-size:14px;color:{BODY};margin:0;line-height:1.7;font-family:{FONT};">Your first <strong>{_html.escape(cat)}</strong> briefing &mdash; real AI news, every item cited &mdash; lands in your inbox at {when}.</p>
    </div>"""
        teaser_text = f"\nYour first {cat} briefing lands at {when}.\n"

    inner = header_band(f"Welcome aboard &middot; {today_str()}") + f"""
  <div style="padding:32px;">
    <p style="font-size:18px;color:{INK};font-weight:600;margin:0 0 16px;font-family:{FONT};">Welcome to My Daily Download.</p>
    <p style="font-size:14px;color:{BODY};line-height:1.7;margin:0 0 20px;font-family:{FONT};">
      You'll get a sharp AI briefing built for <strong>{_html.escape(cat)}</strong> &mdash; the few things that
      actually matter to your job today, read and filtered so you don't have to.
    </p>

    {section_label("What to expect")}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 24px;font-family:{FONT};">
      <tr><td style="padding:6px 0;font-size:14px;color:{BODY};line-height:1.6;"><strong style="color:{INK};">Daily.</strong> One email, every morning at {when}.</td></tr>
      <tr><td style="padding:6px 0;border-top:1px solid {RULE};font-size:14px;color:{BODY};line-height:1.6;"><strong style="color:{INK};">Cited.</strong> Every item links to a real, primary source. No fabricated stats &mdash; ever.</td></tr>
      <tr><td style="padding:6px 0;border-top:1px solid {RULE};font-size:14px;color:{BODY};line-height:1.6;"><strong style="color:{INK};">Role-specific.</strong> Tuned to <strong style="color:{INK};">{_html.escape(cat)}</strong>. Reply anytime to change your role or seniority.</td></tr>
    </table>
{teaser_html}
    <p style="font-size:13px;color:{META};line-height:1.6;margin:0;font-family:{FONT};">
      That's it. Your next briefing arrives tomorrow morning. &mdash; The My Daily Download team
    </p>
  </div>"""

    text = (
        f"Welcome to My Daily Download\n"
        f"{today_str()}\n\n"
        f"You'll get a sharp AI briefing built for {cat} — the few things that actually\n"
        f"matter to your job today.\n\n"
        f"WHAT TO EXPECT\n"
        f"- Daily: one email every morning at {when}.\n"
        f"- Cited: every item links to a real, primary source. No fabricated stats, ever.\n"
        f"- Role-specific: tuned to {cat}. Reply anytime to change your role or seniority.\n"
        f"{teaser_text}\n"
        f"Your next briefing arrives tomorrow morning.\n"
        f"— The My Daily Download team"
    )

    return page(inner, "Welcome to My Daily Download"), text
