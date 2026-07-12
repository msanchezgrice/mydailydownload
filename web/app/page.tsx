import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import HomeClient, { type SignedInHomeUser } from "./HomeClient";
import { CLERK_SERVER_ENABLED } from "./lib/clerk";
import { careerCategories, type CareerId } from "./lib/careerContent";
import { getSupabaseAdmin } from "./lib/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "https://mydailydownload.com/" },
};

type SubscriberProfile = {
  career_id: string | null;
  seniority: string | null;
  plan: string | null;
  confirmed_at: string | null;
  is_active: boolean | null;
  delivery_hour: number | null;
  tz: string | null;
};

const careerIds = new Set(careerCategories.map((career) => career.id));

function normalizeCareerId(careerId: string | null | undefined): CareerId | null {
  return careerId && careerIds.has(careerId) ? (careerId as CareerId) : null;
}

async function fetchSubscriberProfile(
  email: string
): Promise<SubscriberProfile | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("career_id, seniority, plan, confirmed_at, is_active, delivery_hour, tz")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) return null;
    return (data as SubscriberProfile | null) ?? null;
  } catch {
    return null;
  }
}

async function getSignedInHomeUser(): Promise<SignedInHomeUser | null> {
  if (!CLERK_SERVER_ENABLED) return null;

  const user = await currentUser().catch(() => null);
  if (!user) return null;

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.at(0)?.emailAddress ??
    "";
  const profile = email ? await fetchSubscriberProfile(email) : null;
  const careerId = normalizeCareerId(profile?.career_id);
  const careerName = careerId
    ? careerCategories.find((career) => career.id === careerId)?.name ?? null
    : null;

  return {
    name: user.firstName || user.fullName || email.split("@")[0] || "there",
    email: email || null,
    careerId,
    careerName,
    seniority: profile?.seniority ?? null,
    plan: profile?.plan ?? null,
    confirmed: profile?.confirmed_at ? true : profile ? false : null,
    isActive: profile?.is_active ?? null,
    deliveryHour: profile?.delivery_hour ?? null,
    timezone: profile?.tz ?? null,
  };
}

export default async function Home() {
  const signedInUser = await getSignedInHomeUser();
  return <HomeClient signedInUser={signedInUser} />;
}
