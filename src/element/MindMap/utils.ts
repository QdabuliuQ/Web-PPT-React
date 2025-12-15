import Hierarchy from "@antv/hierarchy";
import type { EdgeMetadata, Graph, NodeMetadata } from "@antv/x6";
import { downloadImage } from "@/utils";

// X6 数据格式
export interface X6GraphData {
  nodes: NodeMetadata[];
  edges: EdgeMetadata[];
}

// 节点尺寸计算的常量
const NODE_PADDING = { left: 10, right: 10, top: 10, bottom: 10 };
const NODE_SAFETY_MARGIN = 0;
const DEFAULT_NODE_FONT_SIZE = 14;
const DEFAULT_NODE_FONT_FAMILY = "Arial, sans-serif";
const DEFAULT_BORDER_WIDTH = 1;

// 计算节点尺寸
export interface CalculateNodeSizeOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  borderWidth?: number;
}

export function calculateNodeSize(options: CalculateNodeSizeOptions): {
  width: number;
  height: number;
} {
  const {
    text,
    fontSize = DEFAULT_NODE_FONT_SIZE,
    fontFamily = DEFAULT_NODE_FONT_FAMILY,
    borderWidth = DEFAULT_BORDER_WIDTH,
  } = options;

  // 使用 Canvas API 测量文本宽度
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const borderWidthTotal = borderWidth * 2;

  if (context) {
    context.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = context.measureText(text);
    const textWidth = Math.ceil(textMetrics.width);
    const textHeight = fontSize;

    const width =
      textWidth +
      NODE_PADDING.left +
      NODE_PADDING.right +
      NODE_SAFETY_MARGIN +
      borderWidthTotal;
    const height =
      textHeight + NODE_PADDING.top + NODE_PADDING.bottom + borderWidthTotal;

    return { width, height };
  }

  // 如果 Canvas API 不可用，返回默认尺寸
  return {
    width: 120,
    height: 40,
  };
}

// 创建新节点配置
export interface CreateNewNodeConfigOptions {
  id: string;
  x: number;
  y: number;
  topic?: string;
  level?: number;
}

export function createNewNodeConfig(
  options: CreateNewNodeConfigOptions
): NodeMetadata {
  const { id, x, y, topic = "新节点", level = 0 } = options;

  // 计算预估尺寸
  const size = calculateNodeSize({ text: topic });

  return {
    id,
    shape: "mindmap-node",
    x,
    y,
    width: size.width,
    height: size.height,
    zIndex: 1,
    data: {
      topic,
      level,
    },
    attrs: {
      text: {
        text: topic,
      },
      style: {
        background: "#EFF4FF",
        border: "#5F95FF",
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderStyle: "",
        fontSize: DEFAULT_NODE_FONT_SIZE,
        color: "#262626",
        fontWeight: "normal",
      },
    },
  };
}

// 计算缩放和居中
export interface CalculateZoomAndCenterOptions {
  graph: Graph;
  containerWidth: number;
  containerHeight: number;
  padding?: number;
}

export function calculateZoomAndCenter(
  options: CalculateZoomAndCenterOptions
): { scale: number; preScale: number } | null {
  const { graph, containerWidth, containerHeight, padding = 40 } = options;

  // 获取当前缩放级别
  const currentZoom = graph.zoom();

  const bbox = graph.getContentBBox({
    useCellGeometry: false,
  });

  // 如果内容为空，返回 null（调用者可以重置缩放为 1）
  if (bbox.width === 0 && bbox.height === 0) {
    return null;
  }

  // 计算合适的缩放比例，留出一些边距
  const scaleX = (containerWidth - padding * 2) / (bbox.width / currentZoom);
  const scaleY = (containerHeight - padding * 2) / (bbox.height / currentZoom);

  // 选择较小的缩放比例，确保内容完全可见
  const targetScale = Math.min(scaleX, scaleY, 1); // 不超过 1，不放大

  return { scale: targetScale, preScale: currentZoom };
}

// 创建默认的思维导图数据
export function createDefaultMindMapData(): X6GraphData {
  return {
    nodes: [
      {
        id: "root",
        shape: "mindmap-node",
        x: 400,
        y: 300,
        zIndex: 1,
        data: {
          topic: "中心主题",
          level: 0,
        },
        attrs: {
          text: {
            text: "中心主题",
          },
          style: {
            background: "#EFF4FF",
            border: "#5F95FF",
            borderWidth: 1,
            borderStyle: "solid", // "" 实线, "5,5" 虚线, "2,2" 点线
            fontSize: 14,
            color: "#262626",
            fontWeight: "normal",
          },
        },
      },
      {
        id: "node_1",
        shape: "mindmap-node",
        x: 600,
        y: 200,
        zIndex: 1,
        data: {
          topic: "分支",
          level: 1,
        },
        attrs: {
          text: {
            text: "分支",
          },
          style: {
            background: "#EFF4FF",
            border: "#5F95FF",
            borderWidth: 1,
            borderStyle: "solid", // "" 实线, "5,5" 虚线, "2,2" 点线
            fontSize: 14,
            color: "#262626",
            fontWeight: "normal",
          },
        },
      },
      {
        id: "node_2",
        shape: "mindmap-node",
        x: 600,
        y: 400,
        zIndex: 1,
        data: {
          topic: "分支2",
          level: 1,
        },
        attrs: {
          text: {
            text: "分支2",
          },
          style: {
            background: "#EFF4FF",
            border: "#5F95FF",
            borderWidth: 1,
            borderStyle: "solid", // "" 实线, "5,5" 虚线, "2,2" 点线
            fontSize: 14,
            color: "#262626",
            fontWeight: "normal",
          },
        },
      },
    ],
    edges: [
      {
        id: "edge_root_1",
        source: {
          cell: "root",
          port: "port-right", // 连接到根节点的右侧边缘
        },
        target: {
          cell: "node_1",
          port: "port-left", // 连接到子节点的左侧边缘
        },
        shape: "mindmap-edge",
      },
      {
        id: "edge_root_2",
        source: {
          cell: "root",
          port: "port-right", // 连接到根节点的右侧边缘
        },
        target: {
          cell: "node_2",
          port: "port-left", // 连接到子节点的左侧边缘
        },
        shape: "mindmap-edge",
      },
    ],
  };
}

// 从 Graph 获取数据
export function getDataFromGraph(graph: Graph): X6GraphData {
  const nodes = graph.getNodes().map((node) => ({
    id: node.id,
    shape: node.shape,
    x: node.getPosition().x,
    y: node.getPosition().y,
    width: node.getSize().width,
    height: node.getSize().height,
    zIndex: node.zIndex || 1, // 保存 zIndex，默认值为 1
    data: node.getData(),
    attrs: node.getAttrs(),
  }));

  const edges = graph.getEdges().map((edge) => {
    const sourceData = edge.getSource() as any;
    const targetData = edge.getTarget() as any;

    // 检查 source 是否是对象格式（包含 port）
    const source =
      typeof sourceData === "object" && sourceData !== null && sourceData.port
        ? {
            cell: sourceData.cell || edge.getSourceCellId(),
            port: sourceData.port,
          }
        : edge.getSourceCellId();

    // 检查 target 是否是对象格式（包含 port）
    const target =
      typeof targetData === "object" && targetData !== null && targetData.port
        ? {
            cell: targetData.cell || edge.getTargetCellId(),
            port: targetData.port,
          }
        : edge.getTargetCellId();

    return {
      id: edge.id,
      source,
      target,
      shape: edge.shape,
      router: edge.getRouter()?.name || "manhattan",
      connector: edge.getConnector()?.name || "mindmap",
      attrs: edge.getAttrs(),
    };
  });

  return { nodes, edges };
}

// 层级数据结构（用于 hierarchy 布局）
interface HierarchyNodeData {
  id: string;
  label: string;
  width: number;
  height: number;
  children?: HierarchyNodeData[];
}

// Hierarchy 计算结果
interface HierarchyResult {
  id: string;
  x: number;
  y: number;
  data: HierarchyNodeData;
  children?: HierarchyResult[];
}

// 将 X6GraphData 转换为层级结构
function convertToHierarchyData(
  graphData: X6GraphData,
  rootId: string
): HierarchyNodeData | null {
  const nodeMap = new Map<string, NodeMetadata>();
  graphData.nodes.forEach((node) => {
    if (node.id) {
      nodeMap.set(node.id, node);
    }
  });

  // 构建边的映射：parent -> children[]
  const childrenMap = new Map<string, string[]>();
  graphData.edges.forEach((edge) => {
    const sourceId =
      typeof edge.source === "string" ? edge.source : edge.source.cell;
    const targetId =
      typeof edge.target === "string" ? edge.target : edge.target.cell;

    if (!childrenMap.has(sourceId)) {
      childrenMap.set(sourceId, []);
    }
    childrenMap.get(sourceId)!.push(targetId);
  });

  // 递归构建层级结构
  function buildHierarchyNode(nodeId: string): HierarchyNodeData | null {
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    const topic = (node.data as any)?.topic || nodeId;
    const width = node.width ?? 120;
    const height = node.height ?? 40;

    const hierarchyNode: HierarchyNodeData = {
      id: nodeId,
      label: topic,
      width,
      height,
    };

    const childrenIds = childrenMap.get(nodeId) || [];
    if (childrenIds.length > 0) {
      hierarchyNode.children = childrenIds
        .map((childId) => buildHierarchyNode(childId))
        .filter((node): node is HierarchyNodeData => node !== null);
    }

    return hierarchyNode;
  }

  return buildHierarchyNode(rootId);
}

// 使用 hierarchy 自动布局
export function autoLayoutGraph(
  graph: Graph,
  rootId: string = "root",
  options?: {
    hGap?: number;
    vGap?: number;
  }
): void {
  const { hGap = 40, vGap = 20 } = options || {};

  // 获取当前图数据
  const graphData = getDataFromGraph(graph);

  // 转换为层级结构
  const hierarchyData = convertToHierarchyData(graphData, rootId);
  if (!hierarchyData) {
    console.warn("无法找到根节点，跳过自动布局");
    return;
  }

  // 获取根节点的当前位置，作为布局的起始点
  const rootNode = graph.getCellById(rootId);
  if (!rootNode || !rootNode.isNode()) {
    console.warn("无法找到根节点，跳过自动布局");
    return;
  }
  const rootPosition = rootNode.getPosition();

  // 使用 hierarchy.mindmap 计算布局
  const result: HierarchyResult = Hierarchy.mindmap(hierarchyData, {
    direction: "H", // 水平方向
    getHeight(d: HierarchyNodeData) {
      return d.height;
    },
    getWidth(d: HierarchyNodeData) {
      return d.width;
    },
    getHGap() {
      return hGap;
    },
    getVGap() {
      return vGap;
    },
    getSide: () => {
      return "right"; // 子节点在右侧
    },
  });

  // hierarchy.mindmap 返回的坐标是绝对坐标，但我们需要保持根节点位置不变
  // 计算根节点在 hierarchy 结果中的位置偏移
  const rootResultX = result.x;
  const rootResultY = result.y;
  const offsetX = rootPosition.x - rootResultX;
  const offsetY = rootPosition.y - rootResultY;

  // 收集所有需要更新的节点位置
  const nodePositions = new Map<string, { x: number; y: number }>();

  function traverse(hierarchyItem: HierarchyResult) {
    if (hierarchyItem) {
      // 应用偏移量，保持根节点位置不变
      nodePositions.set(hierarchyItem.id, {
        x: hierarchyItem.x + offsetX,
        y: hierarchyItem.y + offsetY,
      });

      if (hierarchyItem.children) {
        hierarchyItem.children.forEach((child) => traverse(child));
      }
    }
  }

  traverse(result);

  // 批量更新节点位置
  nodePositions.forEach((position, nodeId) => {
    const node = graph.getCellById(nodeId);
    if (node && node.isNode()) {
      node.setPosition(position.x, position.y, { silent: false });
    }
  });

  // 重新渲染边（因为节点位置改变了）
  graph.getEdges().forEach((edge) => {
    edge.setVertices([]); // 清除自定义顶点，让边自动重新计算路径
  });
}

// 下载思维导图预览图片
export async function downloadMindMapImage(
  previewImage: string,
  id: string
): Promise<void> {
  if (!previewImage) {
    return;
  }

  try {
    // 检查是否是 SVG 格式的 base64
    if (previewImage.startsWith("data:image/svg+xml")) {
      // 将 SVG base64 转换为 PNG
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // 创建 canvas 并绘制图片
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("无法创建 canvas 上下文"));
              return;
            }

            // 绘制图片到 canvas
            ctx.drawImage(img, 0, 0);

            // 转换为 PNG base64
            const pngDataUrl = canvas.toDataURL("image/png");
            const filename = `${id}.png`;
            downloadImage(pngDataUrl, filename);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("图片加载失败"));
        };

        img.src = previewImage;
      });
    } else {
      // 如果是其他格式（如 PNG），直接下载
      const filename = `${id}.png`;
      downloadImage(previewImage, filename);
    }
  } catch (error) {
    console.error("下载图片失败:", error);
  }
}
