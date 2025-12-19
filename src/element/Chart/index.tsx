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
export { ChartButtonComponent as ChartButton } from "./button";
export { ChartPanel, ChartPanelKey, ChartPanelTitle } from "./panel";

export interface IChartProps extends ICommonElementProps {
  type: "chart";
  chartType: string; // 图表类型，格式如 "bar1", "line1", "line2", "line3" 等
  // ECharts 完整配置选项
  option?: echarts.EChartsOption;
}

const Component: FC<IChartProps> = observer((props) => {
  const {
    mode = "edit",
    id,
    option,
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
    if (!chartInstanceRef.current || !option) return;
    console.log(option, "option");

    chartInstanceRef.current.setOption(option);
  }, [option]);

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

/**
 * 根据 chartType 获取对应的配置函数
 */
const getChartOptionByType = (chartType: string): echarts.EChartsOption => {
  // 解析 chartType，例如 "bar1" -> { type: "bar", index: 1 }
  const match = chartType.match(/^([a-z]+)(\d+)$/);
  if (!match) {
    // 默认使用 bar1
    return getBarChartOption1();
  }

  const [, type, indexStr] = match;
  const index = parseInt(indexStr, 10);

  // 根据类型和索引调用对应的配置函数
  switch (type) {
    case "bar":
      if (index === 1) {
        return getBarChartOption1();
      } else if (index === 2) {
        return getBarChartOption2();
      } else if (index === 3) {
        return getBarChartOption3();
      } else if (index === 4) {
        return getBarChartOption4();
      }
      break;
    case "line":
      if (index === 1) {
        return getLineChartOption1();
      } else if (index === 2) {
        return getLineChartOption2();
      } else if (index === 3) {
        return getLineChartOption3();
      }
      break;
    case "pie":
      return getPieChartOption();
    case "scatter":
      return getScatterChartOption();
    case "radar":
      return getRadarChartOption();
  }

  // 默认返回 bar1 配置
  return getBarChartOption1();
};

export const CreateChart = (props: Partial<IChartProps> = {}) => {
  const chartType = props.chartType || "bar1";

  // 根据 chartType 调用对应的配置函数获取 option
  const chartOption = getChartOptionByType(chartType);

  const defaultProps: Omit<IChartProps, "type" | "id"> = {
    mode: "edit",
    chartType: chartType,
    option: chartOption,
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
