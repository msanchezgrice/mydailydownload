# Approval Boundaries — My Daily Download

## STOP BEFORE (require Miguel's explicit approval)
- **Paid spend** — provisioning paid tiers, ad spend, paid API upgrades beyond free tiers.
- **Public posting** — any post to X, Facebook, or other public surface (the social repurpose loop drafts → holds for approval).
- **Customer emails** — sending any email to a real subscriber (incl. the first real broadcast). Seed/test sends to our own addresses are fine.
- **Provider/account mutations** — creating billable resources, changing plans, deleting projects.
- **Billing changes** — Stripe live mode, price changes, refunds.
- **Domain / DNS changes** — although Vercel + DNS are authorized, surface each DNS record set before applying.
- **Destructive / irreversible** — dropping tables, deleting deployments, force-push, removing domains.
- **MFA / CAPTCHA / login / account ambiguity** — pause and ask rather than guess credentials or which account to use.

## PRE-APPROVED (already authorized)
- **Local Phase 0 build** — fix/run the frontend demo locally (no spend, no emails).
- **Proxycurl provisioning** — real LinkedIn parsing approved.
- **Vercel + GitHub** — create a dedicated GitHub repo `mydailydownload`, a Vercel project, and configure DNS/SPF/DKIM/DMARC on mydailydownload.com (surface records before applying).
- **Test-mode only** — Stripe test mode, Resend domain verification, seed sends to our own inboxes.

## Default posture
When in doubt, **draft and hold** rather than execute. Public, paid, or customer-facing actions are opt-in per action, not standing.
