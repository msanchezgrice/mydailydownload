import { timingSafeEqual } from "node:crypto";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_ACCOUNT_ID = "acct_1Tf4DDPnLtm1veVC";
const MAX_WINDOW_SECONDS = 35 * 24 * 60 * 60;
const MAX_PAGES = 100;

type TimeWindow = { start: number; end: number };
type RevenueRequest = { current: TimeWindow; prior: TimeWindow; history?: TimeWindow };
type BalanceRow = Pick<Stripe.BalanceTransaction, "id" | "amount" | "created" | "currency" | "net" | "type" | "reporting_category">;
type ChargeRow = Pick<Stripe.Charge, "id" | "amount" | "created" | "currency" | "paid" | "status">;
type RefundRow = Pick<Stripe.Refund, "id" | "amount" | "created" | "currency" | "status">;
type DisputeRow = Pick<Stripe.Dispute, "id" | "amount" | "created" | "currency" | "status">;
type ListParams = { created: { gte: number; lt: number }; limit: number; starting_after?: string };
type ListPage<T> = { data: T[]; has_more: boolean };

function authorized(request: NextRequest, expected: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const supplied = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function validWindow(value: unknown): value is TimeWindow {
  if (!value || typeof value !== "object") return false;
  const { start, end } = value as Partial<TimeWindow>;
  return Number.isInteger(start)
    && Number.isInteger(end)
    && Number(start) >= 1_577_836_800
    && Number(end) > Number(start)
    && Number(end) - Number(start) <= MAX_WINDOW_SECONDS;
}

function validRequest(value: unknown): value is RevenueRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<RevenueRequest>;
  return validWindow(input.current) && validWindow(input.prior) && (input.history === undefined || validWindow(input.history));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function validProviderRow(value: unknown): value is Record<string, unknown> & { id: string } {
  return isRecord(value) && typeof value.id === "string" && value.id.length > 0;
}

function validBalanceRow(value: unknown): value is BalanceRow {
  return validProviderRow(value)
    && Number.isInteger(value.amount)
    && Number.isInteger(value.created)
    && value.currency === "usd"
    && Number.isInteger(value.net)
    && typeof value.type === "string"
    && typeof value.reporting_category === "string";
}

function validChargeRow(value: unknown): value is ChargeRow {
  return validProviderRow(value)
    && Number.isInteger(value.amount)
    && Number(value.amount) >= 0
    && Number.isInteger(value.created)
    && value.currency === "usd"
    && typeof value.paid === "boolean"
    && typeof value.status === "string";
}

function validRefundRow(value: unknown): value is RefundRow {
  return validProviderRow(value)
    && Number.isInteger(value.amount)
    && Number(value.amount) >= 0
    && Number.isInteger(value.created)
    && value.currency === "usd"
    && ["pending", "requires_action", "succeeded", "failed", "canceled"].includes(String(value.status));
}

function validDisputeRow(value: unknown): value is DisputeRow {
  return validProviderRow(value)
    && Number.isInteger(value.amount)
    && Number.isInteger(value.created)
    && value.currency === "usd"
    && typeof value.status === "string";
}

function validListPage<T extends { id: string }>(value: unknown, validateRow: (row: unknown) => row is T): value is ListPage<T> {
  return isRecord(value)
    && Array.isArray(value.data)
    && typeof value.has_more === "boolean"
    && value.data.every(validateRow);
}

async function listAll<T extends { id: string }>(
  list: (params: ListParams) => Promise<unknown>,
  window: TimeWindow,
  validateRow: (row: unknown) => row is T,
): Promise<T[]> {
  const rows: T[] = [];
  let startingAfter: string | undefined;
  const seenIds = new Set<string>();
  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const rawPage = await list({
      created: { gte: window.start, lt: window.end },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    if (!validListPage(rawPage, validateRow)) {
      throw new Error("Invalid Stripe list response");
    }
    const page = rawPage;
    for (const row of page.data) {
      if (seenIds.has(row.id)) {
        throw new Error("Stripe list cursor did not make unique progress");
      }
      seenIds.add(row.id);
      rows.push(row);
    }
    if (!page.has_more) return rows;
    if (page.data.length === 0) {
      throw new Error("Stripe list response has_more without rows");
    }
    const nextCursor = page.data.at(-1)?.id;
    if (!nextCursor || nextCursor === startingAfter) {
      throw new Error("Stripe list cursor did not make unique progress");
    }
    startingAfter = nextCursor;
  }
  throw new Error("Stripe list page cap exceeded");
}

function succeededCharge(row: ChargeRow): boolean {
  return row.paid === true && row.status === "succeeded";
}

const REVENUE_IMPACT_MATRIX: Readonly<Record<string, { types: readonly string[]; affectsGross: boolean }>> = {
  charge: { types: ["charge", "payment", "validation"], affectsGross: true },
  charge_failure: { types: ["payment_failure_refund"], affectsGross: true },
  partial_capture_reversal: { types: ["refund"], affectsGross: true },
  refund: { types: ["refund", "payment_refund"], affectsGross: false },
  dispute: { types: ["adjustment", "adjusted_for_overdraft_transaction"], affectsGross: false },
  dispute_reversal: { types: ["adjustment"], affectsGross: false },
  refund_failure: { types: ["refund_failure"], affectsGross: false },
};

function revenueImpactEntry(row: BalanceRow): { types: readonly string[]; affectsGross: boolean } | undefined {
  const entry = REVENUE_IMPACT_MATRIX[row.reporting_category];
  if (entry) {
    if (!entry.types.includes(row.type)) {
      throw new Error("Stripe balance transaction violated the supported reporting-category/type matrix");
    }
    return entry;
  }
  // Reporting category is authoritative. Generic types such as `adjustment`
  // legitimately appear in non-revenue categories, so unsupported categories
  // are ignored. A payment reversal is an explicit exception until Stripe's
  // category mapping is proven, because silently omitting that debit would
  // overstate revenue.
  if (row.type === "payment_reversal") throw new Error("Unsupported Stripe payment reversal reporting category");
  return undefined;
}

function grossRevenueImpactCents(row: BalanceRow): number {
  return revenueImpactEntry(row)?.affectsGross ? row.amount : 0;
}

function summarize(rows: BalanceRow[], charges: ChargeRow[]) {
  return {
    grossCents: rows.reduce((total, row) => total + grossRevenueImpactCents(row), 0),
    netCents: rows.reduce((total, row) => revenueImpactEntry(row) ? total + row.net : total, 0),
    paidConversions: charges.filter(succeededCharge).length,
  };
}

const chicagoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function businessDate(epochSeconds: number): string {
  const parts = Object.fromEntries(chicagoDate.formatToParts(new Date(epochSeconds * 1000))
    .filter((part) => ["year", "month", "day"].includes(part.type))
    .map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function businessDateStartSeconds(value: string): number | undefined {
  const [year, month, day] = value.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day, 0, 0, 0);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let iteration = 0; iteration < 4; iteration += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess))
      .filter((part) => ["year", "month", "day", "hour", "minute", "second"].includes(part.type))
      .map((part) => [part.type, Number(part.value)])) as Record<string, number>;
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const adjustment = target - represented;
    guess += adjustment;
    if (adjustment === 0) break;
  }
  const seconds = Math.floor(guess / 1000);
  return Number.isSafeInteger(seconds) ? seconds : undefined;
}

function history(rows: BalanceRow[], requested?: TimeWindow) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const grossCents = grossRevenueImpactCents(row);
    if (grossCents === 0) continue;
    const date = businessDate(row.created);
    const dateStart = businessDateStartSeconds(date);
    if (!requested || dateStart === undefined || dateStart < requested.start || dateStart >= requested.end) continue;
    totals.set(date, (totals.get(date) ?? 0) + grossCents);
  }
  return {
    timeZone: "America/Chicago",
    days: [...totals.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, grossCents]) => ({ date, grossCents })),
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const metricsToken = process.env.PORTFOLIO_METRICS_TOKEN;
  if (!secretKey || !metricsToken) {
    return NextResponse.json({ error: "Revenue metrics are not configured" }, { status: 503 });
  }
  if (!authorized(request, metricsToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!validRequest(input)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  try {
    const account = await stripe.accounts.retrieve(null);
    if (account.id !== EXPECTED_ACCOUNT_ID) {
      return NextResponse.json({ error: "Revenue provider identity check failed" }, { status: 502 });
    }

    const balanceList = (params: Parameters<typeof stripe.balanceTransactions.list>[0]) => stripe.balanceTransactions.list(params);
    const chargeList = (params: Parameters<typeof stripe.charges.list>[0]) => stripe.charges.list(params);
    const [currentRows, currentCharges, priorRows, priorCharges, refundRows, disputeRows, historyRows] = await Promise.all([
      listAll<BalanceRow>(balanceList, input.current, validBalanceRow),
      listAll<ChargeRow>(chargeList, input.current, validChargeRow),
      listAll<BalanceRow>(balanceList, input.prior, validBalanceRow),
      listAll<ChargeRow>(chargeList, input.prior, validChargeRow),
      listAll<RefundRow>((params) => stripe.refunds.list(params), input.current, validRefundRow),
      listAll<DisputeRow>((params) => stripe.disputes.list(params), input.current, validDisputeRow),
      input.history ? listAll<BalanceRow>(balanceList, input.history, validBalanceRow) : Promise.resolve([]),
    ]);
    const current = summarize(currentRows, currentCharges);
    const succeededRefunds = refundRows.filter((refund) => refund.status === "succeeded");
    const refundCents = succeededRefunds.reduce((total, refund) => total + refund.amount, 0);

    return NextResponse.json({
      schemaVersion: 2,
      provider: "stripe",
      accountId: account.id,
      mode: secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_") ? "live" : "test",
      currency: "usd",
      checkedAt: new Date().toISOString(),
      requested: {
        current: { start: input.current.start, end: input.current.end },
        prior: { start: input.prior.start, end: input.prior.end },
        ...(input.history ? { history: { start: input.history.start, end: input.history.end } } : {}),
      },
      current: {
        ...current,
        refundCents,
        refunds: succeededRefunds.length,
        disputes: disputeRows.length,
      },
      prior: summarize(priorRows, priorCharges),
      history: history(historyRows, input.history),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Portfolio revenue aggregate failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Revenue provider query failed" }, { status: 502 });
  }
}
