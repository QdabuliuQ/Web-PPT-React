import { pptStore } from "@/store";
import { useMemoizedFn } from "ahooks";
import * as echarts from "echarts";
import { useState } from "react";
import type { IChartProps } from "./index";
import {
  getBarChartOption1,
  getBarChartOption2,
  getBarChartOption3,
  getBarChartOption4,
  getLineChartOption1,
  getLineChartOption2,
  getLineChartOption3,
  getPieChartOption,
  getRadarChartOption,
  getScatterChartOption,
} from "./type";

/**
 * 根据 chartType 获取对应的配置函数
 */
export const getChartOptionByType = (
  chartType: string,
  config?: any
): echarts.EChartsOption => {
  const match = chartType.match(/^([a-z]+)(\d+)$/);
  if (!match) {
    return getBarChartOption1(config);
  }

  const [, type, indexStr] = match;
  const index = parseInt(indexStr, 10);

  switch (type) {
    case "bar":
      if (index === 1) return getBarChartOption1(config);
      if (index === 2) return getBarChartOption2(config);
      if (index === 3) return getBarChartOption3(config);
      if (index === 4) return getBarChartOption4(config);
      break;
    case "line":
      if (index === 1) return getLineChartOption1(config);
      if (index === 2) return getLineChartOption2(config);
      if (index === 3) return getLineChartOption3(config);
      break;
    case "pie":
      if (index === 1) return getPieChartOption(config);
      break;
    case "scatter":
      if (index === 1) return getScatterChartOption(config);
      break;
    case "radar":
      if (index === 1) return getRadarChartOption(config);
      break;
  }

  return getBarChartOption1(config);
};

interface UseChartDataModalProps {
  pageId: string;
  elementId: string;
}

interface UseChartDataModalReturn {
  isDataModalOpen: boolean;
  handleOpenDataModal: () => void;
  handleCloseDataModal: () => void;
  handleSaveChartData: (updatedConfig: any) => void;
}

/**
 * 管理图表数据编辑弹窗的 hook
 */
export function useChartDataModal({
  pageId,
  elementId,
}: UseChartDataModalProps): UseChartDataModalReturn {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // 打开数据编辑 Modal
  const handleOpenDataModal = useMemoizedFn(() => {
    setIsDataModalOpen(true);
  });

  // 关闭数据编辑 Modal
  const handleCloseDataModal = useMemoizedFn(() => {
    setIsDataModalOpen(false);
  });

  // 保存图表数据
  const handleSaveChartData = useMemoizedFn((updatedConfig: any) => {
    if (!pageId || !elementId) return;

    const currentElement = pptStore.getElementInfo(
      pageId,
      elementId
    ) as IChartProps;
    if (!currentElement) return;

    // 获取当前 option 中的其他配置（保留非数据相关的配置）
    const currentOption = currentElement.option || {};
    const {
      title,
      backgroundColor,
      color,
      grid,
      xAxis,
      yAxis,
      legend,
      polar,
      radiusAxis,
      angleAxis,
      radar,
      tooltip,
    } = currentOption;

    // 重新生成完整的 option，使用更新后的数据配置
    const gridOption = Array.isArray(grid) ? grid[0] : grid;
    const legendOption = Array.isArray(legend) ? legend[0] : legend;

    const newOption = getChartOptionByType(currentElement.chartType, {
      ...updatedConfig,
      // 保留其他配置
      title,
      backgroundColor,
      color,
      showGrid: (gridOption as any)?.splitLine?.show !== false,
      showLabels: currentOption.series?.[0]?.label?.show !== false,
      showLegend: (legendOption as any)?.show !== false,
    });

    // 合并保留的配置（如 grid, xAxis, yAxis 等的自定义样式）
    // 对于散点图，需要移除 xAxis 和 yAxis 的 min/max，让它们根据数据重新计算
    const isScatterChart = currentElement.chartType === "scatter1";

    // 处理 xAxis：如果是散点图，移除 min/max；否则保留完整配置
    let finalXAxis = xAxis;
    if (isScatterChart && xAxis) {
      const xAxisArray = Array.isArray(xAxis) ? xAxis : [xAxis];
      finalXAxis = xAxisArray.map((axis: any) => {
        const { min: _min, max: _max, ...rest } = axis || {};
        return rest;
      });
      if (!Array.isArray(xAxis)) {
        finalXAxis = finalXAxis[0];
      }
    }

    // 处理 yAxis：如果是散点图，移除 min/max；否则保留完整配置
    let finalYAxis = yAxis;
    if (isScatterChart && yAxis) {
      const yAxisArray = Array.isArray(yAxis) ? yAxis : [yAxis];
      finalYAxis = yAxisArray.map((axis: any) => {
        const { min: _min, max: _max, ...rest } = axis || {};
        return rest;
      });
      if (!Array.isArray(yAxis)) {
        finalYAxis = finalYAxis[0];
      }
    }

    const finalOption = {
      ...newOption,
      // 保留自定义的 grid 配置（如果存在）
      ...(grid && { grid }),
      // 保留自定义的 xAxis 配置（如果存在，散点图已移除 min/max）
      ...(finalXAxis && { xAxis: finalXAxis }),
      // 保留自定义的 yAxis 配置（如果存在，散点图已移除 min/max）
      ...(finalYAxis && { yAxis: finalYAxis }),
      // 保留自定义的 legend 配置（如果存在）
      ...(legend && { legend }),
      // 保留自定义的 polar 配置（如果存在）
      ...(polar && { polar }),
      // 保留自定义的 radiusAxis 配置（如果存在）
      ...(radiusAxis && { radiusAxis }),
      // 保留自定义的 angleAxis 配置（如果存在）
      ...(angleAxis && { angleAxis }),
      // 保留自定义的 radar 配置（如果存在）
      ...(radar && { radar }),
      // 保留自定义的 tooltip 配置（如果存在）
      ...(tooltip && { tooltip }),
    };

    pptStore.setElementInfo(pageId, elementId, {
      ...currentElement,
      option: finalOption,
    } as IChartProps);
  });

  return {
    isDataModalOpen,
    handleOpenDataModal,
    handleCloseDataModal,
    handleSaveChartData,
  };
}
