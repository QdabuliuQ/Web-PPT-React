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
 *
 * 默认输出目录：项目根 agent-output/
 *   document.json / meta.json / asset-map.json / report.json
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { runTemplatePipeline } from "../src/agent/pipeline/run";
import {
  DEFAULT_SAMPLE_DIR,
  loadSampleImageUrls,
} from "../src/agent/samples/loadSamples";

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
  console.log(`WebPPT Agent CLI

用法:
  pnpm agent -- "<用户PPT需求>"
  pnpm agent -- --prompt "<需求>"
  pnpm agent -- --mock "<需求>"              # 强制不调真实 API
  pnpm agent -- --out <目录> "<需求>"        # 自定义输出目录
  pnpm agent -- --samples <路径> "<需求>"    # 审美参考图（文件/目录/demo）
  pnpm agent -- --samples demo -- "<需求>"   # 使用 src/agent/assets

默认输出: ${DEFAULT_OUT}
  - document.json   WebPPT 可加载文档（调试主文件）
  - meta.json
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

参考图说明:
  --samples 可重复；支持目录、单文件、逗号分隔路径，或关键字 demo
  仅 ThemeAgent 识图抽配色/气质；版式仍由 layout 骨架决定
  需要 LLM 支持多模态（image_url）；纯文本模型会忽略或报错
`);
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let mock = false;
  let outDir = DEFAULT_OUT;
  let prompt = "";
  const sampleInputs: string[] = [];
  const rest: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      return { help: true, mock, outDir, prompt: "", sampleInputs };
    }
    if (a === "--mock") {
      mock = true;
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
      // pnpm/npm 传过来的分隔符，忽略
      continue;
    }
    if (a.startsWith("-")) {
      console.warn(`未知参数: ${a}`);
      continue;
    }
    rest.push(a);
  }

  if (!prompt) prompt = rest.join(" ").trim();
  return { help: false, mock, outDir, prompt, sampleInputs };
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  loadEnvFile(path.join(ROOT, ".env"));

  const { help, mock, outDir, prompt, sampleInputs } = parseArgs(process.argv);
  if (help) {
    printHelp();
    return;
  }
  if (!prompt) {
    printHelp();
    console.error("错误：请提供 PPT 需求文案，例如：\n  pnpm agent -- \"融资路演模板\"\n");
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

  const forceMock = mock || process.env.AGENT_MOCK === "1";
  console.log(`[agent] prompt: ${prompt}`);
  console.log(`[agent] mock: ${forceMock}`);
  console.log(`[agent] out: ${outDir}`);
  console.log(`[agent] llm: ${process.env.LLM_MODEL || "(default)"} @ ${process.env.LLM_BASE_URL || "(default)"}`);

  const started = Date.now();
  const result = await runTemplatePipeline({
    userPrompt: prompt,
    sampleImageUrls,
    outDir,
    config: forceMock ? { mock: true } : { mock: false },
  });

  const docPath = path.join(outDir, "document.json");
  const summary = {
    ok: result.report.ok,
    name: result.document.name,
    pages: result.document.pages.length,
    defects: result.report.defects.length,
    iterations: result.report.iterations,
    elapsedMs: Date.now() - started,
    sampleCount: sampleImageUrls?.length || 0,
    files: {
      document: docPath,
      meta: path.join(outDir, "meta.json"),
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
