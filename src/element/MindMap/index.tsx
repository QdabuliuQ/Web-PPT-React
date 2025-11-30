import { AnimationWrapper, MovableWrapper } from "@/components";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  contextMenuStore,
  elementActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { Export, Graph, Path, Shape } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import { useMemoizedFn } from "ahooks";
import { Spin } from "antd";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getMindMapMenuItems } from "./menu";
import { MindMapModal } from "./MindMapModal";
import { MindMapNode } from "./MindMapNode";
import { createDefaultMindMapData, type X6GraphData } from "./utils";

export { MindMapButtonComponent as MindMapButton } from "./button";
export { getMindMapMenuItems } from "./menu";
export { MindMapPanel, MindMapPanelKey, MindMapPanelTitle } from "./panel";

export interface IMindMapProps extends ICommonElementProps {
  type: "mindmap";
  data?: X6GraphData; // X6 数据格式
  readonly?: boolean; // 是否只读
}

// 注册 React 节点
register({
  effect: ["width", "height"],
  shape: "mindmap-node",
  width: 120,
  height: 40,
  component: MindMapNode,
  ports: {
    groups: {
      top: {
        position: "top",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
          },
        },
      },
      right: {
        position: "right",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
          },
        },
      },
      bottom: {
        position: "bottom",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
          },
        },
      },
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
          },
        },
      },
    },
    items: [
      { group: "top", id: "port-top" },
      { group: "right", id: "port-right" },
      { group: "bottom", id: "port-bottom" },
      { group: "left", id: "port-left" },
    ],
  },
});

// 连接器
Graph.registerConnector(
  "mindmap",
  (sourcePoint, targetPoint, _, options) => {
    const midX = sourcePoint.x + 10;
    const midY = sourcePoint.y;
    const ctrX = (targetPoint.x - midX) / 5 + midX;
    const ctrY = targetPoint.y;
    const pathData = `
     M ${sourcePoint.x} ${sourcePoint.y}
     L ${midX} ${midY}
     Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
    `;
    return options.raw ? Path.parse(pathData) : pathData;
  },
  true
);

// 注册自定义边
Shape.Edge.registry.register(
  "mindmap-edge",
  {
    inherit: "edge",
    connector: {
      name: "mindmap",
    },
    attrs: {
      line: {
        stroke: "#A2B1C3",
        strokeWidth: 2,
        targetMarker: null,
      },
    },
    zIndex: -1, // 边的 zIndex 设置为 -1，确保在节点下方
  },
  true
);

const Component: FC<IMindMapProps> = observer((props) => {
  const {
    mode = "edit",
    id,
    data,
    readonly = false,
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
    onUnSelect,
  } = props;

  // 从 store 中获取最新的 previewImage，确保响应式更新
  const currentPageId = pageActiveStore.getPageActive() || "";
  const currentElement =
    currentPageId && id
      ? (pptStore.getElementInfo(currentPageId, id) as IMindMapProps | null)
      : null;
  const previewImage = (currentElement as any)?.previewImage;
  const backgroundColor =
    (currentElement as any)?.mindMapBackgroundColor || "#F2F7FA";

  const moveableRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 跟踪表格是否真正被拖拽移动过（用于防止误触发双击）
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
    onStateChange: (_dragging) => {
      // 拖拽结束时不需要手动设置 transform，由 dynamicStyle 控制
    },
    onMoveableRefresh: () => {
      // 刷新 Moveable 位置
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

  // 获取通用菜单
  const { commonMenu } = useCommonContextMenu(currentPageId, id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 立即激活元素
    if (!isSelected) {
      onSelect?.();
    }
  };

  // 处理单击事件 - 激活元素
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  // 处理双击事件 - 打开编辑 Modal
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 如果刚刚进行过拖拽，则不打开编辑窗口
    if (hasDraggedRef.current) {
      return;
    }
    if (mode === "edit" && !readonly) {
      handleModalOpen();
    }
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果未选中，先选中
    if (!isSelected) {
      onSelect?.();
    }

    // 显示右键菜单，合并思维导图菜单和通用菜单
    const menuItems = [...getMindMapMenuItems(), ...commonMenu];
    contextMenuStore.showMenu(menuItems, e);
  };

  useEffect(() => {
    if (mode === "edit" && !isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, mode, onUnSelect]);

  // 导出 SVG 的公共函数
  const exportGraphToSVG = useMemoizedFn(
    async (
      graph: Graph,
      viewBox: { x: number; y: number; width: number; height: number },
      backgroundColor?: string
    ) => {
      return new Promise<string>((resolve) => {
        // 直接在 toSVG 选项中传入 viewBox，让 X6 自动处理
        graph.toSVG(
          (svgString) => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
            const svgElement = svgDoc.documentElement;

            // 隐藏所有连接点
            const ports = svgElement.querySelectorAll(".x6-port, [data-port]");
            ports.forEach((port) => {
              const element = port as SVGElement;
              element.style.display = "none";
            });

            // 如果有背景色，添加背景矩形
            if (backgroundColor) {
              const rect = svgDoc.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              rect.setAttribute("x", String(viewBox.x));
              rect.setAttribute("y", String(viewBox.y));
              rect.setAttribute("width", String(viewBox.width));
              rect.setAttribute("height", String(viewBox.height));
              rect.setAttribute("fill", backgroundColor);
              // 将背景矩形插入到最前面
              if (svgElement.firstChild) {
                svgElement.insertBefore(rect, svgElement.firstChild);
              } else {
                svgElement.appendChild(rect);
              }
            }

            // 将修改后的 SVG 转换为字符串
            const serializer = new XMLSerializer();
            const modifiedSvgString = serializer.serializeToString(svgElement);
            resolve(modifiedSvgString);
          },
          {
            copyStyles: true,
            preserveDimensions: true,
            viewBox: viewBox,
          }
        );
      });
    }
  );

  // 初始化预览图片（用于刚创建时）
  const initPreviewImage = useMemoizedFn(async () => {
    if (!currentPageId || !id || previewImage) return;

    setIsLoading(true);
    try {
      // 创建一个临时的隐藏容器
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "800px";
      tempContainer.style.height = "600px";
      document.body.appendChild(tempContainer);

      // 创建临时的 Graph 实例（使用与 initGraph 相同的配置）
      const tempGraph = new Graph({
        container: tempContainer,
        width: 800,
        height: 600,
        background: {
          color: "#F2F7FA", // 默认背景色
        },
        grid: {
          visible: false, // 预览图不需要显示网格
          type: "dot",
          args: {
            color: "#e0e0e0",
            thickness: 1,
          },
        },
        panning: false,
        mousewheel: false,
        connecting: {
          router: "manhattan",
          connector: {
            name: "rounded",
            args: {
              radius: 8,
            },
          },
          anchor: "center",
          connectionPoint: "anchor",
          allowBlank: false,
          snap: {
            radius: 20,
          },
        },
        highlighting: {
          magnetAdsorbed: {
            name: "stroke",
            args: {
              attrs: {
                fill: "#fff",
                stroke: "#31d0c6",
                strokeWidth: 4,
              },
            },
          },
        },
      });

      // 使用 Export 插件
      tempGraph.use(new Export());
      // 加载数据
      const graphData = data || createDefaultMindMapData();
      tempGraph.fromJSON(graphData);

      // 等待渲染完成（增加等待时间确保边完全渲染）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 计算 viewBox
      const box = tempGraph.getContentBBox({ useCellGeometry: false });
      const padding = 20;
      const viewBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      // 使用公共函数导出 SVG（传入背景色）
      const modifiedSvgString = await exportGraphToSVG(
        tempGraph,
        viewBox,
        "#F2F7FA" // 默认背景色
      );
      const svgBlob = new Blob([modifiedSvgString], {
        type: "image/svg+xml",
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        const currentElement = pptStore.getElementInfo(currentPageId, id);
        if (currentElement) {
          pptStore.setElementInfo(currentPageId, id, {
            ...currentElement,
            previewImage: imageData,
          } as any);
        }
      };
      reader.readAsDataURL(svgBlob);

      // 清理临时资源
      setTimeout(() => {
        tempGraph.dispose();
        document.body.removeChild(tempContainer);
      }, 1000);
    } catch (error) {
      console.error("初始化预览图片失败:", error);
    } finally {
      setIsLoading(false);
    }
  });

  // 组件挂载时，如果没有预览图片，生成初始预览图片
  useEffect(() => {
    if (!previewImage && data && currentPageId && id) {
      initPreviewImage();
    }
  }, [previewImage, data, currentPageId, id, initPreviewImage]);

  // Modal 打开处理
  const handleModalOpen = useMemoizedFn(() => {
    setModalOpen(true);
  });

  // Modal 关闭处理
  const handleModalClose = useMemoizedFn(async () => {
    setModalOpen(false);
  });

  // 处理数据变更
  const handleDataChange = useMemoizedFn((updatedData: X6GraphData) => {
    if (currentPageId && id) {
      const currentElement = pptStore.getElementInfo(currentPageId, id);
      if (currentElement) {
        console.log(updatedData, "updatedData");

        pptStore.setElementInfo(currentPageId, id, {
          ...currentElement,
          data: updatedData,
        } as any);
      }
    }
  });

  // 处理预览图片变更
  const handlePreviewImageChange = useMemoizedFn((imageData: string) => {
    if (currentPageId && id) {
      const updatedElement = pptStore.getElementInfo(currentPageId, id);
      if (updatedElement) {
        pptStore.setElementInfo(currentPageId, id, {
          ...updatedElement,
          previewImage: imageData,
        } as any);
      }
    }
  });

  // 处理背景色变更
  const handleBackgroundColorChange = useMemoizedFn((color: string) => {
    if (currentPageId && id) {
      const updatedElement = pptStore.getElementInfo(currentPageId, id);
      if (updatedElement) {
        pptStore.setElementInfo(currentPageId, id, {
          ...updatedElement,
          mindMapBackgroundColor: color,
        } as any);
      }
    }
  });

  // 动态样式（位置、大小等）
  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      cursor: isSelected ? "move" : "pointer",
      overflow: "hidden",
    }),
    [x, y, width, height, rotate, zIndex, isSelected]
  );

  // 组合CSS类名
  const className = [
    styles.mindMapElement,
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <Spin size="large" />
            </div>
          )}
          {previewImage && !isLoading && (
            <div
              className={`${styles.mindMapImageWrapper} w-full h-full`}
              style={{ backgroundColor }}
            >
              <img
                src={previewImage}
                alt="思维导图预览"
                className="w-full h-full object-contain"
                style={{ pointerEvents: "none" }}
              />
            </div>
          )}
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
      <MindMapModal
        open={modalOpen}
        onClose={handleModalClose}
        data={data}
        readonly={readonly}
        onDataChange={handleDataChange}
        onPreviewImageChange={handlePreviewImageChange}
        onBackgroundColorChange={handleBackgroundColorChange}
        exportGraphToSVG={exportGraphToSVG}
        initialBackgroundColor={backgroundColor}
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
            <Spin size="large" />
          </div>
        )}
        {previewImage && !isLoading && (
          <div className="w-full h-full">
            <img
              src={previewImage}
              alt="思维导图预览"
              className="w-full h-full object-contain"
              style={{ pointerEvents: "none" }}
            />
          </div>
        )}
      </AnimationWrapper>
    </div>
  );
});

export const MindMap = memo(Component);

export const CreateMindMap = (props: Partial<IMindMapProps> = {}) => {
  const defaultProps: Omit<IMindMapProps, "type" | "id"> = {
    mode: "edit",
    data: createDefaultMindMapData(),
    readonly: false,
    x: 100,
    y: 100,
    width: 600,
    height: 400,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `mindmap_${getRandomId()}`,
    type: "mindmap" as const,
  };
};
