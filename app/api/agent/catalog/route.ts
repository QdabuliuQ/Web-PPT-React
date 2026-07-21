import { NextResponse } from "next/server";
import { getPlatformCatalogJson } from "@/agent/catalog/exportCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/agent/catalog — 平台元素/属性约束目录 */
export async function GET() {
  return NextResponse.json(getPlatformCatalogJson());
}
