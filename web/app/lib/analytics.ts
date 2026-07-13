export const ATTRIBUTION_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
] as const;

export type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];
export type AttributionParams = Partial<Record<AttributionParamKey, string>>;

export const PII_EXCLUDED_FIELDS = [
  "email",
  "linkedin_url",
  "linkedinurl",
  "resume_text",
  "resumetext",
  "resume_file",
  "resumefile",
  "resume_file_name",
  "resumefilename",
  "filename",
  "file_name",
  "employer",
  "company",
  "job_title",
  "jobtitle",
  "title",
  "consent_ip",
  "consent_text",
  "ip",
  "stripe_customer_id",
  "stripecustomerid",
  "stripe_customer",
  "payment_method",
  "paymentmethod",
] as const;

const PII_FIELD_SET = new Set<string>(PII_EXCLUDED_FIELDS);
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/i;
const LINKEDIN_RE = /linkedin\.com\/in\//i;
const RESUME_FILE_RE = /\bresume\.(pdf|doc|docx|txt)\b/i;

export const ANALYTICS_EVENT_TAXONOMY = {
  landing_viewed: {
    description: "Visitor lands on the homepage or a campaign URL.",
    providers: ["posthog", "ga4"] as const,
  },
  career_hub_viewed: {
    description: "Visitor views an indexable /ai-for/[career] hub.",
    providers: ["posthog", "ga4"] as const,
  },
  cta_clicked: {
    description: "Visitor clicks a primary CTA toward onboarding or checkout.",
    providers: ["posthog", "ga4"] as const,
  },
  onboarding_started: {
    description: "Visitor starts the profile/onboarding flow.",
    providers: ["posthog", "ga4"] as const,
  },
  profile_preview_generated: {
    description: "A coarse role/seniority preview is generated without raw profile data.",
    providers: ["posthog"] as const,
  },
  profile_confirmed: {
    description: "Visitor accepts or corrects the coarse career and seniority profile.",
    providers: ["posthog", "ga4"] as const,
  },
  subscribe_submitted: {
    description: "Visitor submits the double-opt-in subscription form.",
    providers: ["posthog", "ga4"] as const,
  },
  confirmation_email_requested: {
    description: "Server saved the subscriber row and attempted the confirmation email.",
    providers: ["posthog", "ga4"] as const,
  },
  subscription_confirmed: {
    description: "Primary conversion: user clicked the double-opt-in confirmation link.",
    primaryConversion: true,
    providers: ["posthog", "ga4", "google_ads", "meta"] as const,
  },
  signed_up: {
    description: "Canonical portfolio signup: user completed the double-opt-in confirmation.",
    primaryConversion: true,
    providers: ["posthog"] as const,
  },
  checkout_started: {
    description: "Visitor asks to start Pro checkout.",
    providers: ["posthog", "ga4", "google_ads", "meta"] as const,
  },
  checkout_session_created: {
    description: "Server created a Stripe Checkout Session without exposing Stripe IDs.",
    providers: ["posthog", "ga4"] as const,
  },
  pro_purchase_completed: {
    description: "Secondary monetization conversion from Stripe webhook.",
    providers: ["posthog", "ga4", "google_ads", "meta"] as const,
  },
  unsubscribe_completed: {
    description: "Subscriber completed one-click or token-based unsubscribe.",
    providers: ["posthog"] as const,
  },
} as const;

export type AnalyticsEventName = keyof typeof ANALYTICS_EVENT_TAXONOMY;

export interface ProviderPayloadInput {
  eventName: AnalyticsEventName;
  eventId: string;
  anonymousId: string;
  url?: string;
  userAgent?: string;
  attribution?: AttributionParams;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

export interface ProviderPayloads {
  posthog: {
    event: string;
    distinct_id: string;
    properties: Record<string, unknown>;
  };
  ga4: {
    client_id: string;
    events: Array<{
      name: string;
      params: Record<string, unknown>;
    }>;
  };
  meta: {
    data: Array<{
      event_name: string;
      event_time: number;
      event_id: string;
      action_source: "website";
      event_source_url?: string;
      user_data: Record<string, unknown>;
      custom_data: Record<string, unknown>;
    }>;
  };
}

const META_EVENT_NAMES: Partial<Record<AnalyticsEventName, string>> = {
  subscription_confirmed: "CompleteRegistration",
  checkout_started: "InitiateCheckout",
  pro_purchase_completed: "Purchase",
};

function normalizeFieldName(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .toLowerCase();
}

function isPiiField(key: string): boolean {
  const normalized = normalizeFieldName(key);
  return (
    PII_FIELD_SET.has(normalized) ||
    normalized.includes("email") ||
    normalized.includes("linkedin") ||
    normalized.includes("resume") ||
    normalized.includes("stripe_customer") ||
    normalized.includes("payment") ||
    normalized.includes("consent_ip") ||
    normalized.includes("consent_text")
  );
}

function isPiiValue(value: string): boolean {
  return EMAIL_RE.test(value) || LINKEDIN_RE.test(value) || RESUME_FILE_RE.test(value);
}

function cleanValue(value: string): string | null {
  const cleaned = value.trim().slice(0, 200);
  if (!cleaned || isPiiValue(cleaned)) return null;
  return cleaned;
}

export function buildAttributionFromUrl(url: string): AttributionParams {
  const parsed = new URL(url);
  const attribution: AttributionParams = {};

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const rawValue = parsed.searchParams.get(key);
    if (!rawValue) continue;
    const value = cleanValue(rawValue);
    if (value) attribution[key] = value;
  }

  return attribution;
}

export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (isPiiField(key) || value === undefined || value === null) continue;

    if (typeof value === "string") {
      const cleaned = cleanValue(value);
      if (cleaned) sanitized[key] = cleaned;
      continue;
    }

    if (Array.isArray(value)) {
      const cleanArray = value
        .filter((item): item is string | number | boolean => {
          if (typeof item === "string") return cleanValue(item) !== null;
          return typeof item === "number" || typeof item === "boolean";
        })
        .map((item) => (typeof item === "string" ? cleanValue(item) : item));
      if (cleanArray.length > 0) sanitized[key] = cleanArray;
      continue;
    }

    if (typeof value === "object") {
      const nested = sanitizeAnalyticsProperties(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) sanitized[key] = nested;
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function flattenAttribution(attribution: AttributionParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attribution).map(([key, value]) => [`attribution_${key}`, value])
  );
}

export function buildProviderPayloads(input: ProviderPayloadInput): ProviderPayloads {
  const attribution = input.attribution ?? {};
  const cleanUrl = input.url ? cleanValue(input.url) ?? undefined : undefined;
  const baseProperties = sanitizeAnalyticsProperties({
    ...(input.properties ?? {}),
    ...flattenAttribution(attribution),
    event_id: input.eventId,
    anonymous_id: input.anonymousId,
    source_url: cleanUrl,
  });
  const eventTime = Math.floor((input.timestamp ?? new Date()).getTime() / 1000);
  const metaEventName = META_EVENT_NAMES[input.eventName] ?? "Other";
  const metaUserData = sanitizeAnalyticsProperties({
    external_id: input.anonymousId,
    client_user_agent: input.userAgent,
    fbc: attribution.fbclid ? `fb.1.${eventTime}.${attribution.fbclid}` : undefined,
  });

  return {
    posthog: {
      event: input.eventName,
      distinct_id: input.anonymousId,
      properties: baseProperties,
    },
    ga4: {
      client_id: input.anonymousId,
      events: [
        {
          name: input.eventName,
          params: baseProperties,
        },
      ],
    },
    meta: {
      data: [
        {
          event_name: metaEventName,
          event_time: eventTime,
          event_id: input.eventId,
          action_source: "website",
          ...(cleanUrl ? { event_source_url: cleanUrl } : {}),
          user_data: metaUserData,
          custom_data: baseProperties,
        },
      ],
    },
  };
}
