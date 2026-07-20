import type { ITextProps } from "@/element/Text";
import type PptxGenJS from "pptxgenjs";
import {
  parsePlacement,
  positionFromElement,
  shadowFromOffsets,
  toHexColor,
  mapBorderDash,
  pxToPt,
} from "./helpers";

/**
 * 文本 → PPTX（字号/阴影按画布 px 换算为 pptxgenjs 的 pt）
 */
export function addTextElement(
  slide: PptxGenJS.Slide,
  el: ITextProps
): void {
  const { align, valign } = parsePlacement(el.placement);
  const pos = positionFromElement(el);

  const options: PptxGenJS.TextPropsOptions = {
    ...pos,
    fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
    fontSize: pxToPt(el.fontSize),
    color: toHexColor(el.color),
    bold: el.bold,
    italic: el.italic,
    underline: el.underline ? { style: "sng" } : undefined,
    strike: el.strikethrough ? "sngStrike" : undefined,
    align,
    valign,
    wrap: true,
    isTextBox: true,
    // 与网页一致：文本框无内边距
    margin: 0,
  };

  if (el.lineHeight && el.fontSize) {
    options.lineSpacingMultiple = el.lineHeight;
  }

  if (el.backgroundColor && el.backgroundColor !== "transparent") {
    options.fill = { color: toHexColor(el.backgroundColor, "FFFFFF") };
  }

  if (el.border) {
    const dashType = mapBorderDash(el.borderStyle);
    options.line = {
      color: toHexColor(el.borderColor, "000000"),
      width: pxToPt(el.borderWidth || 1),
      ...(dashType ? { dashType } : { type: "none" as const }),
    };
  }

  const shadow = shadowFromOffsets({
    enabled: el.shadow,
    offsetX: el.shadowOffsetX,
    offsetY: el.shadowOffsetY,
    color: el.shadowColor,
    blur: el.shadowBlur ?? 4,
  });
  if (shadow) options.shadow = shadow;

  if (el.rotate) {
    options.rotate = el.rotate;
  }

  slide.addText(el.text ?? "", options);
}
