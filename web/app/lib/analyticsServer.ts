import { randomUUID } from "node:crypto";
import {
  ANALYTICS_EVENT_TAXONOMY,
  ATTRIBUTION_PARAM_KEYS,
  buildProviderPayloads,
  sanitizeAnalyticsProperties,
  type AnalyticsEventName,
  type AttributionParams,
} from "./analytics";
import { GA_MEASUREMENT_ID } from "./googleAds";

type ProviderName = "posthog" | "ga4" | "meta";

export interface ProviderDispatchReceipt {
  provider: ProviderName;
  status: "sent" | "skipped" | "failed";
  statusCode?: number;
  reason?: string;
}

export interface AnalyticsDispatchInput {
  eventName: AnalyticsEventName;
  eventId?: string;
  anonymousId?: string;
  url?: string;
  userAgent?: string;
  attribution?: AttributionParams;
  properties?: Record<string, unknown>;
}

export interface AnalyticsDispatchResult {
  ok: boolean;
  eventId: string;
  anonymousId: string;
  providers: ProviderDispatchReceipt[];
}

function clean(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function posthogHost(): string {
  return clean(process.env.NEXT_PUBLIC_POSTHOG_HOST) || "https://us.i.posthog.com";
}

function providerReceipt(
  provider: ProviderName,
  status: ProviderDispatchReceipt["status"],
  extra: Omit<ProviderDispatchReceipt, "provider" | "status"> = {},
): ProviderDispatchReceipt {
  return { provider, status, ...extra };
}

async function dispatchJson(
  provider: ProviderName,
  url: string,
  body: unknown,
): Promise<ProviderDispatchReceipt> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return providerReceipt(provider, response.ok ? "sent" : "failed", {
      statusCode: response.status,
      ...(response.ok ? {} : { reason: "provider_http_error" }),
    });
  } catch {
    return providerReceipt(provider, "failed", { reason: "network_error" });
  }
}

export function coerceAnalyticsEventName(value: unknown): AnalyticsEventName | null {
  if (typeof value !== "string") return null;
  return value in ANALYTICS_EVENT_TAXONOMY ? (value as AnalyticsEventName) : null;
}

export function coerceAttribution(value: unknown): AttributionParams {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const attribution: AttributionParams = {};
  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const rawValue = input[key];
    if (typeof rawValue === "string" && rawValue.trim()) {
      attribution[key] = rawValue.trim().slice(0, 200);
    }
  }
  return attribution;
}

export async function dispatchAnalyticsEvent(
  input: AnalyticsDispatchInput,
): Promise<AnalyticsDispatchResult> {
  const eventId = input.eventId?.trim() || randomUUID();
  const anonymousId = input.anonymousId?.trim() || `server:${randomUUID()}`;
  const payloads = buildProviderPayloads({
    ...input,
    eventId,
    anonymousId,
    properties: sanitizeAnalyticsProperties(input.properties ?? {}),
  });

  const providers: ProviderDispatchReceipt[] = [];
  const posthogToken = clean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
  if (posthogToken) {
    providers.push(
      await dispatchJson("posthog", `${posthogHost().replace(/\/$/, "")}/capture/`, {
        api_key: posthogToken,
        ...payloads.posthog,
      }),
    );
  } else {
    providers.push(providerReceipt("posthog", "skipped", { reason: "missing_project_token" }));
  }

  const ga4ApiSecret = clean(process.env.GA4_API_SECRET);
  if (GA_MEASUREMENT_ID && ga4ApiSecret) {
    const params = new URLSearchParams({
      measurement_id: GA_MEASUREMENT_ID,
      api_secret: ga4ApiSecret,
    });
    providers.push(
      await dispatchJson(
        "ga4",
        `https://www.google-analytics.com/mp/collect?${params.toString()}`,
        payloads.ga4,
      ),
    );
  } else {
    providers.push(providerReceipt("ga4", "skipped", { reason: "missing_api_secret" }));
  }

  const metaPixelId = clean(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const metaCapiToken = clean(process.env.META_CAPI_ACCESS_TOKEN);
  if (metaPixelId && metaCapiToken) {
    const params = new URLSearchParams({ access_token: metaCapiToken });
    const testEventCode = clean(process.env.META_TEST_EVENT_CODE);
    if (testEventCode) params.set("test_event_code", testEventCode);
    providers.push(
      await dispatchJson(
        "meta",
        `https://graph.facebook.com/v20.0/${encodeURIComponent(metaPixelId)}/events?${params.toString()}`,
        payloads.meta,
      ),
    );
  } else {
    providers.push(providerReceipt("meta", "skipped", { reason: "missing_pixel_or_capi_token" }));
  }

  return { ok: true, eventId, anonymousId, providers };
}
