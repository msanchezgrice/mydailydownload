"""One-off backfill: generate the Mid Level briefing for the 12 careers that are
missing from the launch matrix, so every /ai-for/[career] SEO hub is live-cited
before the apex cutover.

The SEO hub (web/app/ai-for/[career]/page.tsx) reads the most recent "Mid Level"
briefing per career, so Mid Level is the only tier needed to light up a hub.
Junior/Senior fill in on demand via run_daily when a subscriber picks them.

Idempotent: db.upsert_briefing keys on (career_id, seniority, date), so re-runs
update in place. Every URL persisted is real (engine guardrail).

CLI:
    .venv/bin/python backfill_hubs.py
"""
import sys
import logging

from generate_all import generate_one

logging.basicConfig(level="INFO", format="%(levelname)s %(message)s")
log = logging.getLogger("backfill")

# The 15 careers minus the 3 already seeded (marketing, product-management,
# entrepreneurship). Order roughly by likely demand.
MISSING = [
    "sales", "engineering", "design", "finance", "data-science", "operations",
    "hr-people", "customer-success", "content-creation", "consulting",
    "legal", "healthcare",
]


def main() -> int:
    ok, fail = [], []
    for cid in MISSING:
        try:
            r = generate_one(cid, "Mid Level")
            ok.append(cid)
            print(f"OK   {cid:<20} {r.get('headline', '')[:60]!r}", flush=True)
        except Exception as e:  # keep going; one bad career shouldn't abort the rest
            fail.append((cid, repr(e)))
            print(f"FAIL {cid:<20} {e!r}", flush=True)

    print(f"\n=== backfill done: {len(ok)} ok, {len(fail)} failed ===", flush=True)
    for cid, e in fail:
        print(f"  FAILED {cid}: {e}", flush=True)
    return 0 if not fail else 1


if __name__ == "__main__":
    sys.exit(main())
