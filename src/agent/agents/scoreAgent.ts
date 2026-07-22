import { z } from "zod";
import type { AgentRuntimeConfig } from "../config";
import { chatJson } from "../clients/llm";
import {
  PAGE_SCORE_SYSTEM_PROMPT,
  SCORE_PASS_THRESHOLD,
  buildPageScoreUserPrompt,
} from "../prompts/score";
import { screenshotPagesWithPuppeteer } from "../gate/screenshotPages";
import type { CompiledDocument } from "../compile/engine";
import type { AssetMap, MetaJson, PageScore, ScoreReport } from "../types";
import path from "path";

export const PageScoreSchema = z.object({
  score: z.number().min(0).max(10),
  dimensions: z
    .object({
      layout: z.number().min(0).max(10),
      typography: z.number().min(0).max(10),
      contrast: z.number().min(0).max(10),
      hierarchy: z.number().min(0).max(10),
      content: z.number().min(0).max(10),
      polish: z.number().min(0).max(10),
    })
    .partial()
    .optional(),
  summary: z.string().default(""),
  issues: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).min(1).max(8),
  needOptimize: z.boolean().optional(),
});

function normalizeScore(
  pageId: string,
  raw: z.infer<typeof PageScoreSchema>,
  passThreshold: number
): PageScore {
  const score = Math.round(Math.min(10, Math.max(0, raw.score)) * 2) / 2;
  const needOptimize = score < passThreshold;
  return {
    pageId,
    score,
    dimensions: raw.dimensions,
    summary: raw.summary || "",
    issues: raw.issues || [],
    suggestions: raw.suggestions,
    needOptimize,
  };
}

function mockScore(pageId: string, passThreshold: number): PageScore {
  const score = Math.max(passThreshold, 9);
  return {
    pageId,
    score,
    dimensions: {
      layout: score,
      typography: score,
      contrast: score,
      hierarchy: score,
      content: score,
      polish: score,
    },
    summary: "mock：达到通过线",
    issues: [],
    suggestions: ["保持当前信息密度与标题具体性"],
    needOptimize: false,
  };
}

async function scoreOnePage(opts: {
  config: AgentRuntimeConfig;
  pageId: string;
  pageIndex: number;
  pageCount: number;
  dataUrl: string;
  userPrompt?: string;
  layoutKey?: string;
  pageType?: string;
}): Promise<PageScore> {
  const { config, pageId, dataUrl } = opts;
  if (config.mock) return mockScore(pageId, config.scorePassThreshold);

  const raw = await chatJson({
    config,
    baseUrl: config.vlBaseUrl,
    apiKey: config.vlApiKey,
    model: config.vlModel,
    // 部分 VL 接口不支持 response_format
    jsonObject: false,
    messages: [
      { role: "system", content: PAGE_SCORE_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildPageScoreUserPrompt({
              pageId,
              pageIndex: opts.pageIndex,
              pageCount: opts.pageCount,
              userPrompt: opts.userPrompt,
              layoutKey: opts.layoutKey,
              pageType: opts.pageType,
              passThreshold: config.scorePassThreshold,
            }),
          },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    parse: (data) => PageScoreSchema.parse(data),
  });

  return normalizeScore(pageId, raw, config.scorePassThreshold);
}

export function scoreToRepairInstruction(
  score: PageScore,
  passThreshold = SCORE_PASS_THRESHOLD
): string {
  const tips = score.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const issues =
    score.issues.length > 0 ? `\n问题：${score.issues.join("；")}` : "";
  return `[page-score] 得分 ${score.score}/10（<${passThreshold} 需优化）。总评：${score.summary}${issues}\n请仅改文案/imagePrompt 等槽位内容落实下列建议（禁止改坐标）：\n${tips}`;
}

/**
 * 截图 + VL 打分。score < passThreshold 的页 needOptimize=true。
 */
export async function runPageScoreAgent(opts: {
  config: AgentRuntimeConfig;
  document: CompiledDocument;
  meta: MetaJson;
  assetMap: AssetMap;
  outDir: string;
  userPrompt?: string;
}): Promise<ScoreReport> {
  const { config, document, meta, assetMap, outDir, userPrompt } = opts;
  const shotDir = path.join(outDir, "score-shots");
  const metaById = new Map(meta.pages.map((p) => [p.pageId, p]));

  if (!config.usePageScore) {
    return {
      ok: true,
      passThreshold: config.scorePassThreshold,
      iterations: 0,
      pages: document.pages.map((p) => ({
        pageId: p.id,
        score: 10,
        summary: "打分已关闭",
        issues: [],
        suggestions: [],
        needOptimize: false,
      })),
    };
  }

  let shots: Awaited<ReturnType<typeof screenshotPagesWithPuppeteer>>;
  try {
    shots = await screenshotPagesWithPuppeteer({
      pages: document.pages,
      assetMap,
      outDir: shotDir,
      assetsDir: path.join(outDir, "assets"),
    });
  } catch (err) {
    console.warn(
      `[score] 截图失败，跳过打分:`,
      err instanceof Error ? err.message : err
    );
    return {
      ok: true,
      passThreshold: config.scorePassThreshold,
      iterations: 0,
      pages: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const pages: PageScore[] = [];
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const metaPage = metaById.get(shot.pageId);
    try {
      const scored = await scoreOnePage({
        config,
        pageId: shot.pageId,
        pageIndex: i,
        pageCount: shots.length,
        dataUrl: shot.dataUrl,
        userPrompt,
        layoutKey: metaPage?.layoutKey,
        pageType: metaPage?.pageType,
      });
      pages.push(scored);
      console.log(
        `[score] ${shot.pageId}: ${scored.score}/10 needOptimize=${scored.needOptimize}`
      );
    } catch (err) {
      console.warn(
        `[score] ${shot.pageId} 打分失败:`,
        err instanceof Error ? err.message : err
      );
      pages.push({
        pageId: shot.pageId,
        score: 0,
        summary: "打分失败",
        issues: [err instanceof Error ? err.message : String(err)],
        suggestions: ["压缩过长正文，标题改为具体利益点"],
        needOptimize: true,
      });
    }
  }

  const low = pages.filter((p) => p.needOptimize);
  return {
    ok: low.length === 0,
    passThreshold: config.scorePassThreshold,
    iterations: 0,
    pages,
  };
}
