import type { CSSProperties } from "react";
import type { ITextProps } from "..";

export function propsToCssStyle(props: Partial<ITextProps>) {
  const styles: CSSProperties = {};
  for (const key of Object.keys(props)) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      if (key === "bold") {
        styles.fontWeight = props.bold ? "bold" : "normal";
      } else if (key === "italic") {
        styles.fontStyle = props.italic ? "italic" : "normal";
      } else if (key === "fontFamily") {
        styles.fontFamily = props.fontFamily;
      } else if (key === "underline" || key === "strikethrough") {
        styles.textDecoration = `${props.underline ? "underline" : ""} ${props.strikethrough ? "line-through" : ""}`;
      } else if (key === "shadow") {
        styles.textShadow = props.shadow
          ? `${props.shadowOffsetY}px ${props.shadowOffsetX}px 5px ${props.shadowColor}`
          : "none";
      } else if (key === "border") {
        styles.border = props.border
          ? `${props.borderWidth}px ${props.borderStyle} ${props.borderColor}`
          : "none";
      } else if (key === "stroke") {
        styles["-webkit-text-stroke"] = props.stroke
          ? `${props.strokeWidth}px ${props.strokeColor}`
          : "";
      } else {
        styles[key] = props[key];
      }
    }
  }
  return styles;
}
