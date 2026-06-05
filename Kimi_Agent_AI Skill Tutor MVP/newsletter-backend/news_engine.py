"""Real, cited news engine for "My Daily Download" (Phase 1).

This replaces the old `search_ai_news()` LLM-fabrication path. The engine
fetches *real* items from free RSS feeds, canonicalizes + dedupes them, ranks
them per career category, optionally summarizes them with a STRICT grounded
LLM prompt (only if OPENAI_API_KEY is set), and emits a structured briefing in
which **every rendered URL is guaranteed to exist in the fetched set**.

Hard invariant (the guardrail): no fact / headline / URL is ever emitted unless
it came from a feed item we actually fetched. If no LLM key is present, the
engine passes real feed titles + summaries through unchanged. It NEVER invents.

CLI:
    .venv/bin/python news_engine.py <category_id>          # human-readable
    .venv/bin/python news_engine.py <category_id> --json   # raw briefing JSON

Runnable with ZERO API keys (RSS is free).

Env-gated lanes (no-op until keys arrive):
    EXA_API_KEY      -> Lane B recall (Exa)
    TAVILY_API_KEY   -> Lane B recall (Tavily)
    AGENTMAIL_API_KEY-> Lane C newsletter-discovery
    OPENAI_API_KEY   -> grounded summarization (gpt-4o-mini)
"""
import os
import re
import sys
import json
import time
import hashlib
import logging
from html import unescape
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse, urlunparse, parse_qs, unquote, urljoin

import feedparser
import requests

from news_feeds import all_feeds
from config import CAREER_CATEGORIES, CAREER_ID_MAP, MAX_NEWS_ITEMS

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(levelname)s %(message)s")
log = logging.getLogger("news_engine")

# ──────────────────────────────────────────────────────────────────────────
# Day-of-week hero themes (overlay from the plan).
# ──────────────────────────────────────────────────────────────────────────
DOW_THEMES = {
    0: ("The Setup", "Week-ahead lead — what to watch this week"),       # Monday
    1: ("Tool Tuesday", "A tool worth trying today"),                    # Tuesday
    2: ("Playbook Wednesday", "A tactical workflow you can run now"),    # Wednesday
    3: ("Signal Thursday", "The signal that matters for your role"),     # Thursday
    4: ("The Roundup", "The week's biggest moves, rounded up"),          # Friday
    5: ("Weekend Read", "One longer read for the weekend"),              # Saturday
    6: ("Weekend Read", "One longer read for the weekend"),              # Sunday
}

# Tracking / junk query params to strip during canonicalization.
_TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "utm_id", "utm_name", "utm_reader", "utm_brand", "utm_social",
    "mc_cid", "mc_eid", "fbclid", "gclid", "dclid", "msclkid", "igshid",
    "yclid", "_hsenc", "_hsmi", "hsctatracking", "mkt_tok", "vero_id",
    "ref", "ref_src", "ref_url", "source", "cmpid", "ncid", "spm",
    "guccounter", "guce_referrer", "guce_referrer_sig",
}
# Params that commonly wrap a redirect target (decode without a network call).
_REDIRECT_PARAMS = ("url", "u", "redirect", "redirect_url", "dest", "destination", "target")

STOPWORDS = {
    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with",
    "is", "are", "was", "were", "this", "that", "it", "its", "as", "at",
    "by", "from", "new", "ai", "how", "why", "what", "you", "your",
}


# ──────────────────────────────────────────────────────────────────────────
# Fetch
# ──────────────────────────────────────────────────────────────────────────
def _clean_html(text: str) -> str:
    """Strip tags + collapse whitespace from a feed summary (no network)."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _content_hash(url: str, title: str) -> str:
    basis = (canonicalize(url) + "|" + (title or "").strip().lower()).encode("utf-8", "ignore")
    return hashlib.sha256(basis).hexdigest()[:16]


def _parse_published(entry) -> str:
    """Return an ISO8601 published timestamp string, best-effort."""
    for key in ("published_parsed", "updated_parsed"):
        val = entry.get(key)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc).isoformat()
            except (ValueError, TypeError):
                pass
    for key in ("published", "updated"):
        if entry.get(key):
            return entry.get(key)
    return ""


def fetch_all(feeds=None, per_feed_limit: int = 25) -> list:
    """Pull every feed via feedparser. Per-feed try/except: one bad feed never
    breaks the run. Returns a list of item dicts and a parallel stats record
    accessible via the `.fetch_stats` attribute on the returned list.
    """
    feeds = feeds if feeds is not None else all_feeds()
    items = []
    ok, fail = 0, 0
    failures = []

    for feed in feeds:
        url = feed["url"]
        source = feed["source"]
        try:
            parsed = feedparser.parse(url)
            # feedparser sets bozo on malformed feeds but often still yields entries.
            entries = parsed.entries or []
            if not entries:
                raise ValueError(f"no entries (bozo={getattr(parsed, 'bozo', '?')})")
            count = 0
            for entry in entries[:per_feed_limit]:
                link = (entry.get("link") or "").strip()
                title = _clean_html(entry.get("title") or "")
                if not link or not title:
                    continue
                summary = _clean_html(
                    entry.get("summary")
                    or (entry.get("content", [{}])[0].get("value") if entry.get("content") else "")
                    or entry.get("description")
                    or ""
                )
                canon = canonicalize(link)
                items.append({
                    "url": canon,
                    "original_url": link,
                    "title": title,
                    "summary": summary[:1200],
                    "source": source,
                    "tier": feed.get("tier", "press"),
                    "published": _parse_published(entry),
                    "content_hash": _content_hash(canon, title),
                })
                count += 1
            ok += 1
            log.info("feed OK  %-32s %3d items", source, count)
        except Exception as exc:  # noqa: BLE001 - per-feed isolation is intentional
            fail += 1
            failures.append({"source": source, "url": url, "error": str(exc)})
            log.warning("feed FAIL %-32s %s", source, exc)

    result = list(items)
    # Attach stats so callers can report success/failure counts.
    try:
        result_stats = {"ok": ok, "fail": fail, "total_feeds": len(feeds),
                        "total_items": len(items), "failures": failures}
        setattr(result, "fetch_stats", result_stats)  # type: ignore[attr-defined]
    except Exception:  # list does support attrs via subclass only; fallback below
        pass
    fetch_all.last_stats = {"ok": ok, "fail": fail, "total_feeds": len(feeds),
                            "total_items": len(items), "failures": failures}
    return result


# ──────────────────────────────────────────────────────────────────────────
# Canonicalize
# ──────────────────────────────────────────────────────────────────────────
def canonicalize(url: str) -> str:
    """Normalize a URL: unwrap obvious redirect wrappers (no network), strip
    tracking params, drop fragments. Falls back to the original on any error.
    """
    if not url:
        return url
    original = url.strip()
    try:
        # Best-effort unwrap of a redirect wrapper: ?url=<encoded real url>.
        for _ in range(3):  # unwrap up to 3 nested layers
            parsed = urlparse(url)
            qs = parse_qs(parsed.query)
            unwrapped = None
            for key in _REDIRECT_PARAMS:
                if key in qs and qs[key]:
                    candidate = unquote(qs[key][0])
                    if candidate.startswith("http://") or candidate.startswith("https://"):
                        unwrapped = candidate
                        break
            if unwrapped and unwrapped != url:
                url = unwrapped
                continue
            break

        parsed = urlparse(url)
        if not parsed.scheme:
            return original
        # Strip tracking params, keep meaningful ones.
        kept = []
        for key, val in parse_qs(parsed.query, keep_blank_values=False).items():
            if key.lower() in _TRACKING_PARAMS:
                continue
            for v in val:
                kept.append(f"{key}={v}")
        query = "&".join(kept)
        netloc = parsed.netloc.lower()
        # Drop a trailing slash on the path (but keep root "/").
        path = parsed.path
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]
        cleaned = urlunparse((parsed.scheme, netloc, path, parsed.params, query, ""))
        return cleaned
    except Exception:  # noqa: BLE001 - canonicalization must never raise
        return original


# ──────────────────────────────────────────────────────────────────────────
# Dedupe
# ──────────────────────────────────────────────────────────────────────────
def _normalize_title(title: str) -> str:
    t = (title or "").lower()
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def dedupe(items: list) -> list:
    """Drop exact content_hash dupes + near-dupes by normalized title.
    Tracks a `trending_score` = how many feeds carried the story.
    Keeps the highest-trust (primary > research > press > indie) representative.
    """
    tier_rank = {"primary": 0, "research": 1, "press": 2, "indie": 3}

    by_hash = {}
    for it in items:
        h = it["content_hash"]
        if h not in by_hash:
            by_hash[h] = dict(it)
            by_hash[h]["trending_score"] = 1
            by_hash[h]["_sources"] = {it["source"]}
        else:
            existing = by_hash[h]
            if it["source"] not in existing["_sources"]:
                existing["trending_score"] += 1
                existing["_sources"].add(it["source"])

    # Collapse near-dupes by normalized title.
    by_title = {}
    for it in by_hash.values():
        key = _normalize_title(it["title"])
        if not key:
            key = it["url"]
        if key not in by_title:
            by_title[key] = it
        else:
            keep = by_title[key]
            keep["trending_score"] += 1
            keep["_sources"] |= it["_sources"]
            # Prefer the higher-trust source as the representative.
            if tier_rank.get(it["tier"], 9) < tier_rank.get(keep["tier"], 9):
                merged_score = keep["trending_score"]
                merged_sources = keep["_sources"]
                by_title[key] = it
                by_title[key]["trending_score"] = merged_score
                by_title[key]["_sources"] = merged_sources

    out = []
    for it in by_title.values():
        it.pop("_sources", None)
        out.append(it)
    return out


# ──────────────────────────────────────────────────────────────────────────
# Rank
# ──────────────────────────────────────────────────────────────────────────
def _recency_decay(published: str) -> float:
    """Return a multiplier in (0,1]; newer = closer to 1. ~7-day half-life."""
    if not published:
        return 0.5
    dt = None
    # Try ISO first.
    try:
        s = published.replace("Z", "+00:00")
        dt = datetime.fromisoformat(s)
    except (ValueError, TypeError):
        # Try RFC822 via feedparser's own parser.
        try:
            parsed = feedparser._parse_date(published)  # type: ignore[attr-defined]
            if parsed:
                dt = datetime(*parsed[:6], tzinfo=timezone.utc)
        except Exception:  # noqa: BLE001
            dt = None
    if dt is None:
        return 0.5
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    age_days = max(0.0, (datetime.now(timezone.utc) - dt).total_seconds() / 86400.0)
    # 7-day half-life.
    return 0.5 ** (age_days / 7.0)


def _keywords(text: str) -> set:
    toks = re.findall(r"[a-z0-9]+", (text or "").lower())
    return {t for t in toks if t not in STOPWORDS and len(t) > 2}


def rank_for_category(items: list, category: dict, top_n: int = None) -> list:
    """Score items by keyword overlap with the category's search_terms +
    recency decay + a small trending boost + a small first-party trust boost.
    Returns the top N (default MAX_NEWS_ITEMS * 3 to give the composer slack).
    """
    if top_n is None:
        top_n = max(MAX_NEWS_ITEMS * 3, 12)
    terms = _keywords(category.get("search_terms", "") + " " + category.get("name", ""))
    tier_boost = {"primary": 1.15, "research": 1.0, "press": 1.05, "indie": 1.0}

    scored = []
    for it in items:
        text_kw = _keywords(it["title"] + " " + it["summary"])
        overlap = len(terms & text_kw)
        # Relevance dominates: category keyword overlap is the primary signal so
        # off-topic-but-recent items can't crowd out on-topic ones. A small floor
        # keeps a high-trending breaking item eligible without letting noise win.
        relevance = 1.0 * overlap + 0.15
        recency = _recency_decay(it.get("published", ""))
        trending = 1.0 + 0.35 * (it.get("trending_score", 1) - 1)
        # Recency is a gentle multiplier (0.7..1.0), not a co-equal term, so a
        # 3-keyword on-topic story beats a 0-keyword item published an hour ago.
        score = relevance * (0.7 + 0.3 * recency) * trending * tier_boost.get(it.get("tier"), 1.0)
        sc = dict(it)
        sc["_score"] = round(score, 4)
        sc["_overlap"] = overlap
        scored.append(sc)

    # Sort by score, but break ties toward more recent items.
    scored.sort(key=lambda x: (x["_score"], _recency_decay(x.get("published", ""))), reverse=True)
    return scored[:top_n]


# ──────────────────────────────────────────────────────────────────────────
# Grounded summarization (LLM optional; pass-through without a key)
# ──────────────────────────────────────────────────────────────────────────
def summarize_grounded(items: list) -> list:
    """If OPENAI_API_KEY is set, rewrite each item's summary using a STRICT
    grounded prompt (gpt-4o-mini, JSON mode). Otherwise pass the real feed
    title + summary through UNCHANGED. Either way, the source URL is preserved
    verbatim and no new facts are introduced.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        log.info("OPENAI_API_KEY not set -> grounded summarization OFF (passing real feed text through unchanged)")
        return [dict(it) for it in items]

    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
    except Exception as exc:  # noqa: BLE001
        log.warning("OpenAI client unavailable (%s); passing feed text through unchanged", exc)
        return [dict(it) for it in items]

    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    system = (
        "You are a careful newsletter editor. You will be given ONE news item: "
        "a title, a source summary, and a source URL. Rewrite ONLY using facts "
        "present in the provided text. Add NO facts, numbers, names, quotes, or "
        "claims that are not in the provided text. If a detail is unknown, omit "
        "it. Keep it to 1-2 sentences, neutral and factual. Return JSON: "
        '{"headline": "...", "summary": "...", "url": "<unchanged source url>"}. '
        "The url MUST be returned exactly as given."
    )

    out = []
    for it in items:
        payload = json.dumps({"title": it["title"], "summary": it["summary"], "url": it["url"]})
        new_item = dict(it)
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": payload},
                ],
                temperature=0.0,
                max_tokens=300,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
            # GUARD: never let the model change the URL. If it did, discard the
            # rewrite and fall back to the real feed text for this item.
            if data.get("url", "").strip() == it["url"]:
                new_item["title"] = data.get("headline", it["title"]).strip() or it["title"]
                new_item["summary"] = data.get("summary", it["summary"]).strip() or it["summary"]
            else:
                log.warning("summary URL drift on '%s' -> keeping original feed text", it["title"][:60])
        except Exception as exc:  # noqa: BLE001
            log.warning("summarize failed for '%s' (%s) -> keeping original feed text", it["title"][:60], exc)
        out.append(new_item)
    return out


# ──────────────────────────────────────────────────────────────────────────
# GUARDRAIL
# ──────────────────────────────────────────────────────────────────────────
def _collect_urls(obj) -> list:
    """Recursively collect every non-null `url`/`source_url` value in a briefing."""
    urls = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("url", "source_url") and isinstance(v, str) and v:
                urls.append(v)
            else:
                urls.extend(_collect_urls(v))
    elif isinstance(obj, list):
        for v in obj:
            urls.extend(_collect_urls(v))
    return urls


def validate(briefing: dict, fetched_urls: set) -> dict:
    """HARD INVARIANT: every URL rendered in the briefing must exist in the
    fetched set. Any block whose source URL is not in the fetched set is
    dropped. Returns the cleaned briefing. Raises AssertionError if, after
    cleaning, the top story has no valid source (a briefing must be grounded).
    """
    def _ok(url):
        return isinstance(url, str) and url in fetched_urls

    # Top story must have a fetched URL.
    top = briefing.get("topStory")
    if top and not _ok(top.get("url")):
        log.warning("guardrail: topStory url not in fetched set -> dropping topStory")
        briefing["topStory"] = None

    # Quick hits: drop any not in fetched set.
    cleaned_hits = []
    for hit in briefing.get("quickHits", []):
        if _ok(hit.get("url")):
            cleaned_hits.append(hit)
        else:
            log.warning("guardrail: dropping quickHit with non-fetched url: %r", hit.get("url"))
    briefing["quickHits"] = cleaned_hits

    # Sources list: drop any not in fetched set.
    cleaned_sources = []
    for src in briefing.get("sources", []):
        if _ok(src.get("url")):
            cleaned_sources.append(src)
        else:
            log.warning("guardrail: dropping source with non-fetched url: %r", src.get("url"))
    briefing["sources"] = cleaned_sources

    # Final assertion: every remaining URL is in the fetched set.
    remaining = _collect_urls(briefing)
    bad = [u for u in remaining if u not in fetched_urls]
    assert not bad, f"guardrail violation: {len(bad)} rendered URL(s) not in fetched set: {bad[:3]}"

    briefing["_validated"] = True
    return briefing


# ──────────────────────────────────────────────────────────────────────────
# Env-gated keyed lanes (Lane B / Lane C). No-ops until keys arrive.
# ──────────────────────────────────────────────────────────────────────────
EXA_SEARCH_URL = "https://api.exa.ai/search"


def _source_from_url(url: str) -> str:
    """Derive a clean, human-readable source name from a URL's host.

    Used for Exa results, which give us a URL + author but no feed `source`.
    e.g. https://www.theverge.com/... -> "theverge.com".
    """
    try:
        netloc = urlparse(url).netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc or "Exa"
    except Exception:  # noqa: BLE001
        return "Exa"


def fetch_exa(category: dict, num_results: int = 12, days_back: int = 14) -> list:
    """Lane B (Exa) topical recall.

    Calls the Exa `/search` API for the category's `search_terms` and returns
    items in the SAME shape as RSS items (url, original_url, title, summary,
    source, tier, published, content_hash) so they merge straight into the
    existing dedupe + rank + guardrail pipeline.

    No-op (returns []) until EXA_API_KEY is set — missing key degrades
    gracefully and never raises. Every returned URL comes verbatim from an Exa
    result; we never fabricate a link.
    """
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        log.info("Exa lane disabled — set EXA_API_KEY to enable.")
        return []

    terms = (category.get("search_terms") or category.get("name") or "").strip()
    if not terms:
        log.info("Exa lane: category %r has no search_terms; skipping.", category.get("id"))
        return []

    start_published = (
        datetime.now(timezone.utc) - timedelta(days=days_back)
    ).strftime("%Y-%m-%dT%H:%M:%SZ")

    payload = {
        "query": terms,
        "type": "auto",
        "numResults": num_results,
        "category": "news",
        "startPublishedDate": start_published,
        "contents": {"text": True, "highlights": True},
    }
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}

    try:
        resp = requests.post(EXA_SEARCH_URL, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            log.warning("Exa lane: HTTP %s -> skipping Exa for %s (%s)",
                        resp.status_code, category.get("id"), resp.text[:160])
            return []
        data = resp.json()
    except Exception as exc:  # noqa: BLE001 - Exa must never break a run
        log.warning("Exa lane: request failed (%s) -> skipping Exa for %s", exc, category.get("id"))
        return []

    results = data.get("results") or []
    items = []
    for res in results:
        link = (res.get("url") or "").strip()
        title = _clean_html(res.get("title") or "")
        # GUARD: a real, usable item needs a real URL and a real title.
        if not link or not title:
            continue
        # Summary: prefer the model-extracted highlight, fall back to text.
        highlights = res.get("highlights") or []
        summary = ""
        if highlights:
            summary = _clean_html(highlights[0])
        if not summary:
            summary = _clean_html(res.get("text") or "")
        canon = canonicalize(link)
        # publishedDate is ISO8601 already; keep as-is (best-effort).
        published = (res.get("publishedDate") or "").strip()
        items.append({
            "url": canon,
            "original_url": link,
            "title": title,
            "summary": summary[:1200],
            "source": _source_from_url(canon),
            "tier": "press",          # Exa news results behave like tech press for ranking
            "published": published,
            "content_hash": _content_hash(canon, title),
        })

    log.info("Exa lane OK  %-28s %3d items", category.get("id", "?"), len(items))
    return items


def fetch_tavily(category: dict) -> list:
    """Lane B (Tavily) topical recall. No-op until TAVILY_API_KEY is set."""
    if not os.getenv("TAVILY_API_KEY"):
        log.info("Tavily lane disabled — set TAVILY_API_KEY to enable.")
        return []
    log.info("Tavily lane: TAVILY_API_KEY present but client not yet implemented (Phase 1 stub).")
    return []


AGENTMAIL_BASE = "https://api.agentmail.to"
# The inbox we (would) ask people to subscribe their newsletters to. Discovery
# only flows through THIS inbox; nothing is sent from it by the news engine.
AGENTMAIL_INBOX = os.getenv("AGENTMAIL_INBOX", "mydailydownload@agentmail.to")
AGENTMAIL_INBOX_USERNAME = AGENTMAIL_INBOX.split("@", 1)[0]


def _agentmail_headers() -> dict:
    return {
        "Authorization": f"Bearer {os.getenv('AGENTMAIL_API_KEY')}",
        "Content-Type": "application/json",
    }


def _agentmail_ensure_inbox() -> str | None:
    """Ensure our discovery inbox exists; return its email address or None.

    Idempotent: lists existing inboxes first, only creates if missing. Never
    raises — any failure degrades the lane to a no-op.
    """
    try:
        r = requests.get(f"{AGENTMAIL_BASE}/v0/inboxes",
                          headers=_agentmail_headers(), timeout=30)
        if r.status_code == 200:
            for ib in (r.json().get("inboxes") or []):
                if ib.get("email") == AGENTMAIL_INBOX or ib.get("inbox_id") == AGENTMAIL_INBOX:
                    return ib.get("email") or AGENTMAIL_INBOX
        # Not found (or list failed) -> try to create it.
        r2 = requests.post(f"{AGENTMAIL_BASE}/v0/inboxes",
                           headers=_agentmail_headers(),
                           json={"username": AGENTMAIL_INBOX_USERNAME,
                                 "display_name": "My Daily Download"},
                           timeout=30)
        if r2.status_code in (200, 201):
            return r2.json().get("email") or AGENTMAIL_INBOX
        # AgentMail returns 409/422 if it already exists under another path.
        log.info("AgentMail: ensure-inbox returned HTTP %s; assuming %s exists",
                 r2.status_code, AGENTMAIL_INBOX)
        return AGENTMAIL_INBOX
    except Exception as exc:  # noqa: BLE001
        log.warning("AgentMail: ensure-inbox failed (%s) -> lane disabled", exc)
        return None


def _extract_links_from_html(html: str, base_url: str = "") -> list:
    """Pull outbound href links from newsletter HTML, unwrap tracking
    redirects via canonicalize(), and de-dupe. Returns a list of canonical
    URLs (primary sources). No network calls beyond what canonicalize does
    (which is none). Requires BeautifulSoup.
    """
    try:
        from bs4 import BeautifulSoup
    except Exception as exc:  # noqa: BLE001
        log.warning("AgentMail: BeautifulSoup unavailable (%s) -> no link extraction", exc)
        return []

    links = []
    seen = set()
    try:
        soup = BeautifulSoup(html or "", "html.parser")
    except Exception:  # noqa: BLE001
        return []
    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if not href:
            continue
        if base_url and href.startswith("/"):
            href = urljoin(base_url, href)
        if not (href.startswith("http://") or href.startswith("https://")):
            continue
        # Unwrap tracking redirects (?url=<encoded>) + strip utm params.
        canon = canonicalize(href)
        host = urlparse(canon).netloc.lower()
        # Skip mail-platform / unsubscribe / tracking-only links — not stories.
        if any(bad in host for bad in (
            "agentmail.to", "list-manage.com", "unsubscribe", "mailchi.mp",
            "substack.com/profile", "twitter.com/intent", "facebook.com/sharer",
            "beehiiv.com", "sendgrid.net", "mailgun.org",
        )):
            continue
        # Skip obvious unsubscribe/preferences anchors.
        anchor = (a.get_text() or "").strip().lower()
        if any(w in anchor for w in ("unsubscribe", "manage preferences", "view in browser", "update your")):
            continue
        if canon not in seen:
            seen.add(canon)
            links.append(canon)
    return links


def fetch_agentmail(max_messages: int = 25, max_links_per_message: int = 8) -> list:
    """Lane C (AgentMail newsletter-discovery).

    Reads recent messages in our discovery inbox, extracts the primary-source
    links the newsletters point at, unwraps tracking redirects, and returns
    DISCOVERY items in RSS shape (url, original_url, title, summary, source,
    tier, published, content_hash).

    Discovery-only: the item's title is the destination URL slug and the
    summary is empty (we cite the primary source, we do NOT reproduce a
    newsletter's prose). The grounded-summary + guardrail stages handle the
    rest; every URL is a real link pulled from a real received message.

    No-op (returns []) until AGENTMAIL_API_KEY is set. If the inbox has no
    subscribed newsletters yet, returns [] and logs a one-line hint telling
    the operator which address to subscribe newsletters to.
    """
    if not os.getenv("AGENTMAIL_API_KEY"):
        log.info("AgentMail lane disabled — set AGENTMAIL_API_KEY to enable.")
        return []

    inbox = _agentmail_ensure_inbox()
    if not inbox:
        return []

    # List recent messages.
    try:
        r = requests.get(f"{AGENTMAIL_BASE}/v0/inboxes/{inbox}/messages",
                         headers=_agentmail_headers(),
                         params={"limit": max_messages}, timeout=30)
        if r.status_code != 200:
            log.warning("AgentMail: list messages HTTP %s -> lane returns []", r.status_code)
            return []
        msgs = r.json().get("messages") or []
    except Exception as exc:  # noqa: BLE001
        log.warning("AgentMail: list messages failed (%s) -> lane returns []", exc)
        return []

    if not msgs:
        log.info("AgentMail: 0 messages in %s — subscribe newsletters to %s to enable discovery.",
                 inbox, inbox)
        return []

    items = []
    seen_urls = set()
    for m in msgs:
        mid = m.get("message_id")
        if not mid:
            continue
        try:
            from urllib.parse import quote
            md = requests.get(
                f"{AGENTMAIL_BASE}/v0/inboxes/{inbox}/messages/{quote(mid, safe='')}",
                headers=_agentmail_headers(), timeout=30)
            if md.status_code != 200:
                continue
            detail = md.json()
        except Exception as exc:  # noqa: BLE001
            log.warning("AgentMail: fetch message %s failed (%s)", str(mid)[:30], exc)
            continue

        html = detail.get("html") or detail.get("extracted_html") or ""
        published = (detail.get("timestamp") or detail.get("created_at") or "").strip()
        links = _extract_links_from_html(html)[:max_links_per_message]
        for canon in links:
            if canon in seen_urls:
                continue
            seen_urls.add(canon)
            # Discovery title = host + last path slug; NEVER the newsletter's prose.
            parsed = urlparse(canon)
            slug = parsed.path.rstrip("/").rsplit("/", 1)[-1].replace("-", " ").replace("_", " ").strip()
            host = _source_from_url(canon)
            title = (slug[:120].title() if slug else host)
            items.append({
                "url": canon,
                "original_url": canon,
                "title": title or host,
                "summary": "",  # discovery-only: no fabricated prose
                "source": host,
                "tier": "press",
                "published": published,
                "content_hash": _content_hash(canon, title),
            })

    log.info("AgentMail lane OK  inbox=%s  messages=%d  discovery_items=%d",
             inbox, len(msgs), len(items))
    return items


# ──────────────────────────────────────────────────────────────────────────
# Compose a briefing
# ──────────────────────────────────────────────────────────────────────────
def build_briefing(category_id: str, day_of_week: int = None, seniority: str = None,
                   max_quick_hits: int = None) -> dict:
    """Compose a structured, fully-grounded briefing for a category.

    Returns a dict:
        {
          category_id, category_name, date, day_of_week, dow_theme, dow_blurb,
          seniority,
          topStory: {headline, summary, source, url, published, trending_score} | None,
          quickHits: [{headline, summary, source, url, published}, ...],
          sources:  [{name, url}, ...],   # every primary source cited
          # curation-only blocks we cannot derive from RSS are intentionally
          # omitted or carry source: null. We never fabricate them.
          toolOfTheDay: null,
          byTheNumbers: null,
          fetched_count, feeds_ok, feeds_fail, _validated
        }
    """
    if max_quick_hits is None:
        max_quick_hits = MAX_NEWS_ITEMS
    category = CAREER_ID_MAP.get(category_id)
    if category is None:
        raise ValueError(f"unknown category_id: {category_id!r}. "
                         f"Valid: {', '.join(c['id'] for c in CAREER_CATEGORIES)}")

    if day_of_week is None:
        day_of_week = datetime.now().weekday()
    dow_theme, dow_blurb = DOW_THEMES.get(day_of_week, ("The Setup", ""))

    # ── Fetch (Lane A free RSS) + env-gated keyed lanes ──
    raw = fetch_all()
    stats = getattr(fetch_all, "last_stats", {"ok": 0, "fail": 0, "total_items": len(raw)})
    raw.extend(fetch_exa(category))
    raw.extend(fetch_tavily(category))
    raw.extend(fetch_agentmail())

    # The fetched-URL set is the universe the guardrail validates against.
    fetched_urls = {it["url"] for it in raw}

    # ── Canonicalize already done in fetch; dedupe + rank ──
    deduped = dedupe(raw)
    ranked = rank_for_category(deduped, category)

    # ── Grounded summarize (pass-through without a key) ──
    summarized = summarize_grounded(ranked)

    # ── Compose blocks from ranked real items ──
    top = summarized[0] if summarized else None
    rest = summarized[1:1 + max_quick_hits]

    def _item_view(it):
        return {
            "headline": it["title"],
            "summary": it["summary"],
            "source": it["source"],
            "url": it["url"],
            "published": it.get("published", ""),
            "trending_score": it.get("trending_score", 1),
        }

    briefing = {
        "category_id": category_id,
        "category_name": category["name"],
        "date": datetime.now().strftime("%B %d, %Y"),
        "day_of_week": day_of_week,
        "dow_theme": dow_theme,
        "dow_blurb": dow_blurb,
        "seniority": seniority,
        "topStory": _item_view(top) if top else None,
        "quickHits": [_item_view(it) for it in rest],
        # Every cited primary source (dedup by url), for a "Sources" footer.
        "sources": [],
        # Curation-only blocks we cannot honestly derive from RSS: omit /
        # mark source null. NEVER fabricated.
        "toolOfTheDay": None,      # needs real curation; left null until a real source feeds it
        "byTheNumbers": None,      # funding amounts / stats need a real cited source
        "fetched_count": len(fetched_urls),
        "feeds_ok": stats.get("ok"),
        "feeds_fail": stats.get("fail"),
    }

    # Build the sources list from the rendered items (top + quick hits).
    seen = set()
    for it in ([briefing["topStory"]] if briefing["topStory"] else []) + briefing["quickHits"]:
        if it["url"] not in seen:
            seen.add(it["url"])
            briefing["sources"].append({"name": it["source"], "url": it["url"]})

    # ── GUARDRAIL ──
    briefing = validate(briefing, fetched_urls)
    return briefing


# ──────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────
def _print_briefing(b: dict):
    line = "─" * 72
    print(line)
    print(f"  MY DAILY DOWNLOAD — {b['category_name'].upper()}  ·  {b['date']}")
    print(f"  {b['dow_theme']}: {b['dow_blurb']}")
    print(f"  feeds OK: {b['feeds_ok']}  failed: {b['feeds_fail']}  "
          f"unique fetched URLs: {b['fetched_count']}")
    print(line)
    if b["topStory"]:
        t = b["topStory"]
        trend = f"  [seen in {t['trending_score']} feeds]" if t["trending_score"] > 1 else ""
        print(f"\n[ TOP STORY ]{trend}")
        print(f"  {t['headline']}")
        if t["summary"]:
            print(f"  {t['summary'][:300]}")
        print(f"  Source: {t['source']} — {t['url']}")
    else:
        print("\n[ TOP STORY ]  (none passed the guardrail)")

    if b["quickHits"]:
        print("\n[ QUICK HITS ]")
        for i, h in enumerate(b["quickHits"], 1):
            print(f"  {i}. {h['headline']}")
            print(f"     Source: {h['source']} — {h['url']}")

    print("\n[ SOURCES CITED ]")
    for s in b["sources"]:
        print(f"  · {s['name']}: {s['url']}")

    print(f"\n[ CURATION-ONLY BLOCKS ]  toolOfTheDay={b['toolOfTheDay']}  "
          f"byTheNumbers={b['byTheNumbers']}  (omitted — no fabrication)")
    print(f"\n[ GUARDRAIL ]  validated={b.get('_validated')}  "
          f"(every rendered URL ∈ fetched set)")
    print(line)


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        print("Valid category_ids:")
        for c in CAREER_CATEGORIES:
            print(f"  {c['id']}")
        return 0
    category_id = argv[0]
    as_json = "--json" in argv[1:]
    dow = None
    for a in argv[1:]:
        if a.startswith("--dow="):
            dow = int(a.split("=", 1)[1])
    b = build_briefing(category_id, day_of_week=dow)
    if as_json:
        print(json.dumps(b, indent=2))
    else:
        _print_briefing(b)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
