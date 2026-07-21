import { buildPptxBuffer, type ExportPptxOptions } from "@/utils/pptx/exportPptx";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/export/pptx
 * body: { name?, pages, snapshots?, backgrounds? }
 * 返回 .pptx 二进制文件
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportPptxOptions;

    if (!body?.pages || !Array.isArray(body.pages)) {
      return NextResponse.json(
        { error: "请求体缺少 pages" },
        { status: 400 }
      );
    }

    const buffer = await buildPptxBuffer({
      name: body.name,
      pages: body.pages,
      snapshots: body.snapshots,
      backgrounds: body.backgrounds,
    });

    const rawName = (body.name || "未命名").replace(/[/\\?%*:|"<>]/g, "_");
    const fileName = `${rawName}.pptx`;
    const encoded = encodeURIComponent(fileName);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/export/pptx]", error);
    const message =
      error instanceof Error ? error.message : "导出 PPTX 失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
