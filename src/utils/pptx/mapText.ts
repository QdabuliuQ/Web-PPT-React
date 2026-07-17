import type { ITextProps } from "@/element/Text";
import type PptxGenJS from "pptxgenjs";
import {
  parsePlacement,
  positionFromElement,
  shadowFromOffsets,
  toHexColor,
  mapBorderDash,
} from "./helpers";

export function addTextElement(
  slide: PptxGenJS.Slide,
  el: ITextProps
): void {
  const { align, valign } = parsePlacement(el.placement);
  const pos = positionFromElement(el);

  const options: PptxGenJS.TextPropsOptions = {
    ...pos,
    fontFace: el.fontFamily?.split(",")[0]?.trim() || "Arial",
    fontSize: el.fontSize,
    color: toHexColor(el.color),
    bold: el.bold,
    italic: el.italic,
    underline: el.underline ? { style: "sng" } : undefined,
    strike: el.strikethrough ? "sngStrike" : undefined,
    align,
    valign,
    wrap: true,
    isTextBox: true,
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
      width: el.borderWidth || 1,
      ...(dashType ? { dashType } : { type: "none" as const }),
    };
  }

  if (el.stroke) {
    options.outline = {
      size: el.strokeWidth || 1,
      color: toHexColor(el.strokeColor, "000000"),
    };
  }

  const shadow = shadowFromOffsets({
    enabled: el.shadow,
    offsetX: el.shadowOffsetX,
    offsetY: el.shadowOffsetY,
    color: el.shadowColor,
  });
  if (shadow) options.shadow = shadow;

  // 旋转已在 position 中带上；pptx 文本 rotate 单位是度
  if (el.rotate) {
    options.rotate = el.rotate;
  }

  slide.addText(el.text ?? "", options);
}
