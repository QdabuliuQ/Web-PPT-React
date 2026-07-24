import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { repairPageContent, runContentAgent } from "../agents/contentAgent";
import { runImageAgent } from "../agents/imageAgent";
import {
  runPageScoreAgent,
  scoreToRepairInstruction,
} from "../agents/scoreAgent";
import { runThemeAgent } from "../agents/themeAgent";
import { writePlatformCatalog } from "../catalog/exportCatalog";
import { compileDocument } from "../compile/engine";
import {
  loadAgentConfig,
  type AgentRuntimeConfig,
} from "../config";
import {
  defectsToRepairInstructions,
  runVisualGate,
} from "../gate/visualGate";
import { normalizeMetaPages } from "../meta/normalize";
import type { PipelineResult, ScoreReport, ThemeToken } from "../types";
import { runHtmlPipeline } from "./runHtml";

export type RunPipelineOptions = {
  userPrompt: string;
  sampleImageUrls?: string[];
  outDir?: string;
  config?: Partial<AgentRuntimeConfig>;
  /** 断点：已有 meta / assetMap 可跳过对应阶段 */
  resumeMeta?: unknown;
  resumeAssetMap?: Record<string, { url: string; localPath?: string }>;
  /**
   * 固定主题（编辑器当前主题 / 预设）。
   * 提供后跳过 ThemeAgent 抽色，文案/生图/编译均按此配色。
   */
  theme?: ThemeToken;
};

/**
 * 统一入口：按 config.pipelineMode 分流。
 * - skeleton（默认）：原 meta + 骨架 compile
 * - html：Layout HTML + Puppeteer 测坐标
 */
export async function runPipeline(
  options: RunPipelineOptions
): Promise<PipelineResult> {
  const config = loadAgentConfig(options.config);
  if (config.pipelineMode === "html") {
    console.log("[pipeline] mode=html（无骨架）");
    return runHtmlPipeline(options);
  }
  console.log("[pipeline] mode=skeleton（meta + layout skeletons）");
  return runTemplatePipeline(options);
}

/** 原骨架流水线（保留） */
export async function runTemplatePipeline(
  options: RunPipelineOptions
): Promise<PipelineResult> {
  const config = loadAgentConfig({
    ...options.config,
    pipelineMode: "skeleton",
  });
  const outDir =
    options.outDir || path.join(process.cwd(), "agent-output");
  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(outDir, "assets"), { recursive: true });
  await writePlatformCatalog(outDir);

  const theme = options.resumeMeta
    ? (options.resumeMeta as { theme: Awaited<ReturnType<typeof runThemeAgent>> })
        .theme
    : await runThemeAgent({
        config,
        userPrompt: options.userPrompt,
        sampleImageUrls: options.sampleImageUrls,
        fixedTheme: options.theme,
      });

  let meta = options.resumeMeta
    ? await import("../schema").then(({ MetaJsonSchema }) =>
        MetaJsonSchema.parse(options.resumeMeta)
      )
    : await runContentAgent({
        config,
        theme,
        userPrompt: options.userPrompt,
      });

  await writeFile(
    path.join(outDir, "meta.json"),
    JSON.stringify(meta, null, 2),
    "utf-8"
  );

  const assetMap =
    options.resumeAssetMap ||
    (await runImageAgent({
      config,
      meta,
      outDir: path.join(outDir, "assets"),
    }));

  await writeFile(
    path.join(outDir, "asset-map.json"),
    JSON.stringify(assetMap, null, 2),
    "utf-8"
  );

  let document = compileDocument(normalizeMetaPages(meta), assetMap);
  const gateOpts = {};
  let report = await runVisualGate(document, 0, gateOpts);

  let iter = 0;
  while (!report.ok && iter < config.maxGateIterations) {
    iter += 1;
    const instructions = defectsToRepairInstructions(report.defects);
    const before = meta;
    try {
      for (const [pageId, instruction] of instructions) {
        const onlyContrast =
          /\[contrast\]/.test(instruction) &&
          !/\[out-of-bounds\]/.test(instruction) &&
          !/\[empty-image\]/.test(instruction) &&
          !/\[vague-title\]/.test(instruction) &&
          !/\[sparse-content\]/.test(instruction) &&
          !/\[dense-content\]/.test(instruction);
        if (onlyContrast) continue;

        meta = await repairPageContent({
          config,
          meta,
          pageId,
          instruction,
        });
      }
      meta = normalizeMetaPages(meta);
      document = compileDocument(meta, assetMap);
      report = await runVisualGate(document, iter, gateOpts);
      if (
        !report.ok &&
        report.defects.every(
          (d) => d.kind === "contrast" || d.kind === "out-of-bounds"
        )
      ) {
        console.warn(
          `[pipeline] 仍有 ${report.defects.length} 条结构性告警，已尽力纠正，继续输出`
        );
        break;
      }
    } catch (err) {
      console.warn(
        `[pipeline] 第 ${iter} 次回炉/编译失败，保留上一版:`,
        err instanceof Error ? err.message : err
      );
      meta = before;
      document = compileDocument(normalizeMetaPages(meta), assetMap);
      report = await runVisualGate(document, iter, gateOpts);
      break;
    }
  }

  let scoreReport: ScoreReport | undefined;
  if (config.usePageScore) {
    let scoreIter = 0;
    scoreReport = await runPageScoreAgent({
      config,
      document,
      meta,
      assetMap,
      outDir,
      userPrompt: options.userPrompt,
    });
    scoreReport.iterations = scoreIter;

    while (
      scoreReport &&
      !scoreReport.ok &&
      scoreIter < config.maxScoreIterations
    ) {
      scoreIter += 1;
      const toFix = scoreReport.pages.filter((p) => p.needOptimize);
      if (toFix.length === 0) break;

      const before = meta;
      try {
        for (const pageScore of toFix) {
          meta = await repairPageContent({
            config,
            meta,
            pageId: pageScore.pageId,
            instruction: scoreToRepairInstruction(
              pageScore,
              config.scorePassThreshold
            ),
          });
        }
        meta = normalizeMetaPages(meta);
        document = compileDocument(meta, assetMap);
        report = await runVisualGate(document, report.iterations, gateOpts);
        scoreReport = await runPageScoreAgent({
          config,
          document,
          meta,
          assetMap,
          outDir,
          userPrompt: options.userPrompt,
        });
        scoreReport.iterations = scoreIter;
        console.log(
          `[pipeline] 打分回炉 #${scoreIter}：低分页 ${
            scoreReport.pages.filter((p) => p.needOptimize).length
          }`
        );
      } catch (err) {
        console.warn(
          `[pipeline] 打分回炉失败，保留上一版:`,
          err instanceof Error ? err.message : err
        );
        meta = before;
        document = compileDocument(normalizeMetaPages(meta), assetMap);
        break;
      }
    }
  }

  meta = normalizeMetaPages(meta);
  await writeFile(
    path.join(outDir, "meta.json"),
    JSON.stringify(meta, null, 2),
    "utf-8"
  );

  await writeFile(
    path.join(outDir, "document.json"),
    JSON.stringify(document, null, 2),
    "utf-8"
  );
  await writeFile(
    path.join(outDir, "report.json"),
    JSON.stringify(
      { ...report, scoreReport, pipelineMode: "skeleton" },
      null,
      2
    ),
    "utf-8"
  );
  if (scoreReport) {
    await writeFile(
      path.join(outDir, "score-report.json"),
      JSON.stringify(scoreReport, null, 2),
      "utf-8"
    );
  }

  return {
    meta,
    assetMap,
    document,
    report,
    scoreReport,
    pipelineMode: "skeleton",
  };
}
