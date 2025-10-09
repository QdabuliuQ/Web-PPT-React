// 表格单元格信息
export interface CellInfo {
  row: number;
  col: number;
  key: string; // `${row}-${col}`
}

// 表格交互事件数据类型定义（简化版，不包含elementId）
export interface CellSelectionChangeData {
  selectedCells: Set<string>;
  isShiftPressed: boolean;
}

export interface CellOperationData {
  operation: "bold" | "italic" | "underline" | "strikethrough";
  selectedCells: Set<string>;
}

export interface CellStyleChangeData {
  selectedCells: Set<string>;
  styleKey: string;
  styleValue: any;
}

// 生成特定组件实例的事件名称
export function getTableEventName(
  baseEventName: string,
  tableId: string
): string {
  return `table_${tableId}_${baseEventName}`;
}

// 基础事件名称常量
export const BASE_TABLE_EVENTS = {
  CELL_SELECTION_CHANGE: "cell_selection_change",
  CELL_OPERATION: "cell_operation",
  CELL_STYLE_CHANGE: "cell_style_change",
} as const;
