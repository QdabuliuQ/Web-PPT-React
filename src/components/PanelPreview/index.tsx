import type { ITextProps } from "@/element/Text";
import {
  buildTextDropShadow,
  buildTextGlyphShadow,
} from "@/element/Text/utils";
import { useMemo, type CSSProperties, type FC } from "react";

interface IPanelPreviewProps {
  onSelect: (item: Partial<ITextProps>) => void;
}

/** 判断是否为浅色字（预览格需要深色底才能看清） */
function isLightTextColor(color?: string): boolean {
  if (!color) return false;
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) return false;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
}

/** 字母上的阴影样式（避免作用在预览格底色上） */
function getPreviewLetterStyle(item: Partial<ITextProps>): CSSProperties {
  return {
    color: item.color,
    fontWeight: item.bold ? "bold" : "normal",
    fontStyle: item.italic ? "italic" : "normal",
    textDecoration: [
      item.underline ? "underline" : "",
      item.strikethrough ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" "),
    filter: buildTextDropShadow(
      item.shadow,
      item.shadowOffsetX,
      item.shadowOffsetY,
      item.shadowBlur,
      item.shadowColor
    ),
    textShadow: buildTextGlyphShadow(
      item.shadow,
      item.shadowOffsetX,
      item.shadowOffsetY,
      item.shadowBlur,
      item.shadowColor
    ),
  };
}

export const PanelPreview: FC<IPanelPreviewProps> = (props) => {
  const selectItem = useMemo<Array<Partial<ITextProps>>>(() => {
    const commonStyle: Partial<ITextProps> = {
      underline: false,
      strikethrough: false,
      italic: false,
      shadow: false,
      shadowColor: "#000000",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 4,
      backgroundColor: "transparent",
    };

    return [
      {
        ...commonStyle,
        color: "#000000",
        bold: true,
      },
      {
        ...commonStyle,
        color: "#259bff",
        bold: true,
      },
      {
        ...commonStyle,
        color: "#ffffff",
        bold: true,
        shadow: true,
        shadowColor: "#aaaaaa",
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 3,
      },
      {
        ...commonStyle,
        color: "#25ff27",
        bold: true,
      },
      {
        ...commonStyle,
        color: "#ffffff",
        bold: true,
        shadow: true,
        shadowColor: "#ff1bb8",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 10,
      },
      {
        ...commonStyle,
        color: "#000000",
        bold: true,
        shadow: true,
        shadowColor: "#00ff1d",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 10,
      },
    ];
  }, []);

  return (
    <div className="h-full box-border rounded border border-[var(--border-default,#e5e5e5)] p-[3px] flex gap-[2px]">
      {selectItem.map((item, index) => {
        const light = isLightTextColor(item.color);
        return (
          <div
            key={index}
            className="h-full aspect-[1/1] rounded text-[40px] leading-none flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-90"
            style={{ backgroundColor: light ? "#2a2a2a" : "#f7f7f7" }}
            onClick={() => props.onSelect(item)}
            title="应用样式"
          >
            <span style={getPreviewLetterStyle(item)}>A</span>
          </div>
        );
      })}
    </div>
  );
};
