import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/stripe-webhook — receives Stripe webhook events.
 *
 * On `checkout.session.completed` it upserts the subscriber's plan to "pro" in
 * Supabase, keyed by email (session.customer_email or client_reference_id).
 *
 * The raw request body is required for signature verification, so the Vercel
 * body parser is disabled below. Self-contained by design (no local imports):
 * Vercel excludes `_`-prefixed shared files from the deployment.
 */

export const config = { api: { bodyParser: false } };

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook not configured (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)");
    res.status(500).json({ error: "Server not configured" });
    return;
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error("Failed to read raw body:", e);
    res.status(400).json({ error: "Could not read body" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = (session.customer_email || session.client_reference_id || "").trim().toLowerCase();

    if (email) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceRoleKey) {
        try {
          const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { error } = await supabase
            .from("subscribers")
            .upsert({ email, plan: "pro" }, { onConflict: "email" });
          if (error) console.error("Supabase upsert (pro) error:", error);
        } catch (e) {
          console.error("Supabase upsert (pro) failed:", e);
        }
      } else {
        console.error("Supabase not configured for webhook upsert");
      }
    } else {
      console.error("checkout.session.completed had no email/client_reference_id");
    }
  }

  res.status(200).json({ received: true });
}
