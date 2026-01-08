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
import { CreateChart } from ".";

// 图表类型配置（按分类组织）
const chartCategories = [
  {
    category: "柱状图",
    charts: [
      { type: "bar1", name: "柱状图" },
      { type: "bar2", name: "极坐标柱状图" },
      { type: "bar3", name: "切向极坐标柱状图" },
      { type: "bar4", name: "横向柱状图" },
    ],
  },
  {
    category: "折线图",
    charts: [
      { type: "line1", name: "折线图" },
      { type: "line2", name: "堆叠折线图" },
      { type: "line3", name: "面积图" },
      { type: "line4", name: "阶梯折线图" },
    ],
  },
  {
    category: "饼图",
    charts: [
      { type: "pie1", name: "饼图" },
      { type: "pie2", name: "环形图" },
    ],
  },
  {
    category: "其他",
    charts: [
      { type: "scatter1", name: "散点图" },
      { type: "radar1", name: "雷达图" },
      { type: "funnel1", name: "漏斗图" },
    ],
  },
];

export default function ChartButton() {
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
    [handleOpen, handleClose, handleCreateChart]
  );

  return (
    <Popover open={open} placement="bottom" content={content} trigger={[]}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <PanelButton
          icon={<ChartHistogram theme="outline" size="24" fill="#333" />}
          title="图表"
        />
      </div>
    </Popover>
  );
}

export const ChartButtonComponent = memo(ChartButton);
