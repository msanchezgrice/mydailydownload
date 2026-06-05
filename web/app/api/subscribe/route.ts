import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/subscribe — captures a real signup into Supabase `subscribers`
 * and fires the double-opt-in confirmation email (Resend). Self-contained:
 * email helpers are inlined here (no shared imports).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "https://mydailydownload.com";
const FROM = "My Daily Download <newsletter@mydailydownload.com>";
const MAILING_ADDRESS =
  "My Daily Download · My Daily Download, 8808 Mesa Drive, Austin, TX";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PLANS = new Set(["free", "pro"]);

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
      const d = (await resp.json().catch(() => ({}))) as { message?: string };
      console.error("Resend error:", d.message || resp.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend send failed:", e);
    return false;
  }
}

function confirmationEmail(confirmUrl: string, unsubscribeUrl: string) {
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;">
    <div style="background:#0B0C10;padding:22px 32px;"><span style="color:#F2A900;font-weight:700;font-size:18px;">My Daily Download</span></div>
    <div style="padding:32px;color:#1A1D23;font-size:15px;line-height:1.65;">
      <h1 style="font-size:20px;margin:0 0 14px;color:#14171d;">Confirm your subscription</h1>
      <p style="margin:0 0 20px;color:#555;">You're one click from your personalized daily AI briefing. Confirm your email to start receiving it.</p>
      <p style="margin:0 0 24px;"><a href="${confirmUrl}" style="display:inline-block;background:#F2A900;color:#0B0C10;font-weight:600;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:8px;">Confirm my subscription →</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If you didn't sign up, you can ignore this email — nothing will be sent.</p>
    </div>
    <div style="padding:20px 32px;background:#f8f9fa;color:#7A8194;font-size:12px;line-height:1.6;text-align:center;">
      <a href="${unsubscribeUrl}" style="color:#7A8194;text-decoration:underline;">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:#7A8194;text-decoration:underline;">Privacy</a><br/>
      ${MAILING_ADDRESS}<br/>© ${new Date().getFullYear()} My Daily Download
    </div>
  </div></body></html>`;
  const text = `Confirm your subscription to My Daily Download:\n${confirmUrl}\n\nIf you didn't sign up, ignore this email.\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject: "Confirm your My Daily Download subscription", html, text };
}

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Server not configured" },
      { status: 500, headers: CORS }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400, headers: CORS }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400, headers: CORS }
    );
  }

  const careerId =
    typeof body.careerId === "string" && body.careerId.trim()
      ? body.careerId.trim()
      : null;
  const seniority =
    typeof body.seniority === "string" && body.seniority.trim()
      ? body.seniority.trim()
      : null;
  const interests = Array.isArray(body.interests)
    ? body.interests.filter((i): i is string => typeof i === "string")
    : [];
  const plan =
    typeof body.plan === "string" && ALLOWED_PLANS.has(body.plan)
      ? body.plan
      : "free";
  const consentText =
    typeof body.consentText === "string" && body.consentText.trim()
      ? body.consentText.trim()
      : "I agree to receive the My Daily Download newsletter. Unsubscribe anytime.";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sendConfirm = async (
    confirmToken: string,
    unsubToken: string
  ): Promise<boolean> => {
    const confirmUrl = `${SITE}/api/confirm?token=${confirmToken}`;
    const unsubUrl = `${SITE}/api/unsubscribe?token=${unsubToken}`;
    const { subject, html, text } = confirmationEmail(confirmUrl, unsubUrl);
    return sendEmail(email, subject, html, text, unsubUrl);
  };

  const row = {
    email,
    career_id: careerId,
    seniority,
    interests,
    plan,
    confirm_token: randomUUID(),
    unsubscribe_token: randomUUID(),
    consent_ts: new Date().toISOString(),
    consent_ip: getClientIp(req),
    consent_text: consentText,
    is_active: true,
  };

  const { error } = await supabase.from("subscribers").insert(row);

  if (error) {
    if (
      error.code === "23505" ||
      /duplicate key|already exists/i.test(error.message)
    ) {
      const { data: existing } = await supabase
        .from("subscribers")
        .select("confirm_token, unsubscribe_token, confirmed_at")
        .eq("email", email)
        .maybeSingle();
      let emailed = false;
      if (existing && !existing.confirmed_at && existing.confirm_token) {
        emailed = await sendConfirm(
          existing.confirm_token,
          existing.unsubscribe_token
        );
      }
      return NextResponse.json(
        { ok: true, alreadySubscribed: true, emailed },
        { status: 200, headers: CORS }
      );
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save subscription" },
      { status: 500, headers: CORS }
    );
  }

  const emailed = await sendConfirm(row.confirm_token, row.unsubscribe_token);
  return NextResponse.json({ ok: true, emailed }, { status: 200, headers: CORS });
}
