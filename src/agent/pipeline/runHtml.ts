import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  htmlDeckToCompatMeta,
  repairHtmlPage,
  runLayoutHtmlAgent,
} from "../agents/layoutHtmlAgent";
import { runBriefAgent } from "../agents/briefAgent";
import { runImageAgent } from "../agents/imageAgent";
import {
  runPageScoreAgent,
  scoreToRepairInstruction,
} from "../agents/scoreAgent";
import { runStoryAgent } from "../agents/storyAgent";
import { runThemeAgent } from "../agents/themeAgent";
import { writePlatformCatalog } from "../catalog/exportCatalog";
import { loadAgentConfig } from "../config";
import { buildDesignProfileFromBrief } from "../design/director";
import {
  defectsToRepairInstructions,
  runVisualGate,
} from "../gate/visualGate";
import { compileHtmlDocument } from "../htmlCompile";
import type { HtmlDeck, PipelineResult, ScoreReport } from "../types";
import type { RunPipelineOptions } from "./run";
import { prepareOutDir } from "./outDir";

/** 写出 html-deck + 逐页 html-pages（回炉后必须再调，避免与 document 脱节） */
async function persistHtmlDeck(outDir: string, htmlDeck: HtmlDeck) {
  const pagesDir = path.join(outDir, "html-pages");
  await mkdir(pagesDir, { recursive: true });
  await writeFile(
    path.join(outDir, "html-deck.json"),
    JSON.stringify(htmlDeck, null, 2),
    "utf-8"
  );
  for (const p of htmlDeck.pages) {
    await writeFile(path.join(pagesDir, `${p.pageId}.html`), p.html, "utf-8");
  }
}

function pageTypeByIdFromDeck(deck: HtmlDeck): Record<string, string> {
  const m: Record<string, string> = {};
  for (const p of deck.pages) m[p.pageId] = p.pageType;
  return m;
}

/** Gate 回炉：跳过仅对比度；跳过 sparse（内容应由 Layout 首轮写满） */
function shouldSkipGateRepair(instruction: string): boolean {
  const hasSparse = /\[sparse-content\]/.test(instruction);
  const hasStructural =
    /\[out-of-bounds\]/.test(instruction) ||
    /\[empty-image\]/.test(instruction) ||
    /\[vague-title\]/.test(instruction) ||
    /\[dense-content\]/.test(instruction) ||
    /\[too-many-elements\]/.test(instruction) ||
    /\[unsafe-text-surface\]/.test(instruction);
  if (hasSparse && !hasStructural) return true;

  // 双平面字面缺陷必须回炉，不可跳过
  if (/\[unsafe-text-surface\]/.test(instruction)) return false;

  const onlyContrast =
    /\[contrast\]/.test(instruction) &&
    !/\[out-of-bounds\]/.test(instruction) &&
    !/\[empty-image\]/.test(instruction) &&
    !/\[vague-title\]/.test(instruction) &&
    !/\[sparse-content\]/.test(instruction) &&
    !/\[dense-content\]/.test(instruction) &&
    !/\[unsafe-text-surface\]/.test(instruction);
  return onlyContrast;
}

/**
 * HTML 流水线：Brief（AI 定场合）→ Theme → Story → Layout → Image → Compile → Gate → Score
 */
export async function runHtmlPipeline(
  options: RunPipelineOptions
): Promise<PipelineResult> {
  const config = loadAgentConfig({
    ...options.config,
    pipelineMode: "html",
  });
  const outDir = await prepareOutDir(
    options.outDir || path.join(process.cwd(), "agent-output"),
    { resume: Boolean(options.resumeMeta || options.resumeAssetMap) }
  );
  await mkdir(path.join(outDir, "html-pages"), { recursive: true });
  await writePlatformCatalog(outDir);

  const brief = await runBriefAgent({
    config,
    userPrompt: options.userPrompt,
  });
  await writeFile(
    path.join(outDir, "brief.json"),
    JSON.stringify(brief, null, 2),
    "utf-8"
  );
  const designProfile = buildDesignProfileFromBrief(brief);
  await writeFile(
    path.join(outDir, "design-profile.json"),
    JSON.stringify(designProfile, null, 2),
    "utf-8"
  );
  console.log(
    `[html-pipeline] brief genre=${brief.genreId} archetype=${designProfile.archetype} family=${designProfile.visualFamily} · ${brief.reason.slice(0, 48)}`
  );

  const theme = await runThemeAgent({
    config,
    userPrompt: options.userPrompt,
    sampleImageUrls: options.sampleImageUrls,
    fixedTheme: options.theme,
    designProfile,
    brief,
  });

  const story = await runStoryAgent({
    config,
    theme,
    userPrompt: options.userPrompt,
    designProfile,
    brief,
  });
  await writeFile(
    path.join(outDir, "story.json"),
    JSON.stringify(story, null, 2),
    "utf-8"
  );
  console.log(
    `[html-pipeline] story runId=${story.runId} angle=${story.angle.slice(0, 48)} pages=${story.pages.length}`
  );

  let htmlDeck = await runLayoutHtmlAgent({
    config,
    theme,
    userPrompt: options.userPrompt,
    story,
    designProfile,
    brief,
  });

  await persistHtmlDeck(outDir, htmlDeck);

  const assetsDir = path.join(outDir, "assets");
  const assetMap =
    options.resumeAssetMap ||
    (await runImageAgent({
      config,
      drawTasks: htmlDeck.drawTasks,
      outDir: assetsDir,
    }));

  await writeFile(
    path.join(outDir, "asset-map.json"),
    JSON.stringify(assetMap, null, 2),
    "utf-8"
  );

  // HTML 几何已由 compile 阶段页面 DOM 量过；Gate 只做结构硬规则
  const gateOpts = {
    pageTypeById: pageTypeByIdFromDeck(htmlDeck),
  };

  let document = await compileHtmlDocument(htmlDeck, assetMap, { assetsDir });
  let report = await runVisualGate(document, 0, gateOpts);

  let iter = 0;
  while (!report.ok && iter < config.maxGateIterations) {
    iter += 1;
    const instructions = defectsToRepairInstructions(report.defects);
    const before = htmlDeck;
    let repairedAny = false;
    try {
      for (const [pageId, instruction] of instructions) {
        if (shouldSkipGateRepair(instruction)) {
          if (/\[sparse-content\]/.test(instruction)) {
            console.warn(
              `[html-pipeline] 跳过 sparse 回炉（${pageId}）：内容应在 Layout 首轮定稿`
            );
          }
          continue;
        }

        htmlDeck = await repairHtmlPage({
          config,
          deck: htmlDeck,
          pageId,
          instruction,
        });
        repairedAny = true;
      }
      if (!repairedAny) {
        console.warn(
          `[html-pipeline] Gate 仅剩可跳过缺陷，继续输出`
        );
        break;
      }
      gateOpts.pageTypeById = pageTypeByIdFromDeck(htmlDeck);
      await persistHtmlDeck(outDir, htmlDeck);
      document = await compileHtmlDocument(htmlDeck, assetMap, { assetsDir });
      report = await runVisualGate(document, iter, gateOpts);
      if (
        !report.ok &&
        report.defects.every(
          (d) =>
            d.kind === "contrast" ||
            d.kind === "out-of-bounds" ||
            d.kind === "sparse-content"
        )
      ) {
        console.warn(
          `[html-pipeline] 仍有 ${report.defects.length} 条非阻断告警，继续输出`
        );
        break;
      }
    } catch (err) {
      console.warn(
        `[html-pipeline] 第 ${iter} 次回炉失败，保留上一版:`,
        err instanceof Error ? err.message : err
      );
      htmlDeck = before;
      document = await compileHtmlDocument(htmlDeck, assetMap, { assetsDir });
      report = await runVisualGate(document, iter, gateOpts);
      break;
    }
  }

  let meta = htmlDeckToCompatMeta(htmlDeck);

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
      const types = pageTypeByIdFromDeck(htmlDeck);
      // hero/close 不做 Score 内容扩写回炉，避免与 Layout 定稿分叉
      const toFix = scoreReport.pages.filter(
        (p) =>
          p.needOptimize &&
          types[p.pageId] !== "hero" &&
          types[p.pageId] !== "close"
      );
      if (toFix.length === 0) break;
      const before = htmlDeck;
      try {
        for (const pageScore of toFix) {
          htmlDeck = await repairHtmlPage({
            config,
            deck: htmlDeck,
            pageId: pageScore.pageId,
            instruction: scoreToRepairInstruction(
              pageScore,
              config.scorePassThreshold
            ),
          });
        }
        meta = htmlDeckToCompatMeta(htmlDeck);
        await persistHtmlDeck(outDir, htmlDeck);
        gateOpts.pageTypeById = pageTypeByIdFromDeck(htmlDeck);
        document = await compileHtmlDocument(htmlDeck, assetMap, { assetsDir });
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
      } catch (err) {
        console.warn(
          `[html-pipeline] 打分回炉失败:`,
          err instanceof Error ? err.message : err
        );
        htmlDeck = before;
        meta = htmlDeckToCompatMeta(htmlDeck);
        document = await compileHtmlDocument(htmlDeck, assetMap, {
          assetsDir,
        });
        break;
      }
    }
  }

  meta = htmlDeckToCompatMeta(htmlDeck);
  await persistHtmlDeck(outDir, htmlDeck);
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
      { ...report, scoreReport, pipelineMode: "html" },
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
    htmlDeck,
    pipelineMode: "html",
  };
}
