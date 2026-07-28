import type { Elements, Page } from "@/store/zustand/pptStore";
import { PLATFORM_LIMITS } from "../catalog";
import { PAGE_TYPE_LAYOUTS } from "../layout/pageTypes";
import { mapPageBackground } from "../theme/mapper";
import type { AssetMap, HtmlDeck, PageType, ThemeToken } from "../types";
import { resolveDocumentSrc } from "./assets";
import { mapMeasuredNodeToElement } from "./mapElement";
import { measureSlideHtml } from "./measure";
import { ensureTextAboveShapes, pruneOverlappingImages } from "./postProcess";

export type HtmlCompiledDocument = {
  name: string;
  theme: ThemeToken;
  gridSize: number;
  gridType: "grid" | "line" | "none";
  verticalLine: number[];
  horizontalLine: number[];
  rule: boolean;
  guideLineShow: boolean;
  keyboardToggle: boolean;
  pages: Page[];
};

async function compileHtmlPage(opts: {
  pageId: string;
  pageType?: PageType;
  html: string;
  theme: ThemeToken;
  assetMap: AssetMap;
  assetsDir?: string;
}): Promise<Page> {
  const { pageId, pageType, html, theme, assetMap, assetsDir } = opts;
  const measured = await measureSlideHtml({ html, assetMap, assetsDir });

  const elements: Elements[] = [];
  for (const node of measured.nodes) {
    const el = mapMeasuredNodeToElement(node, theme, assetMap);
    if (el) elements.push(el);
  }

  const pruned = ensureTextAboveShapes(pruneOverlappingImages(elements));

  if (pruned.length > PLATFORM_LIMITS.maxElementsPerPage) {
    pruned.length = PLATFORM_LIMITS.maxElementsPerPage;
  }

  const bgImageKey = measured.pageBgImageKey;
  const solidBg = measured.pageBg || theme.background || "#FFFFFF";
  let backgroundImage: string | undefined;
  if (bgImageKey) {
    backgroundImage = resolveDocumentSrc(bgImageKey, assetMap) || undefined;
  }

  const layoutKey =
    pageType && PAGE_TYPE_LAYOUTS[pageType]?.[0]
      ? PAGE_TYPE_LAYOUTS[pageType][0]
      : undefined;

  const bg = backgroundImage
    ? mapPageBackground(theme, layoutKey, backgroundImage)
    : {
        backgroundType: "solidColor" as const,
        background: solidBg,
        bgColor: solidBg,
        fgColor: theme.secondary,
        bgOpacity: 0.2,
      };

  return {
    id: measured.pageId || pageId,
    elements: pruned,
    visible: true,
    toggleInAnimation: "fadeIn",
    toggleInDuration: "default",
    toggleInDelay: "0s",
    autoToggle: false,
    autoToggleTime: 5,
    backgroundType: bg.backgroundType,
    background: bg.background,
    bgColor: bg.bgColor,
    fgColor: bg.fgColor,
    bgOpacity: bg.bgOpacity,
    remark: "",
    ...(bg.selectedTexture ? { selectedTexture: bg.selectedTexture } : {}),
    ...(bg.backgroundImage ? { backgroundImage: bg.backgroundImage } : {}),
  } as Page;
}

/**
 * HtmlDeck + AssetMap → 编辑器 document.json 结构（不经骨架）
 */
export async function compileHtmlDocument(
  deck: HtmlDeck,
  assetMap: AssetMap,
  opts?: { assetsDir?: string }
): Promise<HtmlCompiledDocument> {
  const pages: Page[] = [];
  for (const p of deck.pages) {
    const page = await compileHtmlPage({
      pageId: p.pageId,
      pageType: p.pageType,
      html: p.html,
      theme: deck.theme,
      assetMap,
      assetsDir: opts?.assetsDir,
    });
    pages.push(page);
  }

  return {
    name: deck.name,
    theme: deck.theme,
    gridSize: 10,
    gridType: "none",
    verticalLine: [],
    horizontalLine: [],
    rule: false,
    guideLineShow: false,
    keyboardToggle: true,
    pages,
  };
}

export { measureSlideHtml } from "./measure";
export {
  mapMeasuredNodeToElement,
  applyTextEditorChrome,
  TEXT_EDITOR_PADDING_PX,
  TEXT_EDITOR_SAFETY_PX,
} from "./mapElement";
export { ensureTextAboveShapes, pruneOverlappingImages } from "./postProcess";
