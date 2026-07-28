import type { AgentRuntimeConfig } from "../config";
import { chatJson } from "../clients/llm";
import type { DesignArchetypeId, DesignProfile } from "../design/director";
import { buildDesignProfileFromBrief } from "../design/director";
import {
  BRIEF_SYSTEM_PROMPT,
  buildBriefUserPrompt,
} from "../prompts/brief";
import { DesignBriefLlmSchema } from "../schema";
import { detectDeckGenre, type DeckGenreId } from "../theme/genre";
import type { PageType } from "../types";
import type { DesignBrief } from "../brief/types";
import type { VisualFamilyId } from "../theme/visualFamily";

function uniquePageTypes(pageTypes: readonly PageType[]): PageType[] {
  const seen = new Set<PageType>();
  const out: PageType[] = [];
  for (const t of pageTypes) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** hero 置首、close 置末；缺则补上 */
export function normalizePageSequence(
  pageTypes: readonly PageType[]
): PageType[] {
  let seq = uniquePageTypes(pageTypes).filter(
    (t) => t !== "hero" && t !== "close"
  );
  if (!pageTypes.includes("breath") && !pageTypes.includes("metrics")) {
    seq = [...seq, "breath"];
  }
  return ["hero", ...seq, "close"];
}

function genreToArchetype(genreId: DeckGenreId): DesignArchetypeId {
  switch (genreId) {
    case "corp-gala":
      return "stageGala";
    case "consumer":
      return "productLaunch";
    case "personal-review":
      return "personalReview";
    case "pitch":
      return "dataMonument";
    case "brand":
      return "editorialStory";
    default:
      return "consulting";
  }
}

/**
 * mock / LLM 失败兜底：仍可用关键词表，仅作离线垫底，不进主路径决策。
 */
export function mockDesignBrief(userPrompt: string): DesignBrief {
  const genre = detectDeckGenre(userPrompt);
  const archetype = genreToArchetype(genre.id);
  const sequence = normalizePageSequence(
    parseSequenceFromGuidance(genre.layoutGuidance)
  );
  return {
    version: "brief-1.0",
    genreId: genre.id,
    label: genre.label,
    visualFamily: genre.visualFamily as VisualFamilyId,
    archetype,
    narrativeShape: genre.layoutGuidance.split("\n")[0] || genre.label,
    pageSequenceHints: sequence,
    themeHints: genre.themeGuidance,
    layoutGuidance: genre.layoutGuidance,
    reason: "mock fallback from keyword genre table",
  };
}

function parseSequenceFromGuidance(guidance: string): PageType[] {
  const m = guidance.match(/hero[\s\S]*?close/);
  if (!m) {
    return [
      "hero",
      "agenda",
      "problem",
      "solution",
      "metrics",
      "breath",
      "close",
    ];
  }
  const tokens = m[0]
    .split(/→|->|,|、|\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const allowed = new Set([
    "hero",
    "agenda",
    "problem",
    "solution",
    "pillars",
    "metrics",
    "evidence",
    "compare",
    "breath",
    "team",
    "timeline",
    "close",
  ]);
  const out: PageType[] = [];
  for (const t of tokens) {
    const clean = t.replace(/或.*$/, "").replace(/[^a-z-]/g, "");
    if (allowed.has(clean)) out.push(clean as PageType);
  }
  return out.length >= 3
    ? out
    : ["hero", "agenda", "problem", "solution", "metrics", "breath", "close"];
}

function normalizeBrief(
  raw: {
    genreId: DeckGenreId;
    label: string;
    visualFamily: VisualFamilyId;
    archetype: DesignArchetypeId;
    narrativeShape: string;
    pageSequenceHints: PageType[];
    themeHints: string;
    layoutGuidance: string;
    reason?: string;
  },
  userPrompt: string
): DesignBrief {
  const label =
    (raw.label && raw.label.trim()) ||
    userPrompt.slice(0, 24) ||
    "通用商务简报";
  return {
    version: "brief-1.0",
    genreId: raw.genreId || "general",
    label,
    visualFamily: raw.visualFamily || "editorial",
    archetype: raw.archetype || "consulting",
    narrativeShape:
      (raw.narrativeShape && raw.narrativeShape.trim()) ||
      "先立判断，再给证据，最后落到行动。",
    pageSequenceHints: normalizePageSequence(raw.pageSequenceHints || []),
    themeHints:
      (raw.themeHints && raw.themeHints.trim()) ||
      "按场合自选色相，避免永远墨青+黄铜。",
    layoutGuidance:
      (raw.layoutGuidance && raw.layoutGuidance.trim()) ||
      "含至少一页呼吸页；封面/封底用双平面构图。",
    reason: (raw.reason && raw.reason.trim()) || "llm brief",
  };
}

export async function runBriefAgent(opts: {
  config: AgentRuntimeConfig;
  userPrompt: string;
}): Promise<DesignBrief> {
  const { config, userPrompt } = opts;

  if (config.mock) {
    return mockDesignBrief(userPrompt);
  }

  try {
    const raw = await chatJson({
      config,
      temperature: 0.45,
      messages: [
        { role: "system", content: BRIEF_SYSTEM_PROMPT },
        { role: "user", content: buildBriefUserPrompt(userPrompt) },
      ],
      parse: (data) => DesignBriefLlmSchema.parse(data),
    });
    return normalizeBrief(raw, userPrompt);
  } catch (err) {
    console.warn(
      "[BriefAgent] LLM brief failed, using mock fallback:",
      err instanceof Error ? err.message : err
    );
    return mockDesignBrief(userPrompt);
  }
}

/** Brief → DesignProfile（风格配方库 + AI 决策覆盖） */
export function designProfileFromBrief(
  brief: DesignBrief,
  seed?: number
): DesignProfile {
  return buildDesignProfileFromBrief(brief, seed);
}
