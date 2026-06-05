"""Generate + persist today's briefings for the launch matrix.

For each of the 3 launch categories × 3 seniority tiers, for TODAY's
day-of-week:
    news_engine.build_briefing(category, dow, seniority)
      -> newsletter_generator.render_html_email (+ plain text)
      -> db.upsert_briefing(career_id, seniority, today, blocks_json, html, dow)

Idempotent: upsert_briefing keys on (career_id, seniority, date) so re-runs
update in place (9 rows, never duplicated). Every URL persisted is real — the
engine's guardrail guarantees it.

Runtime is dominated by the RSS fetch + (optional) grounded summarization, which
build_briefing runs per call — 9 calls total. The run is therefore minutes-long
with OPENAI_API_KEY set; that's expected. Re-running is safe (idempotent) and
will fill in any cells a prior run didn't reach.

CLI:
    .venv/bin/python generate_all.py            # seed all 9 for today
    .venv/bin/python generate_all.py --dow=4    # override day-of-week
    .venv/bin/python generate_all.py --dry-run  # build + render, skip DB write
"""
import sys
import logging
from datetime import date as date_cls, datetime

import db
from news_engine import build_briefing
from newsletter_generator import compile_newsletter, render_html_email, _render_text_email
from config import CAREER_ID_MAP

logging.basicConfig(level="INFO", format="%(levelname)s %(message)s")
log = logging.getLogger("generate_all")

LAUNCH_CATEGORIES = ["marketing", "product-management", "entrepreneurship"]
SENIORITY_TIERS = ["Junior", "Mid Level", "Senior"]


def generate_all(dow: int = None, dry_run: bool = False) -> list:
    """Build, render, and persist the 9-cell launch matrix for today.

    Returns a list of result dicts (one per (category, seniority) cell).
    """
    if dow is None:
        dow = datetime.now().weekday()
    today = date_cls.today()
    results = []

    for career_id in LAUNCH_CATEGORIES:
        career = CAREER_ID_MAP[career_id]
        for seniority in SENIORITY_TIERS:
            # Build a fully-grounded, guardrail-validated briefing.
            briefing = build_briefing(career_id, day_of_week=dow, seniority=seniority)

            # Render HTML + text for storage (subscriber_id left blank — the
            # per-recipient unsubscribe token is stamped at send time).
            content = compile_newsletter(career, briefing)
            html = render_html_email(career["name"], content, subscriber_id="")
            _ = _render_text_email(career["name"], content, subscriber_id="")

            top = briefing.get("topStory")
            headline = top["headline"] if top else "(none)"

            if dry_run:
                log.info("DRY  %-20s %-10s top=%r  html=%dB", career_id, seniority,
                         headline[:60], len(html))
                results.append({"career_id": career_id, "seniority": seniority,
                                "html_bytes": len(html), "headline": headline,
                                "stored": False})
                continue

            row = db.upsert_briefing(
                career_id=career_id, seniority=seniority, date=today,
                blocks_json=briefing, html=html, dow=dow,
            )
            log.info("STORE id=%-4s %-20s %-10s top=%r", row["id"], career_id,
                     seniority, headline[:60])
            results.append({"career_id": career_id, "seniority": seniority,
                            "id": row["id"], "headline": headline, "stored": True})

    return results


def _main(argv):
    dow = None
    dry_run = False
    for a in argv:
        if a.startswith("--dow="):
            dow = int(a.split("=", 1)[1])
        elif a == "--dry-run":
            dry_run = True

    results = generate_all(dow=dow, dry_run=dry_run)
    stored = [r for r in results if r.get("stored")]

    print("\n=== generate_all summary ===")
    print(f"cells built: {len(results)}  stored: {len(stored)}  dry_run: {dry_run}")
    for r in results:
        marker = "stored" if r.get("stored") else "built "
        print(f"  [{marker}] {r['career_id']:<20} {r['seniority']:<10} top: {r['headline'][:70]!r}")

    if not dry_run:
        # Verify the row count for today straight from the DB.
        conn = db.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM briefings WHERE date = CURRENT_DATE;")
                today_count = cur.fetchone()[0]
                cur.execute("SELECT count(*) FROM briefings;")
                total = cur.fetchone()[0]
        finally:
            conn.close()
        print(f"\nSupabase briefings rows for today: {today_count}")
        print(f"Supabase briefings rows total:     {total}")

    return 0


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
