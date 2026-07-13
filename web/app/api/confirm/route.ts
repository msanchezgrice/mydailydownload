import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL,
  GOOGLE_ADS_CONVERSION_ID,
  GOOGLE_TAG_SCRIPT_ID,
  googleAdsSendTo,
} from "../../lib/googleAds";
import { dispatchAnalyticsEvent } from "../../lib/analyticsServer";

/** GET /api/confirm?token= — double-opt-in confirm + welcome email (Resend, inlined). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "https://mydailydownload.com";
const FROM = "My Daily Download <newsletter@mydailydownload.com>";
const MAILING_ADDRESS =
  "My Daily Download · My Daily Download, 8808 Mesa Drive, Austin, TX";

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  unsubscribeUrl: string
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    if (!resp.ok) {
      console.error("Resend error:", resp.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend send failed:", e);
    return false;
  }
}

function welcomeEmail(careerName: string | null, unsubscribeUrl: string) {
  const who = careerName ? ` for ${careerName}` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;">
    <div style="background:#0B0C10;padding:22px 32px;"><span style="color:#F2A900;font-weight:700;font-size:18px;">My Daily Download</span></div>
    <div style="padding:32px;color:#1A1D23;font-size:15px;line-height:1.65;">
      <h1 style="font-size:20px;margin:0 0 14px;color:#14171d;">You're in. Welcome to My Daily Download.</h1>
      <p style="margin:0 0 16px;color:#555;">Every morning you'll get a sharp, <strong>source-cited</strong> AI briefing${who} — the tools, releases, and moves that actually matter for your role. No fluff, no fabricated headlines: every item links to its original source.</p>
      <p style="margin:0 0 16px;color:#555;"><strong>What to expect:</strong> the big story + why it matters to you, quick hits, a tactical play, and a day-of-week rhythm (Tool Tuesday, Playbook Wednesday, and more).</p>
      <p style="margin:0 0 24px;"><a href="${SITE}/sample" style="display:inline-block;background:#F2A900;color:#0B0C10;font-weight:600;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:8px;">See an example guide →</a></p>
      <p style="margin:0;color:#888;font-size:13px;">Your first briefing arrives tomorrow morning.</p>
    </div>
    <div style="padding:20px 32px;background:#f8f9fa;color:#7A8194;font-size:12px;line-height:1.6;text-align:center;">
      <a href="${unsubscribeUrl}" style="color:#7A8194;text-decoration:underline;">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:#7A8194;text-decoration:underline;">Privacy</a><br/>
      ${MAILING_ADDRESS}<br/>© ${new Date().getFullYear()} My Daily Download
    </div>
  </div></body></html>`;
  const text = `Welcome to My Daily Download${who}! Every morning you'll get a source-cited AI briefing tailored to your role. Your first one arrives tomorrow.\nExample guide: ${SITE}/sample\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject: "Welcome to My Daily Download", html, text };
}

function humanizeCareer(slug: string | null): string | null {
  if (!slug) return null;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function escapeScriptValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function googleAdsConversionSnippet(label: string): string {
  const sendTo = googleAdsSendTo(label);
  if (!sendTo) return "";

  const configLines = [
    `gtag('config', '${escapeScriptValue(GA_MEASUREMENT_ID)}');`,
    GOOGLE_ADS_CONVERSION_ID
      ? `gtag('config', '${escapeScriptValue(GOOGLE_ADS_CONVERSION_ID)}');`
      : "",
  ].filter(Boolean);

  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_SCRIPT_ID)}"></script>
  <script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configLines.join("\n")}
gtag('event', 'conversion', {
  'send_to': '${escapeScriptValue(sendTo)}',
  'value': 1.0,
  'currency': 'USD'
});
  </script>`;
}

function page(title: string, body: string, head = ""): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${head}</head>
  <body style="margin:0;background:#0B0C10;color:#E6E8EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;">
    <div style="max-width:460px;text-align:center;padding:40px 24px;">
      <div style="color:#F2A900;font-weight:700;font-size:18px;margin-bottom:24px;">My Daily Download</div>
      ${body}
      <p style="margin-top:28px;"><a href="${SITE}" style="color:#F2A900;text-decoration:none;font-size:14px;">← Back to site</a></p>
    </div></body></html>`;
}

function htmlResponse(status: number, html: string): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!token || !supabaseUrl || !serviceRoleKey) {
    return htmlResponse(
      400,
      page(
        "Invalid link",
        `<h1 style="font-size:22px;">This confirmation link is invalid.</h1>`
      )
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sub } = await supabase
    .from("subscribers")
    .select("email, career_id, unsubscribe_token, confirmed_at")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!sub) {
    return htmlResponse(
      404,
      page(
        "Link not found",
        `<h1 style="font-size:22px;">This link has expired or was already used.</h1>`
      )
    );
  }

  let confirmedNow = false;
  if (!sub.confirmed_at) {
    await supabase
      .from("subscribers")
      .update({ confirmed_at: new Date().toISOString(), is_active: true })
      .eq("confirm_token", token);
    confirmedNow = true;
    const unsubUrl = `${SITE}/api/unsubscribe?token=${sub.unsubscribe_token}`;
    const { subject, html, text } = welcomeEmail(
      humanizeCareer(sub.career_id),
      unsubUrl
    );
    await sendEmail(sub.email, subject, html, text, unsubUrl);
  }

  if (confirmedNow) {
    const analyticsContext = {
      url: req.url,
      userAgent: req.headers.get("user-agent") ?? undefined,
      properties: {
        career_id: sub.career_id,
        confirmed_now: true,
        conversion_source: "double_opt_in_confirmation",
      },
    };
    await Promise.all([
      dispatchAnalyticsEvent({
        eventName: "subscription_confirmed",
        ...analyticsContext,
      }),
      dispatchAnalyticsEvent({
        eventName: "signed_up",
        ...analyticsContext,
      }),
    ]);
  }

  return htmlResponse(
    200,
    page(
      "You're confirmed",
      `<h1 style="font-size:24px;margin:0 0 12px;">You're confirmed. 🟡</h1>
       <p style="color:#8A91A0;font-size:15px;line-height:1.6;margin:0;">Your first personalized AI briefing arrives tomorrow morning. We just sent a welcome email with what to expect.</p>`,
      confirmedNow
        ? googleAdsConversionSnippet(GOOGLE_ADS_CONFIRMED_SUBSCRIBE_LABEL)
        : "",
    )
  );
}
