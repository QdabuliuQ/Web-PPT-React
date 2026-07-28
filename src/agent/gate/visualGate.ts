import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { MAX_ELEMENTS_PER_PAGE } from "@/constants/limits";
import type { Elements, Page } from "@/store/zustand/pptStore";
import { contrastRatio } from "../contrast";
import type { GateReport, PageDefect } from "../types";
import type { CompiledDocument } from "../compile/engine";

const VAGUE_TITLE_RE =
  /^(商业计划书|公司介绍|核心优势|未来展望|产品介绍|关于我们|总结|概述|目录|谢谢|thank\s*you|introduction|overview)$/i;

type Box = { x: number; y: number; width: number; height: number };

function isOutOfBounds(el: Elements): boolean {
  return (
    el.x < -2 ||
    el.y < -2 ||
    el.x + el.width > CANVAS_WIDTH + 2 ||
    el.y + el.height > CANVAS_HEIGHT + 2
  );
}

function isAccentOrEmptyText(el: Extract<Elements, { type: "text" }>): boolean {
  return (
    (el.height || 0) <= 10 ||
    !(el.text || "").trim() ||
    !!(
      el.backgroundColor &&
      el.backgroundColor !== "transparent" &&
      el.color === el.backgroundColor
    )
  );
}

function intersectArea(a: Box, b: Box): number {
  const x0 = Math.max(a.x, b.x);
  const y0 = Math.max(a.y, b.y);
  const x1 = Math.min(a.x + a.width, b.x + b.width);
  const y1 = Math.min(a.y + a.height, b.y + b.height);
  if (x1 <= x0 || y1 <= y0) return 0;
  return (x1 - x0) * (y1 - y0);
}

function coverageRatio(text: Box, surface: Box): number {
  const area = Math.max(1, text.width * text.height);
  return intersectArea(text, surface) / area;
}

function isOpaqueSolidFill(fill: string | undefined, opacity = 1): boolean {
  if (opacity < 0.85) return false;
  const f = String(fill || "").trim();
  if (!f || f === "transparent") return false;
  if (/^rgba?\(/i.test(f)) {
    const m = f.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
    );
    if (!m) return false;
    const a = m[4] != null ? Number(m[4]) : 1;
    return a >= 0.85;
  }
  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(f) || /^[a-z]+$/i.test(f)
  );
}

function findTextSurfaceFill(
  el: Extract<Elements, { type: "text" }>,
  shapes: Array<Extract<Elements, { type: "shape" }>>
): string | undefined {
  const fs = el.fontSize || 16;
  const textBox: Box = {
    x: el.x,
    y: el.y,
    width: el.width,
    height: Math.max(el.height || 0, fs * 1.2),
  };
  const textZ = el.zIndex ?? 0;
  const candidates = shapes
    .filter((sh) => {
      if ((sh.zIndex ?? 0) >= textZ) return false;
      if (!isOpaqueSolidFill(sh.fill, sh.opacity ?? 1)) return false;
      if (sh.width < 80 || sh.height < 36) return false;
      return coverageRatio(textBox, sh) >= 0.85;
    })
    .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
  return candidates[0]?.fill;
}

/**
 * 双平面硬规则：可读文字不得裸落在 page 底图或 image 元素上。
 * 必须有更低 zIndex 的不透明 shape 覆盖 ≥85% 文字包围盒。
 */
function inspectTextSurfaces(page: Page): PageDefect[] {
  const defects: PageDefect[] = [];
  const els = page.elements || [];
  const hasPageBgImage = page.backgroundType === "image";
  const images = els.filter((e) => e.type === "image");
  const shapes = els.filter(
    (e): e is Extract<Elements, { type: "shape" }> => e.type === "shape"
  );

  if (!hasPageBgImage && images.length === 0) return defects;

  for (const el of els) {
    if (el.type !== "text" || isAccentOrEmptyText(el)) continue;
    const fs = el.fontSize || 16;
    if (fs < 12) continue;

    const textBox: Box = {
      x: el.x,
      y: el.y,
      width: el.width,
      height: Math.max(el.height || 0, fs * 1.2),
    };
    const textZ = el.zIndex ?? 0;

    if (findTextSurfaceFill(el, shapes)) continue;

    const overlapsImage = images.some((img) => {
      if ((img.zIndex ?? 0) >= textZ) return false;
      return coverageRatio(textBox, img) >= 0.2;
    });

    if (hasPageBgImage || overlapsImage) {
      defects.push({
        pageId: page.id,
        elementId: el.id,
        kind: "unsafe-text-surface",
        message:
          "文字落在照片/底图上且无实色底板；请改用 split/band/card 双平面构图（字在实色区，图在媒体区）",
      });
    }
  }

  return defects;
}

function collectTextStats(page: Page): {
  titleEls: Extract<Elements, { type: "text" }>[];
  contentChars: number;
  contentBoxes: number;
} {
  const titleEls: Extract<Elements, { type: "text" }>[] = [];
  let contentChars = 0;
  let contentBoxes = 0;
  for (const el of page.elements || []) {
    if (el.type !== "text") continue;
    if (isAccentOrEmptyText(el)) continue;
    const t = (el.text || "").trim();
    const fs = el.fontSize || 16;
    if (fs >= 28 && t.length <= 40) {
      titleEls.push(el);
    }
    if (fs < 40) {
      contentChars += t.length;
      contentBoxes += 1;
    }
  }
  return { titleEls, contentChars, contentBoxes };
}

export type InspectPageOptions = {
  /** 页面类型：hero/close 不做 sparse 密度抽检（应由 Layout 定调，且本就偏收束） */
  pageType?: string;
  /** 显式跳过 sparse（例如 HTML 流水线仅告警不回炉时仍可由调用方过滤） */
  skipSparseContent?: boolean;
};

export function inspectPage(
  page: Page,
  options: InspectPageOptions = {}
): PageDefect[] {
  const defects: PageDefect[] = [];
  const { pageType } = options;

  if ((page.elements?.length || 0) > MAX_ELEMENTS_PER_PAGE) {
    defects.push({
      pageId: page.id,
      kind: "too-many-elements",
      message: `元素数 ${page.elements.length} > ${MAX_ELEMENTS_PER_PAGE}`,
    });
  }

  const bg =
    page.backgroundType === "image" || page.backgroundType === "solidColor"
      ? page.backgroundType === "image"
        ? page.bgColor || page.background || "#0F1115"
        : page.background || page.bgColor || "#FFFFFF"
      : page.bgColor || page.background || "#FFFFFF";

  const surfaceIsDark =
    typeof bg === "string" &&
    (() => {
      try {
        return contrastRatio("#FFFFFF", bg) > contrastRatio("#111111", bg);
      } catch {
        return page.backgroundType === "image";
      }
    })();
  const shapes = (page.elements || []).filter(
    (e): e is Extract<Elements, { type: "shape" }> => e.type === "shape"
  );

  for (const el of page.elements || []) {
    if (isOutOfBounds(el)) {
      defects.push({
        pageId: page.id,
        elementId: el.id,
        kind: "out-of-bounds",
        message: `元素越界 (${el.x},${el.y},${el.width},${el.height})`,
      });
    }

    if (el.type === "text") {
      if (isAccentOrEmptyText(el)) continue;

      const ownTextBg =
        el.backgroundColor &&
        el.backgroundColor !== "transparent" &&
        !String(el.backgroundColor).startsWith("rgba(0,0,0")
          ? el.backgroundColor
          : undefined;
      const textBg =
        ownTextBg ||
        findTextSurfaceFill(el, shapes) ||
        (surfaceIsDark ? "#1A1A1A" : bg);
      // 有底图时颜色对比交给 unsafe-text-surface；此处只查实色页
      if (
        page.backgroundType !== "image" &&
        contrastRatio(el.color || "#000", textBg) < 4.5
      ) {
        defects.push({
          pageId: page.id,
          elementId: el.id,
          kind: "contrast",
          message: `对比度不足 color=${el.color} bg=${textBg}`,
        });
      }
    }

    if (el.type === "image" && !el.src) {
      defects.push({
        pageId: page.id,
        elementId: el.id,
        kind: "empty-image",
        message: "图片 src 为空",
      });
    }
  }

  defects.push(...inspectTextSurfaces(page));

  const { titleEls, contentChars, contentBoxes } = collectTextStats(page);
  for (const el of titleEls) {
    const t = (el.text || "").trim().replace(/[。.!！？?\s]/g, "");
    if (t.length >= 2 && VAGUE_TITLE_RE.test(t)) {
      defects.push({
        pageId: page.id,
        elementId: el.id,
        kind: "vague-title",
        message: `标题过于空泛：「${el.text}」，请改为具体利益/场景表述`,
      });
    }
  }

  const hasDataVisual = (page.elements || []).some(
    (el) => el.type === "chart" || el.type === "table"
  );

  // hero/close 允许收束版式；内容密度由 Layout 首轮负责，不在此用 sparse 逼回炉长文
  const skipSparse =
    pageType === "hero" ||
    pageType === "close" ||
    pageType === "breath" ||
    pageType === "metrics" ||
    options.skipSparseContent === true;

  if (
    !skipSparse &&
    !hasDataVisual &&
    contentBoxes >= 2 &&
    contentChars < 80
  ) {
    defects.push({
      pageId: page.id,
      kind: "sparse-content",
      message: `文案过稀：约 ${contentChars} 字 / ${contentBoxes} 框（内容页建议首轮 Layout 即写满）`,
    });
  }

  for (const el of page.elements || []) {
    if (el.type !== "text" || isAccentOrEmptyText(el)) continue;
    const len = (el.text || "").trim().length;
    if ((el.fontSize || 16) <= 18 && len > 360) {
      defects.push({
        pageId: page.id,
        elementId: el.id,
        kind: "dense-content",
        message: `单框文案过密（${len} 字），请压缩到要点`,
      });
    }
  }

  return defects;
}

export type RunVisualGateOptions = {
  /** pageId → pageType，用于 hero/close 跳过 sparse */
  pageTypeById?: Record<string, string>;
  /** 为 true 时所有页不做 sparse 缺陷（仍做结构硬伤） */
  skipSparseContent?: boolean;
};

/** VisualGate：结构硬规则（越界/对比度/空图/标题/密度/双平面字面） */
export async function runVisualGate(
  doc: CompiledDocument,
  iterations = 0,
  options: RunVisualGateOptions = {}
): Promise<GateReport> {
  const defects = doc.pages.flatMap((page) =>
    inspectPage(page, {
      pageType: options.pageTypeById?.[page.id],
      skipSparseContent: options.skipSparseContent,
    })
  );
  return {
    ok: defects.length === 0,
    defects,
    iterations,
  };
}

export function defectsToRepairInstructions(
  defects: PageDefect[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const d of defects) {
    const prev = map.get(d.pageId) || "";
    map.set(
      d.pageId,
      `${prev}\n[${d.kind}] ${d.elementId || ""} ${d.message}`.trim()
    );
  }
  return map;
}
