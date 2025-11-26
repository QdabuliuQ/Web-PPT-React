import { Edge, Graph, Node } from "@antv/x6";

// X6 数据格式
export interface X6GraphData {
  nodes: Node.Metadata[];
  edges: Edge.Metadata[];
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
        width: 120,
        height: 40,
        data: {
          topic: "中心主题",
          level: 0,
        },
        attrs: {
          text: {
            text: "中心主题",
          },
        },
      },
      {
        id: "node_1",
        shape: "mindmap-node",
        x: 600,
        y: 200,
        width: 120,
        height: 40,
        data: {
          topic: "分支1",
          level: 1,
        },
        attrs: {
          text: {
            text: "分支1",
          },
        },
      },
      {
        id: "node_2",
        shape: "mindmap-node",
        x: 600,
        y: 400,
        width: 120,
        height: 40,
        data: {
          topic: "分支2",
          level: 1,
        },
        attrs: {
          text: {
            text: "分支2",
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
    data: node.getData(),
    attrs: node.getAttrs(),
  }));

  const edges = graph.getEdges().map((edge) => ({
    id: edge.id,
    source: edge.getSourceCellId(),
    target: edge.getTargetCellId(),
    shape: edge.shape,
  }));

  return { nodes, edges };
}
