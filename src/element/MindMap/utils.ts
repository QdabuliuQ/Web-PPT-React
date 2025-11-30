import type { EdgeMetadata, Graph, NodeMetadata } from "@antv/x6";

// X6 数据格式
export interface X6GraphData {
  nodes: NodeMetadata[];
  edges: EdgeMetadata[];
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
        source: "root",
        target: "node_1",
        shape: "mindmap-edge",
      },
      {
        id: "edge_root_2",
        source: "root",
        target: "node_2",
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

  const edges = graph.getEdges().map((edge) => ({
    id: edge.id,
    source: edge.getSourceCellId(),
    target: edge.getTargetCellId(),
    shape: edge.shape,
    router: edge.getRouter()?.name || "manhattan",
    connector: edge.getConnector()?.name || "mindmap",
    attrs: edge.getAttrs(),
  }));

  return { nodes, edges };
}
