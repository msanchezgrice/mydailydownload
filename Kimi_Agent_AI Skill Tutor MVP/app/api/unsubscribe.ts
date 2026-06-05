import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SITE = "https://mydailydownload.com";

function page(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
  <body style="margin:0;background:#0B0C10;color:#E6E8EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;">
    <div style="max-width:460px;text-align:center;padding:40px 24px;">
      <div style="color:#F2A900;font-weight:700;font-size:18px;margin-bottom:24px;">My Daily Download</div>
      ${body}
      <p style="margin-top:28px;"><a href="${SITE}" style="color:#F2A900;text-decoration:none;font-size:14px;">← Back to site</a></p>
    </div></body></html>`;
}

/** Handles browser GET (click) and RFC 8058 one-click POST. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const token =
    (typeof req.query.token === "string" && req.query.token) ||
    (typeof (req.body as { token?: string })?.token === "string" && (req.body as { token: string }).token) ||
    "";

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!token || !supabaseUrl || !serviceRoleKey) {
    if (req.method === "POST") {
      res.status(400).json({ ok: false });
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(400).send(page(`<h1 style="font-size:22px;">Invalid unsubscribe link.</h1>`));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await supabase.from("subscribers").update({ is_active: false }).eq("unsubscribe_token", token);

  // One-click (Gmail/Yahoo) sends a POST — just acknowledge.
  if (req.method === "POST") {
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(
    page(
      `<h1 style="font-size:24px;margin:0 0 12px;">You're unsubscribed.</h1>
       <p style="color:#8A91A0;font-size:15px;line-height:1.6;margin:0;">You won't receive any more emails. Changed your mind? You can subscribe again anytime.</p>`
    )
  );
}
