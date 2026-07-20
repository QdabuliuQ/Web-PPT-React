import { useMemoizedFn } from "ahooks";
import { Modal } from "antd";
import { useEffect, useMemo, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import Spreadsheet from "x-data-spreadsheet";
import "x-data-spreadsheet/dist/locale/zh-cn";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import type { IChartProps } from "./index";
import {
  getBarChart1DataToExcel,
  getBarChart2DataToExcel,
  getBarChart3DataToExcel,
  getBarChart4DataToExcel,
  getLineChart1DataToExcel,
  getLineChart2DataToExcel,
  getLineChart3DataToExcel,
  getPieChartDataToExcel,
  getRadarChartDataToExcel,
  getScatterChartDataToExcel,
  setBarChart1DataFromExcel,
  setBarChart2DataFromExcel,
  setBarChart3DataFromExcel,
  setBarChart4DataFromExcel,
  setLineChart1DataFromExcel,
  setLineChart2DataFromExcel,
  setLineChart3DataFromExcel,
  setPieChartDataFromExcel,
  setRadarChartDataFromExcel,
  setScatterChartDataFromExcel,
} from "./type";

export interface ChartDataModalProps {
  open: boolean;
  onClose: () => void;
  chartInfo: IChartProps;
  onSave: (updatedOption: any) => void;
}

/**
 * 将 Excel 格式数据转换为 x-data-spreadsheet 格式
 * 参考 Table 组件的格式
 */
function convertToXSpreadsheetData(
  excelData: Array<Array<string | number>>
): any {
  const data = {
    name: "sheet1",
    rows: {} as any,
  };

  // 转换数据行
  excelData.forEach((row, rowIndex) => {
    data.rows[rowIndex] = { cells: {} };
    row.forEach((cell, colIndex) => {
      data.rows[rowIndex].cells[colIndex] = {
        text: String(cell),
      };
    });
  });

  return data;
}

/**
 * 从 x-data-spreadsheet 格式转换为 Excel 格式
 * 参考 Table 组件的格式
 */
function convertFromXSpreadsheetData(
  spreadsheetData: any
): Array<Array<string | number>> {
  const result: Array<Array<string | number>> = [];

  // x-data-spreadsheet 返回的是数组格式，第一个元素是 sheet 数据
  const sheetData = Array.isArray(spreadsheetData)
    ? spreadsheetData[0]
    : spreadsheetData;

  const rows = sheetData?.rows || {};
  const rowKeys = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  rowKeys.forEach((rowIndex) => {
    const row = rows[rowIndex];
    const rowData: Array<string | number> = [];

    if (row?.cells) {
      const colKeys = Object.keys(row.cells)
        .map(Number)
        .sort((a, b) => a - b);
      colKeys.forEach((colIndex) => {
        const cell = row.cells[colIndex];
        const value = cell?.text || "";
        // 尝试转换为数字
        const numValue = Number(value);
        rowData.push(isNaN(numValue) || value === "" ? value : numValue);
      });
    }

    result.push(rowData);
  });

  return result;
}

/**
 * 根据图表类型获取对应的数据转换函数
 */
function getDataConverter(chartType: string | undefined) {
  if (!chartType || typeof chartType !== "string") {
    return null;
  }
  const match = chartType.match(/^([a-z]+)(\d+)$/);
  if (!match) return null;

  const [, type, indexStr] = match;
  const index = parseInt(indexStr, 10);

  switch (type) {
    case "bar":
      if (index === 1) {
        return {
          getDataToExcel: getBarChart1DataToExcel,
          setDataFromExcel: setBarChart1DataFromExcel,
        };
      } else if (index === 2) {
        return {
          getDataToExcel: getBarChart2DataToExcel,
          setDataFromExcel: setBarChart2DataFromExcel,
        };
      } else if (index === 3) {
        return {
          getDataToExcel: getBarChart3DataToExcel,
          setDataFromExcel: setBarChart3DataFromExcel,
        };
      } else if (index === 4) {
        return {
          getDataToExcel: getBarChart4DataToExcel,
          setDataFromExcel: setBarChart4DataFromExcel,
        };
      }
      break;
    case "line":
      if (index === 1) {
        return {
          getDataToExcel: getLineChart1DataToExcel,
          setDataFromExcel: setLineChart1DataFromExcel,
        };
      } else if (index === 2) {
        return {
          getDataToExcel: getLineChart2DataToExcel,
          setDataFromExcel: setLineChart2DataFromExcel,
        };
      } else if (index === 3) {
        return {
          getDataToExcel: getLineChart3DataToExcel,
          setDataFromExcel: setLineChart3DataFromExcel,
        };
      }
      break;
    case "pie":
      return {
        getDataToExcel: getPieChartDataToExcel,
        setDataFromExcel: setPieChartDataFromExcel,
      };
    case "scatter":
      return {
        getDataToExcel: getScatterChartDataToExcel,
        setDataFromExcel: setScatterChartDataFromExcel,
      };
    case "radar":
      return {
        getDataToExcel: getRadarChartDataToExcel,
        setDataFromExcel: setRadarChartDataFromExcel,
      };
  }
  return null;
}

/**
 * x-data-spreadsheet dist is a webpack IIFE that assigns `window.x_spreadsheet`
 * (factory), not a proper CJS/ESM export. Bundler default import is often `{}`.
 */
function getSpreadsheetConstructor(): new (
  el: HTMLElement,
  options?: object
) => Spreadsheet {
  let mod: unknown = Spreadsheet;
  for (let i = 0; i < 3 && mod && typeof mod !== "function"; i += 1) {
    mod = (mod as { default?: unknown }).default;
  }
  if (typeof mod === "function") {
    return mod as new (el: HTMLElement, options?: object) => Spreadsheet;
  }
  const fromWindow =
    typeof window !== "undefined"
      ? (window as unknown as { x_spreadsheet?: unknown }).x_spreadsheet
      : undefined;
  if (typeof fromWindow === "function") {
    return fromWindow as new (el: HTMLElement, options?: object) => Spreadsheet;
  }
  throw new Error("x-data-spreadsheet constructor not found");
}

const modalSolidBg = "var(--panel-bg-solid)";

export const ChartDataModal: FC<ChartDataModalProps> = ({
  open,
  onClose,
  chartInfo,
  onSave,
}) => {
  const { t } = useTranslation();
  const spreadsheetContainerRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstanceRef = useRef<Spreadsheet | null>(null);
  const chartInfoRef = useRef(chartInfo);
  chartInfoRef.current = chartInfo;

  // 获取数据转换器（仅随图表类型变化）
  const converter = useMemo(
    () => getDataConverter(chartInfo.chartType),
    [chartInfo.chartType]
  );

  // 清理Spreadsheet
  const cleanupSpreadsheet = useMemoizedFn(() => {
    if (spreadsheetInstanceRef.current) {
      if (spreadsheetContainerRef.current) {
        spreadsheetContainerRef.current.innerHTML = "";
      }
      spreadsheetInstanceRef.current = null;
    }
  });

  // 准备 Spreadsheet 数据的函数
  const prepareSpreadsheetData = useMemoizedFn(() => {
    if (!converter) return null;

    const excelData = converter.getDataToExcel(chartInfoRef.current.option);

    if (!excelData || excelData.length === 0) {
      return null;
    }

    return convertToXSpreadsheetData(excelData);
  });

  const initSpreadsheet = useMemoizedFn(() => {
    if (
      !spreadsheetContainerRef.current ||
      spreadsheetInstanceRef.current ||
      !converter
    ) {
      return;
    }

    const data = prepareSpreadsheetData();
    if (!data) {
      return;
    }

    const container = spreadsheetContainerRef.current;
    const SpreadsheetCtor = getSpreadsheetConstructor();
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
        len: 100,
        height: 40,
      },
      col: {
        len: 20,
        width: 120,
        indexWidth: 60,
        minWidth: 60,
      },
    });

    spreadsheetInstanceRef.current.loadData(data);
  });

  // Modal 完全打开后再挂载 spreadsheet，避免 destroyOnHidden + 父级重渲染打断初始化
  const handleAfterOpenChange = useMemoizedFn((visible: boolean) => {
    if (visible) {
      requestAnimationFrame(() => {
        initSpreadsheet();
      });
    } else {
      cleanupSpreadsheet();
    }
  });

  // open 变为 false 时兜底清理（不依赖 afterOpenChange）
  useEffect(() => {
    if (!open) {
      cleanupSpreadsheet();
    }
  }, [open, cleanupSpreadsheet]);

  // 保存数据
  const handleSave = useMemoizedFn(() => {
    if (!spreadsheetInstanceRef.current || !converter) {
      onClose();
      return;
    }

    try {
      const spreadsheetData = spreadsheetInstanceRef.current.getData();
      const excelData = convertFromXSpreadsheetData(spreadsheetData);

      let cleanOption: any;
      try {
        cleanOption = JSON.parse(
          JSON.stringify(chartInfoRef.current.option)
        );
      } catch (jsonError) {
        console.warn("Failed to clean option, using original:", jsonError);
        cleanOption = chartInfoRef.current.option;
      }

      const updatedConfig = converter.setDataFromExcel(excelData, cleanOption);

      let serializableConfig: any;
      try {
        serializableConfig = JSON.parse(JSON.stringify(updatedConfig));
      } catch (jsonError) {
        console.warn(
          "JSON serialization failed, using original config:",
          jsonError
        );
        serializableConfig = updatedConfig;
      }

      onSave(serializableConfig);
      onClose();
    } catch (err) {
      console.error("Failed to save chart data:", err);
    }
  });

  return (
    <Modal
      title={t("chartDataModal.title")}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      afterOpenChange={handleAfterOpenChange}
      okText={t("chartDataModal.save")}
      cancelText={t("chartDataModal.cancel")}
      width={1000}
      centered
      destroyOnHidden
      // 高于 Moveable 控制点 (1001+)，避免画布选中框穿透弹窗
      zIndex={2000}
      styles={{
        content: { background: modalSolidBg },
        header: { background: modalSolidBg },
        body: { background: modalSolidBg },
        footer: { background: modalSolidBg },
      }}
    >
      <div className="py-[10px]">
        <div
          ref={spreadsheetContainerRef}
          className="h-[500px] w-full rounded overflow-hidden border border-[var(--border-default)] bg-[var(--panel-bg-solid)]"
        />
      </div>
    </Modal>
  );
};
