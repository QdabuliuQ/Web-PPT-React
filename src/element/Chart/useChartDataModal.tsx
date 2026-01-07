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
  getFunnelChartOption,
  getLineChartOption1,
  getLineChartOption2,
  getLineChartOption3,
  getPieChartOption,
  getPieChartOption2,
  getRadarChartOption,
  getScatterChartOption,
} from "./type";
import { getLineChartOption4 } from "./type/line/index4";

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
      if (index === 4) return getLineChartOption4(config);
      break;
    case "pie":
      if (index === 1) return getPieChartOption(config);
      if (index === 2) return getPieChartOption2(config);
      break;
    case "scatter":
      if (index === 1) return getScatterChartOption(config);
      break;
    case "radar":
      if (index === 1) return getRadarChartOption(config);
      break;
    case "funnel":
      if (index === 1) return getFunnelChartOption(config);
      break;
    default:
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
  const handleSaveChartData = useMemoizedFn((updatedOption: any) => {
    if (!pageId || !elementId) return;

    const currentElement = pptStore.getElementInfo(
      pageId,
      elementId
    ) as IChartProps;
    if (!currentElement) return;

    // setDataFromExcel 已经返回完整的 option，直接使用
    pptStore.setElementInfo(pageId, elementId, {
      ...currentElement,
      option: updatedOption,
    } as IChartProps);
  });

  return {
    isDataModalOpen,
    handleOpenDataModal,
    handleCloseDataModal,
    handleSaveChartData,
  };
}
