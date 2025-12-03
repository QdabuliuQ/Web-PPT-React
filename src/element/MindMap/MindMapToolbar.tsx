import { Graph } from "@antv/x6";
import { useMemoizedFn } from "ahooks";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useRef, type FC } from "react";
import { ColorPickerMenuItem } from "./ColorPickerMenuItem";
import styles from "./MindMapModal.module.less";
import { SelectMenuIitem, type SelectMenuItemOption } from "./SelectMenuIitem";

interface MindMapToolbarProps {
  graphRef: React.RefObject<Graph | null>;
  selectedNodeCount: number;
  onBackgroundColorChange?: (color: string) => void;
  updateSelectedNodesStyle: (styleKey: string, value: any) => void;
  // 边样式
  edgeType: string;
  setEdgeType: (value: string) => void;
  edgeTypeRef: React.MutableRefObject<string>;
  edgeWidth: number;
  setEdgeWidth: (value: number) => void;
  edgeWidthRef: React.MutableRefObject<number>;
  edgeColor: string;
  setEdgeColor: (value: string) => void;
  edgeColorRef: React.MutableRefObject<string>;
  edgeConnector: string;
  setEdgeConnector: (value: string) => void;
  edgeConnectorRef: React.MutableRefObject<string>;
  // 背景色
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  backgroundColorRef: React.MutableRefObject<string>;
  // 节点样式
  nodeBackgroundColor: string;
  setNodeBackgroundColor: (value: string) => void;
  nodeBackgroundColorRef: React.MutableRefObject<string>;
  nodeBorderColor: string;
  setNodeBorderColor: (value: string) => void;
  nodeBorderColorRef: React.MutableRefObject<string>;
  nodeBorderWidth: number;
  setNodeBorderWidth: (value: number) => void;
  nodeBorderWidthRef: React.MutableRefObject<number>;
  nodeBorderType: string | null;
  setNodeBorderType: (value: string | null) => void;
  nodeBorderTypeRef: React.MutableRefObject<string>;
  nodeFontSize: number;
  setNodeFontSize: (value: number) => void;
  nodeFontSizeRef: React.MutableRefObject<number>;
  nodeFontColor: string;
  setNodeFontColor: (value: string) => void;
  nodeFontColorRef: React.MutableRefObject<string>;
}

export const MindMapToolbar: FC<MindMapToolbarProps> = ({
  graphRef,
  selectedNodeCount,
  onBackgroundColorChange,
  updateSelectedNodesStyle,
  edgeType,
  setEdgeType,
  edgeTypeRef,
  edgeWidth,
  setEdgeWidth,
  edgeWidthRef,
  edgeColor,
  setEdgeColor,
  edgeColorRef,
  edgeConnector,
  setEdgeConnector,
  edgeConnectorRef,
  backgroundColor,
  setBackgroundColor,
  backgroundColorRef,
  nodeBackgroundColor,
  setNodeBackgroundColor,
  nodeBackgroundColorRef,
  nodeBorderColor,
  setNodeBorderColor,
  nodeBorderColorRef,
  nodeBorderWidth,
  setNodeBorderWidth,
  nodeBorderWidthRef,
  nodeBorderType,
  setNodeBorderType,
  nodeBorderTypeRef,
  nodeFontSize,
  setNodeFontSize,
  nodeFontSizeRef,
  nodeFontColor,
  setNodeFontColor,
  nodeFontColorRef,
}) => {
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

  // 线段连接器选项
  const edgeConnectorOptions: SelectMenuItemOption[] = [
    { label: "思维导图", value: "mindmap" },
    { label: "圆角", value: "rounded" },
    { label: "平滑", value: "smooth" },
    { label: "直线", value: "normal" },
    { label: "跳线", value: "jumpover" },
  ];

  // 节点边框类型选项
  const nodeBorderTypeOptions: SelectMenuItemOption[] = [
    { label: "实线", value: "solid" },
    { label: "虚线", value: "dashed" },
    { label: "点线", value: "dotted" },
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

  // 处理线段类型变化
  const handleEdgeTypeChange = useMemoizedFn((value: string) => {
    const newEdgeType = value as string;
    setEdgeType(newEdgeType);
    edgeTypeRef.current = newEdgeType;
    const graph = graphRef.current;
    if (graph) {
      const isSolid = value === "none";
      graph.getEdges().forEach((edge) => {
        if (isSolid) {
          // 实线：移除 strokeDasharray 属性
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
  });

  // 处理线段宽度变化
  const handleEdgeWidthChange = useMemoizedFn((value: number) => {
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
  });

  // 处理线段颜色变化
  const handleEdgeColorChange = useMemoizedFn((color: string) => {
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
  });

  // 处理线段连接器变化
  const handleEdgeConnectorChange = useMemoizedFn((value: string) => {
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
  });

  // 处理背景颜色变化
  const handleBackgroundColorChange = useMemoizedFn((color: string) => {
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
  });

  // 处理节点边框颜色变化
  const handleNodeBorderColorChange = useMemoizedFn((color: string) => {
    setNodeBorderColor(color);
    nodeBorderColorRef.current = color;
    const graph = graphRef.current;
    if (graph) {
      const selectedCells = graph.getSelectedCells();
      const selectedNodes = selectedCells.filter((cell) => cell.isNode());
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
  });

  return (
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
          onSelect={handleEdgeTypeChange}
        />
        <SelectMenuIitem
          title="线段宽度"
          options={edgeWidthOptions}
          value={edgeWidth}
          onSelect={handleEdgeWidthChange}
        />
        <ColorPickerMenuItem
          title="线段颜色"
          value={edgeColor}
          onChange={handleEdgeColorChange}
        />
        <SelectMenuIitem
          title="线段类型"
          options={edgeConnectorOptions}
          value={edgeConnector}
          onSelect={handleEdgeConnectorChange}
        />
        <ColorPickerMenuItem
          title="背景颜色"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
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
          onChange={handleNodeBorderColorChange}
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
            // updateSelectedNodesStyle 会自动更新 originalBorderWidth
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
            updateSelectedNodesStyle("borderStyle", newBorderType);
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
  );
};

