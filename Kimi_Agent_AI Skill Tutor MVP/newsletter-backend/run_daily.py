"""Automated DAILY SEND for "My Daily Download".

Run once per day (GitHub Actions cron, ~7am ET). Two phases, both idempotent:

  1. GENERATE — ensure today's briefing exists for every (career_id, seniority)
     that has at least one confirmed + active subscriber. Reuses the
     generate_all build/render pipeline (news_engine.build_briefing ->
     newsletter_generator render -> db.upsert_briefing). Cells already present
     in `briefings` for today are skipped (no rebuild, no API spend).

  2. SEND — for every subscriber with `confirmed_at IS NOT NULL AND is_active`,
     look up their briefing (career_id × seniority × today). If no `sends` row
     exists yet for (subscriber_id, today), send via mailer.send_briefing(...)
     and record the delivery in `sends`.

Idempotency: the `sends` UNIQUE(subscriber_id, briefing_date) constraint is the
hard guard. We pre-check for an existing send AND insert with
`ON CONFLICT DO NOTHING`, so a second run on the same day sends 0 emails and
inserts 0 rows even under a race.

CLI:
    .venv/bin/python run_daily.py            # generate as needed + send for today
    .venv/bin/python run_daily.py --dry-run  # plan only: no generation, no send
"""
import sys
import logging
from datetime import date as date_cls, datetime

import db
import mailer
from generate_all import generate_one  # built below; see note in generate_all

logging.basicConfig(level="INFO", format="%(levelname)s %(message)s")
log = logging.getLogger("run_daily")


# ── helpers ─────────────────────────────────────────────────────────────────
def _confirmed_active_subscribers() -> list:
    """All subscribers with confirmed_at set AND is_active true.

    Returns subscriber-row dicts carrying the fields send_briefing needs
    (email, career_id, seniority, unsubscribe_token) plus id for the sends row.
    """
    import psycopg2.extras
    conn = db.get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, email, career_id, seniority, unsubscribe_token,
                       confirm_token, delivery_hour, tz
                FROM subscribers
                WHERE confirmed_at IS NOT NULL AND is_active = TRUE
                ORDER BY id;
                """
            )
            return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def _record_send(subscriber_id: int, briefing_date, message_id: str,
                 status: str) -> bool:
    """Insert a sends row. Idempotent via ON CONFLICT DO NOTHING on the
    UNIQUE(subscriber_id, briefing_date) constraint.

    Returns True if a row was inserted, False if one already existed.
    """
    if isinstance(briefing_date, date_cls):
        briefing_date = briefing_date.isoformat()
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sends (subscriber_id, briefing_date, message_id, status, sent_at)
                VALUES (%s, %s, %s, %s, now())
                ON CONFLICT (subscriber_id, briefing_date) DO NOTHING
                RETURNING id;
                """,
                (subscriber_id, briefing_date, message_id, status),
            )
            inserted = cur.fetchone() is not None
        conn.commit()
        return inserted
    finally:
        conn.close()


def _already_sent(subscriber_id: int, briefing_date) -> bool:
    """True if a sends row already exists for (subscriber_id, briefing_date)."""
    if isinstance(briefing_date, date_cls):
        briefing_date = briefing_date.isoformat()
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM sends WHERE subscriber_id = %s AND briefing_date = %s;",
                (subscriber_id, briefing_date),
            )
            return cur.fetchone() is not None
    finally:
        conn.close()


# ── main ────────────────────────────────────────────────────────────────────
def run_daily(dry_run: bool = False) -> dict:
    today = date_cls.today()
    dow = datetime.now().weekday()

    subs = _confirmed_active_subscribers()
    log.info("confirmed+active subscribers: %d", len(subs))

    # Phase 1 — GENERATE. Only the (career_id, seniority) cells we actually need
    # (i.e. that have a confirmed+active subscriber), and only if missing.
    needed_cells = {(s["career_id"], s["seniority"]) for s in subs}
    generated = 0
    for career_id, seniority in sorted(needed_cells):
        existing = db.get_briefing(career_id, seniority, today)
        if existing:
            log.info("GEN skip  %-20s %-12s (already in briefings)", career_id, seniority)
            continue
        if dry_run:
            log.info("GEN would build %-20s %-12s", career_id, seniority)
            continue
        log.info("GEN build %-20s %-12s ...", career_id, seniority)
        generate_one(career_id, seniority, today, dow)
        generated += 1

    # Phase 2 — SEND.
    sent = 0
    skipped = 0
    failed = 0
    sent_details = []
    for s in subs:
        sub_id = s["id"]
        career_id = s["career_id"]
        seniority = s["seniority"]

        if _already_sent(sub_id, today):
            log.info("SEND skip sub=%s %s (already sent today)", sub_id, s["email"])
            skipped += 1
            continue

        row = db.get_briefing(career_id, seniority, today)
        if not row:
            log.warning("SEND skip sub=%s %s — no briefing for %s/%s/%s",
                        sub_id, s["email"], career_id, seniority, today)
            skipped += 1
            continue

        # Pass the STRUCTURED briefing (blocks_json) so render_briefing_email
        # stamps THIS recipient's unsubscribe token into the body links. The
        # stored `html` column was rendered with a blank subscriber_id and is
        # not per-recipient, so we don't reuse it for the body.
        briefing = row.get("blocks_json") or {}

        if dry_run:
            log.info("SEND would send sub=%s %s (%s/%s)", sub_id, s["email"],
                     career_id, seniority)
            continue

        res = mailer.send_briefing(s, briefing)
        if not res.get("success"):
            log.error("SEND FAIL sub=%s %s: %s", sub_id, s["email"], res.get("error"))
            failed += 1
            continue

        message_id = res.get("message_id")
        inserted = _record_send(sub_id, today, message_id, status="sent")
        if inserted:
            sent += 1
            sent_details.append((s["email"], message_id))
            log.info("SEND ok   sub=%s %s message_id=%s", sub_id, s["email"], message_id)
        else:
            # Lost the race: another runner recorded the send between our
            # pre-check and insert. The email did go out here, but the canonical
            # record belongs to the other run; count as skipped, not double-sent.
            skipped += 1
            log.warning("SEND raced sub=%s %s — sends row already present; not counting",
                        sub_id, s["email"])

    return {
        "today": today.isoformat(),
        "subscribers": len(subs),
        "generated": generated,
        "sent": sent,
        "skipped": skipped,
        "failed": failed,
        "sent_details": sent_details,
        "dry_run": dry_run,
    }


def _main(argv):
    dry_run = "--dry-run" in argv
    summary = run_daily(dry_run=dry_run)

    print("\n=== run_daily summary ===")
    print(f"date:               {summary['today']}")
    print(f"subscribers:        {summary['subscribers']} (confirmed + active)")
    print(f"generated briefings:{summary['generated']}")
    print(f"sent:               {summary['sent']}")
    print(f"skipped:            {summary['skipped']} (already sent / no briefing)")
    print(f"failed:             {summary['failed']}")
    print(f"dry_run:            {summary['dry_run']}")
    for email, mid in summary["sent_details"]:
        print(f"  -> sent {email}  message_id={mid}")

    return 0 if summary["failed"] == 0 else 2


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
