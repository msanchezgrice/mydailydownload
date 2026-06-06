"use client";

import { useEffect, useState } from "react";
import {
  sampleNewsletters,
  formatFor,
  dayKeyForDate,
  DAY_ROTATION,
  type SampleNewsletter,
  type CareerId,
  type DayKey,
} from "../lib/careerContent";

/**
 * NewsletterPreview (exported as SampleEmail for back-compat).
 *
 *  - <SampleEmail careerId="marketing" />            ← landing / onboarding
 *  - <SampleEmail content={briefing} careerName=… />  ← sample page
 */
interface SampleEmailProps {
  careerId?: CareerId;
  content?: SampleNewsletter;
  careerName?: string;
  todayDate?: string;
  dayKey?: DayKey;
  className?: string;
}

const FALLBACK_ID: CareerId = "product-management";

function stripPlaceholderLanguage(text: string): string {
  return text
    .replace(/\s+—\s+sample issue/gi, " — guide issue")
    .replace(/\byour sample AI edge\b/gi, "your AI edge")
    .replace(/\bSample Source\b/g, "Source")
    .replace(/\bSample Tool\b/g, "AI Tool")
    .replace(/\bSample date\b/g, "Date TBA")
    .replace(/\bsample metric\b/gi, "role metric")
    .replace(/\s*\((?:representative\s+)?sample[^)]*\)/gi, "")
    .replace(/\bsample\b/gi, "guide")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeNewsletter(newsletter: SampleNewsletter): SampleNewsletter {
  return JSON.parse(
    JSON.stringify(newsletter),
    (_key, value) =>
      typeof value === "string" ? stripPlaceholderLanguage(value) : value
  ) as SampleNewsletter;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B07A00] mb-2">
      {children}
    </div>
  );
}

export default function SampleEmail({
  careerId,
  content,
  careerName,
  todayDate,
  dayKey,
  className = "",
}: SampleEmailProps) {
  const rawData: SampleNewsletter =
    content ??
    sampleNewsletters[careerId ?? FALLBACK_ID] ??
    sampleNewsletters[FALLBACK_ID];
  const data = sanitizeNewsletter(rawData);

  const fmt = formatFor(data);
  const day: DayKey = dayKey ?? fmt.signatureDay ?? dayKeyForDate();
  const rotation = DAY_ROTATION[day];
  const label = careerName ?? data.careerName;
  const dateStr =
    todayDate ??
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const [shown, setShown] = useState(false);
  useEffect(() => {
    const hide = setTimeout(() => setShown(false), 0);
    const show = setTimeout(() => setShown(true), 30);
    return () => {
      clearTimeout(hide);
      clearTimeout(show);
    };
  }, [data.careerId, day]);

  return (
    <div
      className={`mx-auto max-w-[560px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden transition-opacity duration-500 ${
        shown ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {/* Email header */}
      <div className="bg-[#0B0C10] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#F2A900] flex items-center justify-center">
            <span className="text-[#0B0C10] text-[11px] font-extrabold">D</span>
          </div>
          <span className="text-[#E6E8EE] text-[13px] font-bold tracking-tight">
            My Daily Download
          </span>
        </div>
        <span className="text-[#8A91A0] text-[11px]">
          {label} · {rotation.theme} · {dateStr}
        </span>
      </div>

      {/* Email body */}
      <div className="p-6 text-[#1A1D23]">
        {/* HERO */}
        <div className="rounded-xl border-l-[3px] border-[#F2A900] bg-[#FFF8E7] p-4 mb-5">
          <Eyebrow>{rotation.eyebrow}</Eyebrow>

          {fmt.hero === "funding" && data.funding ? (
            <div className="space-y-1.5">
              {data.funding.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="font-semibold text-[#1A1D23]">{f.label}</span>
                  <span className="font-mono text-[#B07A00] font-semibold">
                    {f.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h4 className="text-[15px] font-bold text-[#1A1D23] leading-snug">
                {data.heroTitle}
              </h4>
              <p className="text-[13px] text-[#555] mt-1 leading-relaxed">
                {data.heroBody}
              </p>
            </>
          )}
        </div>

        {/* BIG STORY */}
        <Eyebrow>The Big Story</Eyebrow>
        <h5 className="text-[14px] font-semibold text-[#1A1D23] leading-snug">
          {data.topStory.headline}
        </h5>
        <p className="text-[13px] text-[#555] mt-1 leading-relaxed">
          {data.topStory.summary}
        </p>
        <div className="text-[12px] text-[#8A91A0] mt-1">
          Source: {data.topStory.source} ↗
        </div>

        {/* MARKETING extras */}
        {data.format === "marketing" && (
          <>
            {data.prompt && (
              <>
                <div className="mt-5">
                  <Eyebrow>Prompt of the Day</Eyebrow>
                </div>
                <div className="rounded-lg bg-[#0B0C10] text-[#E6E8EE] font-mono text-[12px] p-3 leading-relaxed">
                  {data.prompt}
                </div>
              </>
            )}
            {data.channelWatch && (
              <>
                <div className="mt-5">
                  <Eyebrow>Channel Watch</Eyebrow>
                </div>
                <ul className="list-disc pl-5 text-[13px] text-[#444] space-y-1">
                  {data.channelWatch.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-5">
              <Eyebrow>By the Numbers</Eyebrow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat value={data.stats.value1} label={data.stats.label1} />
              <Stat value={data.stats.value2} label={data.stats.label2} />
            </div>
          </>
        )}

        {/* PRODUCT extras */}
        {data.format === "product" && (
          <>
            {data.teardown && (
              <>
                <div className="mt-5">
                  <Eyebrow>Teardown</Eyebrow>
                </div>
                <h5 className="text-[14px] font-semibold text-[#1A1D23]">
                  {data.teardown.title}
                </h5>
                <p className="text-[13px] text-[#555] mt-1 leading-relaxed">
                  {data.teardown.body}
                </p>
              </>
            )}
            {data.benchmarks && (
              <>
                <div className="mt-5">
                  <Eyebrow>Benchmark Board</Eyebrow>
                </div>
                <ul className="list-disc pl-5 text-[13px] text-[#444] space-y-1">
                  {data.benchmarks.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {/* FOUNDER extras */}
        {data.format === "founder" && (
          <>
            <div className="mt-5">
              <Eyebrow>Tool Stack</Eyebrow>
            </div>
            <h5 className="text-[14px] font-semibold text-[#1A1D23]">
              {data.tool.name}
            </h5>
            <p className="text-[13px] text-[#555] mt-1 leading-relaxed">
              {data.tool.description}
            </p>
            {data.theAsk && (
              <>
                <div className="mt-5">
                  <Eyebrow>The Ask — do this today</Eyebrow>
                </div>
                <div className="rounded-lg bg-[#0B0C10] text-[#E6E8EE] font-mono text-[12px] p-3 leading-relaxed">
                  {data.theAsk}
                </div>
              </>
            )}
          </>
        )}

        {/* DEFAULT format extras */}
        {data.format === "default" && (
          <>
            <div className="mt-5">
              <Eyebrow>Tool of the Day</Eyebrow>
            </div>
            <div className="rounded-lg border-l-[3px] border-[#F2A900] bg-[#FFF8E7] p-3">
              <div className="text-[14px] font-semibold text-[#1A1D23]">
                {data.tool.name}
              </div>
              <div className="text-[13px] text-[#555] mt-0.5">
                {data.tool.description}
              </div>
            </div>

            <div className="mt-5">
              <Eyebrow>Quick Hits</Eyebrow>
            </div>
            <ul className="space-y-2">
              {data.quickHits.map((h, i) => (
                <li key={i}>
                  <div className="text-[13px] font-semibold text-[#1A1D23]">
                    {h.headline}
                  </div>
                  <div className="text-[12px] text-[#666]">{h.description}</div>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <Eyebrow>Playbook</Eyebrow>
            </div>
            <h5 className="text-[14px] font-semibold text-[#1A1D23]">
              {data.howTo.title}
            </h5>
            <p className="text-[13px] text-[#555] mt-1 leading-relaxed">
              {data.howTo.content}
            </p>

            <div className="mt-5">
              <Eyebrow>By the Numbers</Eyebrow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat value={data.stats.value1} label={data.stats.label1} />
              <Stat value={data.stats.value2} label={data.stats.label2} />
            </div>

            <div className="mt-5">
              <Eyebrow>Event Radar</Eyebrow>
            </div>
            <p className="text-[13px] text-[#444]">
              {data.upcoming.event} — {data.upcoming.date}
            </p>
          </>
        )}

        {/* CTA footer */}
        <div className="mt-6 rounded-lg bg-[#F8F9FA] px-4 py-3 text-center">
          <span className="text-[#B07A00] text-[13px] font-semibold">
            Get the full briefing — go Pro →
          </span>
        </div>
        <p className="text-[11px] text-[#9aa0ad] text-center mt-3">
          guide preview · {label} format · {rotation.theme} rotation
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-[#F8F9FA] p-3 text-center">
      <div className="text-[20px] font-bold text-[#B07A00] leading-none">
        {value}
      </div>
      <div className="text-[11px] text-[#666] mt-1 leading-tight">{label}</div>
    </div>
  );
}
