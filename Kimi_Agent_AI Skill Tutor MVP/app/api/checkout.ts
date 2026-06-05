import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/checkout — creates a Stripe Checkout Session for the Pro plan
 * ($19/mo subscription) and returns its hosted-checkout URL.
 *
 * Body: { email?: string }
 * Returns: { url: string }
 *
 * Self-contained by design: Vercel excludes `_`-prefixed shared files from the
 * deployment, so this function inlines everything it needs (no local imports).
 */

const SITE = "https://mydailydownload.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!secretKey || !priceId) {
    console.error("Stripe not configured (missing STRIPE_SECRET_KEY or STRIPE_PRO_PRICE_ID)");
    res.status(500).json({ error: "Server not configured" });
    return;
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === "string" ? (JSON.parse(req.body || "{}") as Record<string, unknown>) : ((req.body as Record<string, unknown>) ?? {});
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const email = EMAIL_RE.test(rawEmail) ? rawEmail : undefined;

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE}/#/?pro=success`,
      cancel_url: `${SITE}/#/?pro=cancel`,
      allow_promotion_codes: true,
      ...(email ? { customer_email: email, client_reference_id: email } : {}),
    });

    if (!session.url) {
      res.status(500).json({ error: "Could not create checkout session" });
      return;
    }
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    res.status(500).json({ error: "Could not create checkout session" });
  }
}
