/**
 * My Daily Download → My AI Skill Tutor funnel.
 *
 * My Daily Download has been absorbed into My AI Skill Tutor
 * (myaiskilltutor.com). The MDD SEO surface stays live, but every
 * signup/subscribe CTA now points at MAST's free AI-readiness assessment.
 *
 * Single source of truth for the destination URL + UTM tagging so every
 * surface funnels consistently.
 */

export const MAST_SITE_URL = "https://www.myaiskilltutor.com";

export type MastUtmCampaign = "career_hub" | "homepage";

/**
 * Build the MAST free-assessment URL with MDD referral UTMs.
 *
 * @param campaign  "career_hub" for the /ai-for SEO cluster (career hubs,
 *                  blog guides, sample guide); "homepage" for the landing
 *                  page and onboarding entry points.
 * @param careerId  Optional MDD career slug — appended as utm_content when
 *                  per-career context is available.
 */
export function mastAssessmentUrl(
  campaign: MastUtmCampaign,
  careerId?: string | null
): string {
  let url =
    `${MAST_SITE_URL}/assessment` +
    `?utm_source=mydailydownload&utm_medium=referral&utm_campaign=${campaign}`;
  if (careerId) url += `&utm_content=${encodeURIComponent(careerId)}`;
  return url;
}

/** Honest description of the free offer, reused across surfaces. */
export const MAST_FREE_OFFER =
  "a free 0-100 AI-readiness score for your role plus a skill-gap report — about 2 minutes, no account required";
