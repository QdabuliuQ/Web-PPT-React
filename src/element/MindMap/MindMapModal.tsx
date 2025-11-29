import { Export, Graph, Node, Selection, Shape } from "@antv/x6";
import { useMemoizedFn } from "ahooks";
import { Modal, Spin, theme } from "antd";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useEffect, useRef, useState, type FC } from "react";
import { CanvasControls } from "./CanvasControls";
import { ColorPickerMenuItem } from "./ColorPickerMenuItem";
import styles from "./MindMapModal.module.less";
import { SelectMenuIitem, type SelectMenuItemOption } from "./SelectMenuIitem";
import {
  createDefaultMindMapData,
  getDataFromGraph,
  type X6GraphData,
} from "./utils";

interface MindMapModalProps {
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

  // Loading 状态
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 是否有未保存的更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // 初始数据快照（用于比较是否有更改）
  const initialDataRef = useRef<X6GraphData | null>(null);

  // 获取主题色
  const { token } = theme.useToken();

  // 线段类型选项
  const edgeTypeOptions: SelectMenuItemOption[] = [
    { label: "实线", value: "none" },
    { label: "虚线", value: "5,5" },
    { label: "点线", value: "2,2" },
    { label: "点划线", value: "5,2,2,2" },
  ];

  // 线段宽度选项
  const edgeWidthOptions: SelectMenuItemOption[] = [
    { label: "1px", value: 1 },
    { label: "2px", value: 2 },
    { label: "3px", value: 3 },
    { label: "4px", value: 4 },
    { label: "5px", value: 5 },
  ];

  // 线段连接器类型选项
  const edgeConnectorOptions: SelectMenuItemOption[] = [
    { label: "思维导图", value: "mindmap" },
    { label: "圆角", value: "rounded" },
    { label: "平滑", value: "smooth" },
    { label: "直线", value: "normal" },
    { label: "跳线", value: "jumpover" },
  ];

  // 节点边框类型选项
  const nodeBorderTypeOptions: SelectMenuItemOption[] = [
    { label: "实线", value: "" },
    { label: "虚线", value: "5,5" },
    { label: "点线", value: "2,2" },
  ];

  // 节点边框宽度选项
  const nodeBorderWidthOptions: SelectMenuItemOption[] = [
    { label: "1px", value: 1 },
    { label: "2px", value: 2 },
    { label: "3px", value: 3 },
    { label: "4px", value: 4 },
    { label: "5px", value: 5 },
  ];

  // 节点字体大小选项
  const nodeFontSizeOptions: SelectMenuItemOption[] = [
    { label: "10px", value: 10 },
    { label: "12px", value: 12 },
    { label: "14px", value: 14 },
    { label: "16px", value: 16 },
    { label: "18px", value: 18 },
    { label: "20px", value: 20 },
    { label: "24px", value: 24 },
  ];

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
          name: "normal",
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
    graph.use(
      new Selection({
        enabled: true,
        rubberband: true, // 启用框选功能
        modifiers: "shift", // 按住 Shift 键进行框选
        showNodeSelectionBox: true, // 显示节点的选择框
      })
    );

    graphRef.current = graph;

    // 初始化背景色
    backgroundColorRef.current = initialBackgroundColor;
    setBackgroundColor(initialBackgroundColor);

    // 加载数据或使用默认数据
    const graphData = data || createDefaultMindMapData();

    // 保存初始数据快照
    initialDataRef.current = JSON.parse(JSON.stringify(graphData));

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

    // 等待 React 节点渲染完成后居中画布
    graph.centerContent();

    // 监听内容变化，标记为有未保存的更改
    const handleContentChange = () => {
      if (graphRef.current && initialDataRef.current) {
        const currentData = getDataFromGraph(graphRef.current);
        const currentDataStr = JSON.stringify(currentData);
        const initialDataStr = JSON.stringify(initialDataRef.current);
        setHasUnsavedChanges(currentDataStr !== initialDataStr);
      }
    };

    // 监听节点和边的变化
    graph.on("node:added", handleContentChange);
    graph.on("node:removed", handleContentChange);
    graph.on("node:change:position", handleContentChange);
    graph.on("node:change:size", handleContentChange);
    graph.on("edge:added", handleContentChange);
    graph.on("edge:removed", handleContentChange);
    graph.on("cell:change:attrs", handleContentChange);
    graph.on("cell:change:data", handleContentChange);

    // 初始化完成，隐藏 loading
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    // 监听选择变更事件
    graph.on("selection:changed", ({ added, removed }) => {
      console.log(added, removed);

      // 移除选中样式
      removed.forEach((cell) => {
        if (cell.isNode()) {
          const currentStyle = cell.getAttrs().style || {};
          // 恢复原始边框宽度（从节点数据中获取，如果没有则使用默认值 1）
          const originalBorderWidth = cell.getData()?.originalBorderWidth || 1;
          cell.setAttrs({
            style: {
              ...currentStyle,
              border: "#5F95FF",
              borderWidth: originalBorderWidth,
            },
          });
        }
      });

      // 添加选中样式
      added.forEach((cell) => {
        if (cell.isNode()) {
          const currentStyle = cell.getAttrs().style || {};
          // 保存原始边框宽度
          const currentBorderWidth = currentStyle.borderWidth || 1;
          if (!cell.getData()?.originalBorderWidth) {
            cell.setData({
              ...cell.getData(),
              originalBorderWidth: currentBorderWidth,
            });
          }
          cell.setAttrs({
            style: {
              ...currentStyle,
              border: "#1890ff",
              // 保持原始边框宽度，不改变
              borderWidth: currentBorderWidth,
            },
          });
        }
      });

      // 检查选中的节点数量
      const selectedCells = graph.getSelectedCells();
      const selectedNodes = selectedCells.filter((cell) => cell.isNode());

      // 更新选中节点数量
      setSelectedNodeCount(selectedNodes.length);

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
          // 如果是选中状态的蓝色，需要从原始数据中获取
          const originalBorder =
            selectedNode.getData()?.originalBorder || currentStyle.border;
          const borderColor =
            originalBorder === "#1890ff" ? "#5F95FF" : originalBorder;
          setNodeBorderColor(borderColor);
          nodeBorderColorRef.current = borderColor;
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
          currentStyle.borderType !== undefined &&
          currentStyle.borderType !== null
        ) {
          const borderType = String(currentStyle.borderType);
          setNodeBorderType(borderType);
          nodeBorderTypeRef.current = borderType;
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

      // 创建子节点
      const childNode = graph.addNode({
        id: childId,
        shape: "mindmap-node",
        x: newX,
        y: newY,
        zIndex: 1, // 确保节点在边的上方
        data: {
          topic: "新节点",
          level: (parentNode.getData()?.level || 0) + 1,
        },
        attrs: {
          text: {
            text: "新节点",
          },
          style: {
            background: "#EFF4FF",
            border: "#5F95FF",
            borderWidth: 1,
            borderType: "",
            fontSize: 14,
            color: "#262626",
            fontWeight: "normal",
          },
        },
      });

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
          },
        },
      });

      // 选中新节点
      const currentStyle = childNode.getAttrs().style || {};
      childNode.setAttrs({
        style: {
          ...currentStyle,
          border: "#1890ff",
          borderWidth: 2,
        },
      });

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
          node.setAttrs({
            style: {
              ...currentStyle,
              [styleKey]: value,
            },
          });
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

  const handleCenter = useMemoizedFn(() => {
    const graph = graphRef.current;
    if (graph) {
      graph.centerContent();
      graph.zoomTo(1);
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
          initialDataRef.current = JSON.parse(JSON.stringify(currentData));
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

  return (
    <Modal
      title="编辑思维导图"
      open={open}
      onCancel={handleCancel}
      onOk={handleSave}
      width="90%"
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
      <OverlayScrollbarsComponent
        className={`${styles.modalHeader} mt-[10px] mb-[10px]`}
        options={{
          scrollbars: {
            autoHide: "scroll",
            autoHideDelay: 1000,
          },
          overflow: {
            x: "scroll",
            y: "hidden",
          },
        }}
        style={{
          width: "100%",
          height: "45px",
        }}
      >
        <div className="inline-flex gap-[10px] items-center h-full box-border rounded-lg px-[20px]">
          <SelectMenuIitem
            title="线段类型"
            options={edgeTypeOptions}
            value={edgeType}
            onSelect={(value) => {
              const newEdgeType = value as string;
              setEdgeType(newEdgeType);
              edgeTypeRef.current = newEdgeType;
              const graph = graphRef.current;
              if (graph) {
                const isSolid = value === "none";
                graph.getEdges().forEach((edge) => {
                  if (isSolid) {
                    // 实线：移除 strokeDasharray 属性
                    // 先获取当前属性，移除 strokeDasharray，然后重新设置
                    const currentAttrs = edge.getAttrs();
                    const lineAttrs = currentAttrs.line || {};
                    const { strokeDasharray: _, ...restLineAttrs } = lineAttrs;
                    edge.setAttrs({
                      ...currentAttrs,
                      line: restLineAttrs,
                    });
                    // 使用 prop 方法显式移除属性
                    edge.prop("attrs/line/strokeDasharray", undefined);
                  } else {
                    // 虚线/点线：设置 strokeDasharray
                    edge.setAttrs({
                      line: {
                        ...edge.getAttrs().line,
                        strokeDasharray: value as string,
                      },
                    });
                  }
                });
              }
            }}
          />
          <SelectMenuIitem
            title="线段宽度"
            options={edgeWidthOptions}
            value={edgeWidth}
            onSelect={(value) => {
              const newEdgeWidth = value as number;
              setEdgeWidth(newEdgeWidth);
              edgeWidthRef.current = newEdgeWidth;
              const graph = graphRef.current;
              if (graph) {
                graph.getEdges().forEach((edge) => {
                  edge.setAttrs({
                    line: {
                      ...edge.getAttrs().line,
                      strokeWidth: newEdgeWidth,
                    },
                  });
                });
              }
            }}
          />
          <ColorPickerMenuItem
            title="线段颜色"
            value={edgeColor}
            onChange={(color) => {
              setEdgeColor(color);
              edgeColorRef.current = color;
              const graph = graphRef.current;
              if (graph) {
                graph.getEdges().forEach((edge) => {
                  edge.setAttrs({
                    line: {
                      ...edge.getAttrs().line,
                      stroke: color,
                    },
                  });
                });
              }
            }}
          />
          <SelectMenuIitem
            title="线段类型"
            options={edgeConnectorOptions}
            value={edgeConnector}
            onSelect={(value) => {
              const newEdgeConnector = value as string;
              setEdgeConnector(newEdgeConnector);
              edgeConnectorRef.current = newEdgeConnector;
              const graph = graphRef.current;
              if (graph) {
                graph.getEdges().forEach((edge) => {
                  // 设置 router（跳线需要 er router）
                  edge.setRouter(
                    newEdgeConnector === "jumpover" ? "er" : "manhattan"
                  );
                  // 设置 connector
                  edge.setConnector(
                    newEdgeConnector,
                    newEdgeConnector === "rounded"
                      ? { radius: 8 }
                      : newEdgeConnector === "jumpover"
                        ? { size: 4, radius: 4 }
                        : {}
                  );
                });
              }
            }}
          />
          <ColorPickerMenuItem
            title="背景颜色"
            value={backgroundColor}
            onChange={(color) => {
              setBackgroundColor(color);
              backgroundColorRef.current = color;
              const graph = graphRef.current;
              if (graph) {
                // 使用 drawBackground 方法设置背景颜色
                graph.drawBackground({
                  color,
                });
              }
              // 通知父组件保存背景色
              onBackgroundColorChange?.(color);
            }}
          />
          <div className="h-[20px] w-[1px] bg-gray-300 inline" />
          {/* 节点样式编辑 */}
          <ColorPickerMenuItem
            title="节点背景颜色"
            value={nodeBackgroundColor}
            disabled={selectedNodeCount === 0}
            onChange={(color) => {
              setNodeBackgroundColor(color);
              nodeBackgroundColorRef.current = color;
              updateSelectedNodesStyle("background", color);
            }}
          />
          <ColorPickerMenuItem
            title="节点边框颜色"
            value={nodeBorderColor}
            disabled={selectedNodeCount === 0}
            onChange={(color) => {
              setNodeBorderColor(color);
              nodeBorderColorRef.current = color;
              const graph = graphRef.current;
              if (graph) {
                const selectedCells = graph.getSelectedCells();
                const selectedNodes = selectedCells.filter((cell) =>
                  cell.isNode()
                );
                selectedNodes.forEach((node) => {
                  // 保存原始边框颜色
                  if (!node.getData()?.originalBorder) {
                    node.setData({
                      ...node.getData(),
                      originalBorder: color,
                    });
                  }
                });
              }
              updateSelectedNodesStyle("border", color);
            }}
          />
          <SelectMenuIitem
            title="节点边框宽度"
            options={nodeBorderWidthOptions}
            value={nodeBorderWidth}
            disabled={selectedNodeCount === 0}
            onSelect={(value) => {
              const newBorderWidth = value as number;
              setNodeBorderWidth(newBorderWidth);
              nodeBorderWidthRef.current = newBorderWidth;
              const graph = graphRef.current;
              if (graph) {
                const selectedCells = graph.getSelectedCells();
                const selectedNodes = selectedCells.filter((cell) =>
                  cell.isNode()
                );
                selectedNodes.forEach((node) => {
                  // 保存原始边框宽度
                  if (!node.getData()?.originalBorderWidth) {
                    node.setData({
                      ...node.getData(),
                      originalBorderWidth: newBorderWidth,
                    });
                  }
                });
              }
              updateSelectedNodesStyle("borderWidth", newBorderWidth);
            }}
          />
          <SelectMenuIitem
            title="节点边框类型"
            options={nodeBorderTypeOptions}
            value={nodeBorderType}
            disabled={selectedNodeCount === 0}
            onSelect={(value) => {
              const newBorderType = value as string;
              setNodeBorderType(newBorderType);
              nodeBorderTypeRef.current = newBorderType;
              updateSelectedNodesStyle("borderType", newBorderType);
            }}
          />
          <SelectMenuIitem
            title="节点字体大小"
            options={nodeFontSizeOptions}
            value={nodeFontSize}
            disabled={selectedNodeCount === 0}
            onSelect={(value) => {
              const newFontSize = value as number;
              setNodeFontSize(newFontSize);
              nodeFontSizeRef.current = newFontSize;
              updateSelectedNodesStyle("fontSize", newFontSize);
            }}
          />
          <ColorPickerMenuItem
            title="字体颜色"
            value={nodeFontColor}
            disabled={selectedNodeCount === 0}
            onChange={(color) => {
              setNodeFontColor(color);
              nodeFontColorRef.current = color;
              updateSelectedNodesStyle("color", color);
            }}
          />
        </div>
      </OverlayScrollbarsComponent>
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
          />
        )}
      </div>
    </Modal>
  );
};
