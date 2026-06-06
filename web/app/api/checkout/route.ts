import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout — creates a Stripe Checkout Session for the Pro plan
 * ($19/mo subscription) and returns its hosted-checkout URL.
 *
 * Body: { email?: string }
 * Returns: { url: string }
 *
 * App Router route handler. Self-contained (no shared imports) so it deploys
 * cleanly as its own Vercel function.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "https://mydailydownload.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!secretKey || !priceId) {
    console.error("Stripe not configured (missing STRIPE_SECRET_KEY or STRIPE_PRO_PRICE_ID)");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {}; // empty body is allowed (email optional)
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const email = EMAIL_RE.test(rawEmail) ? rawEmail : undefined;

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE}/?pro=success`,
      cancel_url: `${SITE}/onboarding?pro=cancel`,
      allow_promotion_codes: true,
      ...(email ? { customer_email: email, client_reference_id: email } : {}),
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
