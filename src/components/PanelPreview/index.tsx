import type { ITextProps } from "@/element/Text";
import { propsToCssStyle } from "@/element/Text/utils";
import { useMemo, type FC } from "react";
interface IPanelPreviewProps {
  onSelect: (item: Partial<ITextProps>) => void;
}

export const PanelPreview: FC<IPanelPreviewProps> = (props) => {
  const commonStyle = {
    underline: false,
    strikethrough: false,
    italic: false,
    stroke: false,
    strokeColor: "#000000",
    strokeWidth: 0,
    shadow: false,
    shadowColor: "#000000",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };

  const selectItem = useMemo<Array<Partial<ITextProps>>>(
    () => [
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
        shadowColor: "#cccccc",
        shadowOffsetX: 1,
        shadowOffsetY: 1,
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
      },
      {
        ...commonStyle,
        color: "#000000",
        bold: true,
        shadow: true,
        shadowColor: "#00ff1d",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    ],
    []
  );

  return (
    <div className="h-full box-border rounded border border-[gray-200] p-[3px] flex gap-[2px]">
      {selectItem.map((item, index) => {
        return (
          <div
            key={index}
            className="h-full aspect-[1/1] rounded text-[40px] flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0]"
            style={{
              ...propsToCssStyle(item),
            }}
            onClick={() => props.onSelect(item)}
          >
            A
          </div>
        );
      })}
    </div>
  );
};
