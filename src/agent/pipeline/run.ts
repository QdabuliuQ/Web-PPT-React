import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { repairPageContent, runContentAgent } from "../agents/contentAgent";
import { runImageAgent } from "../agents/imageAgent";
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
import type { PipelineResult } from "../types";

export type RunPipelineOptions = {
  userPrompt: string;
  sampleImageUrls?: string[];
  outDir?: string;
  config?: Partial<AgentRuntimeConfig>;
  /** 断点：已有 meta / assetMap 可跳过对应阶段 */
  resumeMeta?: unknown;
  resumeAssetMap?: Record<string, { url: string; localPath?: string }>;
};

export async function runTemplatePipeline(
  options: RunPipelineOptions
): Promise<PipelineResult> {
  const config = loadAgentConfig(options.config);
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
  let report = runVisualGate(document, 0);

  let iter = 0;
  while (!report.ok && iter < config.maxGateIterations) {
    iter += 1;
    const instructions = defectsToRepairInstructions(report.defects);
    const before = meta;
    try {
      for (const [pageId, instruction] of instructions) {
        // 对比度由 ThemeMapper/Compile 纠正，不必让 LLM 改文案
        const onlyContrast =
          /\[contrast\]/.test(instruction) &&
          !/\[text-overflow\]/.test(instruction) &&
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
      report = runVisualGate(document, iter);
      // 若只剩对比度 / 无法由 LLM 改坐标的问题，接受并退出
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
      report = runVisualGate(document, iter);
      break;
    }
  }

  // 最终再规范化一次，保证落盘 meta 可编译
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
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  return { meta, assetMap, document, report };
}
