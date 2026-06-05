"""Daily AI Edge Newsletter — Main Runner

Usage:
    # Run once (send newsletters now)
    python run.py --once

    # Start scheduler (runs daily at configured time)
    python run.py --schedule

    # Send test newsletter
    python run.py --test product-manager your@email.com

    # Show subscriber stats
    python run.py --stats

Environment variables:
    OPENAI_API_KEY or ANTHROPIC_API_KEY
    RESEND_API_KEY
    LLM_PROVIDER (openai|anthropic, default: openai)
    LLM_MODEL (default: gpt-4o-mini)
    NEWSLETTER_TIME (default: 07:00)
"""
import argparse
import sys
import time
import schedule
from datetime import datetime

from config import NEWSLETTER_TIME, CAREER_CATEGORIES
from subscribers import (
    add_subscriber, get_all_active_subscribers, get_subscribers_by_career,
    mark_sent, get_stats, unsubscribe,
)
from newsletter_generator import generate_newsletter
from email_sender import send_email


def send_daily_newsletters():
    """Generate and send newsletters to all active subscribers."""
    print(f"\n{'='*60}")
    print(f"Daily AI Edge — Newsletter Run")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    subscribers = get_all_active_subscribers()
    if not subscribers:
        print("No active subscribers. Exiting.")
        return

    print(f"Found {len(subscribers)} active subscribers")

    # Group by career for efficiency (generate once per career)
    career_groups = {}
    for sub in subscribers:
        cid = sub["career_id"]
        if cid not in career_groups:
            career_groups[cid] = []
        career_groups[cid].append(sub)

    total_sent = 0
    total_failed = 0

    for career_id, subs in career_groups.items():
        career = next((c for c in CAREER_CATEGORIES if c["id"] == career_id), None)
        career_name = career["name"] if career else career_id
        print(f"\n--- Career: {career_name} ({len(subs)} subscribers) ---")

        # Generate newsletter once for this career
        try:
            newsletter = generate_newsletter(career_id)
            print(f"  Subject: {newsletter['subject']}")
        except Exception as e:
            print(f"  ERROR generating newsletter: {e}")
            total_failed += len(subs)
            continue

        # Send to each subscriber
        for sub in subs:
            try:
                result = send_email(
                    to_email=sub["email"],
                    subject=newsletter["subject"],
                    html=newsletter["html"],
                    text=newsletter["text"],
                )
                if result["success"]:
                    mark_sent(sub["id"])
                    total_sent += 1
                    print(f"  ✓ Sent to {sub['email']}")
                else:
                    total_failed += 1
                    print(f"  ✗ Failed to {sub['email']}: {result['error']}")
            except Exception as e:
                total_failed += 1
                print(f"  ✗ Error sending to {sub['email']}: {e}")

    print(f"\n{'='*60}")
    print(f"Run complete: {total_sent} sent, {total_failed} failed")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


def send_test_newsletter(career_id: str, email: str):
    """Send a test newsletter to a specific email."""
    print(f"Generating test newsletter for career: {career_id}")
    newsletter = generate_newsletter(career_id)

    print(f"Subject: {newsletter['subject']}")
    print(f"HTML length: {len(newsletter['html'])} chars")

    result = send_email(
        to_email=email,
        subject=f"[TEST] {newsletter['subject']}",
        html=newsletter["html"],
        text=newsletter["text"],
    )

    if result["success"]:
        print(f"✓ Test sent successfully! Message ID: {result['message_id']}")
    else:
        print(f"✗ Failed: {result['error']}")


def add_test_subscriber(email: str, career_id: str):
    """Add a test subscriber."""
    result = add_subscriber(
        email=email,
        career_id=career_id,
        plan="free",
    )
    if result["success"]:
        print(f"✓ Added subscriber: {email} ({career_id})")
    else:
        print(f"✗ {result['error']}")


def main():
    parser = argparse.ArgumentParser(description="Daily AI Edge Newsletter System")
    parser.add_argument("--once", action="store_true", help="Send newsletters once now")
    parser.add_argument("--schedule", action="store_true", help="Start daily scheduler")
    parser.add_argument("--test", nargs=2, metavar=("CAREER_ID", "EMAIL"), help="Send test newsletter")
    parser.add_argument("--stats", action="store_true", help="Show subscriber stats")
    parser.add_argument("--add-subscriber", nargs=2, metavar=("EMAIL", "CAREER_ID"), help="Add a subscriber")
    parser.add_argument("--unsubscribe", metavar="EMAIL", help="Unsubscribe an email")

    args = parser.parse_args()

    if args.test:
        send_test_newsletter(args.test[0], args.test[1])
        return

    if args.stats:
        stats = get_stats()
        print(f"\n{'='*40}")
        print(f"Daily AI Edge — Subscriber Stats")
        print(f"{'='*40}")
        print(f"Total subscribers: {stats['total_subscribers']}")
        print(f"Active subscribers: {stats['active_subscribers']}")
        print(f"\nBy career:")
        for career_id, count in stats['by_career'].items():
            career = next((c for c in CAREER_CATEGORIES if c['id'] == career_id), None)
            name = career['name'] if career else career_id
            print(f"  {name}: {count}")
        print(f"{'='*40}\n")
        return

    if args.add_subscriber:
        add_test_subscriber(args.add_subscriber[0], args.add_subscriber[1])
        return

    if args.unsubscribe:
        result = unsubscribe(args.unsubscribe)
        print(f"Unsubscribed: {result['success']} (affected: {result['affected']})")
        return

    if args.once:
        send_daily_newsletters()
        return

    if args.schedule:
        print(f"Starting scheduler. Newsletters will be sent daily at {NEWSLETTER_TIME}")
        schedule.every().day.at(NEWSLETTER_TIME).do(send_daily_newsletters)

        # Run immediately on first start (optional)
        # send_daily_newsletters()

        while True:
            schedule.run_pending()
            time.sleep(60)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
