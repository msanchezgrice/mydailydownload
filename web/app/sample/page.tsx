import { careerCategories, type CareerId } from "../lib/careerContent";
import { getSupabaseAdmin } from "../lib/supabaseServer";
import SampleGuideClient, {
  type BriefingGuide,
  type BriefingGuideItem,
} from "./SampleGuideClient";

export const dynamic = "force-dynamic";

interface BriefingBlocks {
  topStory?: BriefingGuideItem | null;
  quickHits?: BriefingGuideItem[];
  sources?: { name: string; url: string }[];
  dow_theme?: string | null;
  dow_blurb?: string | null;
}

const careerIds = careerCategories.map((career) => career.id) as CareerId[];

function normalizeCareer(value: string | string[] | undefined): CareerId {
  const raw = Array.isArray(value) ? value[0] : value;
  return careerIds.includes(raw as CareerId)
    ? (raw as CareerId)
    : "product-management";
}

function cleanItem(
  item: BriefingGuideItem | null | undefined
): BriefingGuideItem | null {
  if (!item?.headline || !item.url) return null;
  return {
    headline: item.headline,
    summary: item.summary || item.description || "",
    description: item.description || item.summary || "",
    source: item.source || "Source",
    url: item.url,
    published: item.published || "",
  };
}

function guideFromRow(row: {
  career_id: string;
  date: string | null;
  blocks_json: BriefingBlocks | null;
}): BriefingGuide | null {
  const category = careerCategories.find((career) => career.id === row.career_id);
  const blocks = row.blocks_json;
  if (!category || !blocks) return null;

  const topStory = cleanItem(blocks.topStory);
  if (!topStory) return null;

  const quickHits = (blocks.quickHits ?? [])
    .map(cleanItem)
    .filter((item): item is BriefingGuideItem => Boolean(item));
  const sourceMap = new Map<string, { name: string; url: string }>();

  for (const item of [topStory, ...quickHits]) {
    sourceMap.set(item.url, { name: item.source, url: item.url });
  }
  for (const source of blocks.sources ?? []) {
    if (source?.url) sourceMap.set(source.url, source);
  }

  return {
    careerId: category.id as CareerId,
    careerName: category.name,
    date: row.date,
    dowTheme: blocks.dow_theme ?? null,
    dowBlurb: blocks.dow_blurb ?? null,
    topStory,
    quickHits,
    sources: Array.from(sourceMap.values()),
  };
}

async function fetchLatestGuides(): Promise<Partial<Record<CareerId, BriefingGuide>>> {
  const sb = getSupabaseAdmin();
  if (!sb) return {};

  try {
    const { data } = await sb
      .from("briefings")
      .select("career_id, date, blocks_json")
      .eq("seniority", "Mid Level")
      .in("career_id", careerIds)
      .order("date", { ascending: false })
      .limit(90);

    const guides: Partial<Record<CareerId, BriefingGuide>> = {};
    for (const row of data ?? []) {
      const guide = guideFromRow(row as {
        career_id: string;
        date: string | null;
        blocks_json: BriefingBlocks | null;
      });
      if (guide && !guides[guide.careerId]) {
        guides[guide.careerId] = guide;
      }
    }
    return guides;
  } catch {
    return {};
  }
}

export default async function SamplePage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialCareer = normalizeCareer(params.career);
  const guides = await fetchLatestGuides();

  return <SampleGuideClient initialCareer={initialCareer} guides={guides} />;
}
