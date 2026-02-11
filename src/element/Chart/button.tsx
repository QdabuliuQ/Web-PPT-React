import { PanelButton } from "@/components/PanelButton";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartHistogram } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { memo, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateChart } from ".";

export default function ChartButton() {
  const { t } = useTranslation();
  
  // 图表类型配置（按分类组织）
  const chartCategories = useMemo(() => [
    {
      category: t('elements.chart.categories.bar'),
      charts: [
        { type: "bar1", name: t('elements.chart.types.bar1') },
        { type: "bar2", name: t('elements.chart.types.bar2') },
        { type: "bar3", name: t('elements.chart.types.bar3') },
        { type: "bar4", name: t('elements.chart.types.bar4') },
      ],
    },
    {
      category: t('elements.chart.categories.line'),
      charts: [
        { type: "line1", name: t('elements.chart.types.line1') },
        { type: "line2", name: t('elements.chart.types.line2') },
        { type: "line3", name: t('elements.chart.types.line3') },
        { type: "line4", name: t('elements.chart.types.line4') },
      ],
    },
    {
      category: t('elements.chart.categories.pie'),
      charts: [
        { type: "pie1", name: t('elements.chart.types.pie1') },
        { type: "pie2", name: t('elements.chart.types.pie2') },
      ],
    },
    {
      category: t('elements.chart.categories.other'),
      charts: [
        { type: "scatter1", name: t('elements.chart.types.scatter1') },
        { type: "radar1", name: t('elements.chart.types.radar1') },
        { type: "funnel1", name: t('elements.chart.types.funnel1') },
      ],
    },
  ], [t]);
  // 使用 Zustand hooks 订阅状态变化
  const pageId = usePageActiveStore((state) => state.pageActive) || "";
  const addElement = usePPTStore((state) => state.addElement);
  const setElementActive = useElementActiveStore(
    (state) => state.setElementActive
  );
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  });

  const handleClose = useMemoizedFn(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  });

  const handleCreateChart = useMemoizedFn((chartType: string) => {
    // 清除延迟关闭的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const option = CreateChart({ chartType });
    addElement(pageId, option);
    if (pageId) {
      setElementActive(option.id);
    }

    // 立即关闭 Popover
    setOpen(false);
  });

  const content = useMemo(
    () => (
      <div
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className="min-w-[200px] py-[4px]"
      >
        <div className="flex flex-col">
          {chartCategories.map((category) => (
            <div key={category.category} className="flex flex-col">
              <div className="px-[12px] py-[6px] mb-[4px]">
                <div className="text-[11px] font-medium text-[#f25f00] uppercase tracking-wide relative">
                  <div className="absolute left-0 top-0 w-[3px] h-full bg-[#f25f00]" />
                  <span className="ml-[10px]">{category.category}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[4px] px-[8px] pb-[8px]">
                {category.charts.map((chart) => (
                  <div
                    key={chart.type}
                    onClick={() => handleCreateChart(chart.type)}
                    className="px-[12px] py-[8px] text-[12px] text-gray-700 cursor-pointer rounded-[4px] hover:bg-[#f0f0f0] transition-colors active:bg-[#e0e0e0]"
                  >
                    {chart.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [handleOpen, handleClose, handleCreateChart, chartCategories]
  );

  return (
    <Popover open={open} placement="bottom" content={content} trigger={[]}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <PanelButton
          icon={<ChartHistogram theme="outline" size="24" fill="#333" />}
          title={t('elements.chart.button')}
        />
      </div>
    </Popover>
  );
}

export const ChartButtonComponent = memo(ChartButton);
