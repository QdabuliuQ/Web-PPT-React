import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  ANIMATION_DELAYS,
  ANIMATION_DURATIONS,
  ANIMATION_TRIGGERS,
  BORDER_STYLES,
  CHART_TYPES,
  COMMON_ELEMENT_FIELDS,
  DOCUMENT_FIELDS,
  ELEMENT_ANIMATION_NAMES,
  ELEMENT_SCHEMAS,
  ELEMENT_TYPES,
  ICON_NAME_WHITELIST,
  ICON_THEMES,
  PAGE_FIELDS,
  PAGE_TOGGLE_ANIMATION_NAMES,
  PLACEMENT_KEYS,
  PLATFORM_CANVAS,
  PLATFORM_LIMITS,
  SHAPE_TYPES,
  TABLE_BORDER_STYLES,
  UNSUPPORTED,
  buildPlatformConstraintPrompt,
} from "../catalog/platform";
import { listLayouts } from "../layout";
import {
  PAGE_TYPES,
  PAGE_TYPE_LAYOUTS,
  PAGE_TYPE_META,
  buildPageTypeConstraintPrompt,
} from "../layout/pageTypes";

/** 导出机器可读 + Prompt 文本，供 Agent / 调试使用 */
export function getPlatformCatalogJson() {
  return {
    version: "1.1",
    canvas: PLATFORM_CANVAS,
    limits: PLATFORM_LIMITS,
    documentFields: DOCUMENT_FIELDS,
    pageFields: PAGE_FIELDS,
    commonElementFields: COMMON_ELEMENT_FIELDS,
    elementTypes: ELEMENT_TYPES,
    elementSchemas: ELEMENT_SCHEMAS,
    pageTypes: PAGE_TYPES,
    pageTypeMeta: PAGE_TYPE_META,
    pageTypeLayouts: PAGE_TYPE_LAYOUTS,
    layouts: listLayouts().map((l) => ({
      layoutKey: l.layoutKey,
      name: l.name,
      pageTypes: l.pageTypes || [],
      slotCount: l.slots.length,
    })),
    enums: {
      placement: PLACEMENT_KEYS,
      borderStyle: BORDER_STYLES,
      tableBorderStyle: TABLE_BORDER_STYLES,
      chartType: CHART_TYPES,
      shapeType: SHAPE_TYPES,
      iconTheme: ICON_THEMES,
      iconNameWhitelist: ICON_NAME_WHITELIST,
      elementAnimationName: ELEMENT_ANIMATION_NAMES,
      pageToggleAnimationName: PAGE_TOGGLE_ANIMATION_NAMES,
      animationDuration: ANIMATION_DURATIONS,
      animationDelay: ANIMATION_DELAYS,
      animationTrigger: ANIMATION_TRIGGERS,
      pageType: PAGE_TYPES,
    },
    unsupported: UNSUPPORTED,
    promptText: buildPlatformConstraintPrompt(),
    pageTypePrompt: buildPageTypeConstraintPrompt(),
  };
}

export async function writePlatformCatalog(
  outDir = path.join(process.cwd(), "agent-output")
): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const file = path.join(outDir, "platform-catalog.json");
  await writeFile(file, JSON.stringify(getPlatformCatalogJson(), null, 2), "utf-8");
  return file;
}
