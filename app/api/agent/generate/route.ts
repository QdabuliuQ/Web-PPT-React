import { runTemplatePipeline } from "@/agent/pipeline/run";
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
 *   mock?: boolean
 * }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      sampleImageUrls?: string[];
      useDemoSamples?: boolean;
      mock?: boolean;
      outDir?: string;
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

    const result = await runTemplatePipeline({
      userPrompt: body.prompt.trim(),
      sampleImageUrls,
      outDir: body.outDir,
      config: {
        mock:
          body.mock === true ||
          process.env.AGENT_MOCK === "1" ||
          !process.env.LLM_API_KEY,
      },
    });

    return NextResponse.json({
      ok: result.report.ok,
      name: result.document.name,
      pageCount: result.document.pages.length,
      report: result.report,
      document: result.document,
      meta: result.meta,
      assetMap: result.assetMap,
    });
  } catch (error) {
    console.error("[api/agent/generate]", error);
    const message =
      error instanceof Error ? error.message : "模板生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
