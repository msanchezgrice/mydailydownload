-- My Daily Download — Supabase / Postgres schema.
--
-- Idempotent: safe to run repeatedly (CREATE TABLE IF NOT EXISTS + IF NOT
-- EXISTS indexes). Apply with:
--   psql "host=db.wzhnfctutueunirvciol.supabase.co port=5432 user=postgres \
--         dbname=postgres password=$SUPABASE_DB_PASSWORD sslmode=require" \
--        -f db/schema.sql
-- or via db.apply_schema() (psycopg2) in db.py.

-- ── subscribers ───────────────────────────────────────────────────────────
-- A person who receives the newsletter. Consent fields capture GDPR/CAN-SPAM
-- double opt-in evidence (token + timestamp + IP + the exact consent text).
CREATE TABLE IF NOT EXISTS subscribers (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             TEXT NOT NULL UNIQUE,
    career_id         TEXT NOT NULL DEFAULT 'product-management',
    seniority         TEXT DEFAULT 'Mid Level',
    interests         JSONB NOT NULL DEFAULT '[]'::jsonb,
    plan              TEXT NOT NULL DEFAULT 'free',
    tz                TEXT NOT NULL DEFAULT 'UTC',
    delivery_hour     INT  NOT NULL DEFAULT 7,
    confirm_token     TEXT,
    confirmed_at      TIMESTAMPTZ,
    unsubscribe_token TEXT,
    consent_ts        TIMESTAMPTZ,
    consent_ip        TEXT,
    consent_text      TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscribers_career ON subscribers (career_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers (is_active);

-- ── news_items ─────────────────────────────────────────────────────────────
-- A deduped, ranked news item harvested by the news engine. url is unique so
-- repeated harvests upsert rather than duplicate. content_hash mirrors the
-- engine's dedupe key; trending_score = how many feeds carried the story.
CREATE TABLE IF NOT EXISTS news_items (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url            TEXT NOT NULL UNIQUE,
    title          TEXT,
    summary        TEXT,
    source         TEXT,
    published_at   TIMESTAMPTZ,
    content_hash   TEXT,
    trending_score INT NOT NULL DEFAULT 1,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_hash      ON news_items (content_hash);

-- ── briefings ──────────────────────────────────────────────────────────────
-- A composed, fully-grounded briefing for one (career, seniority, date).
-- blocks_json is the structured briefing the engine emits; html is the
-- rendered email body. One briefing per (career_id, seniority, date).
CREATE TABLE IF NOT EXISTS briefings (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    career_id   TEXT NOT NULL,
    seniority   TEXT,
    dow         INT,
    date        DATE NOT NULL,
    blocks_json JSONB,
    html        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (career_id, seniority, date)
);
CREATE INDEX IF NOT EXISTS idx_briefings_career_date ON briefings (career_id, date DESC);

-- ── sends ──────────────────────────────────────────────────────────────────
-- A delivery record: one (subscriber, briefing_date) send. message_id is the
-- provider message id (AgentMail / Resend). One send per subscriber per date.
CREATE TABLE IF NOT EXISTS sends (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscriber_id BIGINT NOT NULL REFERENCES subscribers (id) ON DELETE CASCADE,
    briefing_date DATE NOT NULL,
    message_id    TEXT,
    status        TEXT NOT NULL DEFAULT 'queued',
    sent_at       TIMESTAMPTZ,
    UNIQUE (subscriber_id, briefing_date)
);
CREATE INDEX IF NOT EXISTS idx_sends_subscriber ON sends (subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sends_date       ON sends (briefing_date DESC);
