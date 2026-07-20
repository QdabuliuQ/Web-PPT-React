import type { ITableProps } from "@/element/Table";
import type PptxGenJS from "pptxgenjs";
import {
  parsePlacement,
  positionFromElement,
  pxToIn,
  pxToPt,
  toHexColor,
} from "./helpers";

/** CSS cell padding（index.module.less）→ 英寸，贴近预览 */
const CELL_PAD_Y_IN = pxToIn(4);
const CELL_PAD_X_IN = pxToIn(8);

/** 始终用 TextProps[]，保证每段都带上 align（与预览 textAlign 一致） */
function cellText(
  raw: string,
  align: PptxGenJS.HAlign
): PptxGenJS.TextProps[] {
  const lines = raw.length ? raw.split("\n") : [""];
  return lines.map((line, i) => ({
    text: line,
    options: {
      align,
      ...(i < lines.length - 1 ? { breakLine: true as const } : {}),
    },
  }));
}

export function addTableElement(
  slide: PptxGenJS.Slide,
  el: ITableProps
): void {
  const pos = positionFromElement(el);
  const rows = el.dataSource || [];
  if (rows.length === 0) return;

  const rowCount = rows.length;
  const colCount = Math.max(...rows.map((r) => r.length), 1);

  const colPercents =
    el.columnWidths?.length === colCount
      ? el.columnWidths
      : Array.from({ length: colCount }, () => 100 / colCount);

  const rowPercents =
    el.rowHeights?.length === rowCount
      ? el.rowHeights
      : Array.from({ length: rowCount }, () => 100 / rowCount);

  const colW = colPercents.map((p) => pxToIn((el.width * p) / 100));
  const rowH = rowPercents.map((p) => pxToIn((el.height * p) / 100));

  const borderColor = toHexColor(el.borderColor, "D0D7DE");
  const borderWidth = el.borderWidth ?? 1;
  const borderType =
    el.borderStyle === "none"
      ? ("none" as const)
      : el.borderStyle === "dashed" || el.borderStyle === "dotted"
        ? ("dash" as const)
        : ("solid" as const);

  const tableRows: PptxGenJS.TableRow[] = rows.map((row) => {
    const cells: PptxGenJS.TableCell[] = [];
    for (let c = 0; c < colCount; c++) {
      const cell = row[c];
      if (!cell) {
        cells.push({ text: "" });
        continue;
      }

      // placement key = 水平-垂直，与画布 placementConvey 一致
      const { align, valign } = parsePlacement(
        cell.placement || "center-center"
      );

      cells.push({
        text: cellText(String(cell.value ?? ""), align),
        options: {
          fontSize: pxToPt(cell.fontSize || el.fontSize || 12),
          fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
          color: toHexColor(cell.color),
          bold: cell.bold,
          italic: cell.italic,
          underline: cell.underline ? { style: "sng" } : undefined,
          align,
          valign,
          margin: [CELL_PAD_Y_IN, CELL_PAD_X_IN, CELL_PAD_Y_IN, CELL_PAD_X_IN],
          fill: cell.backgroundColor
            ? { color: toHexColor(cell.backgroundColor, "FFFFFF") }
            : undefined,
        },
      });
    }
    return cells;
  });

  const border =
    borderType === "none"
      ? undefined
      : {
          type: borderType,
          pt: pxToPt(borderWidth),
          color: borderColor,
        };

  slide.addTable(tableRows, {
    x: pos.x,
    y: pos.y,
    w: pos.w,
    colW,
    rowH,
    border,
    fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
    fontSize: pxToPt(el.fontSize || 12),
    autoPage: false,
  });
}
