"""Double opt-in confirmation email.

A single clear call to action: confirm your subscription. The confirm endpoint
(`/confirm?token=...`) is added later; the email is what matters now. Branded
(dark header + amber button) with a plain-text alternative.
"""
import html as _html

from ._base import (
    AMBER, INK, BODY, META, FONT,
    header_band, button, page, today_str, category_label,
)

BASE_URL = "https://mydailydownload.com"


def render_confirmation(sub: dict, confirm_token: str, unsub_token: str):
    """Return (html, text) for the double opt-in confirmation email."""
    cat = category_label(sub.get("career_id", ""), sub.get("career_name"))
    confirm_url = f"{BASE_URL}/confirm?token={confirm_token}"

    inner = header_band(f"Confirm your subscription &middot; {today_str()}") + f"""
  <div style="padding:32px;">
    <p style="font-size:18px;color:{INK};font-weight:600;margin:0 0 16px;font-family:{FONT};">Confirm your subscription</p>
    <p style="font-size:14px;color:{BODY};line-height:1.7;margin:0 0 8px;font-family:{FONT};">
      You're one click away from your daily <strong>{_html.escape(cat)}</strong> AI briefing &mdash;
      real news, every item cited to a primary source.
    </p>
    <p style="font-size:14px;color:{BODY};line-height:1.7;margin:0 0 24px;font-family:{FONT};">
      Tap the button below to confirm you want to receive it. We won't send anything until you do.
    </p>
    {button(confirm_url, "Confirm my subscription &rarr;")}
    <p style="font-size:12px;color:{META};line-height:1.6;margin:24px 0 0;font-family:{FONT};">
      Or paste this link into your browser:<br>
      <a href="{confirm_url}" style="color:{AMBER};text-decoration:none;word-break:break-all;">{confirm_url}</a>
    </p>
    <p style="font-size:12px;color:{META};line-height:1.6;margin:16px 0 0;font-family:{FONT};">
      If you didn't sign up for My Daily Download, you can safely ignore this email &mdash;
      no subscription will be created.
    </p>
  </div>"""

    text = (
        f"Confirm your subscription to My Daily Download\n"
        f"{today_str()}\n\n"
        f"You're one click away from your daily {cat} AI briefing — real news, every item\n"
        f"cited to a primary source.\n\n"
        f"Confirm here:\n{confirm_url}\n\n"
        f"We won't send anything until you confirm.\n\n"
        f"If you didn't sign up for My Daily Download, you can safely ignore this email —\n"
        f"no subscription will be created."
    )

    return page(inner, "Confirm your subscription to My Daily Download"), text
