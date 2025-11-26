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
import { Export, Graph, Node, Path, Shape } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import { useMemoizedFn } from "ahooks";
import { Modal, message } from "antd";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getMindMapMenuItems } from "./menu";
import { MindMapNode } from "./MindMapNode";
import {
  createDefaultMindMapData,
  getDataFromGraph,
  type X6GraphData,
} from "./utils";

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
    zIndex: 0,
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

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const moveableRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      viewBox: { x: number; y: number; width: number; height: number }
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
      console.log(data, "datadata");

      // 加载数据
      const graphData = data || createDefaultMindMapData();
      tempGraph.fromJSON(graphData);

      // 等待渲染完成（增加等待时间确保边完全渲染）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 计算所有节点的边界框
      const nodes = tempGraph.getNodes();
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      if (nodes.length > 0) {
        nodes.forEach((node) => {
          const bbox = node.getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        });

        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
      } else {
        minX = 0;
        minY = 0;
        maxX = 800;
        maxY = 600;
      }

      const viewBox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };

      // 使用公共函数导出 SVG
      const modifiedSvgString = await exportGraphToSVG(tempGraph, viewBox);
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
    }
  });

  // 组件挂载时，如果没有预览图片，生成初始预览图片
  useEffect(() => {
    if (!previewImage && data && currentPageId && id) {
      initPreviewImage();
    }
  }, [previewImage, data, currentPageId, id, initPreviewImage]);

  // 生成预览图片
  const generatePreviewImage = useMemoizedFn(async () => {
    if (!graphRef.current || !currentPageId || !id) return;

    try {
      const graph = graphRef.current;

      // 获取当前元素
      const currentElement = pptStore.getElementInfo(currentPageId, id);
      if (!currentElement) return;

      // 等待 React 节点渲染完成
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 使用 getContentBBox() 获取内容边界框（参考 XFlow 的实现）
      const box = graph.getContentBBox();
      const padding = 20;
      const viewBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      // 使用公共函数导出 SVG
      const modifiedSvgString = await exportGraphToSVG(graph, viewBox);
      const svgBlob = new Blob([modifiedSvgString], {
        type: "image/svg+xml",
      });

      // 将 SVG 转换为图片
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        const updatedElement = pptStore.getElementInfo(currentPageId, id);
        if (updatedElement) {
          pptStore.setElementInfo(currentPageId, id, {
            ...updatedElement,
            previewImage: imageData,
          } as any);
        }
      };
      reader.readAsDataURL(svgBlob);
    } catch (error) {
      console.error("生成预览图片失败:", error);
    }
  });

  // 初始化 X6 Graph
  const initGraph = useMemoizedFn(() => {
    if (!modalContainerRef.current) return;

    // 如果已经初始化过，先销毁
    if (graphRef.current) {
      graphRef.current.dispose();
      graphRef.current = null;
    }

    // 创建 Graph 实例
    const graph = new Graph({
      container: modalContainerRef.current,
      width: modalContainerRef.current.clientWidth,
      height: modalContainerRef.current.clientHeight,
      grid: {
        visible: true,
        type: "dot",
        args: {
          color: "#e0e0e0",
          thickness: 1,
        },
      },
      panning: {
        enabled: true,
        eventTypes: ["leftMouseDown", "mouseWheel"],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: "ctrl",
        minScale: 0.5,
        maxScale: 4,
      },
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
        createEdge() {
          return new Shape.Edge({
            shape: "mindmap-edge",
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
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
    graph.use(new Export());

    graphRef.current = graph;

    // 加载数据或使用默认数据
    const graphData = data || createDefaultMindMapData();
    graph.fromJSON(graphData);

    // 等待 React 节点渲染完成后居中画布
    graph.centerContent();

    // 编辑功能在 MindMapNode 组件内部完成，不需要 addTools

    // 存储选中的节点
    let selectedNode: Node | null = null;

    // 监听节点点击事件 - 选中节点
    graph.on("node:click", ({ node }) => {
      // 取消之前的选中样式
      if (selectedNode) {
        selectedNode.setAttrs({
          body: {
            stroke: "#5F95FF",
            strokeWidth: 1,
          },
        });
      }
      // 设置当前节点为选中状态
      selectedNode = node;
      node.setAttrs({
        body: {
          stroke: "#1890ff",
          strokeWidth: 2,
        },
      });
    });

    // 监听空白区域点击 - 取消选中
    graph.on("blank:click", () => {
      if (selectedNode) {
        selectedNode.setAttrs({
          body: {
            stroke: "#5F95FF",
            strokeWidth: 1,
          },
        });
        selectedNode = null;
      }
    });

    // 监听节点添加子节点事件
    graph.on("node:add-child", ({ node }) => {
      if (readonly) return;
      const parentNode = node;
      const parentId = parentNode.id;
      const childId = `node_${Date.now()}`;

      // 获取父节点位置和大小
      const parentPosition = parentNode.getPosition();
      const parentSize = parentNode.getSize();

      // 查找父节点的所有现有子节点
      const existingEdges = graph
        .getEdges()
        .filter((edge) => edge.getSourceCellId() === parentId);
      const existingChildNodes = existingEdges
        .map((edge) => graph.getCellById(edge.getTargetCellId()))
        .filter(
          (cell): cell is Node => cell !== null && cell.isNode()
        ) as Node[];

      // 计算新节点的位置
      // 默认间距
      const spacing = 200;
      let newX = parentPosition.x + parentSize.width + spacing;
      let newY = parentPosition.y;

      // 如果有现有子节点，计算合适的位置避免重叠
      if (existingChildNodes.length > 0) {
        // 找到最右侧的子节点
        const rightmostChild = existingChildNodes.reduce((prev, curr) => {
          const prevPos = prev.getPosition();
          const currPos = curr.getPosition();
          return currPos.x > prevPos.x ? curr : prev;
        });

        const rightmostPos = rightmostChild.getPosition();
        const rightmostSize = rightmostChild.getSize();

        // 新节点放在最右侧子节点的右侧
        newX = rightmostPos.x + rightmostSize.width + spacing;
        newY = rightmostPos.y;
      }

      // 创建子节点
      const childNode = graph.addNode({
        id: childId,
        shape: "mindmap-node",
        x: newX,
        y: newY,
        data: {
          topic: "新节点",
          level: (parentNode.getData()?.level || 0) + 1,
        },
        attrs: {
          text: {
            text: "新节点",
          },
        },
      });

      // 创建边
      graph.addEdge({
        source: parentId,
        target: childId,
        shape: "mindmap-edge",
      });

      // 选中新节点
      childNode.setAttrs({
        body: {
          stroke: "#1890ff",
          strokeWidth: 2,
        },
      });

      // 居中显示内容
      graph.centerContent();
    });
  });

  // 销毁 X6 Graph
  const destroyGraph = useMemoizedFn(() => {
    if (graphRef.current) {
      graphRef.current.dispose();
      graphRef.current = null;
    }
  });

  // Modal 打开时初始化 Graph
  const handleModalOpen = useMemoizedFn(() => {
    setModalOpen(true);
    // 延迟初始化，确保 DOM 已渲染
    setTimeout(() => {
      initGraph();
    }, 100);
  });

  // Modal 关闭时销毁 Graph
  const handleModalClose = useMemoizedFn(async () => {
    // 更新 mobx store 和生成预览图片
    if (graphRef.current && currentPageId && id) {
      // 更新数据到 store
      const updatedData = getDataFromGraph(graphRef.current);
      const currentElement = pptStore.getElementInfo(currentPageId, id);
      if (currentElement) {
        pptStore.setElementInfo(currentPageId, id, {
          ...currentElement,
          data: updatedData,
        } as any);
      }

      // 生成最终的预览图片
      await generatePreviewImage();
    }
    destroyGraph();
    setModalOpen(false);
  });

  // 添加子节点
  const handleAddChild = useMemoizedFn(() => {
    if (!graphRef.current || readonly) return;

    const graph = graphRef.current;
    // 获取所有节点，找到第一个节点作为父节点（简化实现）
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
      message.warning("请先创建根节点");
      return;
    }

    // 使用最后一个节点作为父节点（实际应该使用选中的节点）
    const parentNode = nodes[nodes.length - 1];
    const parentId = parentNode.id;
    const childId = `node_${Date.now()}`;

    // 获取父节点位置
    const parentPosition = parentNode.getPosition();
    const parentSize = parentNode.getSize();

    // 创建子节点
    const childNode = graph.addNode({
      id: childId,
      shape: "mindmap-node",
      x: parentPosition.x + parentSize.width + 200,
      y: parentPosition.y,
      data: {
        topic: "新节点",
        level: (parentNode.getData()?.level || 0) + 1,
      },
      attrs: {
        text: {
          text: "新节点",
        },
      },
    });

    // 创建边
    graph.addEdge({
      source: parentId,
      target: childId,
      shape: "mindmap-edge",
    });

    // 选中新节点
    childNode.setAttrs({
      body: {
        stroke: "#1890ff",
        strokeWidth: 2,
      },
    });
    // 工具已在创建时添加，双击节点即可编辑
  });

  // 删除节点
  const handleDeleteNode = useMemoizedFn(() => {
    if (!graphRef.current || readonly) return;

    const graph = graphRef.current;
    // 获取所有节点，删除最后一个（实际应该删除选中的节点）
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
      message.warning("没有可删除的节点");
      return;
    }

    const selectedNodes = [nodes[nodes.length - 1]];

    selectedNodes.forEach((node) => {
      // 删除节点及其所有子节点
      const removeNodeAndChildren = (nodeId: string) => {
        const edges = graph.getEdges();
        const childEdges = edges.filter(
          (edge) => edge.getSourceCellId() === nodeId
        );
        childEdges.forEach((edge) => {
          removeNodeAndChildren(edge.getTargetCellId());
          graph.removeEdge(edge);
        });
        graph.removeNode(nodeId);
      };

      removeNodeAndChildren(node.id);
    });

    message.success("删除成功");
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
          className="w-full h-full"
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="思维导图预览"
              className="w-full h-full object-contain"
              style={{ pointerEvents: "none" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              双击编辑思维导图
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
      <Modal
        title="编辑思维导图"
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleModalClose}
        width="90%"
        style={{ top: 20 }}
        styles={{
          body: { height: "calc(100vh - 200px)", padding: 0 },
        }}
        okText="完成"
        cancelText="取消"
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div style={{ flex: 1 }}>
              <button
                onClick={handleAddChild}
                style={{
                  marginRight: 8,
                  padding: "4px 12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                添加子节点
              </button>
              <button
                onClick={handleDeleteNode}
                style={{
                  marginRight: 8,
                  padding: "4px 12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                删除节点
              </button>
            </div>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <div
          ref={modalContainerRef}
          className="w-full h-full"
          style={{ height: "100%" }}
        />
      </Modal>
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
        className="w-full h-full"
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt="思维导图预览"
            className="w-full h-full object-contain"
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            思维导图预览
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
