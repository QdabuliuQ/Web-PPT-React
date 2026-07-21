import type { ExportPptxOptions } from "@/utils/pptx/exportPptx";
import { prepareExportBackgrounds } from "@/utils/pptx/exportTextureBackground";
import { prepareExportSnapshots } from "@/utils/pptx/prepareExportSnapshots";

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 调用后端接口生成 PPTX 并触发浏览器下载
 */
export async function downloadPptxFromApi(
  options: ExportPptxOptions
): Promise<void> {
  const pages = options.pages.filter((p) => p.visible !== false);
  if (pages.length === 0) {
    throw new Error("没有可导出的页面");
  }

  const [snapshots, backgrounds] = await Promise.all([
    options.snapshots ?? prepareExportSnapshots(pages),
    options.backgrounds ?? prepareExportBackgrounds(pages),
  ]);

  const res = await fetch("/api/export/pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: options.name,
      pages,
      snapshots,
      backgrounds,
    }),
  });

  if (!res.ok) {
    let message = `导出失败 (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const encoded = match?.[1] || match?.[2];
  const fileName = encoded
    ? decodeURIComponent(encoded)
    : `${options.name || "未命名"}.pptx`;

  triggerBlobDownload(blob, fileName);
}
