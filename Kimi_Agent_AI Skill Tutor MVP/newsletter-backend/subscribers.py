"""Subscriber database using SQLite.

Simple key fields:
- id, email, career_id, seniority, interests, plan, delivery_time
- created_at, last_sent_at, is_active
"""
import sqlite3
import json
from datetime import datetime
from config import DATABASE_PATH


SCHEMA = """
CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    career_id TEXT NOT NULL DEFAULT 'product-management',
    seniority TEXT DEFAULT 'Mid Level',
    interests TEXT DEFAULT '[]',
    plan TEXT DEFAULT 'free',
    delivery_time TEXT DEFAULT 'morning',
    profile_json TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_career ON subscribers(career_id);
CREATE INDEX IF NOT EXISTS idx_active ON subscribers(is_active);
"""


def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def add_subscriber(email: str, career_id: str = "product-management",
                   seniority: str = "Mid Level", interests: list = None,
                   plan: str = "free", delivery_time: str = "morning",
                   profile: dict = None) -> dict:
    """Add a new subscriber."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO subscribers (email, career_id, seniority, interests, plan, delivery_time, profile_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (email, career_id, seniority,
             json.dumps(interests or []), plan, delivery_time,
             json.dumps(profile or {}))
        )
        conn.commit()
        subscriber_id = cursor.lastrowid
        return {"success": True, "id": subscriber_id}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "Email already subscribed"}
    finally:
        conn.close()


def get_subscriber(subscriber_id: int) -> dict:
    """Get a single subscriber by ID."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subscribers WHERE id = ?", (subscriber_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_subscriber_by_email(email: str) -> dict:
    """Get a subscriber by email."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subscribers WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_subscribers_by_career(career_id: str) -> list:
    """Get all active subscribers for a career category."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM subscribers WHERE career_id = ? AND is_active = 1",
        (career_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_active_subscribers() -> list:
    """Get all active subscribers."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subscribers WHERE is_active = 1")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_subscriber(subscriber_id: int, **kwargs) -> dict:
    """Update subscriber fields."""
    allowed = {"career_id", "seniority", "interests", "plan", "delivery_time",
               "is_active", "profile_json"}
    updates = {k: v for k, v in kwargs.items() if k in allowed}

    if not updates:
        return {"success": False, "error": "No valid fields to update"}

    # JSON serialize lists/dicts
    if "interests" in updates and isinstance(updates["interests"], list):
        updates["interests"] = json.dumps(updates["interests"])
    if "profile_json" in updates and isinstance(updates["profile_json"], dict):
        updates["profile_json"] = json.dumps(updates["profile_json"])

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [subscriber_id]
    cursor.execute(f"UPDATE subscribers SET {set_clause} WHERE id = ?", values)
    conn.commit()
    conn.close()
    return {"success": True}


def mark_sent(subscriber_id: int):
    """Update last_sent_at timestamp."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE subscribers SET last_sent_at = ? WHERE id = ?",
        (datetime.now().isoformat(), subscriber_id)
    )
    conn.commit()
    conn.close()


def unsubscribe(email: str) -> dict:
    """Soft-delete a subscriber by email."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE subscribers SET is_active = 0 WHERE email = ?", (email,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0, "affected": affected}


def get_stats() -> dict:
    """Get subscriber statistics."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM subscribers WHERE is_active = 1")
    total_active = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM subscribers")
    total = cursor.fetchone()[0]

    cursor.execute(
        """SELECT career_id, COUNT(*) as count FROM subscribers
           WHERE is_active = 1 GROUP BY career_id ORDER BY count DESC"""
    )
    by_career = {row[0]: row[1] for row in cursor.fetchall()}

    conn.close()
    return {
        "total_subscribers": total,
        "active_subscribers": total_active,
        "by_career": by_career,
    }


# ─── Init on import ───
init_db()
