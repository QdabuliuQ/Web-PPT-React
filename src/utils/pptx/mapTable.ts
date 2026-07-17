import type { ITableProps } from "@/element/Table";
import type PptxGenJS from "pptxgenjs";
import {
  parsePlacement,
  positionFromElement,
  pxToIn,
  toHexColor,
} from "./helpers";

export function addTableElement(
  slide: PptxGenJS.Slide,
  el: ITableProps
): void {
  const pos = positionFromElement(el);
  const rows = el.dataSource || [];
  if (rows.length === 0) return;

  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const colPercents =
    el.columnWidths?.length === colCount
      ? el.columnWidths
      : Array.from({ length: colCount }, () => 100 / colCount);

  const colW = colPercents.map((p) => pxToIn((el.width * p) / 100));

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
      const { align, valign } = parsePlacement(cell.placement);
      cells.push({
        text: String(cell.value ?? ""),
        options: {
          fontSize: cell.fontSize || el.fontSize || 12,
          fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
          color: toHexColor(cell.color),
          bold: cell.bold,
          italic: cell.italic,
          underline: cell.underline ? { style: "sng" } : undefined,
          align,
          valign,
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
          pt: borderWidth,
          color: borderColor,
        };

  slide.addTable(tableRows, {
    x: pos.x,
    y: pos.y,
    w: pos.w,
    h: pos.h,
    colW,
    border,
    fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
    fontSize: el.fontSize || 12,
  });
}
