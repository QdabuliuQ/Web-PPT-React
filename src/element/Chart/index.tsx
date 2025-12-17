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

export const CreateChart = (props: Partial<IChartProps> = {}) => {
  const chartType = props.chartType || "bar1";

  const defaultProps: Omit<IChartProps, "type" | "id"> = {
    mode: "edit",
    chartType: chartType,
    option: {
      title: {
        text: "标题",
        show: true,
        textStyle: {
          color: "#333",
          fontStyle: "normal",
          fontWeight: "bold",
          fontSize: 18,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        subtext: "",
        subtextStyle: {
          color: "#aaa",
          fontStyle: "normal",
          fontWeight: "bold",
          fontSize: 12,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        left: 0,
        top: 0,
      },
      grid: {
        show: true,
        left: 20,
        right: 20,
        top: 40,
        bottom: 20,
        shadowColor: "transparent",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        backgroundColor: "#fff",
      },
      dataset: {
        source: [
          ["product", "value"],
          ["A", 30],
          ["B", 80],
          ["C", 45],
          ["D", 60],
        ],
      },
      legend: {
        show: true,
        left: 0,
        top: 0,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          color: "#333",
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        itemStyle: {
          borderColor: "transparent",
          borderWidth: 0,
          borderType: "solid",
          opacity: 1,
          shadowBlur: 0,
          shadowColor: "transparent",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
      },
      xAxis: {
        show: true,
        name: "",
        nameLocation: "end",
        nameTextStyle: {
          color: "#666",
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        type: "category",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#666",
            width: 1,
            type: "solid",
            shadowBlur: 0,
            shadowColor: "transparent",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            opacity: 1,
          },
        },
        axisLabel: {
          show: true,
          color: "#666",
          rotate: 0,
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          shadowColor: "transparent",
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        axisTick: {
          show: true,
          length: 5,
          lineStyle: {
            color: "#ccc",
            width: 1,
            type: "solid",
            opacity: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        name: "",
        nameLocation: "end",
        nameTextStyle: {
          color: "#666",
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        show: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: "#666",
            width: 1,
            type: "solid",
            shadowBlur: 0,
            shadowColor: "transparent",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            opacity: 1,
          },
        },
        axisLabel: {
          show: true,
          color: "#666",
          rotate: 0,
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          shadowColor: "transparent",
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        axisTick: {
          show: true,
          length: 5,
          lineStyle: {
            color: "#ccc",
            width: 1,
            type: "solid",
            opacity: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#e0e0e0",
            type: "dashed",
          },
        },
      },
      series: [
        {
          type: "bar",
          name: "数值",
          encode: {
            x: "product",
            y: "value",
          },
          itemStyle: {
            color: "#5F95FF",
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "top",
            color: "#333",
            fontSize: 12,
          },
        },
      ],
    },
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
