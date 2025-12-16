import { AnimationWrapper, MovableWrapper } from "@/components";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  contextMenuStore,
  elementActiveStore,
  elementHoverActiveStore,
  pageActiveStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import * as echarts from "echarts";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getChartMenuItems } from "./menu";
export { ChartButtonComponent as ChartButton } from "./button";
export { ChartPanel, ChartPanelKey, ChartPanelTitle } from "./panel";

// 基础数据格式（用于柱状图、折线图、饼图）
export interface BaseChartData {
  label: string;
  value: number;
}

// 散点图数据格式
export interface ScatterChartData {
  x: number;
  y: number;
  label?: string;
}

// 雷达图数据格式
export interface RadarChartData {
  name: string;
  value: number;
}

export interface IChartProps extends ICommonElementProps {
  type: "chart";
  chartType: string; // 图表类型，格式如 "bar1", "line1", "line2", "line3" 等
  // 基础图表数据（柱状图、折线图、饼图）
  data?: Array<BaseChartData>;
  // 散点图数据
  scatterData?: Array<ScatterChartData>;
  // 雷达图数据
  radarData?: Array<RadarChartData>;
  color: string; // 图表颜色
  showGrid: boolean; // 是否显示网格
  showLabels: boolean; // 是否显示标签
  title?: {
    text?: string;
    subtext?: string;
    [key: string]: any;
  }; // 图表标题配置
}

const Component: FC<IChartProps> = observer((props) => {
  const {
    mode = "edit",
    id,
    chartType = "bar",
    data = [
      { label: "A", value: 30 },
      { label: "B", value: 80 },
      { label: "C", value: 45 },
      { label: "D", value: 60 },
    ],
    scatterData,
    radarData,
    color = "#5F95FF",
    showGrid = true,
    showLabels = true,
    title,
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
    onSelect,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const moveableRef = useRef<any>(null);

  // 使用通用的可移动元素hook
  const {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    handleRotateStart,
    handleRotate,
    handleRotateEnd,
  } = useMovableElement({
    id,
    props,
    onStateChange: () => {},
    onMoveableRefresh: () => {
      if (moveableRef.current) {
        moveableRef.current.updateRect();
      }
    },
  });

  const isSelected = elementActiveStore.isElementActive(id);
  const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);

  // 获取通用菜单
  const currentPageId = pageActiveStore.getPageActive() || "";
  const { commonMenu } = useCommonContextMenu(currentPageId, id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect?.();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSelected) {
      onSelect?.();
    }

    const menuItems = [...getChartMenuItems(), ...commonMenu];
    contextMenuStore.showMenu(menuItems, e);
  };

  // 初始化 echarts 实例
  useEffect(() => {
    if (!chartRef.current) return;

    // 如果实例已存在，先销毁
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // 创建新的 echarts 实例
    const chartInstance = echarts.init(chartRef.current);
    chartInstanceRef.current = chartInstance;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // 更新图表配置
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const updateChart = async () => {
      try {
        // 解析 chartType，例如 "bar1" -> { type: "bar", index: 1 }
        const match = chartType.match(/^([a-z]+)(\d+)$/);
        if (!match) {
          console.error(`Invalid chartType format: ${chartType}`);
          return;
        }

        const [, type, indexStr] = match;
        const index = parseInt(indexStr, 10);

        // 动态导入对应的文件
        let getChartOption: ((config: any) => echarts.EChartsOption) | null =
          null;

        const module = await import(`./type/${type}/index${index}`);

        // 根据类型获取对应的函数
        switch (type) {
          case "bar":
            getChartOption = module.getBarChartOption;
            if (!data || data.length === 0) return;
            if (getChartOption && chartInstanceRef.current) {
              const option = getChartOption({
                title,
                data,
                color,
                showGrid,
                showLabels,
              });
              chartInstanceRef.current.setOption(option);
            }
            break;

          case "line":
            if (index === 1) getChartOption = module.getLineChartOption;
            else if (index === 2)
              getChartOption = module.getAreaLineChartOption;
            else if (index === 3)
              getChartOption = module.getSmoothLineChartOption;
            if (!data || data.length === 0) return;
            if (getChartOption && chartInstanceRef.current) {
              const option = getChartOption({
                data,
                color,
                showGrid,
                showLabels,
              });
              chartInstanceRef.current.setOption(option);
            }
            break;

          case "pie":
            getChartOption = module.getPieChartOption;
            if (!data || data.length === 0) return;
            if (getChartOption && chartInstanceRef.current) {
              const option = getChartOption({
                data,
                color,
                showLabels,
              });
              chartInstanceRef.current.setOption(option);
            }
            break;

          case "scatter":
            getChartOption = module.getScatterChartOption;
            if (!scatterData || scatterData.length === 0) return;
            if (getChartOption && chartInstanceRef.current) {
              const option = getChartOption({
                data: scatterData,
                color,
                showGrid,
                showLabels,
              });
              chartInstanceRef.current.setOption(option);
            }
            break;

          case "radar":
            getChartOption = module.getRadarChartOption;
            if (!radarData || radarData.length === 0) return;
            if (getChartOption && chartInstanceRef.current) {
              const option = getChartOption({
                data: radarData,
                color,
                showLabels,
              });
              chartInstanceRef.current.setOption(option);
            }
            break;

          default:
            console.error(`Unknown chart type: ${type}`);
            return;
        }
      } catch (error) {
        console.error("Failed to update chart:", error);
      }
    };

    updateChart();
  }, [
    chartType,
    data,
    scatterData,
    radarData,
    color,
    showGrid,
    showLabels,
    title,
  ]);

  // 响应式调整
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resize();
    }
  }, [width, height]);

  // 动态样式
  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      cursor: mode === "edit" ? (isSelected ? "move" : "pointer") : "default",
      border:
        mode === "edit" && isHoverActive && !isSelected
          ? "1px solid var(--primary-color, #f25f00)"
          : "none",
    }),
    [x, y, width, height, rotate, zIndex, isSelected, mode, isHoverActive]
  );

  // 组合CSS类名
  const className = [
    styles.chartElement,
    mode === "edit" ? styles.editMode : "",
    mode === "edit" && isDragging ? styles.dragging : "",
    mode === "edit" && isSelected ? "element-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return mode === "edit" ? (
    <>
      <div
        id={id}
        className={className}
        style={dynamicStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <AnimationWrapper
          mode={mode}
          elementId={id}
          animationName={animationName}
          animationDuration={animationDuration}
          animationDelay={animationDelay}
          animationTrigger={animationTrigger}
          className="w-full h-full relative"
        >
          <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        </AnimationWrapper>
      </div>
      <MovableWrapper
        ref={moveableRef}
        id={id}
        active={isSelected}
        bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
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
    </>
  ) : (
    <div id={`preview_${id}`} className={className} style={dynamicStyle}>
      <AnimationWrapper
        mode={mode}
        elementId={id}
        animationName={animationName}
        animationDuration={animationDuration}
        animationDelay={animationDelay}
        animationTrigger={animationTrigger}
        className="w-full h-full relative"
      >
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </AnimationWrapper>
    </div>
  );
});

export const Chart = memo(Component);

export const CreateChart = (props: Partial<IChartProps> = {}) => {
  const chartType = props.chartType || "bar1";

  // 解析图表类型
  const match = chartType.match(/^([a-z]+)(\d+)$/);
  const type = match ? match[1] : "bar";

  // 根据图表类型设置默认数据
  let defaultData: any;
  let defaultScatterData: any;
  let defaultRadarData: any;

  switch (type) {
    case "scatter":
      defaultScatterData = [
        { x: 10, y: 20, label: "A" },
        { x: 20, y: 30, label: "B" },
        { x: 30, y: 25, label: "C" },
        { x: 40, y: 35, label: "D" },
      ];
      break;
    case "radar":
      defaultRadarData = [
        { name: "维度1", value: 60 },
        { name: "维度2", value: 80 },
        { name: "维度3", value: 45 },
        { name: "维度4", value: 70 },
        { name: "维度5", value: 55 },
      ];
      break;
    default:
      defaultData = [
        { label: "A", value: 30 },
        { label: "B", value: 80 },
        { label: "C", value: 45 },
        { label: "D", value: 60 },
      ];
  }

  const defaultProps: Omit<IChartProps, "type" | "id"> = {
    mode: "edit",
    chartType: chartType,
    data: defaultData,
    scatterData: defaultScatterData,
    radarData: defaultRadarData,
    color: "#5F95FF",
    showGrid: true,
    showLabels: true,
    x: 100,
    y: 100,
    width: 500,
    height: 300,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `chart_${getRandomId()}`,
    type: "chart" as const,
  };
};

export const Name = "图表";
export const ChartPanelIcon = null;
