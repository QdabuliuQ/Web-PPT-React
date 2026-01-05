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
import { globalEventBus } from "@/utils/eventBus";
import { ChartHistogram } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import * as echarts from "echarts";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import { ChartDataModal } from "./chartDataModal";
import { BASE_CHART_EVENTS, getChartEventName } from "./events";
import styles from "./index.module.less";
import { getChartMenuItems } from "./menu";
import { getChartOptionByType, useChartDataModal } from "./useChartDataModal";
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

  // 跟踪图表是否真正被拖拽移动过（用于防止误触发双击）
  const hasDraggedRef = useRef(false);

  // 使用通用的可移动元素hook
  const {
    isDragging,
    handleDragStart: originalHandleDragStart,
    handleDrag: originalHandleDrag,
    handleDragEnd: originalHandleDragEnd,
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

  // 包装 handleDragStart，重置拖拽标记
  const handleDragStart = useMemoizedFn(() => {
    hasDraggedRef.current = false;
    originalHandleDragStart();
  });

  // 包装 handleDrag，检测是否真正发生了移动
  const handleDrag = useMemoizedFn(
    (params: { x: number; y: number; transform: string }) => {
      // 只要有移动超过阈值，就标记为真正的拖拽
      if (Math.abs(params.x) > 1 || Math.abs(params.y) > 1) {
        hasDraggedRef.current = true;
      }
      originalHandleDrag(params);
    }
  );

  // 包装 handleDragEnd，延迟重置拖拽标记
  const handleDragEnd = useMemoizedFn(() => {
    originalHandleDragEnd();
    // 延迟重置，确保 doubleClick 事件可以检查到拖拽状态
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 300);
  });

  const isSelected = elementActiveStore.isElementActive(id);
  const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);

  // 获取通用菜单
  const currentPageId = pageActiveStore.getPageActive() || "";
  const { commonMenu } = useCommonContextMenu(currentPageId, id);

  // 使用图表数据编辑弹窗 hook
  const {
    isDataModalOpen,
    handleOpenDataModal,
    handleCloseDataModal,
    handleSaveChartData,
  } = useChartDataModal({
    pageId: currentPageId,
    elementId: id,
  });

  // 监听来自 panel 的事件，打开数据编辑弹窗
  useEffect(() => {
    if (mode !== "edit") return;

    const eventName = getChartEventName(BASE_CHART_EVENTS.OPEN_DATA_MODAL, id);
    const handleOpenDataModalEvent = () => {
      handleOpenDataModal();
    };

    globalEventBus.on(eventName, handleOpenDataModalEvent);

    return () => {
      globalEventBus.off(eventName, handleOpenDataModalEvent);
    };
  }, [id, mode, handleOpenDataModal]);

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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 如果刚刚进行过拖拽，则不打开编辑窗口
    if (hasDraggedRef.current) {
      return;
    }
    if (mode === "edit") {
      handleOpenDataModal();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSelected) {
      onSelect?.();
    }

    const menuItems = [
      ...getChartMenuItems(handleOpenDataModal, id),
      ...commonMenu,
    ];
    contextMenuStore.showMenu(menuItems, e);
  };

  // 初始化 echarts 实例
  useEffect(() => {
    if (!chartRef.current) return;

    // 如果实例已存在，先销毁
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // 创建新的 echarts 实例，使用 SVG 渲染器
    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
    });
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
        onDoubleClick={handleDoubleClick}
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
          <div
            ref={chartRef}
            id={`dom_${id}`}
            style={{ width: "100%", height: "100%" }}
          />
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
      <ChartDataModal
        open={isDataModalOpen}
        onClose={handleCloseDataModal}
        chartInfo={props}
        onSave={handleSaveChartData}
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
export const ChartPanelIcon = ChartHistogram;
