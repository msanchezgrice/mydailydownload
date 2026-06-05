"""Email sender using Resend API.

Resend is the recommended provider for this MVP because:
- Free tier: 3,000 emails/day
- Simple API
- Great deliverability
- Built for developers

Alternative: SendGrid, AWS SES, Mailgun
"""
import resend
from config import RESEND_API_KEY, FROM_EMAIL, FROM_NAME


def send_email(to_email: str, subject: str, html: str, text: str, from_email: str = None) -> dict:
    """Send an email via Resend.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        html: HTML email body
        text: Plain text fallback
        from_email: Override sender email (default: FROM_EMAIL)

    Returns:
        {"success": bool, "message_id": str or None, "error": str or None}
    """
    if not RESEND_API_KEY:
        return {
            "success": False,
            "message_id": None,
            "error": "RESEND_API_KEY not configured",
        }

    resend.api_key = RESEND_API_KEY

    try:
        response = resend.Emails.send({
            "from": f"{FROM_NAME} <{from_email or FROM_EMAIL}>",
            "to": to_email,
            "subject": subject,
            "html": html,
            "text": text,
        })
        return {
            "success": True,
            "message_id": response.get("id"),
            "error": None,
        }
    except Exception as e:
        return {
            "success": False,
            "message_id": None,
            "error": str(e),
        }


def send_batch(emails: list) -> list:
    """Send multiple emails in batch.

    Args:
        emails: List of dicts with keys: to, subject, html, text

    Returns:
        List of result dicts
    """
    results = []
    for email in emails:
        result = send_email(
            to_email=email["to"],
            subject=email["subject"],
            html=email["html"],
            text=email["text"],
        )
        results.append(result)
    return results


# ─── CLI for testing ───
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: python email_sender.py <to_email> <subject> <html_file>")
        sys.exit(1)

    to_email = sys.argv[1]
    subject = sys.argv[2]
    with open(sys.argv[3], "r") as f:
        html = f.read()

    result = send_email(to_email, subject, html, "Plain text version")
    print(f"Result: {result}")
