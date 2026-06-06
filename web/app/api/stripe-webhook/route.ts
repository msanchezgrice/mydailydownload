import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { dispatchAnalyticsEvent } from "../../lib/analyticsServer";

/**
 * POST /api/stripe-webhook — receives Stripe webhook events.
 *
 * On `checkout.session.completed` it upserts the subscriber's plan to "pro" in
 * Supabase, keyed by email (session.customer_email or client_reference_id).
 *
 * App Router route handlers do NOT buffer/parse the body, so `req.text()`
 * returns the raw payload Stripe needs for signature verification. The matching
 * webhook endpoint targets mydailydownload.com/api/stripe-webhook, a path that
 * is unchanged after the apex cutover — so it keeps working as long as
 * STRIPE_WEBHOOK_SECRET on this project matches that endpoint's signing secret.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook not configured (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
    await dispatchAnalyticsEvent({
      eventName: "pro_purchase_completed",
      url: req.url,
      userAgent: req.headers.get("user-agent") ?? undefined,
      properties: {
        plan: "pro",
        source: "stripe_webhook",
        stripe_event_type: event.type,
      },
    });
  }

  return NextResponse.json({ received: true });
}
