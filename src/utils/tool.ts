import { PlacementMapped } from "@/element/Text/constant";
import type { ComponentType } from "react";

export function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function placementConvey(placement: keyof typeof PlacementMapped) {
  const mapped = PlacementMapped[placement as keyof typeof PlacementMapped];
  const [align, justify] = mapped.split(" ");
  return {
    display: "flex",
    alignItems: align,
    justifyContent: justify,
  };
}

/**
 * 元素面板信息类型
 */
export interface ElementPanelInfo {
  key: string;
  name: string;
  icon?: ComponentType<unknown>;
}

/**
 * 动态获取 element 目录下所有组件的面板信息
 * 自动扫描 element 目录下的所有组件，提取 PanelKey、Name 和 PanelIcon（如果存在）
 *
 * @returns 返回包含所有组件面板信息的数组，按 key 排序
 *
 * @example
 * ```ts
 * const panels = getAllElementPanelInfo();
 * // [
 * //   { key: 'icon', name: '图标' },
 * //   { key: 'image', name: '图片' },
 * //   { key: 'mindmap', name: '思维导图' },
 * //   { key: 'table', name: '表格' },
 * //   { key: 'text', name: '文本', icon: TextIcon }
 * // ]
 * ```
 */
export function getAllElementPanelInfo(): ElementPanelInfo[] {
  const elementPanels: ElementPanelInfo[] = [];

  // 使用 import.meta.glob 自动扫描 element 目录下的所有 index.tsx 文件
  const elementModules = import.meta.glob<{
    Name?: string;
    [key: string]: unknown;
  }>("@/element/*/index.tsx", { eager: true });

  // 遍历所有模块
  for (const [path, module] of Object.entries(elementModules)) {
    try {
      // 提取组件名称（从路径中获取，例如 "@/element/Text/index.tsx" -> "Text"）
      const componentName = path.match(/\/element\/([^/]+)\/index\.tsx$/)?.[1];
      if (!componentName) continue;

      // 尝试获取 PanelKey（可能是 TextPanelKey, TablePanelKey 等）
      // 首字母大写的组件名 + PanelKey
      const panelKeyName = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)}PanelKey`;
      const panelKey = module[panelKeyName] as string | undefined;

      // 获取 Name
      const name = module.Name as string | undefined;

      // 如果缺少必要的字段，跳过
      if (!panelKey || !name) {
        console.warn(
          `Missing required exports in ${componentName}: PanelKey=${!!panelKey}, Name=${!!name}`
        );
        continue;
      }

      // 尝试获取 PanelIcon（可选）
      const panelIconName = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)}PanelIcon`;
      const icon = module[panelIconName] as ComponentType<unknown> | undefined;

      elementPanels.push({
        key: panelKey,
        name,
        ...(icon && { icon }),
      });
    } catch (error) {
      console.warn(`Failed to process element module ${path}:`, error);
    }
  }

  // 按 key 排序，确保返回顺序一致
  return elementPanels.sort((a, b) => a.key.localeCompare(b.key));
}
