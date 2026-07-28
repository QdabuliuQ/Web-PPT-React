import { runPipeline } from "@/agent/pipeline/run";
import type { AgentPipelineMode } from "@/agent/config";
import {
  DEFAULT_SAMPLE_DIR,
  loadSampleImageUrls,
} from "@/agent/samples/loadSamples";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/agent/generate
 * body: {
 *   prompt: string,
 *   sampleImageUrls?: string[],
 *   useDemoSamples?: boolean,  // 使用 src/agent/assets 内置参考图
 *   mock?: boolean,
 *   skipImageGen?: boolean, // 跳过生图，纯色占位
 *   pipelineMode?: "skeleton" | "html"  // 默认 skeleton；html=无骨架
 * }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      sampleImageUrls?: string[];
      useDemoSamples?: boolean;
      mock?: boolean;
      skipImageGen?: boolean;
      outDir?: string;
      pipelineMode?: AgentPipelineMode;
    };

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
    }

    let sampleImageUrls = body.sampleImageUrls;
    if (body.useDemoSamples) {
      const { urls } = loadSampleImageUrls([DEFAULT_SAMPLE_DIR], {
        maxImages: 5,
      });
      sampleImageUrls = [...(sampleImageUrls || []), ...urls];
    }

    const pipelineMode =
      body.pipelineMode === "html" || body.pipelineMode === "skeleton"
        ? body.pipelineMode
        : undefined;

    const result = await runPipeline({
      userPrompt: body.prompt.trim(),
      sampleImageUrls,
      outDir: body.outDir,
      config: {
        mock:
          body.mock === true ||
          process.env.AGENT_MOCK === "1" ||
          !process.env.LLM_API_KEY,
        ...(body.skipImageGen === true ? { skipImageGen: true } : {}),
        ...(pipelineMode ? { pipelineMode } : {}),
      },
    });

    return NextResponse.json({
      ok: result.report.ok,
      pipelineMode: result.pipelineMode || pipelineMode || "skeleton",
      name: result.document.name,
      pageCount: result.document.pages.length,
      report: result.report,
      document: result.document,
      meta: result.meta,
      assetMap: result.assetMap,
      htmlDeck: result.htmlDeck,
    });
  } catch (error) {
    console.error("[api/agent/generate]", error);
    const message =
      error instanceof Error ? error.message : "模板生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
