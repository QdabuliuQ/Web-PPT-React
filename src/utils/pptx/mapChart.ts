import type { IChartProps } from "@/element/Chart";
import type PptxGenJS from "pptxgenjs";
import { addSnapshotImage } from "./snapshotImage";

/**
 * 图表导出：优先使用前端 ECharts 快照（与网页一致）。
 * 服务端无 DOM，不再做离屏回退。
 */
export async function addChartElement(
  slide: PptxGenJS.Slide,
  el: IChartProps,
  _pptx: PptxGenJS,
  snapshots?: Record<string, string>
): Promise<void> {
  const snapshot = snapshots?.[el.id];
  if (snapshot) {
    addSnapshotImage(slide, el, snapshot);
    return;
  }

  console.warn(
    `图表 ${el.id}(${el.chartType}) 缺少导出快照，已跳过（需前端 prepareExportSnapshots）`
  );
}

/** @deprecated 图表统一走客户端快照 */
export function chartNeedsSnapshot(_chartType?: string): boolean {
  return true;
}
