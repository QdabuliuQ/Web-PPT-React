import { HorizontallyCentered, Minus, Plus } from "@icon-park/react";
import { Tooltip } from "antd";
import { type FC } from "react";

interface CanvasControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
}

export const CanvasControls: FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
}) => {
  return (
    <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 flex gap-[8px] items-center bg-white rounded-[8px] shadow-lg px-[8px] py-[6px]">
      <Tooltip title="缩小画布" placement="top">
        <button
          onClick={onZoomOut}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <Minus theme="outline" size="16" fill="#333" />
        </button>
      </Tooltip>
      <Tooltip title="居中画布" placement="top">
        <button
          onClick={onCenter}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <HorizontallyCentered theme="outline" size="16" fill="#333" />
        </button>
      </Tooltip>
      <Tooltip title="放大画布" placement="top">
        <button
          onClick={onZoomIn}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <Plus theme="outline" size="16" fill="#333" />
        </button>
      </Tooltip>
    </div>
  );
};
