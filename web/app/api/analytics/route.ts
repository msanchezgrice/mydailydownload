import { NextResponse, type NextRequest } from "next/server";
import {
  coerceAnalyticsEventName,
  coerceAttribution,
  dispatchAnalyticsEvent,
} from "../../lib/analyticsServer";
import { sanitizeAnalyticsProperties } from "../../lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const eventName = coerceAnalyticsEventName(body.eventName);
  if (!eventName) {
    return NextResponse.json({ ok: false, error: "Invalid eventName" }, { status: 400 });
  }

  const result = await dispatchAnalyticsEvent({
    eventName,
    eventId: stringOrUndefined(body.eventId),
    anonymousId:
      stringOrUndefined(body.anonymousId) ||
      stringOrUndefined(req.headers.get("x-mdd-anonymous-id")),
    url: stringOrUndefined(body.url) || stringOrUndefined(req.headers.get("referer")),
    userAgent: stringOrUndefined(req.headers.get("user-agent")),
    attribution: coerceAttribution(body.attribution),
    properties: sanitizeAnalyticsProperties(
      body.properties && typeof body.properties === "object" && !Array.isArray(body.properties)
        ? (body.properties as Record<string, unknown>)
        : {},
    ),
  });

  return NextResponse.json(result);
}
