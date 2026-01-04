import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ChartLine } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { observer } from "mobx-react-lite";
import { memo, useMemo, useRef, useState } from "react";
import { CreateChart } from ".";

// 图表类型配置
const chartTypes = [
  { type: "bar1", name: "柱状图" },
  { type: "bar2", name: "极坐标柱状图" },
  { type: "bar3", name: "切向极坐标柱状图" },
  { type: "bar4", name: "横向柱状图" },
  { type: "line1", name: "折线图" },
  { type: "line2", name: "堆叠折线图" },
  { type: "line3", name: "面积图" },
  { type: "pie1", name: "饼图" },
  { type: "scatter1", name: "散点图" },
  { type: "radar1", name: "雷达图" },
];

export default function ChartButton() {
  const pageId = pageActiveStore.getPageActive() as string;
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
    pptStore.addElementInfo(pageId, option);
    if (pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }

    // 立即关闭 Popover
    setOpen(false);
  });

  const content = useMemo(
    () => (
      <div
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className="min-w-[200px]"
      >
        <div className="grid grid-cols-2 gap-[4px]">
          {chartTypes.map((chart) => (
            <div
              key={chart.type}
              onClick={() => handleCreateChart(chart.type)}
              className="px-[12px] py-[8px] text-[12px] text-gray-700 cursor-pointer rounded-[4px] hover:bg-[#f0f0f0] transition-colors"
            >
              {chart.name}
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
          icon={<ChartLine theme="outline" size="24" fill="#333" />}
          title="图表"
        />
      </div>
    </Popover>
  );
}

export const ChartButtonComponent = memo(observer(ChartButton));
