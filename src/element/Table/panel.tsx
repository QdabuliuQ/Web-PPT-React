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
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import globalStyles from "@/styles/global.module.less";
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
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Button, ColorPicker, InputNumber, Popover, Tooltip } from "antd";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import type { ITableProps } from ".";
import { Border, FontSize as FontSizeList } from "../Text/constant";
import {
  BASE_TABLE_EVENTS,
  getTableEventName,
  type CellSelectionChangeData,
} from "./events";
import { TableStylePanel } from "./stylePresets";
interface ITablePanelProps {
  title?: string;
}

export const TablePanel: FC<ITablePanelProps> = () => {
  // 用于跟踪当前表格的单元格选择状态
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // 使用 Zustand hooks 订阅状态变化
  const activeElementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const pages = usePPTStore((state) => state.pages);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  // 监听表格单元格选择状态变化；面板切 tab 重挂后主动同步当前选中
  useEffect(() => {
    if (!activeElementId) {
      setSelectedCells(new Set());
      return;
    }

    const eventName = getTableEventName(
      BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
      activeElementId
    );

    const handleCellSelectionChange = (data: unknown) => {
      const selectionData = data as CellSelectionChangeData;
      setSelectedCells(selectionData.selectedCells);
    };

    globalEventBus.on(eventName, handleCellSelectionChange);

    // 订阅后再请求同步，拿到表格组件内仍保留的选中状态
    globalEventBus.emit(
      getTableEventName(
        BASE_TABLE_EVENTS.CELL_SELECTION_SYNC_REQUEST,
        activeElementId
      )
    );

    return () => {
      globalEventBus.off(eventName, handleCellSelectionChange);
    };
  }, [activeElementId]);

  const largeButtons = useMemo(() => {
    return [
      {
        title: "加粗",
        key: "bold",
        icon: <TextBold theme="outline" size="18" fill="var(--icon-color)" />,
      },
      {
        title: "斜体",
        key: "italic",
        icon: <TextItalic theme="outline" size="18" fill="var(--icon-color)" />,
      },
      {
        title: "下划线",
        key: "underline",
        icon: <TextUnderline theme="outline" size="18" fill="var(--icon-color)" />,
      },
      {
        title: "删除线",
        key: "strikethrough",
        icon: <Strikethrough theme="outline" size="18" fill="var(--icon-color)" />,
      },
    ];
  }, []);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] =
    useState(false);

  // 使用本地状态存储边框属性，实现即时 UI 响应
  const [borderWidth, setBorderWidth] = useState<number | null>(null);
  const [borderStyle, setBorderStyle] = useState<string | undefined>(undefined);
  const [borderColor, setBorderColor] = useState<string | undefined>(undefined);

  // 使用本地状态存储按钮的 active 状态，实现即时 UI 响应
  const [buttonStates, setButtonStates] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  // 控件默认值
  const DEFAULT_FONT_SIZE = 14;
  const DEFAULT_COLOR = "#000000";
  const DEFAULT_BACKGROUND_COLOR = "#ffffff";
  const DEFAULT_PLACEMENT = "center-center";

  // 使用本地状态存储控件值，实现动态调整
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    DEFAULT_BACKGROUND_COLOR
  );
  const [placement, setPlacement] = useState<string>(DEFAULT_PLACEMENT);

  // 处理加粗、斜体、下划线、删除线按钮点击：立即更新本地状态，防抖更新 store
  const handleToggleButton = useMemoizedFn(
    (operation: "bold" | "italic" | "underline" | "strikethrough") => {
      if (!activeElementId || !pageId || selectedCells.size === 0) return;

      // 计算新的状态值
      const newValue = !buttonStates[operation];

      // 立即更新本地状态，实现即时 UI 响应
      setButtonStates((prev) => ({
        ...prev,
        [operation]: newValue,
      }));

      // 防抖更新 zustand store，传递新的状态值
      debouncedHandleCellOperation.run(operation, newValue);
    }
  );

  // 处理其他单元格操作（fontSize、placement 等）
  const handleCellOperation = useMemoizedFn(
    (operation: keyof ITableProps["dataSource"][0][0], value?: any) => {
      if (!activeElementId || !pageId || selectedCells.size === 0) return;

      // 如果是 fontSize 的增加/减少操作，先更新本地状态
      if (
        operation === "fontSize" &&
        (value === "add" || value === "decrease")
      ) {
        const newFontSize =
          value === "add" ? fontSize + 1 : Math.max(1, fontSize - 1);
        setFontSize(newFontSize);
      }

      // 使用防抖函数来处理更新
      debouncedHandleCellOperation.run(operation, value);
    }
  );

  // 使用 useDebounce 替代手动防抖
  const debouncedColorChange = useMemoizedFn(
    (property: keyof ITableProps["dataSource"][0][0]) =>
      (colorValue: string) => {
        // 更新本地状态
        if (property === "color") {
          setColor(colorValue);
        } else if (property === "backgroundColor") {
          setBackgroundColor(colorValue);
        }
        // 防抖更新 store
        debouncedHandleCellOperation.run(property, colorValue);
      }
  );

  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", activeElementId || "");
  const { positionHandle } = usePositionElement(
    pageId || "",
    activeElementId || ""
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

  // 使用 useMemo 依赖 pages 来响应元素更新
  const currentElement = useMemo<ITableProps | null>(() => {
    if (!activeElementId || !pageId) return null;
    const page = pages.find((p) => p.id === pageId);
    if (!page) return null;
    const element = page.elements.find((el) => el.id === activeElementId);
    if (element && element.type === "table") {
      return element as ITableProps;
    }
    return null;
  }, [activeElementId, pageId, pages]);

  // 当 currentElement 变化时，同步更新本地状态
  useEffect(() => {
    if (currentElement) {
      setBorderWidth(currentElement.borderWidth ?? null);
      setBorderStyle(currentElement.borderStyle);
      setBorderColor(currentElement.borderColor);
    } else {
      setBorderWidth(null);
      setBorderStyle(undefined);
      setBorderColor(undefined);
    }
  }, [currentElement]);

  // 当 currentElement 或 selectedCells 变化时，同步更新按钮状态和控件值
  useEffect(() => {
    if (!currentElement || selectedCells.size === 0) {
      // 取消选中时，重置为默认值
      setButtonStates({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
      });
      setFontSize(DEFAULT_FONT_SIZE);
      setColor(DEFAULT_COLOR);
      setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
      setPlacement(DEFAULT_PLACEMENT);
      return;
    }

    // 选中单元格时，从第一个选中的单元格读取值（如果多个单元格值不一致，取第一个）
    const firstCellKey = Array.from(selectedCells)[0];
    if (firstCellKey) {
      const [rowIndex, colIndex] = firstCellKey.split("-").map(Number);
      const cell = currentElement.dataSource[rowIndex]?.[colIndex];
      if (cell) {
        // 更新控件值
        setFontSize(cell.fontSize || DEFAULT_FONT_SIZE);
        setColor(cell.color || DEFAULT_COLOR);
        setBackgroundColor(cell.backgroundColor || DEFAULT_BACKGROUND_COLOR);
        setPlacement(cell.placement || DEFAULT_PLACEMENT);
      }
    }

    const checkProperty = (
      property: "bold" | "italic" | "underline" | "strikethrough"
    ): boolean => {
      // 检查所有选中单元格是否都有该属性为 true
      for (const cellKey of selectedCells) {
        const [rowIndex, colIndex] = cellKey.split("-").map(Number);
        const cell = currentElement.dataSource[rowIndex]?.[colIndex];
        if (!cell || !(cell as any)[property]) {
          return false;
        }
      }
      return true;
    };

    setButtonStates({
      bold: checkProperty("bold"),
      italic: checkProperty("italic"),
      underline: checkProperty("underline"),
      strikethrough: checkProperty("strikethrough"),
    });
  }, [currentElement, selectedCells]);

  // 使用 ref 存储 selectedCells，确保防抖函数能获取到最新值
  const selectedCellsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);

  // 防抖处理单元格操作
  const debouncedHandleCellOperation = useDebounceFn(
    (operation: keyof ITableProps["dataSource"][0][0], value?: any) => {
      // 使用 ref 获取最新的 selectedCells
      const latestSelectedCells = selectedCellsRef.current;

      if (!activeElementId || !pageId || latestSelectedCells.size === 0) return;

      // 从 store 获取最新的元素数据，避免使用闭包中的旧数据
      const latestPages = usePPTStore.getState().pages;
      const latestPage = latestPages.find((p) => p.id === pageId);
      if (!latestPage) return;
      const latestElement = latestPage.elements.find(
        (el) => el.id === activeElementId
      ) as ITableProps | undefined;
      if (!latestElement || latestElement.type !== "table") return;

      // 克隆当前数据源
      const newDataSource = latestElement.dataSource.map((row) =>
        row.map((cell) => ({ ...cell }))
      );

      // 对选中的单元格应用操作
      latestSelectedCells.forEach((cellKey) => {
        const [rowIndex, colIndex] = cellKey.split("-").map(Number);
        if (newDataSource[rowIndex] && newDataSource[rowIndex][colIndex]) {
          const cell = newDataSource[rowIndex][colIndex];
          if (value !== undefined) {
            // 处理 fontSize 的特殊操作：add 和 decrease
            if (operation === "fontSize" && typeof value === "string") {
              const currentFontSize = (cell as any).fontSize || 14;
              if (value === "add") {
                (cell as any).fontSize = currentFontSize + 1;
              } else if (value === "decrease") {
                (cell as any).fontSize = Math.max(1, currentFontSize - 1);
              } else {
                // 直接设置值（用于选择器选择的值）
                (cell as any).fontSize = value;
              }
            } else {
              // 直接设置值（用于加粗、斜体、下划线、删除线等布尔属性）
              (cell as any)[operation] = value;
            }
          } else {
            // 如果没有提供值，则切换布尔值属性（用于其他操作）
            const currentValue = (cell as any)[operation];
            if (typeof currentValue === "boolean") {
              (cell as any)[operation] = !currentValue;
            }
          }
        }
      });

      // 更新到store
      setElementInfo(pageId, activeElementId, {
        ...latestElement,
        dataSource: newDataSource,
      } as ITableProps);
    },
    { wait: 300 }
  );

  // 防抖更新 Zustand store，避免频繁更新导致多次重新渲染
  const debouncedUpdateStore = useDebounceFn(
    (key: keyof ITableProps, value: any) => {
      if (!activeElementId || !pageId || !currentElement) return;
      setElementInfo(pageId, activeElementId, {
        ...currentElement,
        [key]: value,
      } as ITableProps);
    },
    { wait: 300 }
  );

  // 处理边框宽度变化：立即更新本地状态，防抖更新 store
  const handleBorderWidthChange = useMemoizedFn((value: number | null) => {
    setBorderWidth(value);
    if (value !== null) {
      debouncedUpdateStore.run("borderWidth", value);
    }
  });

  // 处理边框样式变化：立即更新本地状态，防抖更新 store
  const handleBorderStyleChange = useMemoizedFn((value: string) => {
    setBorderStyle(value);
    debouncedUpdateStore.run("borderStyle", value);
  });

  // 处理边框颜色变化：立即更新本地状态，防抖更新 store
  const handleBorderColorChange = useMemoizedFn((color: string) => {
    setBorderColor(color);
    debouncedUpdateStore.run("borderColor", color);
  });

  // 插入行处理函数
  const handleInsertRow = useMemoizedFn((position: "above" | "below") => {
    if (
      !activeElementId ||
      !pageId ||
      !currentElement ||
      selectedCells.size === 0
    )
      return;

    const { dataSource, rowHeights } = currentElement;
    const rowCount = dataSource.length;
    const colCount = dataSource[0]?.length || 0;

    // 获取第一个选中单元格的行索引
    const firstCellKey = Array.from(selectedCells)[0];
    const [targetRowIndex] = firstCellKey.split("-").map(Number);

    // 创建新的空单元格
    const createEmptyCell = () => ({
      fontSize: 14,
      color: "#000",
      backgroundColor: "#fff",
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      value: "",
      placement: "center-center" as const,
    });

    const newRow = Array(colCount)
      .fill(null)
      .map(() => createEmptyCell());
    const insertIndex =
      position === "above" ? targetRowIndex : targetRowIndex + 1;
    const newDataSource = [
      ...dataSource.slice(0, insertIndex),
      newRow,
      ...dataSource.slice(insertIndex),
    ];

    // 重新计算行高
    const newRowHeights =
      rowHeights && rowHeights.length > 0
        ? [
            ...rowHeights.slice(0, insertIndex),
            100 / (rowCount + 1),
            ...rowHeights
              .slice(insertIndex)
              .map((h) => (h * rowCount) / (rowCount + 1)),
          ]
        : undefined;

    setElementInfo(pageId, activeElementId, {
      ...currentElement,
      dataSource: newDataSource,
      rowHeights: newRowHeights,
    } as ITableProps);
  });

  // 插入列处理函数
  const handleInsertColumn = useMemoizedFn((position: "left" | "right") => {
    if (
      !activeElementId ||
      !pageId ||
      !currentElement ||
      selectedCells.size === 0
    )
      return;

    const { dataSource, columnWidths } = currentElement;
    const colCount = dataSource[0]?.length || 0;

    // 获取第一个选中单元格的列索引
    const firstCellKey = Array.from(selectedCells)[0];
    const [, targetColIndex] = firstCellKey.split("-").map(Number);

    // 创建新的空单元格
    const createEmptyCell = () => ({
      fontSize: 14,
      color: "#000",
      backgroundColor: "#fff",
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      value: "",
      placement: "center-center" as const,
    });

    const insertIndex =
      position === "left" ? targetColIndex : targetColIndex + 1;
    const newDataSource = dataSource.map((row) => [
      ...row.slice(0, insertIndex),
      createEmptyCell(),
      ...row.slice(insertIndex),
    ]);

    // 重新计算列宽
    const newColumnWidths =
      columnWidths && columnWidths.length > 0
        ? [
            ...columnWidths.slice(0, insertIndex),
            100 / (colCount + 1),
            ...columnWidths
              .slice(insertIndex)
              .map((w) => (w * colCount) / (colCount + 1)),
          ]
        : undefined;

    setElementInfo(pageId, activeElementId, {
      ...currentElement,
      dataSource: newDataSource,
      columnWidths: newColumnWidths,
    } as ITableProps);
  });

  // 表格操作按钮配置
  const tableActionButtons = [
    // 行操作
    [
      {
        key: "insertRowAbove",
        icon: <ArrowUp theme="outline" size="13" />,
        text: "在上方插入行",
        onClick: () => handleInsertRow("above"),
      },
      {
        key: "insertRowBelow",
        icon: <ArrowDown theme="outline" size="13" />,
        text: "在下方插入行",
        onClick: () => handleInsertRow("below"),
      },
    ],
    // 列操作
    [
      {
        key: "insertColumnLeft",
        icon: <ArrowLeft theme="outline" size="13" />,
        text: "在左边插入列",
        onClick: () => handleInsertColumn("left"),
      },
      {
        key: "insertColumnRight",
        icon: <ArrowRight theme="outline" size="13" />,
        text: "在右边插入列",
        onClick: () => handleInsertColumn("right"),
      },
    ],
  ];

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <TableStylePanel />
      <PanelSplitLine />
      <div className="h-full flex items-center gap-[5px] flex-shrink-0">
        {largeButtons.map((item) => {
          const propertyKey = item.key as
            | "bold"
            | "italic"
            | "underline"
            | "strikethrough";
          return (
            <PanelLargeButton
              key={item.key}
              title={item.title}
              active={buttonStates[propertyKey]}
              disabled={selectedCells.size === 0} // 没有选中单元格时禁用
              onClick={() => handleToggleButton(propertyKey)}
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
              value={fontSize}
              disabled={selectedCells.size === 0}
              onChange={(value) => {
                setFontSize(value);
                debouncedHandleCellOperation.run("fontSize", value);
              }}
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
                  fill={
                    selectedCells.size === 0
                      ? "var(--text-disabled)"
                      : "var(--icon-color)"
                  }
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
                  fill={
                    selectedCells.size === 0
                      ? "var(--text-disabled)"
                      : "var(--icon-color)"
                  }
                />
              }
            />
          </Tooltip>
        </div>
        <div className="flex items-center gap-[10px]">
          <Popover
            content={
              <ColorPanel
                value={color}
                onChange={debouncedColorChange("color")}
              />
            }
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
                      ? "var(--text-disabled)"
                      : [
                          "var(--icon-color)",
                          "var(--primary-color)",
                          "#FFF",
                          "#43CCF8",
                        ]
                  }
                />
              }
            />
          </Popover>
          <Popover
            content={
              <ColorPanel
                value={backgroundColor}
                onChange={debouncedColorChange("backgroundColor")}
              />
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
                  fill={
                    selectedCells.size === 0
                      ? "var(--text-disabled)"
                      : "var(--icon-color)"
                  }
                />
              }
            />
          </Popover>
          <PanelPlacementButton
            value={placement}
            disabled={selectedCells.size === 0}
            onSelect={(key) => {
              setPlacement(key);
              handleCellOperation("placement", key);
            }}
          />
        </div>
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-between">
        {tableActionButtons.map((buttonGroup, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-[5px]">
            {buttonGroup.map((button) => (
              <Button
                key={button.key}
                size="small"
                type="text"
                disabled={selectedCells.size === 0}
                onClick={button.onClick}
                icon={
                  <span
                    style={{
                      color:
                        selectedCells.size === 0
                          ? "var(--text-disabled)"
                          : "var(--icon-color)",
                    }}
                  >
                    {button.icon}
                  </span>
                }
              >
                {button.text}
              </Button>
            ))}
          </div>
        ))}
      </div>
      <PanelSplitLine />
      <div className="h-full flex gap-[6px]">
        <div className="flex h-full flex-col justify-between">
          <Tooltip title="边框宽度" placement="top">
            <InputNumber
              value={borderWidth}
              style={{ width: "85px" }}
              size="small"
              disabled={!currentElement}
              onChange={handleBorderWidthChange}
              min={1}
            />
          </Tooltip>
          <Tooltip title="边框样式" placement="top">
            <PanelSelect
              value={borderStyle}
              style={{ width: "85px" }}
              size="small"
              options={Border}
              disabled={!currentElement}
              onChange={handleBorderStyleChange}
            />
          </Tooltip>
        </div>
        <div className="">
          <Tooltip title="边框颜色" placement="top">
            <ColorPicker
              size="small"
              className={globalStyles.colorPicker}
              value={borderColor}
              disabled={!currentElement}
              onChange={(_, color) => handleBorderColorChange(color)}
            />
          </Tooltip>
        </div>
      </div>
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
};

export const TablePanelTitle = "tablePanel.title";
export const TablePanelKey = "table";
