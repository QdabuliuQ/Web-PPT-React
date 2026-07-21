import { AnimationWrapper, MovableWrapper } from "@/components";
import { getCenteredElementPosition } from "@/constants/canvas";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  elementActiveStore,
  elementHoverActiveStore,
  pageActiveStore,
  pptStore,
  useElementActiveStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { cloneDeep, getRandomId, placementConvey } from "@/utils";
import { globalEventBus } from "@/utils/eventBus";
import { TableFile } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Modal } from "antd";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import Spreadsheet from "x-data-spreadsheet";
import "x-data-spreadsheet/dist/locale/zh-cn";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import { useMovableElement } from "../../hooks/useMovableElement";
import type { PlacementMapped } from "../Text/constant";
import TableButtonComponent from "./button";
import {
  BASE_TABLE_EVENTS,
  getTableEventName,
  type CellOperationData,
  type CellSelectionChangeData,
} from "./events";
import styles from "./index.module.less";
import { getTableMenuItems } from "./menu";
export { TablePanel, TablePanelKey, TablePanelTitle } from "./panel";

export interface ITableProps extends ICommonElementProps {
  type: "table";
  dataSource: Array<
    Array<{
      fontSize: number;
      color: string;
      backgroundColor: string;
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
      value: string | number;
      placement: keyof typeof PlacementMapped;
    }>
  >;
  columnWidths: number[]; // 列宽百分比 [25, 25, 50] (总和应为100)
  rowHeights?: number[]; // 行高百分比，可选，默认auto
  fontSize: number;
  fontFamily?: string;
  // 边框样式配置
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  borderRadius?: number;
}

const Component: FC<ITableProps> = (props) => {
  const {
    dataSource,
    id,
    mode = "edit",
    fontSize,
    fontFamily = "Arial, sans-serif",
    columnWidths,
    rowHeights,
    x,
    y,
    width,
    height,
    rotate,
    zIndex,
    animationName,
    animationDuration,
    animationDelay,
    animationTrigger,
    borderColor = "#d0d7de",
    borderWidth = 1,
    borderStyle = "solid",
    onSelect,
  } = props;
  const tableRef = useRef<HTMLTableElement>(null);
  const moveableRef = useRef<any>(null);
  const tableData = dataSource;

  // 表格调整相关状态
  const [resizing, setResizing] = useState<{
    type: "column" | "row";
    index: number;
    startPos: number;
    startSize: number;
  } | null>(null);
  const [currentColumnWidths, setCurrentColumnWidths] = useState(columnWidths);
  const [currentRowHeights, setCurrentRowHeights] = useState(rowHeights || []);

  // 弹窗状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 单元格选中状态管理
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const selectedCellsRef = useRef(selectedCells);
  const isShiftPressedRef = useRef(isShiftPressed);
  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);
  useEffect(() => {
    isShiftPressedRef.current = isShiftPressed;
  }, [isShiftPressed]);

  // 拖拽选择状态管理
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // 跟踪表格是否真正被拖拽移动过（用于防止误触发双击）
  const hasDraggedRef = useRef(false);

  // 从DOM读取并更新列宽和行高的通用方法
  const updateColumnWidthsAndRowHeightsFromDOM = useMemoizedFn(() => {
    if (!tableRef.current) return;

    const table = tableRef.current;
    const containerRect = table.getBoundingClientRect();

    // 计算列宽百分比
    const calculatedColumnWidths: number[] = [];
    const rows = table.querySelectorAll("tr");
    if (rows.length > 0) {
      const firstRow = rows[0];
      const cells = firstRow.querySelectorAll("td");
      cells.forEach((cell) => {
        const cellRect = cell.getBoundingClientRect();
        const widthPercent = (cellRect.width / containerRect.width) * 100;
        calculatedColumnWidths.push(widthPercent);
      });
    }

    // 计算行高百分比
    const calculatedRowHeights: number[] = [];
    rows.forEach((row) => {
      const rowRect = row.getBoundingClientRect();
      const heightPercent = (rowRect.height / containerRect.height) * 100;
      calculatedRowHeights.push(heightPercent);
    });

    // 获取当前页面ID并更新store
    const pageId = pageActiveStore.getPageActive();
    if (pageId) {
      const currentElement = pptStore.getElementInfo(pageId, id);
      if (currentElement) {
        pptStore.setElementInfo(pageId, id, {
          ...currentElement,
          columnWidths: calculatedColumnWidths,
          rowHeights:
            calculatedRowHeights.length > 0 ? calculatedRowHeights : undefined,
        } as any);
      }
    }
  });

  // 当props变化时更新本地状态
  useEffect(() => {
    setCurrentColumnWidths(columnWidths);
    // 如果没有设置行高，则平均分配
    if (!rowHeights || rowHeights.length === 0) {
      const avgHeight = 100 / tableData.length;
      setCurrentRowHeights(Array(tableData.length).fill(avgHeight));
    } else {
      setCurrentRowHeights(rowHeights);
    }
  }, [columnWidths, rowHeights, tableData.length]);

  // 监听 dataSource 变化，自动调整 columnWidths 和 rowHeights
  useEffect(() => {
    const pageId = pageActiveStore.getPageActive();
    if (!pageId) return;

    // 检查列数是否发生变化
    const currentColCount = tableData.length > 0 ? tableData[0].length : 0;
    const expectedColCount = columnWidths.length;

    // 检查行数是否发生变化
    const currentRowCount = tableData.length;
    const expectedRowCount = rowHeights?.length || 0;

    let needsUpdate = false;
    let newColumnWidths = [...columnWidths];
    let newRowHeights = rowHeights ? [...rowHeights] : [];

    // 处理列数变化
    if (currentColCount !== expectedColCount) {
      if (currentColCount > expectedColCount) {
        // 新增列，平均分配剩余宽度
        const avgWidth = 100 / currentColCount;
        newColumnWidths = Array(currentColCount).fill(avgWidth);
      } else if (currentColCount < expectedColCount) {
        // 删除列，保持现有列的宽度比例
        newColumnWidths = columnWidths.slice(0, currentColCount);
        // 重新归一化到100%
        const totalWidth = newColumnWidths.reduce(
          (sum, width) => sum + width,
          0
        );
        newColumnWidths = newColumnWidths.map(
          (width) => (width / totalWidth) * 100
        );
      }
      needsUpdate = true;
    }

    // 处理行数变化
    if (currentRowCount !== expectedRowCount) {
      if (currentRowCount > expectedRowCount) {
        // 新增行，平均分配高度
        const avgHeight = 100 / currentRowCount;
        newRowHeights = Array(currentRowCount).fill(avgHeight);
      } else if (currentRowCount < expectedRowCount) {
        // 删除行，保持现有行的高度比例
        newRowHeights = (rowHeights || []).slice(0, currentRowCount);
        // 重新归一化到100%
        const totalHeight = newRowHeights.reduce(
          (sum, height) => sum + height,
          0
        );
        newRowHeights = newRowHeights.map(
          (height) => (height / totalHeight) * 100
        );
      }
      needsUpdate = true;
    }

    // 如果需要更新，保存到store
    if (needsUpdate) {
      const currentElement = pptStore.getElementInfo(pageId, id);
      if (currentElement) {
        pptStore.setElementInfo(pageId, id, {
          ...currentElement,
          columnWidths: newColumnWidths,
          rowHeights: newRowHeights.length > 0 ? newRowHeights : undefined,
        } as any);
      }
    }
  }, [tableData, columnWidths, rowHeights, id]);

  // 表格调整功能相关回调
  const handleColumnResize = useMemoizedFn(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 预览模式下不允许调整列宽
      if (mode === "preview") {
        return;
      }

      setResizing({
        type: "column",
        index: colIndex,
        startPos: e.clientX,
        startSize: currentColumnWidths[colIndex],
      });
    }
  );

  const handleRowResize = useMemoizedFn(
    (rowIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 预览模式下不允许调整行高
      if (mode === "preview") {
        return;
      }

      setResizing({
        type: "row",
        index: rowIndex,
        startPos: e.clientY,
        startSize: currentRowHeights[rowIndex] || 25, // 默认25%
      });
    }
  );

  // 监听全局鼠标事件处理调整
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !tableRef.current) return;

      const containerRect = tableRef.current.getBoundingClientRect();

      if (resizing.type === "column") {
        // 计算列宽变化
        const deltaX = e.clientX - resizing.startPos;
        const containerWidth = containerRect.width;
        const deltaPercent = (deltaX / containerWidth) * 100;

        const newWidths = [...currentColumnWidths];
        const nextIndex = resizing.index + 1;

        // 确保不会超出边界
        const newCurrentWidth = Math.max(
          5,
          Math.min(90, resizing.startSize + deltaPercent)
        );
        const widthDiff = newCurrentWidth - newWidths[resizing.index];

        if (nextIndex < newWidths.length) {
          const newNextWidth = Math.max(5, newWidths[nextIndex] - widthDiff);
          newWidths[resizing.index] = newCurrentWidth;
          newWidths[nextIndex] = newNextWidth;
          setCurrentColumnWidths(newWidths);
        }
      } else if (resizing.type === "row") {
        // 计算行高变化
        const deltaY = e.clientY - resizing.startPos;
        const containerHeight = containerRect.height;
        const deltaPercent = (deltaY / containerHeight) * 100;

        const newHeights = [...currentRowHeights];
        if (newHeights.length === 0) {
          // 如果没有设置行高，初始化为平均分布
          const avgHeight = 100 / tableData.length;
          for (let i = 0; i < tableData.length; i++) {
            newHeights[i] = avgHeight;
          }
        }

        const nextIndex = resizing.index + 1;
        const newCurrentHeight = Math.max(
          10,
          Math.min(80, resizing.startSize + deltaPercent)
        );
        const heightDiff = newCurrentHeight - newHeights[resizing.index];

        if (nextIndex < newHeights.length) {
          const newNextHeight = Math.max(
            10,
            newHeights[nextIndex] - heightDiff
          );
          newHeights[resizing.index] = newCurrentHeight;
          newHeights[nextIndex] = newNextHeight;
          setCurrentRowHeights(newHeights);
        }
      }
    };

    const handleMouseUp = () => {
      // 拖拽结束时，从DOM重新计算并更新列宽和行高
      if (resizing) {
        updateColumnWidthsAndRowHeightsFromDOM();
      }
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    resizing,
    currentColumnWidths,
    currentRowHeights,
    tableData.length,
    id,
    props,
    updateColumnWidthsAndRowHeightsFromDOM,
  ]);

  // 计算矩形范围内所有单元格的工具函数
  const getCellsInRange = useMemoizedFn(
    (
      start: { row: number; col: number },
      end: { row: number; col: number }
    ) => {
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      const cells = new Set<string>();
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          // 确保不超出表格边界
          if (row < tableData.length && col < tableData[row].length) {
            cells.add(`${row}-${col}`);
          }
        }
      }
      return cells;
    }
  );

  // 监听拖拽选择的全局鼠标事件
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tableRef.current) return;

      // 查找鼠标位置对应的单元格
      const cells = tableRef.current.querySelectorAll("td");
      let targetRow = -1;
      let targetCol = -1;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const cellRect = cell.getBoundingClientRect();
        const cellX = e.clientX - cellRect.left;
        const cellY = e.clientY - cellRect.top;

        if (
          cellX >= 0 &&
          cellX <= cellRect.width &&
          cellY >= 0 &&
          cellY <= cellRect.height
        ) {
          // 从cell的key属性获取行列信息
          const key = cell.getAttribute("data-cell-key");
          if (key) {
            const [row, col] = key.split("-").map(Number);
            targetRow = row;
            targetCol = col;
            break;
          }
        }
      }

      if (targetRow >= 0 && targetCol >= 0 && dragStart) {
        // 实时更新选中的单元格范围
        const rangeSelected = getCellsInRange(dragStart, {
          row: targetRow,
          col: targetCol,
        });
        setSelectedCells(rangeSelected);
      }
    };

    const handleMouseUp = () => {
      // 拖拽结束时发布选择状态变化事件
      if (isDragging) {
        const eventName = getTableEventName(
          BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
          id
        );
        globalEventBus.emit(eventName, {
          selectedCells: selectedCells,
          isShiftPressed,
        } as CellSelectionChangeData);
      }

      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragStart,
    getCellsInRange,
    id,
    isShiftPressed,
    selectedCells,
  ]);

  // 使用通用的可移动元素hook
  const {
    handleDragStart: originalHandleDragStart,
    handleDrag: originalHandleDrag,
    handleDragEnd: originalHandleDragEnd,
    handleResizeStart,
    handleResize,
    handleResizeEnd: originalHandleResizeEnd,
    handleRotateStart,
    handleRotate,
    handleRotateEnd,
  } = useMovableElement({
    id,
    props,
    onMoveableRefresh: () => {
      // 刷新 Moveable 位置
      if (moveableRef.current) {
        moveableRef.current.updateRect();
      }
    },
  });

  // 包装 handleDragStart，重置拖拽标记
  const handleDragStart = useMemoizedFn(() => {
    hasDraggedRef.current = false;
    originalHandleDragStart();
  });

  // 包装 handleDrag，检测是否真正发生了移动
  const handleDrag = useMemoizedFn(
    (params: { x: number; y: number; transform: string }) => {
      // 只要有移动超过阈值，就标记为真正的拖拽
      if (Math.abs(params.x) > 1 || Math.abs(params.y) > 1) {
        hasDraggedRef.current = true;
      }
      originalHandleDrag(params);
    }
  );

  // 包装 handleDragEnd，延迟重置拖拽标记
  const handleDragEnd = useMemoizedFn(() => {
    originalHandleDragEnd();
    // 延迟重置，确保 doubleClick 事件可以检查到拖拽状态
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 300);
  });

  // 包装 handleResizeEnd，在 resize 结束后更新列宽和行高
  const handleResizeEnd = useMemoizedFn(() => {
    originalHandleResizeEnd();
    // resize 结束后，从DOM重新计算并更新列宽和行高
    updateColumnWidthsAndRowHeightsFromDOM();
  });

  // 从 MobX store 中获取选中状态
  // 使用 Zustand hook 订阅状态变化，确保组件能够响应状态更新
  const elementActive = useElementActiveStore((state) => state.elementActive);
  const isSelected = elementActive === id;
  const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);

  // 监听shift键状态
  useEffect(() => {
    if (mode === "edit") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
          setIsShiftPressed(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
          setIsShiftPressed(false);
        }
      };

      // 只有在表格被选中时才监听键盘事件
      if (isSelected) {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [isSelected, mode]);

  // 当表格失去激活状态时清空单元格选中状态
  useEffect(() => {
    if (!isSelected) {
      setSelectedCells(new Set());
      setIsShiftPressed(false);
      setIsDragging(false);
      setDragStart(null);

      // 发布选择状态清空事件
      const eventName = getTableEventName(
        BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
        id
      );
      globalEventBus.emit(eventName, {
        selectedCells: new Set(),
        isShiftPressed: false,
      } as CellSelectionChangeData);
    }
  }, [isSelected, id]);

  // 面板重新挂载时回传当前选中状态，避免控件禁用但单元格仍高亮
  useEffect(() => {
    const syncRequestEvent = getTableEventName(
      BASE_TABLE_EVENTS.CELL_SELECTION_SYNC_REQUEST,
      id
    );
    const handleSyncRequest = () => {
      const eventName = getTableEventName(
        BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
        id
      );
      globalEventBus.emit(eventName, {
        selectedCells: selectedCellsRef.current,
        isShiftPressed: isShiftPressedRef.current,
      } as CellSelectionChangeData);
    };
    globalEventBus.on(syncRequestEvent, handleSyncRequest);
    return () => {
      globalEventBus.off(syncRequestEvent, handleSyncRequest);
    };
  }, [id]);

  // 处理单元格操作
  const handleCellOperationInternal = useMemoizedFn(
    (
      operation: "bold" | "italic" | "underline" | "strikethrough",
      selectedCells: Set<string>
    ) => {
      if (selectedCells.size === 0) return;

      const pageId = pageActiveStore.getPageActive();
      if (!pageId) return;

      // 克隆当前数据源
      const newDataSource = tableData.map((row) =>
        row.map((cell) => ({ ...cell }))
      );

      // 对选中的单元格应用操作
      selectedCells.forEach((cellKey) => {
        const [rowIndex, colIndex] = cellKey.split("-").map(Number);
        if (newDataSource[rowIndex] && newDataSource[rowIndex][colIndex]) {
          // 切换对应的样式属性
          newDataSource[rowIndex][colIndex][operation] =
            !newDataSource[rowIndex][colIndex][operation];
        }
      });

      // 更新到store
      pptStore.setElementInfo(pageId, id, {
        ...props,
        dataSource: newDataSource,
      } as any);
    }
  );

  // 监听来自panel的单元格操作事件
  useEffect(() => {
    const cellOperationEventName = getTableEventName(
      BASE_TABLE_EVENTS.CELL_OPERATION,
      id
    );

    const handleCellOperation = (data: unknown) => {
      const operationData = data as CellOperationData;
      handleCellOperationInternal(
        operationData.operation,
        operationData.selectedCells
      );
    };

    globalEventBus.on(cellOperationEventName, handleCellOperation);

    return () => {
      globalEventBus.off(cellOperationEventName, handleCellOperation);
    };
  }, [id, handleCellOperationInternal]);

  const handleClick = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到Canvas
    onSelect?.();
  });

  // 处理单元格点击事件
  const handleCellClick = useMemoizedFn(
    (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡

      // 预览模式下不允许单元格操作
      if (mode === "preview" || mode === "play") {
        return;
      }

      // 只要表格被选中就允许单元格操作
      if (isSelected) {
        const cellKey = `${rowIndex}-${colIndex}`;

        // 检查是否需要清空选中状态
        setSelectedCells((prevSelected) => {
          // 判断点击的单元格是否已选中
          const isCurrentlySelected = prevSelected.has(cellKey);
          // 判断当前是否有任何选中的单元格
          const hasSelectedCells = prevSelected.size > 0;

          // 核心逻辑：有选中 + 点击未选中 = 清空所有
          if (hasSelectedCells && !isCurrentlySelected) {
            const emptySelected = new Set<string>();

            // 发布选择状态变化事件
            const eventName = getTableEventName(
              BASE_TABLE_EVENTS.CELL_SELECTION_CHANGE,
              id
            );
            globalEventBus.emit(eventName, {
              selectedCells: emptySelected,
              isShiftPressed,
            } as CellSelectionChangeData);

            return emptySelected;
          }

          // 其他情况保持原有选中状态不变
          return prevSelected;
        });

        // 激活表格
        onSelect?.();
      } else {
        // 如果表格未被选中，正常激活表格
        onSelect?.();
      }
    }
  );

  // 处理单元格鼠标按下事件
  const handleCellMouseDown = useMemoizedFn(
    (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
      // 预览模式下不允许拖拽选择
      if (mode === "preview") {
        return;
      }

      // 只有在表格被选中且按住shift键时才允许拖拽选择
      if (isSelected && isShiftPressed) {
        e.preventDefault(); // 阻止默认行为
        e.stopPropagation(); // 阻止事件冒泡

        setIsDragging(true);
        setDragStart({ row: rowIndex, col: colIndex });

        // 开始拖拽时先选中起始单元格
        setSelectedCells(new Set([`${rowIndex}-${colIndex}`]));
      }
    }
  );

  // 数据格式转换函数
  const convertToXSpreadsheetData = useMemoizedFn(() => {
    const data = {
      name: "sheet1",
      rows: {} as any,
    };

    // 转换数据行
    tableData.forEach((row, rowIndex) => {
      data.rows[rowIndex] = { cells: {} };

      row.forEach((cell, colIndex) => {
        data.rows[rowIndex].cells[colIndex] = {
          text: cell.value.toString(),
        };
      });
    });

    return data;
  });

  // 处理双击事件，打开弹窗
  const handleDoubleClick = useMemoizedFn((e: React.MouseEvent) => {
    e?.stopPropagation?.(); // 阻止事件冒泡
    console.log(isShiftPressed, hasDraggedRef);

    // 如果按住shift键，则不打开编辑窗口
    if (isShiftPressed) {
      return;
    }

    // 如果刚刚进行过拖拽，则不打开编辑窗口
    if (hasDraggedRef.current) {
      return;
    }

    // 双击时就准备Excel数据
    preparedDataRef.current = convertToXSpreadsheetData();

    setIsModalOpen(true);
  });

  // 关闭弹窗
  const saveExcelData = useMemoizedFn(() => {
    // 获取x-spreadsheet的数据
    const spreadsheetData = spreadsheetInstanceRef.current.getData();

    // 转换为表格数据格式
    const newTableData: ITableProps["dataSource"] = [];
    for (let i = 0; i < tableData.length; i++) {
      newTableData[i] = [];
      for (let j = 0; j < tableData[i].length; j++) {
        const item = cloneDeep(tableData[i][j]);
        item.value = spreadsheetData[0].rows[i]?.cells[j]?.text || "";
        newTableData[i].push(item);
      }
    }

    // 更新表格数据到store
    const pageId = pageActiveStore.getPageActive();
    if (pageId) {
      // 获取当前元素完整信息
      const currentElement = pptStore.getElementInfo(pageId, id);
      if (currentElement) {
        // 更新元素的dataSource属性
        pptStore.setElementInfo(pageId, id, {
          ...currentElement,
          dataSource: newTableData,
        } as any); // 使用any避免类型限制
      }
    }
  });

  const handleSaveAndClose = useMemoizedFn(() => {
    saveExcelData();
    setIsModalOpen(false);
    preparedDataRef.current = null;
  });

  const handleCloseModal = useMemoizedFn(() => {
    setIsModalOpen(false);
    preparedDataRef.current = null;
  });

  // SpreadsheetEditor组件引用
  const spreadsheetContainerRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstanceRef = useRef<any>(null);
  const preparedDataRef = useRef<any>(null);

  // 清理Spreadsheet
  const cleanupSpreadsheet = useMemoizedFn(() => {
    if (spreadsheetInstanceRef.current) {
      // 清理DOM内容
      if (spreadsheetContainerRef.current) {
        spreadsheetContainerRef.current.innerHTML = "";
      }
      // 清理实例引用
      spreadsheetInstanceRef.current = null;
    }
    // 清理预准备的数据
    preparedDataRef.current = null;
  });

  const initSpreadsheet = useMemoizedFn(() => {
    if (!spreadsheetContainerRef.current || spreadsheetInstanceRef.current) {
      return;
    }

    const container = spreadsheetContainerRef.current;
    // dist IIFE exports via window.x_spreadsheet; default import is often {}
    let SpreadsheetCtor: any = Spreadsheet;
    for (
      let i = 0;
      i < 3 && SpreadsheetCtor && typeof SpreadsheetCtor !== "function";
      i += 1
    ) {
      SpreadsheetCtor = SpreadsheetCtor.default;
    }
    if (typeof SpreadsheetCtor !== "function") {
      SpreadsheetCtor =
        typeof window !== "undefined"
          ? (window as any).x_spreadsheet
          : undefined;
    }
    if (typeof SpreadsheetCtor !== "function") {
      throw new Error("x-data-spreadsheet constructor not found");
    }
    const initialWidth = container.clientWidth || 900;

    spreadsheetInstanceRef.current = new SpreadsheetCtor(container, {
      mode: "edit",
      showToolbar: false,
      showGrid: true,
      showContextmenu: false,
      showBottomBar: false,
      view: {
        height: () => 500,
        width: () => container.clientWidth || initialWidth,
      },
      row: {
        len: 50,
        height: 40,
      },
      col: {
        len: 50,
        width: 100,
        indexWidth: 60,
        minWidth: 60,
      },
    });

    const data = preparedDataRef.current || convertToXSpreadsheetData();
    spreadsheetInstanceRef.current.loadData(data);
  });

  const handleAfterOpenChange = useMemoizedFn((visible: boolean) => {
    if (visible) {
      requestAnimationFrame(() => {
        initSpreadsheet();
      });
    } else {
      cleanupSpreadsheet();
    }
  });

  useEffect(() => {
    if (!isModalOpen) {
      cleanupSpreadsheet();
    }
  }, [isModalOpen, cleanupSpreadsheet]);

  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      border:
        mode === "edit" && isHoverActive && !isSelected
          ? "1px solid var(--primary-color, #f25f00)"
          : "none",
    }),
    [height, rotate, width, x, y, zIndex, mode, isHoverActive, isSelected]
  );

  // 获取通用菜单
  const { commonMenu } = useCommonContextMenu(
    pageActiveStore.getPageActive() as string,
    elementActiveStore.getElementActive() as string
  );

  const Table = useMemoizedFn(
    ({ onContextMenu }: { onContextMenu?: (e: React.MouseEvent) => void }) => {
      const className = [
        styles.tableContainer,
        mode === "edit" ? styles.editMode : "",
        mode === "edit" && isSelected ? "element-selected" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div
          onContextMenu={onContextMenu || (() => {})}
          className={className}
          id={mode === "preview" ? `preview_${id}` : id}
          style={dynamicStyle}
          onClick={mode === "edit" ? handleClick : undefined}
          onDoubleClick={mode === "edit" ? handleDoubleClick : undefined}
        >
          <AnimationWrapper
            mode={mode}
            elementId={id}
            animationName={animationName}
            animationDuration={animationDuration}
            animationDelay={animationDelay}
            animationTrigger={animationTrigger}
            className="w-full h-full"
          >
            <div className={styles.tableContentWrapper}>
              {mode === "preview" ? (
                <table
                  ref={tableRef}
                  className={styles.table}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontFamily,
                  }}
                >
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex === 0 ? styles.headerRow : styles.dataRow
                        }
                      >
                        {row.map((cell, colIndex) => {
                          return (
                            <td
                              key={`${rowIndex}-${colIndex}`}
                              data-cell-key={`${rowIndex}-${colIndex}`}
                              className={`${
                                rowIndex === 0
                                  ? styles.headerCell
                                  : styles.dataCell
                              } ${styles.cellBase}`}
                              style={{
                                width: `${currentColumnWidths[colIndex]}%`, // 应用列宽比例
                                height: `${currentRowHeights[rowIndex] || 25}%`, // 始终使用百分比行高，默认25%
                                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                              }}
                            >
                              <div
                                className={`${styles.cellContent} ${
                                  selectedCells.has(`${rowIndex}-${colIndex}`)
                                    ? styles.selectedCell
                                    : ""
                                }`}
                                style={{
                                  fontSize: `${cell.fontSize}px`,
                                  color: cell.color,
                                  fontWeight: cell.bold ? "bold" : "normal",
                                  fontStyle: cell.italic ? "italic" : "normal",
                                  textDecoration: `${cell.underline ? "underline" : ""} ${cell.strikethrough ? "line-through" : ""}`,
                                  backgroundColor: cell.backgroundColor,
                                  ...placementConvey(cell.placement), // flex布局应用到wrapper
                                }}
                              >
                                {cell.value || ""}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table
                  ref={tableRef}
                  className={styles.table}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontFamily,
                  }}
                >
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex === 0 ? styles.headerRow : styles.dataRow
                        }
                      >
                        {row.map((cell, colIndex) => {
                          return (
                            <td
                              key={`${rowIndex}-${colIndex}`}
                              data-cell-key={`${rowIndex}-${colIndex}`}
                              className={`${
                                rowIndex === 0
                                  ? styles.headerCell
                                  : styles.dataCell
                              } ${mode === "edit" ? styles.cellBase : "p-[0] relative bg-transparent"}`}
                              style={{
                                width: `${currentColumnWidths[colIndex]}%`, // 应用列宽比例
                                height: `${currentRowHeights[rowIndex] || 25}%`, // 始终使用百分比行高，默认25%
                                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                              }}
                              onClick={
                                mode === "edit"
                                  ? (e) =>
                                      handleCellClick(rowIndex, colIndex, e)
                                  : undefined
                              }
                              onMouseDown={
                                mode === "edit"
                                  ? (e) =>
                                      handleCellMouseDown(rowIndex, colIndex, e)
                                  : undefined
                              }
                            >
                              <div
                                className={`${styles.cellContent} ${
                                  selectedCells.has(`${rowIndex}-${colIndex}`)
                                    ? styles.selectedCell
                                    : ""
                                }`}
                                style={{
                                  fontSize: `${cell.fontSize}px`,
                                  color: cell.color,
                                  fontWeight: cell.bold ? "bold" : "normal",
                                  fontStyle: cell.italic ? "italic" : "normal",
                                  textDecoration: `${cell.underline ? "underline" : ""} ${cell.strikethrough ? "line-through" : ""}`,
                                  backgroundColor: cell.backgroundColor,
                                  ...placementConvey(cell.placement), // flex布局应用到wrapper
                                }}
                              >
                                {cell.value || ""}
                              </div>

                              {/* 列调整句柄 - 只有在表格被选中且不在最后一列时显示 */}
                              {isSelected && colIndex < row.length - 1 && (
                                <div
                                  data-no-drag
                                  className={`${styles.columnResizeHandle} ${
                                    resizing?.type === "column" &&
                                    resizing.index === colIndex
                                      ? styles.resizing
                                      : ""
                                  }`}
                                  onMouseDown={
                                    mode === "edit"
                                      ? (e) => handleColumnResize(colIndex, e)
                                      : undefined
                                  }
                                />
                              )}

                              {/* 行调整句柄 - 只有在表格被选中且不在最后一行时显示 */}
                              {isSelected &&
                                rowIndex < tableData.length - 1 && (
                                  <div
                                    data-no-drag
                                    className={`${styles.rowResizeHandle} ${
                                      resizing?.type === "row" &&
                                      resizing.index === rowIndex
                                        ? styles.resizing
                                        : ""
                                    }`}
                                    onMouseDown={
                                      mode === "edit"
                                        ? (e) => handleRowResize(rowIndex, e)
                                        : undefined
                                    }
                                  />
                                )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </AnimationWrapper>
        </div>
      );
    }
  );

  return mode === "edit" ? (
    <>
      <Table
        onContextMenu={(e: any) => {
          onSelect?.();
          const menuItems = [
            ...getTableMenuItems({ onEdit: handleDoubleClick }),
            ...commonMenu,
          ];
          (e as any).customData = {
            type: "element_table",
            menuItems,
          };
        }}
      />
      <MovableWrapper
        ref={moveableRef}
        id={id}
        active={isSelected && !resizing && !isDragging}
        draggable={!resizing && !isDragging}
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
        onSelect={onSelect}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
      />
      <Modal
        title="表格数据编辑"
        open={isModalOpen}
        onOk={handleSaveAndClose}
        onCancel={handleCloseModal}
        afterOpenChange={handleAfterOpenChange}
        okText="保存"
        cancelText="取消"
        width={1000}
        centered
        destroyOnHidden
        zIndex={2000}
        styles={{
          content: { background: "var(--panel-bg-solid)" },
          header: { background: "var(--panel-bg-solid)" },
          body: { background: "var(--panel-bg-solid)" },
          footer: { background: "var(--panel-bg-solid)" },
        }}
      >
        <div className="py-[10px]">
          <div
            ref={spreadsheetContainerRef}
            className="h-[500px] w-full rounded overflow-hidden border border-[var(--border-default)] bg-[var(--panel-bg-solid)]"
          />
        </div>
      </Modal>
    </>
  ) : (
    <Table />
  );
};

export const Table = Component;

export const CreateTable = (props: Partial<ITableProps> = {}) => {
  const width = props.width ?? 300;
  const height = props.height ?? 150;
  const defaultProps: Omit<ITableProps, "type" | "id"> = {
    dataSource: [
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "姓名",
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "年龄",
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "职位",
          placement: "center-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "张三",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: 25,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "开发工程师",
          placement: "left-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "李四",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: 30,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "产品经理",
          placement: "left-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "王五",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: 28,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          value: "设计师",
          placement: "left-center",
        },
      ],
    ],
    columnWidths: [25, 25, 50], // 第一列25%, 第二列25%, 第三列50%
    rowHeights: [25, 25, 25, 25], // 四行各占25%（包括表头）- 确保行高固定
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    mode: "edit",
    width,
    height,
    rotate: 0,
    zIndex: 0,
  };
  const pos =
    props.x != null && props.y != null
      ? { x: props.x, y: props.y }
      : getCenteredElementPosition(
          props.width ?? width,
          props.height ?? height
        );
  return {
    ...defaultProps,
    ...props,
    ...pos,
    width: props.width ?? width,
    height: props.height ?? height,
    id: `table_${getRandomId()}`,
    type: "table" as const,
  };
};

export const TableButton = TableButtonComponent;
export const Name = "elements.table.title";
export const TablePanelIcon = TableFile;
