import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** GET (click) + RFC 8058 one-click POST unsubscribe. Self-contained. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function htmlResponse(status: number, html: string): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function unsubscribe(token: string): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !supabaseUrl || !serviceRoleKey) return false;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await supabase
    .from("subscribers")
    .update({ is_active: false })
    .eq("unsubscribe_token", token);
  return true;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ok = await unsubscribe(token);
  if (!ok) {
    return htmlResponse(
      400,
      page(`<h1 style="font-size:22px;">Invalid unsubscribe link.</h1>`)
    );
  }
  return htmlResponse(
    200,
    page(
      `<h1 style="font-size:24px;margin:0 0 12px;">You're unsubscribed.</h1>
       <p style="color:#8A91A0;font-size:15px;line-height:1.6;margin:0;">You won't receive any more emails. Changed your mind? You can subscribe again anytime.</p>`
    )
  );
}

export async function POST(req: NextRequest) {
  // One-click (Gmail/Yahoo) sends a POST. Token may be in query or body.
  let token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    try {
      const body = (await req.json()) as { token?: string };
      if (typeof body?.token === "string") token = body.token;
    } catch {
      /* body may be form-encoded / empty — ignore */
    }
  }
  const ok = await unsubscribe(token);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
