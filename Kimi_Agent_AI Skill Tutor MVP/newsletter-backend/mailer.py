"""Resend mailer for "My Daily Download" (Phase 3).

Sends transactional + briefing emails through the VERIFIED, sending-enabled
Resend domain `mydailydownload.com`. From address:

    My Daily Download <newsletter@mydailydownload.com>

CAN-SPAM / deliverability guardrails baked into EVERY send (not optional):
  - `List-Unsubscribe` header  -> <https://mydailydownload.com/unsubscribe?token=...>
  - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`  (RFC 8058 one-click)
  - a footer carrying a physical mailing-address placeholder
    (`[MAILING ADDRESS — fill before launch]`), an unsubscribe link, and the
    © brand line.

`send_email()` is the single choke point: it injects the compliance footer +
headers so a caller can never forget them. The three high-level helpers
(`send_confirmation`, `send_welcome`, `send_briefing`) build their bodies and
delegate to it.

CLI:
    .venv/bin/python mailer.py welcome      <to> <career_id> [seniority]
    .venv/bin/python mailer.py confirmation <to> <career_id> [seniority]
    .venv/bin/python mailer.py briefing     <to> <career_id> [seniority]
    .venv/bin/python mailer.py sample       <to> <career_id> [seniority]   # subject prefixed [SAMPLE]

Runs with RESEND_API_KEY in the gitignored .env.
"""
import os
import re
import sys
import uuid

import resend
from dotenv import load_dotenv

load_dotenv()

# ── Sender identity (the verified, sending-enabled domain) ──
FROM_NAME = "My Daily Download"
FROM_ADDRESS = "newsletter@mydailydownload.com"
FROM = f"{FROM_NAME} <{FROM_ADDRESS}>"

BASE_URL = "https://mydailydownload.com"

# Physical mailing address is legally required (CAN-SPAM). Placeholder until the
# founder fills a real one — visible in every footer so it can't be forgotten.
MAILING_ADDRESS = "My Daily Download, 8808 Mesa Drive, Austin, TX"

# Brand tokens (from design/DESIGN.md).
C_VOID = "#0B0C10"
C_AMBER = "#F2A900"
C_INK = "#1A1D23"
C_BODY = "#555555"
C_META = "#7A8194"


# ──────────────────────────────────────────────────────────────────────────
# Compliance footer (HTML + text). Injected by send_email on EVERY send.
# ──────────────────────────────────────────────────────────────────────────
def _unsubscribe_url(token: str) -> str:
    return f"{BASE_URL}/unsubscribe?token={token}"


def compliance_footer_html(unsubscribe_token: str) -> str:
    """Branded footer block carrying the unsubscribe link, the physical mailing
    address placeholder, the trust line, and the © brand line."""
    unsub = _unsubscribe_url(unsubscribe_token)
    return f"""
  <div style="background:#f8f9fa;padding:24px 32px;text-align:center;font-size:12px;color:{C_META};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
    <p style="margin:0 0 8px;">You're receiving this because you subscribed to My Daily Download.</p>
    <p style="margin:0 0 8px;">Every item cites a real source.</p>
    <p style="margin:0 0 8px;">
      <a href="{unsub}" style="color:{C_AMBER};text-decoration:none;">Unsubscribe</a>
      &middot;
      <a href="{BASE_URL}/preferences?token={unsubscribe_token}" style="color:{C_AMBER};text-decoration:none;">Update preferences</a>
    </p>
    <p style="margin:0 0 8px;color:{C_META};">My Daily Download &middot; {MAILING_ADDRESS}</p>
    <p style="margin:0;">&copy; 2026 My Daily Download</p>
  </div>"""


def compliance_footer_text(unsubscribe_token: str) -> str:
    unsub = _unsubscribe_url(unsubscribe_token)
    return (
        "\n\n---\n"
        "You're receiving this because you subscribed to My Daily Download.\n"
        "Every item cites a real source.\n"
        f"Unsubscribe: {unsub}\n"
        f"My Daily Download — {MAILING_ADDRESS}\n"
        "© 2026 My Daily Download"
    )


def _inject_footer_html(html: str, unsubscribe_token: str) -> str:
    """Insert the compliance footer just before </body> (or append it)."""
    footer = compliance_footer_html(unsubscribe_token)
    if re.search(r"</body>", html, flags=re.IGNORECASE):
        return re.sub(r"</body>", footer + "\n</body>", html, count=1, flags=re.IGNORECASE)
    return html + footer


# ──────────────────────────────────────────────────────────────────────────
# Core send — the single choke point. Every email passes through here.
# ──────────────────────────────────────────────────────────────────────────
def send_email(to: str, subject: str, html: str, text: str = None,
               headers: dict = None, unsubscribe_token: str = None) -> dict:
    """Send one email via Resend with the mandatory compliance footer + headers.

    Args:
        to:                 recipient address
        subject:            subject line
        html:               HTML body (footer is injected automatically)
        text:               plain-text alt (footer is appended automatically)
        headers:            extra headers to merge (List-Unsubscribe is added here)
        unsubscribe_token:  token used in the List-Unsubscribe header + footer.
                            Falls back to a random token if not supplied so a
                            send is never missing the header.

    Returns: {"success": bool, "message_id": str|None, "error": str|None}
    """
    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        return {"success": False, "message_id": None, "error": "RESEND_API_KEY not configured"}

    token = unsubscribe_token or uuid.uuid4().hex

    # Mandatory list-management headers (RFC 2369 + RFC 8058 one-click).
    list_unsub = f"<{_unsubscribe_url(token)}>"
    merged_headers = {
        "List-Unsubscribe": list_unsub,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    }
    if headers:
        merged_headers.update(headers)

    # Inject the compliance footer into BOTH bodies (belt-and-suspenders so the
    # footer is present even if a caller's template forgot it).
    html_out = _inject_footer_html(html, token)
    text_out = (text or "") + compliance_footer_text(token)

    resend.api_key = api_key
    try:
        response = resend.Emails.send({
            "from": FROM,
            "to": to,
            "subject": subject,
            "html": html_out,
            "text": text_out,
            "headers": merged_headers,
        })
        # resend>=2 returns an object/dict carrying the message id.
        mid = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        return {"success": True, "message_id": mid, "error": None}
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "message_id": None, "error": str(exc)}


# ──────────────────────────────────────────────────────────────────────────
# High-level helpers. Each accepts a `sub` dict shaped like a subscribers row:
#   {email, career_id, seniority, confirm_token, unsubscribe_token, delivery_hour, tz}
# Missing tokens fall back to a generated one so a send is never non-compliant.
# ──────────────────────────────────────────────────────────────────────────
def _sub_token(sub: dict, key: str) -> str:
    return sub.get(key) or uuid.uuid4().hex


def send_confirmation(sub: dict) -> dict:
    """Double opt-in confirmation email."""
    from emails import render_confirmation
    confirm_token = _sub_token(sub, "confirm_token")
    unsub_token = _sub_token(sub, "unsubscribe_token")
    html, text = render_confirmation(sub, confirm_token, unsub_token)
    return send_email(
        to=sub["email"],
        subject="Confirm your subscription to My Daily Download",
        html=html,
        text=text,
        unsubscribe_token=unsub_token,
    )


def send_welcome(sub: dict) -> dict:
    """Branded welcome email with a teaser of today's real briefing."""
    from emails import render_welcome
    unsub_token = _sub_token(sub, "unsubscribe_token")
    html, text = render_welcome(sub, unsub_token)
    return send_email(
        to=sub["email"],
        subject="Welcome to My Daily Download — your first briefing is on the way",
        html=html,
        text=text,
        unsubscribe_token=unsub_token,
    )


def send_briefing(sub: dict, briefing: dict, subject_prefix: str = "") -> dict:
    """Send a rendered daily briefing email.

    `briefing` is a dict carrying at least `html`, `text`, and `subject` (as
    produced by newsletter_generator.generate_newsletter). If a pre-rendered
    `html`/`text` isn't supplied, render from the structured briefing.
    """
    from emails import render_briefing_email
    unsub_token = _sub_token(sub, "unsubscribe_token")

    html = briefing.get("html")
    text = briefing.get("text")
    subject = briefing.get("subject")
    if not html:
        html, text, subject = render_briefing_email(sub, briefing, unsub_token)

    return send_email(
        to=sub["email"],
        subject=f"{subject_prefix}{subject}",
        html=html,
        text=text,
        unsubscribe_token=unsub_token,
    )


# ──────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────
def _main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 1
    cmd, to, career_id = argv[0], argv[1], argv[2]
    seniority = argv[3] if len(argv) > 3 else "Mid Level"
    sub = {
        "email": to,
        "career_id": career_id,
        "seniority": seniority,
        "confirm_token": uuid.uuid4().hex,
        "unsubscribe_token": uuid.uuid4().hex,
        "delivery_hour": 7,
        "tz": "UTC",
    }

    if cmd == "confirmation":
        res = send_confirmation(sub)
    elif cmd == "welcome":
        res = send_welcome(sub)
    elif cmd in ("briefing", "sample"):
        from newsletter_generator import generate_newsletter
        brief = generate_newsletter(career_id, subscriber_id=sub["unsubscribe_token"])
        prefix = "[SAMPLE] " if cmd == "sample" else ""
        res = send_briefing(sub, brief, subject_prefix=prefix)
    else:
        print(f"unknown command: {cmd}")
        return 1

    print(res)
    return 0 if res.get("success") else 2


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
