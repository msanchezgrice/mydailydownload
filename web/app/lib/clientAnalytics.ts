"use client";

import {
  buildAttributionFromUrl,
  sanitizeAnalyticsProperties,
  type AnalyticsEventName,
  type AttributionParams,
} from "./analytics";

const ANONYMOUS_ID_KEY = "mdd_anonymous_id";
const ATTRIBUTION_KEY = "mdd_attribution";

function safeRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
}

export function getMddAnonymousId(): string {
  if (typeof window === "undefined") return safeRandomId();
  const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;
  const next = safeRandomId();
  window.localStorage.setItem(ANONYMOUS_ID_KEY, next);
  return next;
}

export function captureCurrentAttribution(): AttributionParams {
  if (typeof window === "undefined") return {};
  const existing = readJson<AttributionParams>(ATTRIBUTION_KEY, {});
  const latest = buildAttributionFromUrl(window.location.href);
  const merged = { ...existing, ...latest };
  if (Object.keys(merged).length > 0) writeJson(ATTRIBUTION_KEY, merged);
  return merged;
}

export function getStoredAttribution(): AttributionParams {
  if (typeof window === "undefined") return {};
  return readJson<AttributionParams>(ATTRIBUTION_KEY, {});
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const anonymousId = getMddAnonymousId();
  const attribution = { ...captureCurrentAttribution(), ...getStoredAttribution() };

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MDD-Anonymous-ID": anonymousId,
    },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId: safeRandomId(),
      anonymousId,
      url: window.location.href,
      attribution,
      properties: sanitizeAnalyticsProperties(properties),
    }),
  }).catch(() => {
    /* analytics must never block the product flow */
  });
}
