const DEFAULT_GA_MEASUREMENT_ID = "G-X27FVHNW9T";
const DEFAULT_GOOGLE_ADS_CONVERSION_ID = "AW-18217096122";
const DEFAULT_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL = "Gu4HCPLqk7ocELqny-5D";
const DEFAULT_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL = "x_yyCO_qk7ocELqny-5D";
const DEFAULT_GOOGLE_ADS_PURCHASE_LABEL = "gdreCOj5yLkcELqny-5D";

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

export const GA_MEASUREMENT_ID =
  clean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) || DEFAULT_GA_MEASUREMENT_ID;

export const GOOGLE_ADS_CONVERSION_ID = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
) || DEFAULT_GOOGLE_ADS_CONVERSION_ID;

export const GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL,
) || DEFAULT_GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL;

export const GOOGLE_ADS_BEGIN_CHECKOUT_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL,
) || DEFAULT_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL;

export const GOOGLE_ADS_PURCHASE_LABEL = clean(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
) || DEFAULT_GOOGLE_ADS_PURCHASE_LABEL;

export const googleTagIds = [
  GOOGLE_ADS_CONVERSION_ID,
  GA_MEASUREMENT_ID,
].filter(Boolean);

export const GOOGLE_TAG_SCRIPT_ID = googleTagIds[0] ?? "";

type GtagPayload = {
  send_to: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  new_customer?: boolean;
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
    value?: number;
    currency?: string;
    transactionId?: string;
    newCustomer?: boolean;
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
    ...(typeof options.value === "number" ? { value: options.value } : {}),
    ...(options.currency ? { currency: options.currency } : {}),
    ...(options.transactionId ? { transaction_id: options.transactionId } : {}),
    ...(typeof options.newCustomer === "boolean"
      ? { new_customer: options.newCustomer }
      : {}),
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
    value: 1.0,
    currency: "USD",
    eventCallback: navigate,
    eventTimeout: 700,
  });

  if (!sent) {
    navigate();
    return;
  }

  window.setTimeout(navigate, 900);
}
