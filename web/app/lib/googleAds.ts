const DEFAULT_GA_MEASUREMENT_ID = "G-X27FVHNW9T";

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

export const GA_MEASUREMENT_ID =
  clean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) || DEFAULT_GA_MEASUREMENT_ID;

export const GOOGLE_ADS_CONVERSION_ID = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
);

export const GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL,
);

export const GOOGLE_ADS_BEGIN_CHECKOUT_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL,
);

export const GOOGLE_ADS_PURCHASE_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
);

export const googleTagIds = [
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_ID,
].filter(Boolean);

type GtagPayload = {
  send_to: string;
  event_callback?: () => void;
  event_timeout?: number;
};

type GtagFn = (
  command: "event",
  eventName: "conversion",
  payload: GtagPayload,
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    __mddGoogleAdsConversions?: Record<string, true>;
  }
}

export function googleAdsSendTo(label: string | undefined): string {
  const cleanLabel = clean(label);
  if (!GOOGLE_ADS_CONVERSION_ID || !cleanLabel) return "";
  return `${GOOGLE_ADS_CONVERSION_ID}/${cleanLabel}`;
}

export function sendGoogleAdsConversion(
  label: string | undefined,
  options: {
    dedupeKey?: string;
    eventCallback?: () => void;
    eventTimeout?: number;
    once?: boolean;
  } = {},
): boolean {
  const sendTo = googleAdsSendTo(label);
  if (typeof window === "undefined" || !sendTo) return false;
  if (typeof window.gtag !== "function") return false;

  const dedupeKey = options.dedupeKey || sendTo;
  window.__mddGoogleAdsConversions ||= {};
  if (options.once !== false && window.__mddGoogleAdsConversions[dedupeKey]) {
    return true;
  }
  window.__mddGoogleAdsConversions[dedupeKey] = true;

  window.gtag("event", "conversion", {
    send_to: sendTo,
    ...(options.eventCallback ? { event_callback: options.eventCallback } : {}),
    ...(options.eventTimeout ? { event_timeout: options.eventTimeout } : {}),
  });
  return true;
}

export function navigateAfterGoogleAdsConversion(
  label: string | undefined,
  url: string,
): void {
  let navigated = false;
  const navigate = () => {
    if (navigated) return;
    navigated = true;
    window.location.href = url;
  };

  const sent = sendGoogleAdsConversion(label, {
    dedupeKey: `begin_checkout:${url}`,
    eventCallback: navigate,
    eventTimeout: 700,
  });

  if (!sent) {
    navigate();
    return;
  }

  window.setTimeout(navigate, 900);
}
