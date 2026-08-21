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
type BalanceRow = Pick<Stripe.BalanceTransaction, "id" | "amount" | "created" | "net" | "type" | "reporting_category">;

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

async function listAll<T extends { id: string }>(
  list: (params: { created: { gte: number; lt: number }; limit: number; starting_after?: string }) => Promise<{ data: T[]; has_more: boolean }>,
  window: TimeWindow,
): Promise<T[]> {
  const rows: T[] = [];
  let startingAfter: string | undefined;
  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const page = await list({
      created: { gte: window.start, lt: window.end },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    rows.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data.at(-1)?.id;
  }
  return rows;
}

function chargeLike(row: BalanceRow): boolean {
  return row.type === "charge" || row.type === "payment" || row.reporting_category === "charge";
}

function summarize(rows: BalanceRow[]) {
  const charges = rows.filter(chargeLike);
  return {
    grossCents: charges.reduce((total, row) => total + row.amount, 0),
    netCents: charges.reduce((total, row) => total + row.net, 0),
    paidConversions: charges.length,
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

function history(rows: BalanceRow[]) {
  const totals = new Map<string, number>();
  for (const row of rows.filter(chargeLike)) {
    const date = businessDate(row.created);
    totals.set(date, (totals.get(date) ?? 0) + row.amount);
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
    const [currentRows, priorRows, refundRows, disputeRows, historyRows] = await Promise.all([
      listAll<BalanceRow>(balanceList, input.current),
      listAll<BalanceRow>(balanceList, input.prior),
      listAll((params) => stripe.refunds.list(params), input.current),
      listAll((params) => stripe.disputes.list(params), input.current),
      input.history ? listAll<BalanceRow>(balanceList, input.history) : Promise.resolve([]),
    ]);
    const current = summarize(currentRows);
    const refundCents = refundRows.reduce((total, refund) => total + refund.amount, 0);

    return NextResponse.json({
      schemaVersion: 1,
      provider: "stripe",
      accountId: account.id,
      mode: secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_") ? "live" : "test",
      checkedAt: new Date().toISOString(),
      current: {
        ...current,
        refundCents,
        refunds: refundRows.length,
        disputes: disputeRows.length,
      },
      prior: summarize(priorRows),
      history: history(historyRows),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Portfolio revenue aggregate failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Revenue provider query failed" }, { status: 502 });
  }
}
