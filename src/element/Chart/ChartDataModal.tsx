import { useMemoizedFn } from "ahooks";
import { Modal } from "antd";
import { useEffect, useMemo, useRef, type FC } from "react";
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

export const ChartDataModal: FC<ChartDataModalProps> = ({
  open,
  onClose,
  chartInfo,
  onSave,
}) => {
  const spreadsheetContainerRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstanceRef = useRef<Spreadsheet | null>(null);

  // 获取数据转换器
  const converter = useMemo(
    () => getDataConverter(chartInfo.chartType),
    [chartInfo.chartType]
  );

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
  });

  // 从 option 中提取配置数据
  const extractConfigFromOption = (
    option: any,
    chartType: string | undefined
  ): any => {
    if (!option) {
      return {};
    }

    if (!chartType || typeof chartType !== "string") {
      return {};
    }

    const match = chartType.match(/^([a-z]+)(\d+)$/);
    if (!match) {
      return {};
    }

    const [, type, indexStr] = match;
    const index = parseInt(indexStr, 10);

    // 尝试从 dataset.source 中提取数据（优先）
    if (option.dataset?.source) {
      const source = option.dataset.source;
      if (Array.isArray(source) && source.length > 1) {
        // 第一行是表头，后续是数据
        const headers = source[0];
        const dataRows = source.slice(1);

        if (type === "bar" && index === 4) {
          // 横向柱状图：category + series
          const seriesNames = headers.slice(1);
          const result = {
            data: dataRows.map((row: any[]) => ({
              category: String(row[0] || ""),
              series: seriesNames.map((name: string, idx: number) => ({
                name,
                value: Number(row[idx + 1]) || 0,
              })),
            })),
          };
          return result;
        } else if (headers.length === 2) {
          // 简单的 label-value 结构（bar1, bar2, bar3, pie, radar）
          const result = {
            data: dataRows.map((row: any[]) => ({
              label: String(row[0] || ""),
              value: Number(row[1]) || 0,
            })),
          };
          return result;
        } else if (headers.length === 3 && type === "scatter") {
          // 散点图：x, y, label
          const result = {
            data: dataRows.map((row: any[]) => ({
              x: Number(row[0]) || 0,
              y: Number(row[1]) || 0,
              label: row[2] ? String(row[2]) : undefined,
            })),
          };
          return result;
        }
      }
    }

    // 如果没有 dataset，尝试从 series 和 xAxis 中提取（line1, line2, line3）
    if (option.series && option.series.length > 0) {
      const series = option.series[0];
      if (series.data && Array.isArray(series.data)) {
        // 对于折线图等，需要结合 xAxis.data
        if (option.xAxis?.data && Array.isArray(option.xAxis.data)) {
          const result = {
            data: option.xAxis.data.map((label: string, index: number) => ({
              label,
              value: Number(series.data[index]) || 0,
            })),
          };
          return result;
        }
        // 如果没有 xAxis.data，尝试从 series.data 中提取（如果是对象数组）
        if (series.data.length > 0 && typeof series.data[0] === "object") {
          // 可能是饼图的数据格式
          const result = {
            data: series.data.map((item: any) => ({
              label: item.name || String(item[0] || ""),
              value: Number(item.value || item[1] || 0),
            })),
          };
          return result;
        }
      }
    }

    // 对于雷达图，从 radar.indicator 和 series.data[0].value 中提取
    if (
      type === "radar" &&
      option.radar?.indicator &&
      option.series?.[0]?.data?.[0]?.value
    ) {
      const indicators = option.radar.indicator;
      const values = option.series[0].data[0].value;
      const result = {
        data: indicators.map((indicator: any, index: number) => ({
          name: indicator.name || String(indicator),
          value: Number(values[index]) || 0,
        })),
      };
      return result;
    }

    return {};
  };

  // 准备 Spreadsheet 数据的函数
  const prepareSpreadsheetData = useMemoizedFn(() => {
    if (!converter) return null;

    // 从 option 中提取配置
    let extractedConfig = extractConfigFromOption(
      chartInfo.option,
      chartInfo.chartType
    );

    // 如果提取失败，使用空配置（getDataToExcel 会使用默认数据）
    if (!extractedConfig || Object.keys(extractedConfig).length === 0) {
      extractedConfig = {};
    }

    // 将图表数据转换为 Excel 格式（如果 extractedConfig 为空，会使用默认数据）
    const excelData = converter.getDataToExcel(extractedConfig);

    // 确保有数据
    if (!excelData || excelData.length === 0) {
      return null;
    }

    // 转换为 x-data-spreadsheet 格式
    const spreadsheetData = convertToXSpreadsheetData(excelData);

    return spreadsheetData;
  });

  // 监听Modal打开状态，初始化Spreadsheet
  useEffect(() => {
    if (open) {
      // 使用 setTimeout 确保Modal渲染完成后再初始化
      const timer = setTimeout(() => {
        if (
          spreadsheetContainerRef.current &&
          !spreadsheetInstanceRef.current &&
          converter
        ) {
          // 准备数据
          const data = prepareSpreadsheetData();
          if (!data) {
            return;
          }

          // 创建 spreadsheet 实例
          spreadsheetInstanceRef.current = new Spreadsheet(
            spreadsheetContainerRef.current,
            {
              mode: "edit",
              showToolbar: false,
              showGrid: true,
              showContextmenu: false,
              showBottomBar: false,
              view: {
                height: () => 500,
                width: () => {
                  const container = spreadsheetContainerRef.current;
                  if (container) {
                    return container.clientWidth;
                  }
                  return 900;
                },
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
            }
          );

          // 加载数据
          spreadsheetInstanceRef.current.loadData(data);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        cleanupSpreadsheet();
      };
    } else {
      cleanupSpreadsheet();
    }
  }, [open, converter, prepareSpreadsheetData, cleanupSpreadsheet, chartInfo]);

  // 保存数据
  const handleSave = useMemoizedFn(() => {
    if (!spreadsheetInstanceRef.current || !converter) {
      onClose();
      return;
    }

    try {
      // 获取 spreadsheet 数据
      const spreadsheetData = spreadsheetInstanceRef.current.getData();

      // 转换为 Excel 格式
      const excelData = convertFromXSpreadsheetData(spreadsheetData);

      // 转换为图表数据格式
      const updatedConfig = converter.setDataFromExcel(
        excelData,
        chartInfo.option as any
      );

      // 调用保存回调
      onSave(updatedConfig);
      onClose();
    } catch {
      // 静默处理错误
    }
  });

  return (
    <Modal
      title="编辑图表数据"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={1000}
      centered
      destroyOnClose={true}
    >
      <div className="py-[10px]">
        <div
          ref={spreadsheetContainerRef}
          className="h-[500px] w-full border border-gray-300 rounded overflow-hidden"
        />
      </div>
    </Modal>
  );
};
