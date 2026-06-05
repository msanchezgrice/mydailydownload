"""Shared brand tokens + layout helpers for My Daily Download emails.

Dark void header band + amber wordmark, light readable body — locked per
design/DESIGN.md section 5 (email-body tokens are production-tuned: do not
re-tune). Email-safe system font stack only (no web fonts in email).
"""
from datetime import datetime

# ── Brand tokens (DESIGN.md §5.3) ──
VOID = "#0B0C10"          # email-header band + CTA band
AMBER = "#F2A900"         # accent, links, wordmark, section labels
INK = "#1A1D23"           # headings / strong text on light body
BODY = "#555555"          # body copy
META = "#7A8194"          # muted slate — meta / subtitle / footer
TINT = "#FFF8E7"          # callout / tool-box amber wash
PANEL = "#F8F9FA"         # how-to / panel fill
RULE = "#EEEEEE"          # hairline dividers
PAGE = "#F5F5F5"          # outer page background

FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"

CATEGORY_LABELS = {
    "marketing": "Marketing",
    "product-management": "Product Management",
    "entrepreneurship": "Entrepreneurship",
}


def category_label(career_id: str, fallback: str = None) -> str:
    return CATEGORY_LABELS.get(career_id, fallback or career_id.replace("-", " ").title())


def delivery_time_label(sub: dict) -> str:
    """Human-friendly delivery time from a subscriber's delivery_hour + tz."""
    hour = sub.get("delivery_hour", 7)
    tz = sub.get("tz", "UTC")
    try:
        h = int(hour)
    except (TypeError, ValueError):
        h = 7
    suffix = "am" if h < 12 else "pm"
    h12 = h % 12 or 12
    return f"{h12}:00{suffix} {tz}"


def header_band(subtitle: str) -> str:
    """Void header band with amber wordmark + signal dot (text-only, no image,
    so dark-mode inversion can't break it)."""
    return f"""
  <div style="background:{VOID};padding:24px 32px;text-align:center;">
    <h1 style="color:{AMBER};font-size:20px;margin:0;font-weight:700;font-family:{FONT};letter-spacing:-0.01em;">
      <span style="color:{AMBER};">&#9679;</span> My Daily Download
    </h1>
    <p style="color:{META};font-size:13px;margin:6px 0 0;font-family:{FONT};">{subtitle}</p>
  </div>"""


def section_label(text: str) -> str:
    return (f'<div style="font-size:11px;font-weight:600;text-transform:uppercase;'
            f'letter-spacing:0.08em;color:{AMBER};margin:0 0 8px;font-family:{FONT};">{text}</div>')


def button(href: str, label: str) -> str:
    """Amber-on-void pill button (table-based for email-client safety)."""
    return f"""
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:8px auto 0;">
    <tr><td align="center" bgcolor="{AMBER}" style="border-radius:8px;">
      <a href="{href}" style="display:inline-block;padding:14px 28px;font-family:{FONT};font-size:15px;font-weight:600;color:{VOID};text-decoration:none;border-radius:8px;">{label}</a>
    </td></tr>
  </table>"""


def page(inner: str, title: str) -> str:
    """Wrap body content in the 640px container shell. The compliance footer is
    appended later by mailer.send_email (just before </body>)."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{PAGE};font-family:{FONT};">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
{inner}
  </div>
</body>
</html>"""


def today_str() -> str:
    return datetime.now().strftime("%B %d, %Y")
