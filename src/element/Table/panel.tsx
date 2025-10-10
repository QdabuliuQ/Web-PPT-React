import {
  ColorPanel,
  PanelLargeButton,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelPlacementButton } from "@/components/PanelPlacementButton";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { globalEventBus } from "@/utils/eventBus";
import {
  Add,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BackgroundColor,
  ColorCard,
  Reduce,
  Strikethrough,
  TextBold,
  TextItalic,
  TextUnderline,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Popover, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import type { ITableProps } from ".";
import { FontSize as FontSizeList } from "../Text/constant";
import {
  BASE_TABLE_EVENTS,
  getTableEventName,
  type CellSelectionChangeData,
} from "./events";
interface ITablePanelProps {
  title?: string;
}

export const TablePanel: FC<ITablePanelProps> = observer(() => {
  // 用于跟踪当前表格的单元格选择状态
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const activeElementId = elementActiveStore.getElementActive();

  // 监听表格单元格选择状态变化
  useEffect(() => {
    if (!activeElementId) return;

    const eventName = getTableEventName(
      BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
      activeElementId
    );

    const handleCellSelectionChange = (data: unknown) => {
      const selectionData = data as CellSelectionChangeData;
      setSelectedCells(selectionData.selectedCells);
    };

    globalEventBus.on(eventName, handleCellSelectionChange);

    return () => {
      globalEventBus.off(eventName, handleCellSelectionChange);
    };
  }, [activeElementId]);

  // 当激活元素变化时，清空选择状态
  useEffect(() => {
    setSelectedCells(new Set());
  }, [activeElementId]);

  const largeButtons = useMemo(() => {
    return [
      {
        title: "加粗",
        key: "bold",
        icon: <TextBold theme="outline" size="18" fill="#333" />,
      },
      {
        title: "斜体",
        key: "italic",
        icon: <TextItalic theme="outline" size="18" fill="#333" />,
      },
      {
        title: "下划线",
        key: "underline",
        icon: <TextUnderline theme="outline" size="18" fill="#333" />,
      },
      {
        title: "删除线",
        key: "strikethrough",
        icon: <Strikethrough theme="outline" size="18" fill="#333" />,
      },
    ];
  }, []);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] =
    useState(false);

  // 处理单元格操作按钮点击
  const handleCellOperation = useMemoizedFn(
    (operation: keyof ITableProps["dataSource"][0][0], value?: any) => {
      console.log("handleCellOperation", operation, value);

      if (!activeElementId || selectedCells.size === 0) return;

      // 使用 pptStore 的 updateTableCells 方法来处理更新
      pptStore.updateTableCells(
        pageActiveStore.getPageActive() as string,
        activeElementId as string,
        selectedCells,
        operation as string,
        value
      );
    }
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedColorChange = useMemoizedFn(
    (property: keyof ITableProps["dataSource"][0][0]) => (color: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        handleCellOperation(property, color);
      }, 300);
    }
  );

  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(
      pageActiveStore.getPageActive() as string,
      activeElementId as string
    );
  const { positionHandle } = usePositionElement(
    pageActiveStore.getPageActive() as string,
    activeElementId as string
  );
  const onZIndexChange = useMemoizedFn((key: string) => {
    if (key === "toFront") {
      toFrontHandle();
    } else if (key === "sendForward") {
      sendForwardHandle();
    } else if (key === "sendBackward") {
      sendBackwardHandle();
    } else if (key === "toBack") {
      toBackHandle();
    }
  });

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex items-center gap-[5px] flex-shrink-0">
        {largeButtons.map((item) => {
          return (
            <PanelLargeButton
              key={item.key}
              title={item.title}
              active={false}
              disabled={selectedCells.size === 0} // 没有选中单元格时禁用
              onClick={() =>
                handleCellOperation(
                  item.key as "bold" | "italic" | "underline" | "strikethrough"
                )
              }
              icon={item.icon}
            />
          );
        })}
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-[5px]">
          <Tooltip title="文本字体大小">
            <PanelSelect
              style={{ width: 82 }}
              size="small"
              options={FontSizeList}
              disabled={selectedCells.size === 0}
              onChange={(value) => handleCellOperation("fontSize", value)}
            />
          </Tooltip>
          <Tooltip title="增大字号">
            <Button
              size="small"
              type="text"
              onClick={() => handleCellOperation("fontSize", "add")}
              icon={
                <Add
                  theme="outline"
                  size="13"
                  fill={selectedCells.size === 0 ? "#bbb" : "#333"}
                />
              }
              disabled={selectedCells.size === 0}
            />
          </Tooltip>
          <Tooltip title="减小字号">
            <Button
              size="small"
              type="text"
              onClick={() => handleCellOperation("fontSize", "decrease")}
              disabled={selectedCells.size === 0}
              icon={
                <Reduce
                  theme="outline"
                  size="13"
                  fill={selectedCells.size === 0 ? "#bbb" : "#333"}
                />
              }
            />
          </Tooltip>
        </div>
        <div className="flex items-center gap-[10px]">
          <Popover
            content={<ColorPanel onChange={debouncedColorChange("color")} />}
            trigger="hover"
            open={selectedCells.size === 0 ? false : colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              disabled={selectedCells.size === 0}
              icon={
                <ColorCard
                  theme="multi-color"
                  size="12"
                  fill={
                    selectedCells.size === 0
                      ? "#bbb"
                      : ["#333", "#f25f00", "#FFF", "#43CCF8"]
                  }
                />
              }
            />
          </Popover>
          <Popover
            content={
              <ColorPanel onChange={debouncedColorChange("backgroundColor")} />
            }
            trigger="hover"
            open={selectedCells.size === 0 ? false : backgroundColorPickerOpen}
            onOpenChange={setBackgroundColorPickerOpen}
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              disabled={selectedCells.size === 0}
              icon={
                <BackgroundColor
                  theme="outline"
                  size="15"
                  fill={selectedCells.size === 0 ? "#bbb" : "#333"}
                />
              }
            />
          </Popover>
          <PanelPlacementButton
            disabled={selectedCells.size === 0}
            onSelect={(key) => handleCellOperation("placement", key)}
          />
        </div>
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center gap-[5px]">
          <Button
            size="small"
            type="text"
            disabled={selectedCells.size === 0}
            icon={
              <ArrowUp
                theme="outline"
                size="13"
                fill={selectedCells.size === 0 ? "#bbb" : "#333"}
              />
            }
          >
            在上方插入行
          </Button>
          <Button
            size="small"
            type="text"
            disabled={selectedCells.size === 0}
            icon={
              <ArrowDown
                theme="outline"
                size="13"
                fill={selectedCells.size === 0 ? "#bbb" : "#333"}
              />
            }
          >
            在下方插入行
          </Button>
        </div>
        <div className="flex items-center gap-[5px]">
          <Button
            size="small"
            type="text"
            disabled={selectedCells.size === 0}
            icon={
              <ArrowLeft
                theme="outline"
                size="13"
                fill={selectedCells.size === 0 ? "#bbb" : "#333"}
              />
            }
          >
            在左边插入列
          </Button>
          <Button
            size="small"
            type="text"
            disabled={selectedCells.size === 0}
            icon={
              <ArrowRight
                theme="outline"
                size="13"
                fill={selectedCells.size === 0 ? "#bbb" : "#333"}
              />
            }
          >
            在右边插入列
          </Button>
        </div>
      </div>
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
});

export const TablePanelTitle = "表格";
export const TablePanelKey = "table";
