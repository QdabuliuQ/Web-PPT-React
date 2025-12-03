import {
  AddSubset,
  Click,
  ConnectionPoint,
  Copy,
  Delete,
  DownPicture,
  FormatBrush,
  HorizontallyCentered,
  Minus,
  Move,
  Plus,
} from "@icon-park/react";
import { Button, Dropdown, Tooltip, type MenuProps } from "antd";
import { type FC } from "react";

interface CanvasControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  onToggleMode?: () => void;
  onCopy?: () => void;
  onAddChild?: () => void;
  onDeleteNode?: () => void;
  onToggleAutoLayout?: () => void;
  onRefreshLayout?: () => void;
  onExportSvg?: () => void;
  onExportPng?: () => void;
  onExportJpg?: () => void;
  isDisabledCopy?: boolean;
  isDisabledAddChild?: boolean;
  isDisabledDeleteNode?: boolean;
  isAutoLayoutActive?: boolean;
  mode?: "pan" | "select";
}

export const CanvasControls: FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onToggleMode,
  onCopy,
  onAddChild,
  onDeleteNode,
  onToggleAutoLayout,
  onRefreshLayout,
  onExportSvg,
  onExportPng,
  onExportJpg,
  isDisabledCopy,
  isDisabledAddChild,
  isDisabledDeleteNode,
  isAutoLayoutActive = false,
  mode = "select",
}) => {
  // 导出菜单项
  const exportMenuItems: MenuProps["items"] = [
    {
      key: "svg",
      label: "导出 SVG",
      onClick: onExportSvg,
    },
    {
      key: "png",
      label: "导出 PNG",
      onClick: onExportPng,
    },
    {
      key: "jpg",
      label: "导出 JPG",
      onClick: onExportJpg,
    },
  ];
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
          icon={<AddSubset theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      <Tooltip title="自动排列" placement="top">
        <Button
          type="text"
          onClick={onToggleAutoLayout}
          className={isAutoLayoutActive ? "bg-orange-50" : ""}
          icon={
            <ConnectionPoint
              theme="outline"
              size="16"
              fill={isAutoLayoutActive ? "#f25f00" : "#333"}
            />
          }
        />
      </Tooltip>
      {onRefreshLayout && (
        <Tooltip title="刷新排列" placement="top">
          <Button
            type="text"
            onClick={onRefreshLayout}
            icon={<FormatBrush theme="outline" size="16" fill="#333" />}
          />
        </Tooltip>
      )}
      <Tooltip title="删除元素" placement="top">
        <Button
          type="text"
          onClick={onDeleteNode}
          disabled={isDisabledDeleteNode}
          className={`${isDisabledDeleteNode ? "opacity-30 cursor-not-allowed" : ""}`}
          icon={<Delete theme="outline" size="16" fill="#333" />}
        />
      </Tooltip>
      {(onExportSvg || onExportPng || onExportJpg) && (
        <Dropdown menu={{ items: exportMenuItems }} placement="top">
          <Button
            type="text"
            icon={<DownPicture theme="outline" size="16" fill="#333" />}
          />
        </Dropdown>
      )}
    </div>
  );
};
