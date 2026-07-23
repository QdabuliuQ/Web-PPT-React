/**
 * Agent 调试 CLI
 *
 * 用法：
 *   pnpm agent -- "融资路演商业计划书"
 *   pnpm agent -- --mock "快速占位测试"
 *   pnpm agent -- --prompt "面向教育的课程介绍PPT"
 *   pnpm agent -- --out agent-output/debug-01 -- "自定义输出目录"
 *   pnpm agent -- --samples src/agent/assets -- "带审美参考图"
 *   pnpm agent -- --samples demo -- "使用内置 demo1~demo6"
 *   pnpm agent -- --theme navy-gold -- "按预设主题色生成"
 *   pnpm agent -- --theme current -- "使用 document.json 里的当前主题"
 *   pnpm agent -- --html --mock "HTML 流水线（无骨架）"
 *   pnpm agent -- --mode html -- "HTML 流水线"
 *
 * 默认输出目录：项目根 agent-output/
 *   document.json / meta.json / asset-map.json / report.json
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { ThemeTokenSchema } from "../src/agent/schema";
import { runPipeline } from "../src/agent/pipeline/run";
import type { AgentPipelineMode } from "../src/agent/config";
import {
  DEFAULT_SAMPLE_DIR,
  loadSampleImageUrls,
} from "../src/agent/samples/loadSamples";
import type { ThemeToken } from "../src/agent/types";
import {
  getThemePresetById,
  THEME_PRESETS,
  toThemeToken,
} from "../src/theme/presets";

const ROOT = process.cwd();
const DEFAULT_OUT = path.join(ROOT, "agent-output");

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf-8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function printHelp() {
  const presetIds = THEME_PRESETS.map((p) => p.id).join(", ");
  console.log(`WebPPT Agent CLI

用法:
  pnpm agent -- "<用户PPT需求>"
  pnpm agent -- --prompt "<需求>"
  pnpm agent -- --mock "<需求>"              # 强制不调真实 API
  pnpm agent -- --out <目录> "<需求>"        # 自定义输出目录
  pnpm agent -- --samples <路径> "<需求>"    # 审美参考图（文件/目录/demo）
  pnpm agent -- --samples demo -- "<需求>"   # 使用 src/agent/assets
  pnpm agent -- --theme <id|current|json> -- "<需求>"  # 固定主题色生成
  pnpm agent -- --html -- "<需求>"           # HTML 流水线（无骨架）
  pnpm agent -- --mode skeleton|html -- "<需求>"
  pnpm agent -- --html --no-score -- "<需求>"  # 跳过 VL PageScore

--theme:
  - 预设 id（如 navy-gold）
  - current：读 agent-output/document.json（或 --out 目录）里的 theme
  - JSON 文件路径：完整 ThemeToken

--mode / --html:
  - skeleton（默认）：ContentAgent + layout skeletons + compileDocument
  - html：LayoutHtmlAgent + Puppeteer 测坐标 → document.json（无骨架）
  - 也可用环境变量 AGENT_PIPELINE=html

--no-score / --skip-score:
  - 跳过截图 + VL 页面打分与回炉（usePageScore=false）
  - 也可用环境变量 AGENT_PAGE_SCORE=0

可用预设: ${presetIds}

默认输出: ${DEFAULT_OUT}
  - document.json   WebPPT 可加载文档（调试主文件）
  - meta.json       skeleton 路径；html 路径为兼容桩
  - html-deck.json  仅 html 路径
  - html-pages/     仅 html 路径，每页原始 HTML
  - asset-map.json
  - report.json
  - score-report.json   页面 VL 打分（≥9 通过）
  - score-shots/        Puppeteer 页面截图
  - platform-catalog.json

打分相关环境变量:
  DASHSCOPE_API_KEY / SCORE_VL_API_KEY  视觉模型 Key
  SCORE_VL_MODEL                        默认 qwen-vl-max
  SCORE_VL_BASE_URL                     默认 DashScope compatible-mode
  AGENT_PAGE_SCORE=0                    关闭打分回炉
  AGENT_PIPELINE=html                   默认走 HTML 流水线

参考图说明:
  --samples 可重复；支持目录、单文件、逗号分隔路径，或关键字 demo
  有 --theme 时跳过 ThemeAgent 抽色，文案/字体色/图表色/生图均按固定主题
  无 --theme 时 ThemeAgent 仍可识图抽配色
  skeleton 模式：版式由 layout 骨架决定
  html 模式：版式由 HTML + Skill 自由布局，浏览器结算坐标
`);
}

function loadThemeFromDocument(docPath: string): ThemeToken {
  if (!existsSync(docPath)) {
    throw new Error(`找不到文档主题: ${docPath}`);
  }
  const raw = JSON.parse(readFileSync(docPath, "utf-8")) as {
    theme?: unknown;
  };
  if (!raw.theme) {
    throw new Error(`${docPath} 没有 theme 字段，请先在编辑器导出含主题的文档`);
  }
  return ThemeTokenSchema.parse(raw.theme);
}

function resolveThemeInput(
  themeArg: string,
  outDir: string
): ThemeToken {
  const trimmed = themeArg.trim();
  if (!trimmed) {
    throw new Error("空的 --theme 参数");
  }

  if (trimmed === "current" || trimmed === "document") {
    return loadThemeFromDocument(path.join(outDir, "document.json"));
  }

  const preset = getThemePresetById(trimmed);
  if (preset) return toThemeToken(preset);

  const abs = path.resolve(trimmed);
  if (existsSync(abs) && abs.endsWith(".json")) {
    const raw = JSON.parse(readFileSync(abs, "utf-8")) as unknown;
    if (raw && typeof raw === "object" && "theme" in (raw as object)) {
      return ThemeTokenSchema.parse((raw as { theme: unknown }).theme);
    }
    return ThemeTokenSchema.parse(raw);
  }

  throw new Error(
    `无法解析 --theme "${trimmed}"。可用预设 id、current，或 ThemeToken JSON 路径。`
  );
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let mock = false;
  let outDir = DEFAULT_OUT;
  let prompt = "";
  let themeArg = "";
  let pipelineMode: AgentPipelineMode | undefined;
  let noScore = false;
  const sampleInputs: string[] = [];
  const rest: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      return {
        help: true,
        mock,
        outDir,
        prompt: "",
        sampleInputs,
        themeArg,
        pipelineMode,
        noScore,
      };
    }
    if (a === "--mock") {
      mock = true;
      continue;
    }
    if (a === "--no-score" || a === "--skip-score") {
      noScore = true;
      continue;
    }
    if (a === "--html") {
      pipelineMode = "html";
      continue;
    }
    if (a === "--mode") {
      const v = (args[++i] || "").trim().toLowerCase();
      if (v === "html" || v === "html-slide" || v === "slide-html") {
        pipelineMode = "html";
      } else if (v === "skeleton" || v === "template" || v === "meta") {
        pipelineMode = "skeleton";
      } else {
        console.warn(`未知 --mode ${v}，使用 skeleton`);
        pipelineMode = "skeleton";
      }
      continue;
    }
    if (a === "--out" || a === "-o") {
      outDir = path.resolve(args[++i] || DEFAULT_OUT);
      continue;
    }
    if (a === "--prompt" || a === "-p") {
      prompt = args[++i] || "";
      continue;
    }
    if (a === "--theme" || a === "-t") {
      themeArg = args[++i] || "";
      continue;
    }
    if (a === "--samples" || a === "--sample" || a === "-s") {
      const v = args[++i] || "";
      if (v === "demo" || v === "demos" || v === "default") {
        sampleInputs.push(DEFAULT_SAMPLE_DIR);
      } else if (v) {
        sampleInputs.push(v);
      }
      continue;
    }
    if (a === "--") {
      continue;
    }
    if (a.startsWith("-")) {
      console.warn(`未知参数: ${a}`);
      continue;
    }
    rest.push(a);
  }

  if (!prompt) prompt = rest.join(" ").trim();
  return {
    help: false,
    mock,
    outDir,
    prompt,
    sampleInputs,
    themeArg,
    pipelineMode,
    noScore,
  };
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  loadEnvFile(path.join(ROOT, ".env"));

  const {
    help,
    mock,
    outDir,
    prompt,
    sampleInputs,
    themeArg,
    pipelineMode,
    noScore,
  } = parseArgs(process.argv);
  if (help) {
    printHelp();
    return;
  }
  if (!prompt) {
    printHelp();
    console.error(
      '错误：请提供 PPT 需求文案，例如：\n  pnpm agent -- "融资路演模板"\n'
    );
    process.exit(1);
  }

  let sampleImageUrls: string[] | undefined;
  if (sampleInputs.length > 0) {
    const { urls, files } = loadSampleImageUrls(sampleInputs, { maxImages: 5 });
    sampleImageUrls = urls;
    console.log(
      `[agent] samples (${files.length}): ${files
        .map((f) => path.relative(ROOT, f))
        .join(", ")}`
    );
  }

  let theme: ThemeToken | undefined;
  if (themeArg) {
    theme = resolveThemeInput(themeArg, outDir);
    console.log(
      `[agent] theme: ${theme.templateName} (${theme.primary}/${theme.secondary}/${theme.background})`
    );
  }

  const forceMock = mock || process.env.AGENT_MOCK === "1";
  console.log(`[agent] prompt: ${prompt}`);
  console.log(`[agent] mock: ${forceMock}`);
  console.log(`[agent] mode: ${pipelineMode || process.env.AGENT_PIPELINE || "skeleton"}`);
  console.log(`[agent] pageScore: ${noScore ? "off (--no-score)" : "on"}`);
  console.log(`[agent] out: ${outDir}`);
  console.log(
    `[agent] llm: ${process.env.LLM_MODEL || "(default)"} @ ${process.env.LLM_BASE_URL || "(default)"}`
  );

  const started = Date.now();
  const result = await runPipeline({
    userPrompt: prompt,
    sampleImageUrls,
    outDir,
    theme,
    config: {
      mock: forceMock,
      ...(pipelineMode ? { pipelineMode } : {}),
      ...(noScore ? { usePageScore: false } : {}),
    },
  });

  const docPath = path.join(outDir, "document.json");
  const summary = {
    ok: result.report.ok,
    pipelineMode: result.pipelineMode || pipelineMode || "skeleton",
    name: result.document.name,
    pages: result.document.pages.length,
    defects: result.report.defects.length,
    iterations: result.report.iterations,
    elapsedMs: Date.now() - started,
    sampleCount: sampleImageUrls?.length || 0,
    theme: result.document.theme
      ? {
          templateName: result.document.theme.templateName,
          primary: result.document.theme.primary,
          secondary: result.document.theme.secondary,
          background: result.document.theme.background,
        }
      : null,
    files: {
      document: docPath,
      meta: path.join(outDir, "meta.json"),
      htmlDeck: path.join(outDir, "html-deck.json"),
      assetMap: path.join(outDir, "asset-map.json"),
      report: path.join(outDir, "report.json"),
    },
  };

  console.log("\n[agent] done");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\n主调试文件: ${docPath}`);
}

main().catch((err) => {
  console.error("[agent] failed:", err);
  process.exit(1);
});
