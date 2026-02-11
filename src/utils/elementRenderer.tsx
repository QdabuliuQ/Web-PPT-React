/**
 * 使用 json-render 管理 PPT 元素渲染
 * 将原来的 if-else 渲染逻辑转换为声明式配置
 */

import { Chart } from "@/element/Chart";
import { Icon } from "@/element/Icon";
import { Image } from "@/element/Image";
import { MindMap } from "@/element/MindMap";
import { Table } from "@/element/Table";
import { Text } from "@/element/Text";
import { createCatalog } from "@json-render/core";
import {
  Renderer,
  ActionProvider,
  DataProvider,
  VisibilityProvider,
} from "@json-render/react";
import type { FC } from "react";
import { z } from "zod";

// 1. 定义 PPT 元素的 catalog（类型定义和验证）
export const pptElementCatalog = createCatalog({
  components: {
    // 文本组件
    Text: {
      props: z.object({
        id: z.string(),
        text: z.string(),
        fontSize: z.number().optional(),
        fontFamily: z.string().optional(),
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        color: z.string().optional(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
    // 表格组件
    Table: {
      props: z.object({
        id: z.string(),
        dataSource: z.array(z.any()),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
    // 图标组件
    Icon: {
      props: z.object({
        id: z.string(),
        iconName: z.string(),
        fill: z.array(z.string()).optional(),
        theme: z.string().optional(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
    // 图片组件
    Image: {
      props: z.object({
        id: z.string(),
        src: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        opacity: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
    // 思维导图组件
    MindMap: {
      props: z.object({
        id: z.string(),
        data: z.any(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
    // 图表组件
    Chart: {
      props: z.object({
        id: z.string(),
        chartType: z.string(),
        option: z.any(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        rotate: z.number().optional(),
        zIndex: z.number().optional(),
        mode: z.enum(["preview", "play", "edit"]).optional(),
        onSelect: z.function().optional(),
      }),
    },
  },
});

// 2. 注册 React 组件映射（json-render registry 格式）
export const pptComponentRegistry = {
  Text: ({ element }: any) => {
    console.log('Rendering Text with element:', element);
    return <Text {...element.props} type="text" />;
  },
  Table: ({ element }: any) => {
    console.log('Rendering Table with element:', element);
    return <Table {...element.props} type="table" />;
  },
  Icon: ({ element }: any) => {
    console.log('Rendering Icon with element:', element);
    return <Icon {...element.props} type="icon" />;
  },
  Image: ({ element }: any) => {
    console.log('Rendering Image with element:', element);
    return <Image {...element.props} type="image" />;
  },
  MindMap: ({ element }: any) => {
    console.log('Rendering MindMap with element:', element);
    return <MindMap {...element.props} type="mindmap" />;
  },
  Chart: ({ element }: any) => {
    console.log('Rendering Chart with element:', element);
    return <Chart {...element.props} type="chart" />;
  },
};

// 兼容旧的导出名称
export const pptComponentMap = pptComponentRegistry;

// 3. 将现有的 element 数据转换为 json-render 格式
export function convertElementToTree(
  element: any,
  mode?: "preview" | "play" | "edit",
  onSelect?: () => void
) {
  // 根据类型映射到 catalog 中的组件名
  const typeMap: Record<string, string> = {
    text: "Text",
    table: "Table",
    icon: "Icon",
    image: "Image",
    mindmap: "MindMap",
    chart: "Chart",
  };

  const componentType = typeMap[element.type];
  if (!componentType) {
    console.warn(`Unknown element type: ${element.type}`);
    return null;
  }

  // json-render 格式：element 对象包含 key, type, props
  return {
    key: element.id,
    type: componentType,
    props: {
      ...element,
      mode,
      ...(mode === "edit" && onSelect && { onSelect }),
    },
  };
}

// 4. 批量转换元素数组
export function convertElementsToTrees(
  elements: any[],
  mode?: "preview" | "play" | "edit",
  onElementSelect?: (elementId: string) => void
) {
  return elements
    .map((element) =>
      convertElementToTree(
        element,
        mode,
        onElementSelect ? () => onElementSelect(element.id) : undefined
      )
    )
    .filter(Boolean);
}

// 5. 元素渲染器组件
interface ElementRendererProps {
  elements: any[];
  mode?: "preview" | "play" | "edit";
  onElementSelect?: (elementId: string) => void;
}

// 简化版本：直接渲染组件，不使用 json-render（调试用）
export const ElementRendererDirect: FC<ElementRendererProps> = ({
  elements,
  mode,
  onElementSelect,
}) => {
  console.log('ElementRendererDirect - rendering', elements.length, 'elements');
  
  return (
    <>
      {elements.map((element) => {
        const commonProps: any = {
          key: element.id,
          ...element,
          mode,
          ...(onElementSelect && { onSelect: () => onElementSelect(element.id) }),
        };

        if (element.type === "text") {
          return <Text {...commonProps} type="text" />;
        } else if (element.type === "table") {
          return <Table {...commonProps} type="table" />;
        } else if (element.type === "icon") {
          return <Icon {...commonProps} type="icon" />;
        } else if (element.type === "image") {
          return <Image {...commonProps} type="image" />;
        } else if (element.type === "mindmap") {
          return <MindMap {...commonProps} type="mindmap" />;
        } else if (element.type === "chart") {
          return <Chart {...commonProps} type="chart" />;
        }
        return null;
      })}
    </>
  );
};

// 使用 json-render 的版本
export const ElementRenderer: FC<ElementRendererProps> = ({
  elements,
  mode,
  onElementSelect,
}) => {
  const trees = convertElementsToTrees(elements, mode, onElementSelect);
  
  // 调试日志
  console.log('ElementRenderer - elements count:', elements.length);
  console.log('ElementRenderer - trees count:', trees.length);
  if (trees.length > 0) {
    console.log('ElementRenderer - first tree:', trees[0]);
  }

  // 临时：直接使用简化版本
  return <ElementRendererDirect elements={elements} mode={mode} onElementSelect={onElementSelect} />;

  // json-render 版本（暂时禁用）
  /*
  return (
    <DataProvider initialData={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{}}>
          {trees.map((tree, index) =>
            tree ? (
              <Renderer
                key={tree.key || index}
                tree={tree as any}
                registry={pptComponentRegistry}
              />
            ) : null
          )}
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
  */
};

// 6. 使用示例：
// 替换原来的 renderElements 函数：
//
// 原来：
// const renderElements = (isEditMode: boolean) => {
//   return currentPage.elements.map((element) => {
//     if (element.type === "text") return <Text {...} />;
//     else if (element.type === "table") return <Table {...} />;
//     // ... 更多 if-else
//   });
// };
//
// 现在：
// const renderElements = (isEditMode: boolean) => {
//   return (
//     <ElementRenderer
//       elements={currentPage.elements}
//       mode={mode}
//       onElementSelect={isEditMode ? handleElementSelect : undefined}
//     />
//   );
// };
