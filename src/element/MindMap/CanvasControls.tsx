import {
  Click,
  ConnectionPoint,
  Copy,
  HorizontallyCentered,
  Minus,
  Move,
  Plus,
} from "@icon-park/react";
import { Button, Tooltip } from "antd";
import { type FC } from "react";

interface CanvasControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  onToggleMode?: () => void;
  onCopy?: () => void;
  onAddChild?: () => void;
  isDisabledCopy?: boolean;
  isDisabledAddChild?: boolean;
  mode?: "pan" | "select";
}

export const CanvasControls: FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onToggleMode,
  onCopy,
  onAddChild,
  isDisabledCopy,
  isDisabledAddChild,
  mode = "select",
}) => {
  return (
    <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 flex gap-[8px] items-center bg-white rounded-[8px] shadow-lg px-[8px] py-[6px]">
      {onToggleMode && (
        <Tooltip
          title={mode === "pan" ? "选择节点" : "拖拽画布"}
          placement="top"
        >
          <Button
            type="text"
            onClick={onToggleMode}
            icon={
              mode === "pan" ? (
                <Move theme="outline" size="16" fill="#333" />
              ) : (
                <Click theme="outline" size="16" fill="#333" />
              )
            }
          />
        </Tooltip>
      )}
      <Tooltip title="缩小画布" placement="top">
        <Button
          type="text"
          onClick={onZoomOut}
          icon={<Minus theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      <Tooltip title="放大画布" placement="top">
        <Button
          type="text"
          onClick={onZoomIn}
          icon={<Plus theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      <Tooltip title="居中画布" placement="top">
        <Button
          type="text"
          onClick={onCenter}
          icon={<HorizontallyCentered theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      <Tooltip title="复制节点" placement="top">
        <Button
          type="text"
          onClick={onCopy}
          disabled={isDisabledCopy}
          className={`${isDisabledCopy ? "opacity-30 cursor-not-allowed" : ""}`}
          icon={<Copy theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      <Tooltip title="添加子节点" placement="top">
        <Button
          type="text"
          onClick={onAddChild}
          disabled={isDisabledAddChild}
          className={`${isDisabledAddChild ? "opacity-30 cursor-not-allowed" : ""}`}
          icon={<ConnectionPoint theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
    </div>
  );
};
