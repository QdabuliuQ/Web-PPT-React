import { pptStore } from "@/store";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Moveable from "react-moveable";
import styles from "./index.module.less";

export interface MovableWrapperProps {
  // 基础属性
  id: string;

  // 激活状态控制
  active?: boolean; // 是否激活（显示控制点）

  // 功能开关
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;

  // 容器和边界
  containerSelector?: string;
  bounds?: { left: number; top: number; right: number; bottom: number };

  // 位置信息 - 用于响应外部位置变化
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: number;
  keepRatio?: boolean;

  // 吸附相关（内部使用全局配置，不对外暴露网格尺寸）
  snapEnabled?: boolean; // 是否开启元素吸附
  snapThreshold?: number; // 吸附阈值（像素）

  // 事件回调
  onDragStart?: () => void;
  onDrag?: (params: { x: number; y: number; transform: string }) => void;
  onDragEnd?: () => void;
  onResizeStart?: () => void;
  onResize?: (params: {
    width: number;
    height: number;
    transform: string;
    deltaX?: number;
    deltaY?: number;
  }) => void;
  onResizeEnd?: () => void;
  onRotateStart?: () => void;
  onRotate?: (params: { rotate: number; transform: string }) => void;
  onRotateEnd?: () => void;
  onSelect?: () => void; // 选中时触发
  onDeselect?: () => void; // 取消选中时触发
}

const MovableWrapperComponent = forwardRef<any, MovableWrapperProps>(
  (
    {
      id,
      active = true, // 默认为激活状态
      draggable = true,
      resizable = true,
      rotatable = true,
      bounds,
      x,
      y,
      width,
      height,
      rotate,
      keepRatio = false,
      snapThreshold = 5,
      onDragStart,
      onDrag,
      onDragEnd,
      onResizeStart,
      onResize,
      onResizeEnd,
      onRotateStart,
      onRotate,
      onRotateEnd,
      onSelect,
      onDeselect,
    },
    ref
  ) => {
    // Moveable 实例引用
    const moveableRef = useRef<any>(null);
    // 吸附目标集合
    const [elementGuidelines, setElementGuidelines] = useState<
      HTMLElement[] | undefined
    >(undefined);

    // 暴露 Moveable 实例给父组件
    useImperativeHandle(ref, () => ({
      updateRect: () => moveableRef.current?.updateRect(),
      get moveableRef() {
        return moveableRef.current;
      },
    }));

    // 监听选中/取消选中状态
    const prevActiveRef = useRef<boolean | undefined>(active);
    useEffect(() => {
      const prevActive = prevActiveRef.current;
      if (active && !prevActive) {
        // 从非激活变为激活，触发选中事件
        onSelect?.();
      } else if (!active && prevActive) {
        // 从激活变为非激活，触发取消选中事件
        onDeselect?.();
      }
      prevActiveRef.current = active;
    }, [active, onSelect, onDeselect]);

    // 监听位置变化和激活状态，更新 Moveable
    useEffect(() => {
      if (moveableRef.current && active) {
        moveableRef.current.updateRect();
      }
    }, [x, y, width, height, rotate, active]);

    const snapEnabled = true;

    // 收集同级元素作为吸附参考（排除自身）
    useEffect(() => {
      if (!snapEnabled) {
        setElementGuidelines(undefined);
        return;
      }
      const targetElement = document.getElementById(id);
      if (!targetElement) {
        setElementGuidelines(undefined);
        return;
      }
      const parent = targetElement.parentElement;
      if (!parent) {
        setElementGuidelines(undefined);
        return;
      }
      const siblings = Array.from(parent.children).filter(
        (el) => el !== targetElement
      ) as HTMLElement[];
      setElementGuidelines(siblings);
    }, [id, active, snapEnabled]);

    // 拖拽时使用的参考线快照
    const gridType = pptStore.getGridType();
    const [isDragging, setIsDragging] = useState(false);
    const [snapshotHorizontalLine, setSnapshotHorizontalLine] = useState<
      number[]
    >(() => (gridType === "line" ? pptStore.getHorizontalLine() : []));
    const [snapshotVerticalLine, setSnapshotVerticalLine] = useState<number[]>(
      () => (gridType === "line" ? pptStore.getVerticalLine() : [])
    );
    // 使用 ref 跟踪上一次的参考线值，用于检测变化
    const prevHorizontalLineRef = useRef<string>(
      JSON.stringify(pptStore.getHorizontalLine())
    );
    const prevVerticalLineRef = useRef<string>(
      JSON.stringify(pptStore.getVerticalLine())
    );

    // 获取当前参考线的字符串表示（用于比较）
    const currentHorizontalLineStr = JSON.stringify(
      gridType === "line" ? pptStore.getHorizontalLine() : []
    );
    const currentVerticalLineStr = JSON.stringify(
      gridType === "line" ? pptStore.getVerticalLine() : []
    );

    // 监听参考线变化，在拖拽过程中也更新快照值
    useEffect(() => {
      if (gridType === "line") {
        const horizontalLine = pptStore.getHorizontalLine();
        const verticalLine = pptStore.getVerticalLine();
        const horizontalStr = JSON.stringify(horizontalLine);
        const verticalStr = JSON.stringify(verticalLine);

        // 检查是否有变化
        const horizontalChanged =
          prevHorizontalLineRef.current !== horizontalStr;
        const verticalChanged = prevVerticalLineRef.current !== verticalStr;

        if (horizontalChanged || verticalChanged) {
          setSnapshotHorizontalLine([...horizontalLine]);
          setSnapshotVerticalLine([...verticalLine]);
          prevHorizontalLineRef.current = horizontalStr;
          prevVerticalLineRef.current = verticalStr;

          // 如果正在拖拽，使用 Moveable API 强制更新 guidelines
          if (isDragging && moveableRef.current) {
            // 使用 setState 更新 guidelines
            moveableRef.current.setState({
              horizontalGuidelines: horizontalLine,
              verticalGuidelines: verticalLine,
            });
            // 同时调用 updateRect 确保更新生效
            moveableRef.current.updateRect();
          }
        }
      } else {
        setSnapshotHorizontalLine([]);
        setSnapshotVerticalLine([]);
        prevHorizontalLineRef.current = "[]";
        prevVerticalLineRef.current = "[]";
      }
    }, [
      gridType,
      isDragging,
      currentHorizontalLineStr,
      currentVerticalLineStr,
    ]);

    // 拖拽事件处理
    const handleDragStart = (e: {
      inputEvent?: Event;
      stopDrag: () => void;
    }) => {
      const inputTarget = e.inputEvent?.target as HTMLElement | null;
      // 表格行列调整句柄等标记了 data-no-drag 的区域，禁止整体拖拽
      if (inputTarget?.closest?.("[data-no-drag]")) {
        e.stopDrag();
        return;
      }

      // 拖拽开始时，无论元素是否已选中，都触发选中
      // 这样可以确保：如果拖拽未选中的元素，会选中它；如果已有其他元素选中，会切换到当前元素
      if (onSelect) {
        onSelect();
      }

      // 在拖拽开始时获取参考线快照
      if (gridType === "line") {
        const horizontalLine = pptStore.getHorizontalLine();
        const verticalLine = pptStore.getVerticalLine();
        setSnapshotHorizontalLine([...horizontalLine]);
        setSnapshotVerticalLine([...verticalLine]);
      }
      setIsDragging(true);
      onDragStart?.();
    };

    const handleDrag = (e: {
      target: EventTarget;
      transform: string;
      translate: number[];
    }) => {
      const { target, transform, translate } = e;

      // 在拖拽过程中应用 transform，让 Moveable 正确显示
      (target as HTMLElement).style.transform = transform;

      if (onDrag) {
        // 使用translate数组计算相对偏移
        const [deltaX, deltaY] = translate;

        onDrag({
          x: deltaX,
          y: deltaY,
          transform,
        });
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    // 缩放事件处理
    const handleResizeStart = () => {
      onResizeStart?.();
    };

    const handleResize = (e: any) => {
      const { target, width, height, transform, drag } = e;

      (target as HTMLElement).style.width = `${width}px`;
      (target as HTMLElement).style.height = `${height}px`;
      (target as HTMLElement).style.transform = transform;

      if (onResize) {
        onResize({
          width,
          height,
          transform,
          // 传递位置变化信息
          deltaX: drag?.translate?.[0] || 0,
          deltaY: drag?.translate?.[1] || 0,
        });
      }
    };

    const handleResizeEnd = () => {
      onResizeEnd?.();
    };

    // 旋转事件处理
    const handleRotateStart = () => {
      onRotateStart?.();
    };

    const handleRotate = (e: { target: EventTarget; transform: string }) => {
      const { target, transform } = e;
      (target as HTMLElement).style.transform = transform;

      if (onRotate) {
        // 提取旋转角度信息
        const matrix = new DOMMatrix(transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

        onRotate({ rotate: angle, transform });
      }
    };

    const handleRotateEnd = () => {
      onRotateEnd?.();
    };

    const gridSize = pptStore.getGridSize();

    const guideSnapThreshold = snapThreshold;

    // 确保目标元素存在
    const targetElement = document.getElementById(id);
    if (!targetElement) {
      return null;
    }

    return (
      <Moveable
        ref={moveableRef}
        target={`#${id}`}
        container={document.querySelector("#canvas-container") as HTMLElement}
        className={styles.moveableWrapper}
        // 功能配置 - 始终允许拖拽，但缩放和旋转只在激活时可用
        draggable={draggable}
        resizable={active && resizable} // 只有激活时才能缩放
        rotatable={active && rotatable} // 只有激活时才能旋转
        // 边界限制 - 如果传入bounds则使用，否则不限制（允许拖出画布）
        bounds={bounds}
        // 事件处理
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
        // 其他配置
        throttleDrag={0}
        throttleResize={0}
        throttleRotate={0}
        keepRatio={keepRatio}
        // 吸附设置
        snappable={snapEnabled}
        snapThreshold={guideSnapThreshold}
        snapGridWidth={gridType === "grid" ? gridSize : undefined}
        snapGridHeight={gridType === "grid" ? gridSize : undefined}
        horizontalGuidelines={
          gridType === "line" ? snapshotHorizontalLine : undefined
        }
        verticalGuidelines={
          gridType === "line" ? snapshotVerticalLine : undefined
        }
        elementGuidelines={snapEnabled ? elementGuidelines : undefined}
        edge={active} // 只有激活时才显示边框线
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }} // 添加 padding 避免遮挡节点边框
        // 自定义渲染方向 - 只有激活时才显示控制点
        renderDirections={active ? ["nw", "n", "ne", "w", "e", "sw", "s", "se"] : []}
      />
    );
  }
);

MovableWrapperComponent.displayName = "MovableWrapper";

export const MovableWrapper = MovableWrapperComponent;
