import { cloneDeep } from "@/utils";
import { Export, Graph, Node, Selection, Shape } from "@antv/x6";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { message, Modal, Spin, theme } from "antd";
import "overlayscrollbars/overlayscrollbars.css";
import { useEffect, useRef, useState, type FC } from "react";
import { CanvasControls } from "./CanvasControls";
import { MindMapToolbar } from "./MindMapToolbar";
import {
  autoLayoutGraph,
  calculateZoomAndCenter,
  createDefaultMindMapData,
  createNewNodeConfig,
  getDataFromGraph,
  type X6GraphData,
} from "./utils";

export interface MindMapModalProps {
  open: boolean;
  onClose: () => void;
  data?: X6GraphData;
  readonly?: boolean;
  onDataChange?: (data: X6GraphData) => void;
  onPreviewImageChange?: (imageData: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  exportGraphToSVG?: (
    graph: Graph,
    viewBox: { x: number; y: number; width: number; height: number },
    backgroundColor?: string
  ) => Promise<string>;
  initialBackgroundColor?: string;
}

export const MindMapModal: FC<MindMapModalProps> = ({
  open,
  onClose,
  data,
  readonly = false,
  onDataChange,
  onPreviewImageChange,
  onBackgroundColorChange,
  exportGraphToSVG,
  initialBackgroundColor = "#F2F7FA",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const selectedNodeRef = useRef<Node | null>(null);
  const [edgeType, setEdgeType] = useState<string>("none");
  const edgeTypeRef = useRef<string>("none");
  const [edgeWidth, setEdgeWidth] = useState<number>(2);
  const edgeWidthRef = useRef<number>(2);
  const [edgeColor, setEdgeColor] = useState<string>("#A2B1C3");
  const edgeColorRef = useRef<string>("#A2B1C3");
  const [edgeConnector, setEdgeConnector] = useState<string>("mindmap");
  const edgeConnectorRef = useRef<string>("mindmap");
  const [backgroundColor, setBackgroundColor] = useState<string>(
    initialBackgroundColor
  );
  const backgroundColorRef = useRef<string>(initialBackgroundColor);

  // 节点样式状态
  const [nodeBackgroundColor, setNodeBackgroundColor] =
    useState<string>("#EFF4FF");
  const nodeBackgroundColorRef = useRef<string>("#EFF4FF");
  const [nodeBorderColor, setNodeBorderColor] = useState<string>("#5F95FF");
  const nodeBorderColorRef = useRef<string>("#5F95FF");
  const [nodeBorderWidth, setNodeBorderWidth] = useState<number>(1);
  const nodeBorderWidthRef = useRef<number>(1);
  const [nodeBorderType, setNodeBorderType] = useState<string | null>("");
  const nodeBorderTypeRef = useRef<string>("");
  const [nodeFontSize, setNodeFontSize] = useState<number>(14);
  const nodeFontSizeRef = useRef<number>(14);
  const [nodeFontColor, setNodeFontColor] = useState<string>("#262626");
  const nodeFontColorRef = useRef<string>("#262626");

  // 选中节点数量状态
  const [selectedNodeCount, setSelectedNodeCount] = useState<number>(0);
  // 选中边数量状态
  const [selectedEdgeCount, setSelectedEdgeCount] = useState<number>(0);
  // 自动排列开关状态
  const [isAutoLayoutActive, setIsAutoLayoutActive] = useState<boolean>(true);
  const isAutoLayoutActiveRef = useRef<boolean>(true);

  // 同步 ref 和 state
  useEffect(() => {
    isAutoLayoutActiveRef.current = isAutoLayoutActive;
  }, [isAutoLayoutActive]);

  // Loading 状态
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 是否有未保存的更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // 初始数据快照（用于比较是否有更改）
  const initialDataRef = useRef<X6GraphData | null>(null);

  // 画布模式：'pan' 拖拽画布模式，'select' 选择元素模式
  const [canvasMode, setCanvasMode] = useState<"pan" | "select">("pan");
  const selectionPluginRef = useRef<Selection | null>(null);
  const isAdjustingZoomRef = useRef(false); // 标记是否正在调整缩放

  // 获取主题色
  const { token } = theme.useToken();

  // 初始化 X6 Graph
  const initGraph = useMemoizedFn(async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setHasUnsavedChanges(false);

    // 如果已经初始化过，先销毁
    if (graphRef.current) {
      graphRef.current.dispose();
      graphRef.current = null;
    }

    // 创建 Graph 实例
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      background: {
        color: backgroundColorRef.current,
      },
      grid: {
        visible: true,
        type: "dot",
        args: {
          color: "#e0e0e0",
          thickness: 1,
        },
      },
      panning: {
        enabled: true, // 默认启用拖拽模式
        eventTypes: ["leftMouseDown", "mouseWheel"],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: "ctrl",
        minScale: 0.5,
        maxScale: 4,
      },
      interacting: {
        // 禁用边的拖动功能，只支持选中
        edgeMovable: false,
        edgeLabelMovable: false,
      },
      connecting: {
        router: "manhattan",
        connector: {
          name: "normal",
          args: {
            radius: 8,
          },
        },
        anchor: "center",
        connectionPoint: {
          name: "boundary",
        }, // 使用边界连接点，而不是中心点
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          const currentEdgeType = edgeTypeRef.current;
          const currentEdgeWidth = edgeWidthRef.current;
          const currentEdgeColor = edgeColorRef.current;
          const currentEdgeConnector = edgeConnectorRef.current;
          const dashArray =
            currentEdgeType === "none" ? undefined : currentEdgeType;

          return new Shape.Edge({
            shape: "mindmap-edge",
            zIndex: -1, // 确保边在节点下方
            router: currentEdgeConnector === "jumpover" ? "er" : "manhattan",
            connector: {
              name: currentEdgeConnector,
              args:
                currentEdgeConnector === "rounded"
                  ? { radius: 8 }
                  : currentEdgeConnector === "jumpover"
                    ? { size: 4, radius: 4 }
                    : {},
            },
            attrs: {
              line: {
                stroke: currentEdgeColor,
                strokeWidth: currentEdgeWidth,
                strokeDasharray: dashArray,
                pointerEvents: "visibleStroke", // 使边可响应鼠标事件，支持选中和拖动端点
              },
            },
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

    // 使用 Selection 插件启用选择功能
    // 注意：Selection 插件和 Panning 可以同时启用，它们不会冲突
    // 我们通过控制 enabled 和 rubberband 来切换模式
    const selectionPlugin = new Selection({
      enabled: true, // 始终启用选择功能
      rubberband: false, // 默认禁用框选（默认是拖拽模式）
      showNodeSelectionBox: true, // 显示节点的选择框
      showEdgeSelectionBox: true, // 显示边的选择框
    });
    graph.use(selectionPlugin);
    selectionPluginRef.current = selectionPlugin;

    // 设置选择框的 pointer-events 为 none，让鼠标事件穿透
    const updateSelectionBoxPointerEvents = () => {
      const selectionBoxes = containerRef.current?.querySelectorAll(
        ".x6-widget-selection-box"
      );
      selectionBoxes?.forEach((box) => {
        (box as HTMLElement).style.pointerEvents = "none";
      });
    };

    // 监听选择变化，更新选择框样式
    graph.on("selection:changed", () => {
      setTimeout(updateSelectionBoxPointerEvents, 0);

      // 边不支持拖拽，只支持选中，不需要添加工具
    });

    graphRef.current = graph;

    // 初始化背景色
    backgroundColorRef.current = initialBackgroundColor;
    setBackgroundColor(initialBackgroundColor);

    // 加载数据或使用默认数据
    const graphData = data || createDefaultMindMapData();

    // 保存初始数据快照
    initialDataRef.current = cloneDeep(graphData);

    // 如果数据中有 edge 数据，检查是否包含样式信息
    // 如果没有样式信息，需要从第一个 edge 的 attrs 中读取
    if (graphData.edges && graphData.edges.length > 0) {
      const firstEdgeData = graphData.edges[0];
      // 如果 edge 数据中包含 attrs，从中读取样式信息
      if (firstEdgeData.attrs && firstEdgeData.attrs.line) {
        const lineAttrs = firstEdgeData.attrs.line;

        // 读取线段类型（strokeDasharray）
        if (
          lineAttrs.strokeDasharray &&
          typeof lineAttrs.strokeDasharray === "string"
        ) {
          setEdgeType(lineAttrs.strokeDasharray);
          edgeTypeRef.current = lineAttrs.strokeDasharray;
        } else {
          setEdgeType("none");
          edgeTypeRef.current = "none";
        }

        // 读取线段宽度
        if (
          lineAttrs.strokeWidth &&
          typeof lineAttrs.strokeWidth === "number"
        ) {
          setEdgeWidth(lineAttrs.strokeWidth);
          edgeWidthRef.current = lineAttrs.strokeWidth;
        }

        // 读取线段颜色
        if (lineAttrs.stroke && typeof lineAttrs.stroke === "string") {
          setEdgeColor(lineAttrs.stroke);
          edgeColorRef.current = lineAttrs.stroke;
        }
      }

      // 读取连接器类型
      if (
        firstEdgeData.connector &&
        typeof firstEdgeData.connector === "string"
      ) {
        setEdgeConnector(firstEdgeData.connector);
        edgeConnectorRef.current = firstEdgeData.connector;
      }
    }

    graph.fromJSON(graphData);
    const handleContentChange = () => {
      if (graphRef.current && initialDataRef.current) {
        const currentData = getDataFromGraph(graphRef.current);
        const currentDataStr = JSON.stringify(currentData);
        const initialDataStr = JSON.stringify(initialDataRef.current);
        setHasUnsavedChanges(currentDataStr !== initialDataStr);
      }
    };

    graph.on("node:added", handleContentChange);
    graph.on("node:removed", handleContentChange);
    graph.on("node:change:position", handleContentChange);
    // graph.on("node:change:size", (args) => {
    //   handleContentChange();
    //   // 当节点大小改变时，更新连接到该节点的所有边的位置
    //   const node = args.node;
    //   const edges = graph.getConnectedEdges(node);
    //   // 使用 requestAnimationFrame 确保在 DOM 更新后重新计算边的位置
    //   requestAnimationFrame(() => {
    //     edges.forEach((edge) => {
    //       // 重新设置 source 和 target，触发边的路径重新计算
    //       const source = edge.getSource();
    //       const target = edge.getTarget();
    //       if (source && target) {
    //         edge.setSource(source);
    //         edge.setTarget(target);
    //       }
    //     });
    //   });
    // });
    graph.on("edge:added", handleContentChange);
    graph.on("edge:removed", handleContentChange);
    graph.on("cell:change:attrs", handleContentChange);
    graph.on("cell:change:data", handleContentChange);

    adjustZoomAndCenter();
    // 初始化完成，隐藏 loading
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    // 监听选择变更事件
    graph.on("selection:changed", ({ added, removed }) => {
      // 移除选中样式（不再需要恢复边框颜色，因为选中时没有改变）
      removed.forEach((cell) => {
        if (cell.isNode()) {
          // 取消选中时不改变节点的样式，保持用户设置的样式
        }
      });

      // 添加选中样式（不再改变边框颜色，保持用户设置的样式）
      added.forEach((cell) => {
        if (cell.isNode()) {
          // 选中时不改变节点的样式，保持用户设置的样式
          // 选中状态由 X6 的 Selection 插件通过选择框来显示
        }
      });

      // 检查选中的节点和边数量
      const selectedCells = graph.getSelectedCells();
      const selectedNodes = selectedCells.filter((cell) => cell.isNode());
      const selectedEdges = selectedCells.filter((cell) => cell.isEdge());

      // 更新选中节点和边数量
      setSelectedNodeCount(selectedNodes.length);
      setSelectedEdgeCount(selectedEdges.length);

      if (selectedNodes.length === 0) {
        // 没有选中任何节点，清空引用并重置节点样式状态
        selectedNodeRef.current = null;
        // 重置节点样式状态为默认值
        setNodeBackgroundColor("#EFF4FF");
        nodeBackgroundColorRef.current = "#EFF4FF";
        setNodeBorderColor("#5F95FF");
        nodeBorderColorRef.current = "#5F95FF";
        setNodeBorderWidth(1);
        nodeBorderWidthRef.current = 1;
        setNodeBorderType(null); // 使用 null 表示未设置，避免与空字符串选项冲突
        nodeBorderTypeRef.current = "";
        setNodeFontSize(14);
        nodeFontSizeRef.current = 14;
        setNodeFontColor("#262626");
        nodeFontColorRef.current = "#262626";
      } else if (selectedNodes.length === 1) {
        // 只选中一个节点，读取该节点的样式
        const selectedNode = selectedNodes[0] as Node;
        selectedNodeRef.current = selectedNode;
        const currentStyle = selectedNode.getAttrs().style || {};

        // 读取节点样式并更新状态
        if (
          currentStyle.background &&
          typeof currentStyle.background === "string"
        ) {
          setNodeBackgroundColor(currentStyle.background);
          nodeBackgroundColorRef.current = currentStyle.background;
        } else {
          setNodeBackgroundColor("");
          nodeBackgroundColorRef.current = "";
        }

        if (currentStyle.border && typeof currentStyle.border === "string") {
          setNodeBorderColor(currentStyle.border);
          nodeBorderColorRef.current = currentStyle.border;
        } else {
          setNodeBorderColor("");
          nodeBorderColorRef.current = "";
        }

        if (
          currentStyle.borderWidth &&
          typeof currentStyle.borderWidth === "number"
        ) {
          setNodeBorderWidth(currentStyle.borderWidth);
          nodeBorderWidthRef.current = currentStyle.borderWidth;
        } else {
          setNodeBorderWidth(0);
          nodeBorderWidthRef.current = 0;
        }

        if (
          currentStyle.borderStyle !== undefined &&
          currentStyle.borderStyle !== null
        ) {
          const borderStyle = String(currentStyle.borderStyle);
          setNodeBorderType(borderStyle);
          nodeBorderTypeRef.current = borderStyle;
        } else {
          setNodeBorderType(null); // 使用 null 表示未设置
          nodeBorderTypeRef.current = "";
        }

        if (
          currentStyle.fontSize &&
          typeof currentStyle.fontSize === "number"
        ) {
          setNodeFontSize(currentStyle.fontSize);
          nodeFontSizeRef.current = currentStyle.fontSize;
        } else {
          setNodeFontSize(0);
          nodeFontSizeRef.current = 0;
        }

        if (currentStyle.color && typeof currentStyle.color === "string") {
          setNodeFontColor(currentStyle.color);
          nodeFontColorRef.current = currentStyle.color;
        } else {
          setNodeFontColor("");
          nodeFontColorRef.current = "";
        }
      } else {
        // 选中多个节点，清空样式值
        selectedNodeRef.current = null;
        setNodeBackgroundColor("");
        nodeBackgroundColorRef.current = "";
        setNodeBorderColor("");
        nodeBorderColorRef.current = "";
        setNodeBorderWidth(0);
        nodeBorderWidthRef.current = 0;
        setNodeBorderType(null); // 使用 null 表示未设置，避免与空字符串选项冲突
        nodeBorderTypeRef.current = "";
        setNodeFontSize(0);
        nodeFontSizeRef.current = 0;
        setNodeFontColor("");
        nodeFontColorRef.current = "";
      }
    });

    // 监听节点点击事件 - 确保点击时选中节点
    graph.on("node:click", ({ node }) => {
      // 如果节点未被选中，选中它
      // 不阻止事件传播，让双击事件能够正常触发
      if (!graph.isSelected(node)) {
        graph.select(node);
      }
    });

    // 监听边点击事件 - 确保点击时选中边
    graph.on("edge:click", ({ edge }) => {
      // 如果边未被选中，选中它
      if (!graph.isSelected(edge)) {
        graph.select(edge);
      }
    });

    // 监听节点双击事件 - 触发节点编辑
    graph.on("node:dblclick", ({ node, e }) => {
      e.preventDefault();
      e.stopPropagation();

      // 如果节点是只读的，不处理
      const readonly = node.getData()?.readonly || false;
      if (readonly) return;

      // 通过设置节点数据来触发 React 组件进入编辑模式
      const currentData = node.getData() || {};
      node.setData({ ...currentData, _editing: true });
    });

    // 监听空白区域点击 - 取消选中
    graph.on("blank:click", () => {
      graph.cleanSelection();
      selectedNodeRef.current = null;
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

      // 创建子节点，使用工具函数计算尺寸
      const newNodeConfig = createNewNodeConfig({
        id: childId,
        x: newX,
        y: newY,
        topic: "新节点",
        level: (parentNode.getData()?.level || 0) + 1,
      });
      graph.addNode(newNodeConfig);

      // 创建边
      const currentEdgeType = edgeTypeRef.current;
      const currentEdgeWidth = edgeWidthRef.current;
      const currentEdgeColor = edgeColorRef.current;
      const currentEdgeConnector = edgeConnectorRef.current;
      const dashArray =
        currentEdgeType === "none" ? undefined : currentEdgeType;
      graph.addEdge({
        source: parentId,
        target: childId,
        shape: "mindmap-edge",
        zIndex: -1, // 确保边在节点下方
        router: currentEdgeConnector === "jumpover" ? "er" : "manhattan",
        connector: {
          name: currentEdgeConnector,
          args:
            currentEdgeConnector === "rounded"
              ? { radius: 8 }
              : currentEdgeConnector === "jumpover"
                ? { size: 4, radius: 4 }
                : {},
        },
        attrs: {
          line: {
            stroke: currentEdgeColor,
            strokeWidth: currentEdgeWidth,
            strokeDasharray: dashArray,
            pointerEvents: "visibleStroke", // 使边可响应鼠标事件，支持选中和拖动端点
          },
        },
      });

      // 选中新创建的子节点，并清除其他选中
      const childNode = graph.getCellById(childId);
      if (childNode) {
        graph.cleanSelection(); // 清除当前选中
        graph.select(childNode); // 只选中新创建的子节点
      }

      // 如果开启了自动排列，则自动重新布局
      if (isAutoLayoutActiveRef.current) {
        autoLayoutGraph(graph, "root", { hGap: 40, vGap: 20 });
      }

      // 居中显示内容
      graph.centerContent();
    });
  });

  // 更新选中节点的样式（通用方法）
  const updateSelectedNodesStyle = useMemoizedFn(
    (styleKey: string, value: any) => {
      const graph = graphRef.current;
      if (graph) {
        const selectedCells = graph.getSelectedCells();
        const selectedNodes = selectedCells.filter((cell) => cell.isNode());
        selectedNodes.forEach((node) => {
          const currentStyle = node.getAttrs().style || {};
          const nodeData = node.getData() || {};
          console.log(styleKey, value);

          // 更新样式
          node.setAttrs({
            style: {
              ...currentStyle,
              [styleKey]: value,
            },
          });

          // 如果修改的是边框宽度，同步更新原始边框宽度（用于记录）
          if (styleKey === "borderWidth") {
            node.setData({
              ...nodeData,
              originalBorderWidth: value,
            });
          }
        });
      }
    }
  );

  // 画布控制回调函数
  const handleZoomIn = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (graph) {
      const currentZoom = graph.zoom();

      const newZoom = Math.min(currentZoom + 0.1, 4); // 最大缩放 4
      console.log(newZoom, currentZoom, "currentZoom");

      graph.zoomTo(newZoom);
    }
  });

  const handleZoomOut = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (graph) {
      const currentZoom = graph.zoom();
      const newZoom = Math.max(currentZoom - 0.1, 0.5); // 最小缩放 0.5
      console.log(newZoom, currentZoom, "currentZoom");
      graph.zoomTo(newZoom);
    }
  });

  // 调整缩放和居中，确保所有内容都在画布中可见
  const adjustZoomAndCenterInternal = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (!graph) {
      isAdjustingZoomRef.current = false;
      return;
    }
    console.log(isAdjustingZoomRef, "isAdjustingZoomRef");

    // 如果正在调整，直接返回
    if (isAdjustingZoomRef.current) {
      return;
    }

    isAdjustingZoomRef.current = true;

    // 获取画布容器大小
    const container = containerRef.current;
    if (!container) {
      isAdjustingZoomRef.current = false;
      return;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 使用工具函数计算缩放比例
    const result = calculateZoomAndCenter({
      graph,
      containerWidth,
      containerHeight,
    });

    if (result?.scale === result?.preScale) {
      graph.centerContent();
      isAdjustingZoomRef.current = false;
      return;
    }
    if (result === null) {
      graph.centerContent();
      graph.zoomTo(1);
      isAdjustingZoomRef.current = false;
      return;
    }

    // 应用缩放和居中
    graph.zoomTo(result.scale);
    graph.centerContent();

    // 重置标记
    setTimeout(() => {
      isAdjustingZoomRef.current = false;
    }, 100);
  });

  // 使用防抖包装，避免短时间内重复调用
  const { run: adjustZoomAndCenter } = useDebounceFn(
    adjustZoomAndCenterInternal,
    { wait: 200 }
  );

  const handleCenter = useMemoizedFn(() => {
    adjustZoomAndCenter();
  });

  // 切换画布模式
  const handleToggleCanvasMode = useMemoizedFn(() => {
    if (!graphRef.current || !selectionPluginRef.current) return;

    const newMode = canvasMode === "pan" ? "select" : "pan";
    setCanvasMode(newMode);

    if (newMode === "pan") {
      // 切换到拖拽画布模式：启用 panning，禁用框选但保留点击选择
      graphRef.current.enablePanning();
      // 禁用框选功能，但保留点击选择功能
      selectionPluginRef.current.disableRubberband();
      // Selection 插件保持启用，这样点击选择仍然可用
    } else {
      // 切换到选择元素模式：禁用 panning，启用框选和选择
      graphRef.current.disablePanning();
      // 启用框选功能
      selectionPluginRef.current.enableRubberband();
    }
  });

  // 销毁 X6 Graph
  const destroyGraph = useMemoizedFn(() => {
    if (graphRef.current) {
      graphRef.current.dispose();
      graphRef.current = null;
    }
    selectedNodeRef.current = null;
  });

  // 保存数据
  const handleSave = useMemoizedFn(async () => {
    if (graphRef.current) {
      setIsLoading(true);
      try {
        // 更新数据
        const updatedData = getDataFromGraph(graphRef.current);
        onDataChange?.(updatedData);

        // 生成预览图片
        if (exportGraphToSVG && onPreviewImageChange) {
          try {
            // 计算 viewBox
            const box = graphRef.current.getContentBBox({
              useCellGeometry: false,
            });
            const padding = 20;
            const viewBox = {
              x: box.x - padding,
              y: box.y - padding,
              width: box.width + padding * 2,
              height: box.height + padding * 2,
            };

            // 获取背景色
            const bgColor = backgroundColorRef.current;
            const modifiedSvgString = await exportGraphToSVG(
              graphRef.current,
              viewBox,
              bgColor
            );
            const svgBlob = new Blob([modifiedSvgString], {
              type: "image/svg+xml",
            });

            const reader = new FileReader();
            reader.onloadend = () => {
              const imageData = reader.result as string;
              onPreviewImageChange(imageData);
            };
            reader.readAsDataURL(svgBlob);
          } catch (error) {
            console.error("生成预览图片失败:", error);
          }
        }

        // 更新初始数据快照
        if (graphRef.current) {
          const currentData = getDataFromGraph(graphRef.current);
          initialDataRef.current = cloneDeep(currentData);
          setHasUnsavedChanges(false);
        }
      } finally {
        setIsLoading(false);
      }
    }
    destroyGraph();
    onClose();
  });

  // Modal 关闭处理（取消按钮或点击遮罩）
  const handleCancel = useMemoizedFn(() => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: "提示",
        content: "当前内容未保存，是否确认关闭？",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        okButtonProps: {
          style: {
            backgroundColor: token.colorPrimary,
            borderColor: token.colorPrimary,
          },
        },
        cancelButtonProps: {
          style: {
            color: token.colorPrimary,
            borderColor: token.colorPrimary,
          },
        },
        onOk: () => {
          destroyGraph();
          setHasUnsavedChanges(false);
          initialDataRef.current = null;
          onClose();
        },
      });
    } else {
      destroyGraph();
      initialDataRef.current = null;
      onClose();
    }
  });

  // Modal 打开时初始化 Graph
  useEffect(() => {
    if (open) {
      // 重置状态
      setHasUnsavedChanges(false);
      initialDataRef.current = null;

      // 延迟初始化，确保 DOM 已渲染
      const timer = setTimeout(() => {
        initGraph();
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    } else {
      destroyGraph();
      setHasUnsavedChanges(false);
      initialDataRef.current = null;
    }
  }, [open, initGraph, destroyGraph]);

  const handleCopyNode = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const selectedCells = graph.getSelectedCells();
    const selectedNodes = selectedCells.filter((cell) =>
      cell.isNode()
    ) as Node[];

    if (selectedNodes.length === 0) return;

    // 用于存储所有新创建的节点ID，最后选中它们
    const newCreatedNodeIds: string[] = [];

    selectedNodes.forEach((node) => {
      // 找到父节点（通过查找指向当前节点的边）
      const incomingEdges = graph.getIncomingEdges(node);
      const parentEdge = incomingEdges?.[0];

      if (!parentEdge) {
        message.error("根节点无法复制");
        return;
      }

      const parentNodeId = parentEdge.getSourceCellId();
      const parentNode = graph.getCellById(parentNodeId) as Node | null;

      if (!parentNode) return;

      // 获取父节点的所有子节点（同级节点）
      const siblingEdges = graph
        .getEdges()
        .filter((edge) => edge.getSourceCellId() === parentNodeId);
      const siblingNodes = siblingEdges
        .map((edge) => graph.getCellById(edge.getTargetCellId()))
        .filter((cell): cell is Node => cell !== null && cell.isNode());

      // 找到最右侧的兄弟节点，用于计算新节点位置
      let rightmostX = parentNode.getPosition().x + parentNode.getSize().width;
      if (siblingNodes.length > 0) {
        const rightmostSibling = siblingNodes.reduce((prev, curr) => {
          const prevPos = prev.getPosition();
          const currPos = curr.getPosition();
          return currPos.x > prevPos.x ? curr : prev;
        });
        const rightmostPos = rightmostSibling.getPosition();
        const rightmostSize = rightmostSibling.getSize();
        rightmostX = rightmostPos.x + rightmostSize.width;
      }

      // 复制节点（不复制子节点）
      const copyNode = (
        sourceNode: Node,
        newParentId: string,
        offsetX: number
      ): string => {
        const nodeData = sourceNode.getData();
        const nodeAttrs = sourceNode.getAttrs();
        const nodePosition = sourceNode.getPosition();
        const nodeSize = sourceNode.getSize();

        // 生成新节点 ID
        const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 创建新节点
        graph.addNode({
          id: newNodeId,
          shape: sourceNode.shape,
          x: nodePosition.x + offsetX,
          y: nodePosition.y,
          width: nodeSize.width,
          height: nodeSize.height,
          zIndex: sourceNode.zIndex || 1,
          data: {
            ...nodeData,
            topic: nodeData.topic || "新节点",
          },
          attrs: nodeAttrs,
        });

        newCreatedNodeIds.push(newNodeId); // 记录新创建的节点ID

        // 创建连接到父节点的边
        const currentEdgeType = edgeTypeRef.current;
        const currentEdgeWidth = edgeWidthRef.current;
        const currentEdgeColor = edgeColorRef.current;
        const currentEdgeConnector = edgeConnectorRef.current;
        const dashArray =
          currentEdgeType === "none" ? undefined : currentEdgeType;

        graph.addEdge({
          source: newParentId,
          target: newNodeId,
          shape: "mindmap-edge",
          zIndex: -1,
          router: currentEdgeConnector === "jumpover" ? "er" : "manhattan",
          connector: {
            name: currentEdgeConnector,
            args:
              currentEdgeConnector === "rounded"
                ? { radius: 8 }
                : currentEdgeConnector === "jumpover"
                  ? { size: 4, radius: 4 }
                  : {},
          },
          attrs: {
            line: {
              stroke: currentEdgeColor,
              strokeWidth: currentEdgeWidth,
              strokeDasharray: dashArray,
              pointerEvents: "visibleStroke", // 使边可响应鼠标事件，支持选中和拖动端点
            },
          },
        });

        return newNodeId;
      };

      // 计算偏移量（放在最右侧兄弟节点的右侧）
      const spacing = 200;
      const offsetX = rightmostX - node.getPosition().x + spacing;

      // 复制节点（不复制子节点）
      copyNode(node, parentNodeId, offsetX);
    });

    // 清除当前选中，然后只选中所有新创建的节点
    graph.cleanSelection();
    if (newCreatedNodeIds.length > 0) {
      const newNodes = newCreatedNodeIds
        .map((id) => graph.getCellById(id))
        .filter((cell): cell is Node => cell !== null && cell.isNode());
      if (newNodes.length > 0) {
        graph.select(newNodes);
      }
    }

    // 如果开启了自动排列，则自动重新布局
    if (isAutoLayoutActiveRef.current) {
      autoLayoutGraph(graph, "root", { hGap: 40, vGap: 20 });
    }

    // 居中显示内容
    graph.centerContent();
  });

  // 切换自动排列开关
  const handleToggleAutoLayout = useMemoizedFn(() => {
    setIsAutoLayoutActive((prev) => {
      const newValue = !prev;
      isAutoLayoutActiveRef.current = newValue;
      return newValue;
    });
  });

  // 刷新排列
  const handleRefreshLayout = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (!graph) return;
    autoLayoutGraph(graph, "root", { hGap: 40, vGap: 20 });
  });

  // 导出 SVG
  const handleExportSvg = useMemoizedFn(async () => {
    const graph = graphRef.current;
    if (!graph) {
      message.warning("无法导出 SVG");
      return;
    }

    try {
      // 计算 viewBox
      const box = graph.getContentBBox({
        useCellGeometry: false,
      });
      const padding = 20;
      const viewBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      // 获取背景色
      const bgColor = backgroundColorRef.current;

      // 使用 X6 的 exportSVG 方法
      graph.exportSVG(`思维导图_${Date.now()}.svg`, {
        preserveDimensions: true,
        viewBox: viewBox,
        copyStyles: true,
        beforeSerialize: (svg: SVGSVGElement) => {
          // 隐藏所有连接点
          const ports = svg.querySelectorAll(".x6-port, [data-port]");
          ports.forEach((port) => {
            const element = port as SVGElement;
            element.style.display = "none";
          });

          // 如果有背景色，添加背景矩形
          if (bgColor) {
            const rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
            rect.setAttribute("x", String(viewBox.x));
            rect.setAttribute("y", String(viewBox.y));
            rect.setAttribute("width", String(viewBox.width));
            rect.setAttribute("height", String(viewBox.height));
            rect.setAttribute("fill", bgColor);
            // 将背景矩形插入到最前面
            if (svg.firstChild) {
              svg.insertBefore(rect, svg.firstChild);
            } else {
              svg.appendChild(rect);
            }
          }
        },
      });

      message.success("SVG 导出成功");
    } catch (error) {
      console.error("导出 SVG 失败:", error);
      message.error("导出 SVG 失败");
    }
  });

  // 导出 PNG
  const handleExportPng = useMemoizedFn(async () => {
    const graph = graphRef.current;
    if (!graph) {
      message.warning("无法导出 PNG");
      return;
    }

    try {
      // 计算 viewBox
      const box = graph.getContentBBox({
        useCellGeometry: false,
      });
      const padding = 20;
      const viewBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      // 获取背景色
      const bgColor = backgroundColorRef.current;

      // 使用 X6 的 exportPNG 方法
      graph.exportPNG(`思维导图_${Date.now()}.png`, {
        preserveDimensions: true,
        viewBox: viewBox,
        copyStyles: true,
        backgroundColor: bgColor || "#ffffff",
        beforeSerialize: (svg: SVGSVGElement) => {
          // 隐藏所有连接点
          const ports = svg.querySelectorAll(".x6-port, [data-port]");
          ports.forEach((port) => {
            const element = port as SVGElement;
            element.style.display = "none";
          });
        },
      });

      message.success("PNG 导出成功");
    } catch (error) {
      console.error("导出 PNG 失败:", error);
      message.error("导出 PNG 失败");
    }
  });

  // 导出 JPG
  const handleExportJpg = useMemoizedFn(async () => {
    const graph = graphRef.current;
    if (!graph) {
      message.warning("无法导出 JPG");
      return;
    }

    try {
      // 计算 viewBox
      const box = graph.getContentBBox({
        useCellGeometry: false,
      });
      const padding = 20;
      const viewBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };

      // 获取背景色（JPG 不支持透明，使用背景色或白色）
      const bgColor = backgroundColorRef.current || "#ffffff";

      // 使用 X6 的 exportJPEG 方法
      graph.exportJPEG(`思维导图_${Date.now()}.jpg`, {
        preserveDimensions: true,
        viewBox: viewBox,
        copyStyles: true,
        backgroundColor: bgColor,
        quality: 0.95,
        beforeSerialize: (svg: SVGSVGElement) => {
          // 隐藏所有连接点
          const ports = svg.querySelectorAll(".x6-port, [data-port]");
          ports.forEach((port) => {
            const element = port as SVGElement;
            element.style.display = "none";
          });
        },
      });

      message.success("JPG 导出成功");
    } catch (error) {
      console.error("导出 JPG 失败:", error);
      message.error("导出 JPG 失败");
    }
  });

  // 处理添加子节点（从 CanvasControls 调用）
  const handleAddChild = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const selectedCells = graph.getSelectedCells();
    const selectedNodes = selectedCells.filter((cell) =>
      cell.isNode()
    ) as Node[];

    if (selectedNodes.length === 0) return;

    // 记录添加前的所有节点ID
    const existingNodeIds = new Set(graph.getNodes().map((node) => node.id));

    // 为每个选中的节点添加子节点
    selectedNodes.forEach((node) => {
      // 触发添加子节点事件
      node.notify("add-child", {});
    });

    // 等待节点创建完成后，清除当前选中，然后只选中所有新创建的节点
    setTimeout(() => {
      const allNodes = graph.getNodes();
      const newNodes = allNodes.filter((node) => !existingNodeIds.has(node.id));
      if (newNodes.length > 0) {
        graph.cleanSelection(); // 清除当前选中
        graph.select(newNodes); // 只选中新创建的节点
      }
    }, 0);
  });

  const handleDeleteNode = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const selectedCells = graph.getSelectedCells();
    const selectedNodes = selectedCells.filter((cell) =>
      cell.isNode()
    ) as Node[];
    const selectedEdges = selectedCells.filter((cell) => cell.isEdge());

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      message.warning("请先选择要删除的元素");
      return;
    }

    // 删除选中的边
    selectedEdges.forEach((edge) => {
      graph.removeEdge(edge);
    });

    // 删除选中的节点及其相关的边
    selectedNodes.forEach((node) => {
      // 获取连接到该节点的所有边（作为源节点和目标节点）
      const outgoingEdges = graph.getOutgoingEdges(node);
      const incomingEdges = graph.getIncomingEdges(node);

      // 删除所有相关的边
      [...(outgoingEdges ?? []), ...(incomingEdges ?? [])].forEach((edge) => {
        graph.removeEdge(edge);
      });

      // 删除节点
      graph.removeNode(node);
    });

    // 清除选中状态
    graph.cleanSelection();

    // 如果开启了自动排列，则自动重新布局
    if (isAutoLayoutActiveRef.current) {
      autoLayoutGraph(graph, "root", { hGap: 40, vGap: 20 });
    }
  });

  return (
    <Modal
      title="编辑思维导图"
      open={open}
      onCancel={handleCancel}
      onOk={handleSave}
      width="1200px"
      style={{ top: 20 }}
      styles={{
        body: {
          height: "calc(100vh - 200px)",
          padding: 0,
          position: "relative",
        },
      }}
      okText="保存"
      cancelText="取消"
      okButtonProps={{ loading: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      maskClosable={!hasUnsavedChanges}
      closable={!isLoading}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <Spin size="large" tip="加载中..." />
        </div>
      )}
      <MindMapToolbar
        graphRef={graphRef}
        selectedNodeCount={selectedNodeCount}
        onBackgroundColorChange={onBackgroundColorChange}
        updateSelectedNodesStyle={updateSelectedNodesStyle}
        edgeType={edgeType}
        setEdgeType={setEdgeType}
        edgeTypeRef={edgeTypeRef}
        edgeWidth={edgeWidth}
        setEdgeWidth={setEdgeWidth}
        edgeWidthRef={edgeWidthRef}
        edgeColor={edgeColor}
        setEdgeColor={setEdgeColor}
        edgeColorRef={edgeColorRef}
        edgeConnector={edgeConnector}
        setEdgeConnector={setEdgeConnector}
        edgeConnectorRef={edgeConnectorRef}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        backgroundColorRef={backgroundColorRef}
        nodeBackgroundColor={nodeBackgroundColor}
        setNodeBackgroundColor={setNodeBackgroundColor}
        nodeBackgroundColorRef={nodeBackgroundColorRef}
        nodeBorderColor={nodeBorderColor}
        setNodeBorderColor={setNodeBorderColor}
        nodeBorderColorRef={nodeBorderColorRef}
        nodeBorderWidth={nodeBorderWidth}
        setNodeBorderWidth={setNodeBorderWidth}
        nodeBorderWidthRef={nodeBorderWidthRef}
        nodeBorderType={nodeBorderType}
        setNodeBorderType={setNodeBorderType}
        nodeBorderTypeRef={nodeBorderTypeRef}
        nodeFontSize={nodeFontSize}
        setNodeFontSize={setNodeFontSize}
        nodeFontSizeRef={nodeFontSizeRef}
        nodeFontColor={nodeFontColor}
        setNodeFontColor={setNodeFontColor}
        nodeFontColorRef={nodeFontColorRef}
      />
      <div className="relative w-full h-[calc(100%-65px)]">
        <div
          ref={containerRef}
          className="w-full h-full rounded-[10px] overflow-hidden"
          style={{
            pointerEvents: isLoading ? "none" : "auto",
            opacity: isLoading ? 0.5 : 1,
          }}
        />
        {!isLoading && (
          <CanvasControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenter={handleCenter}
            onToggleMode={handleToggleCanvasMode}
            onCopy={handleCopyNode}
            onAddChild={handleAddChild}
            onToggleAutoLayout={handleToggleAutoLayout}
            onRefreshLayout={handleRefreshLayout}
            onExportSvg={handleExportSvg}
            onExportPng={handleExportPng}
            onExportJpg={handleExportJpg}
            isDisabledCopy={selectedNodeCount !== 1}
            isDisabledAddChild={selectedNodeCount === 0}
            isDisabledDeleteNode={
              selectedNodeCount === 0 && selectedEdgeCount === 0
            }
            onDeleteNode={handleDeleteNode}
            isAutoLayoutActive={isAutoLayoutActive}
            mode={canvasMode}
          />
        )}
      </div>
    </Modal>
  );
};
