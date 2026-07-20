import type { CSSProperties } from "react";
import type { ITextProps } from "..";

/** 容器轮廓阴影：透明区域不投影，文字 + 边框会投影 */
export function buildTextDropShadow(
  enabled?: boolean,
  offsetX = 0,
  offsetY = 0,
  blur = 4,
  color = "#000000"
): string | undefined {
  if (!enabled) return undefined;
  return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`;
}

/** 字形阴影：与容器 drop-shadow 叠加，保证文字本身也有阴影 */
export function buildTextGlyphShadow(
  enabled?: boolean,
  offsetX = 0,
  offsetY = 0,
  blur = 4,
  color = "#000000"
): string {
  if (!enabled) return "none";
  return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
}

/** 将文本属性转为画布 CSS */
export function propsToCssStyle(props: Partial<ITextProps>) {
  const styles: CSSProperties = {};
  for (const key of Object.keys(props)) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;

    if (key === "bold") {
      styles.fontWeight = props.bold ? "bold" : "normal";
    } else if (key === "italic") {
      styles.fontStyle = props.italic ? "italic" : "normal";
    } else if (key === "fontFamily") {
      styles.fontFamily = props.fontFamily;
    } else if (key === "underline" || key === "strikethrough") {
      styles.textDecoration = `${props.underline ? "underline" : ""} ${
        props.strikethrough ? "line-through" : ""
      }`.trim();
    } else if (key === "shadow") {
      const filter = buildTextDropShadow(
        props.shadow,
        props.shadowOffsetX,
        props.shadowOffsetY,
        props.shadowBlur,
        props.shadowColor
      );
      if (filter) styles.filter = filter;
      styles.textShadow = buildTextGlyphShadow(
        props.shadow,
        props.shadowOffsetX,
        props.shadowOffsetY,
        props.shadowBlur,
        props.shadowColor
      );
    } else if (key === "border") {
      styles.border = props.border
        ? `${props.borderWidth}px ${props.borderStyle} ${props.borderColor}`
        : "none";
    } else if (
      key === "shadowOffsetX" ||
      key === "shadowOffsetY" ||
      key === "shadowBlur" ||
      key === "shadowColor" ||
      key === "borderWidth" ||
      key === "borderStyle" ||
      key === "borderColor"
    ) {
      continue;
    } else {
      (styles as Record<string, unknown>)[key] = (
        props as Record<string, unknown>
      )[key];
    }
  }
  return styles;
}
