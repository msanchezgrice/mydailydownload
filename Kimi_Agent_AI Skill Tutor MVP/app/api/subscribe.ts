import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/subscribe — captures a real signup into Supabase `subscribers`
 * and fires the double-opt-in confirmation email (Resend). Email helpers are
 * inlined (Vercel excludes `_`-prefixed shared files from the deployment).
 */

const SITE = "https://mydailydownload.com";
const FROM = "My Daily Download <newsletter@mydailydownload.com>";
// TODO before launch: real physical mailing address (CAN-SPAM).
const MAILING_ADDRESS = "My Daily Download, 8808 Mesa Drive, Austin, TX";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PLANS = new Set(["free", "pro"]);

async function sendEmail(to: string, subject: string, html: string, text: string, unsubscribeUrl: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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
      <a href="${unsubscribeUrl}" style="color:#7A8194;text-decoration:underline;">Unsubscribe</a> · <a href="${SITE}/#/privacy" style="color:#7A8194;text-decoration:underline;">Privacy</a><br/>
      ${MAILING_ADDRESS}<br/>© ${new Date().getFullYear()} My Daily Download
    </div>
  </div></body></html>`;
  const text = `Confirm your subscription to My Daily Download:\n${confirmUrl}\n\nIf you didn't sign up, ignore this email.\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject: "Confirm your My Daily Download subscription", html, text };
}

function getClientIp(req: VercelRequest): string | null {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0].split(",")[0].trim();
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) return realIp;
  return req.socket?.remoteAddress ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "Method not allowed" }); return; }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ ok: false, error: "Server not configured" });
    return;
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === "string" ? (JSON.parse(req.body || "{}") as Record<string, unknown>) : ((req.body as Record<string, unknown>) ?? {});
  } catch {
    res.status(400).json({ ok: false, error: "Invalid JSON body" });
    return;
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) { res.status(400).json({ ok: false, error: "Invalid email" }); return; }

  const careerId = typeof body.careerId === "string" && body.careerId.trim() ? body.careerId.trim() : null;
  const seniority = typeof body.seniority === "string" && body.seniority.trim() ? body.seniority.trim() : null;
  const interests = Array.isArray(body.interests) ? body.interests.filter((i): i is string => typeof i === "string") : [];
  const plan = typeof body.plan === "string" && ALLOWED_PLANS.has(body.plan) ? body.plan : "free";
  const consentText = typeof body.consentText === "string" && body.consentText.trim()
    ? body.consentText.trim()
    : "I agree to receive the My Daily Download newsletter. Unsubscribe anytime.";

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const sendConfirm = async (confirmToken: string, unsubToken: string): Promise<boolean> => {
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
    if (error.code === "23505" || /duplicate key|already exists/i.test(error.message)) {
      const { data: existing } = await supabase
        .from("subscribers")
        .select("confirm_token, unsubscribe_token, confirmed_at")
        .eq("email", email)
        .maybeSingle();
      let emailed = false;
      if (existing && !existing.confirmed_at && existing.confirm_token) {
        emailed = await sendConfirm(existing.confirm_token, existing.unsubscribe_token);
      }
      res.status(200).json({ ok: true, alreadySubscribed: true, emailed });
      return;
    }
    console.error("Supabase insert error:", error);
    res.status(500).json({ ok: false, error: "Could not save subscription" });
    return;
  }

  const emailed = await sendConfirm(row.confirm_token, row.unsubscribe_token);
  res.status(200).json({ ok: true, emailed });
}
