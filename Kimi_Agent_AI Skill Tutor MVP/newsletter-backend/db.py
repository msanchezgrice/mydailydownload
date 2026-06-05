"""Thin Supabase/Postgres helpers for My Daily Download.

Uses psycopg2 against the Supabase Postgres instance. Connection strategy:

  1. Direct host (db.<ref>.supabase.co:5432) — IPv6-only on Supabase; works
     only where the host has an IPv6 route.
  2. IPv4 transaction/session pooler (aws-N-<region>.pooler.supabase.com) with
     user `postgres.<ref>` — the IPv4 fallback when the direct host is
     unreachable (the common case on IPv4-only networks).

Set DB_PG_HOST / DB_PG_PORT / DB_PG_USER to override the resolved endpoint.

Helpers:
    apply_schema()                          -> run db/schema.sql (idempotent)
    upsert_briefing(career, seniority, date, blocks_json, html, dow=None)
    get_briefing(career, seniority, date)   -> dict | None
    add_subscriber(email, career_id, ...)   -> dict {id, ...}
    get_subscribers_by_career(career_id)    -> [dict, ...]

All functions open a short-lived connection and close it. Every write uses
ON CONFLICT (idempotent upserts) so re-runs never duplicate rows.
"""
import os
import json
import logging
from datetime import date as date_cls

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("db")

_PROJECT_REF = "wzhnfctutueunirvciol"

# Connection candidates, tried in order. The first that connects is cached.
# Direct host is listed first (correct in IPv6 environments / CI); the
# us-east-1 IPv4 pooler is the working fallback on IPv4-only networks.
_DEFAULT_CANDIDATES = [
    {"host": f"db.{_PROJECT_REF}.supabase.co", "port": 5432, "user": "postgres"},
    {"host": "aws-1-us-east-1.pooler.supabase.com", "port": 5432,
     "user": f"postgres.{_PROJECT_REF}"},
    {"host": "aws-0-us-east-1.pooler.supabase.com", "port": 5432,
     "user": f"postgres.{_PROJECT_REF}"},
]

_cached_dsn = None


def _candidates():
    """Return connection candidates, honoring env overrides if present."""
    host = os.getenv("DB_PG_HOST")
    if host:
        return [{
            "host": host,
            "port": int(os.getenv("DB_PG_PORT", "5432")),
            "user": os.getenv("DB_PG_USER", "postgres"),
        }]
    return list(_DEFAULT_CANDIDATES)


def get_connection():
    """Open a psycopg2 connection, trying each candidate until one works.

    Caches the first working endpoint for the process lifetime so we don't pay
    the discovery cost on every call.
    """
    global _cached_dsn
    password = os.getenv("SUPABASE_DB_PASSWORD")
    if not password:
        raise RuntimeError("SUPABASE_DB_PASSWORD not set — cannot connect to Postgres.")

    tried = [_cached_dsn] if _cached_dsn else []
    tried += [c for c in _candidates() if c != _cached_dsn]

    last_err = None
    for cand in tried:
        if not cand:
            continue
        try:
            conn = psycopg2.connect(
                host=cand["host"], port=cand["port"], user=cand["user"],
                dbname="postgres", password=password, sslmode="require",
                connect_timeout=int(os.getenv("DB_CONNECT_TIMEOUT", "15")),
            )
            _cached_dsn = cand
            return conn
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            log.warning("db: connect failed via %s:%s (%s)", cand["host"], cand["port"], str(exc)[:120])
    raise RuntimeError(f"db: all connection candidates failed; last error: {last_err}")


def apply_schema(schema_path: str = None) -> list:
    """Run db/schema.sql (idempotent) and return the list of the 4 core tables
    that exist afterward.
    """
    if schema_path is None:
        schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db", "schema.sql")
    with open(schema_path) as f:
        sql = f.read()
    conn = get_connection()
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(sql)
            cur.execute("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema='public'
                  AND table_name IN ('subscribers','news_items','briefings','sends')
                ORDER BY table_name;
            """)
            return [r[0] for r in cur.fetchall()]
    finally:
        conn.close()


# ── briefings ──────────────────────────────────────────────────────────────
def upsert_briefing(career_id: str, seniority: str, date, blocks_json: dict,
                    html: str = None, dow: int = None) -> dict:
    """Insert or update a briefing for (career_id, seniority, date).

    Idempotent via ON CONFLICT on the (career_id, seniority, date) unique key.
    Returns {id, career_id, seniority, date}.
    """
    if isinstance(date, date_cls):
        date = date.isoformat()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO briefings (career_id, seniority, dow, date, blocks_json, html)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (career_id, seniority, date) DO UPDATE
                  SET blocks_json = EXCLUDED.blocks_json,
                      html        = EXCLUDED.html,
                      dow         = EXCLUDED.dow
                RETURNING id, career_id, seniority, date;
                """,
                (career_id, seniority, dow, date, json.dumps(blocks_json), html),
            )
            row = cur.fetchone()
        conn.commit()
        return {"id": row[0], "career_id": row[1], "seniority": row[2], "date": str(row[3])}
    finally:
        conn.close()


def get_briefing(career_id: str, seniority: str, date) -> dict:
    """Read back a briefing for (career_id, seniority, date) or None."""
    if isinstance(date, date_cls):
        date = date.isoformat()
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, career_id, seniority, dow, date, blocks_json, html, created_at
                FROM briefings
                WHERE career_id = %s
                  AND seniority IS NOT DISTINCT FROM %s
                  AND date = %s;
                """,
                (career_id, seniority, date),
            )
            row = cur.fetchone()
        if not row:
            return None
        out = dict(row)
        out["date"] = str(out["date"])
        if out.get("created_at") is not None:
            out["created_at"] = out["created_at"].isoformat()
        return out
    finally:
        conn.close()


# ── subscribers ─────────────────────────────────────────────────────────────
def add_subscriber(email: str, career_id: str = "product-management",
                   seniority: str = "Mid Level", interests: list = None,
                   plan: str = "free", tz: str = "UTC", delivery_hour: int = 7,
                   **consent) -> dict:
    """Insert a subscriber (idempotent on email). Optional consent kwargs:
    confirm_token, unsubscribe_token, consent_ts, consent_ip, consent_text.
    Returns {id, email}.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO subscribers
                    (email, career_id, seniority, interests, plan, tz, delivery_hour,
                     confirm_token, unsubscribe_token, consent_ts, consent_ip, consent_text)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE
                  SET career_id = EXCLUDED.career_id,
                      seniority = EXCLUDED.seniority,
                      interests = EXCLUDED.interests,
                      plan      = EXCLUDED.plan,
                      tz        = EXCLUDED.tz,
                      delivery_hour = EXCLUDED.delivery_hour
                RETURNING id, email;
                """,
                (email, career_id, seniority, json.dumps(interests or []), plan, tz,
                 delivery_hour,
                 consent.get("confirm_token"), consent.get("unsubscribe_token"),
                 consent.get("consent_ts"), consent.get("consent_ip"),
                 consent.get("consent_text")),
            )
            row = cur.fetchone()
        conn.commit()
        return {"id": row[0], "email": row[1]}
    finally:
        conn.close()


def get_subscribers_by_career(career_id: str) -> list:
    """Return all active subscribers for a career category."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, email, career_id, seniority, interests, plan, tz,
                       delivery_hour, is_active, created_at
                FROM subscribers
                WHERE career_id = %s AND is_active = TRUE
                ORDER BY created_at DESC;
                """,
                (career_id,),
            )
            rows = cur.fetchall()
        out = []
        for r in rows:
            d = dict(r)
            if d.get("created_at") is not None:
                d["created_at"] = d["created_at"].isoformat()
            out.append(d)
        return out
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "apply":
        print("Applying schema -> tables present:", apply_schema())
    else:
        print("db.py helpers: apply_schema, upsert_briefing, get_briefing, "
              "add_subscriber, get_subscribers_by_career")
        print("Run `python db.py apply` to (re)apply db/schema.sql.")
