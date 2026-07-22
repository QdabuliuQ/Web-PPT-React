import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { MAX_ELEMENTS_PER_PAGE } from "@/constants/limits";
import type { Elements, Page } from "@/store/zustand/pptStore";
import { contrastRatio } from "../contrast";
import type { GateReport, PageDefect } from "../types";
import type { CompiledDocument } from "../compile/engine";
import {
  measureTextOverflowWithPuppeteer,
  overflowHitKey,
  type TextOverflowHit,
} from "./measureTextOverflow";

const VAGUE_TITLE_RE =
  /^(商业计划书|公司介绍|核心优势|未来展望|产品介绍|关于我们|总结|概述|目录|谢谢|thank\s*you|introduction|overview)$/i;

/** 无浏览器时的字符估高回退 */
function estimateTextOverflow(el: Elements): boolean {
  if (el.type !== "text") return false;
  const fontSize = el.fontSize || 16;
  const lineHeight = el.lineHeight || 1.4;
  const lineH = fontSize * lineHeight;
  const approxCharsPerLine = Math.max(1, Math.floor(el.width / (fontSize * 0.6)));
  const lines = Math.ceil((el.text?.length || 0) / approxCharsPerLine) || 1;
  return lines * lineH > el.height + 2;
}

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
  /** DOM 测高命中表；未传则用字符估高 */
  overflowHits?: Set<string>;
  overflowMetrics?: Map<string, TextOverflowHit>;
};

export function inspectPage(
  page: Page,
  options: InspectPageOptions = {}
): PageDefect[] {
  const defects: PageDefect[] = [];
  const { overflowHits, overflowMetrics } = options;

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

      const key = overflowHitKey(page.id, el.id);
      const overflow =
        overflowHits != null
          ? overflowHits.has(key)
          : estimateTextOverflow(el);
      if (overflow) {
        const m = overflowMetrics?.get(key);
        const detail = m
          ? `content=${Math.round(m.contentHeight)}px > box=${Math.round(m.clientHeight)}px`
          : `疑似文字溢出`;
        defects.push({
          pageId: page.id,
          elementId: el.id,
          kind: "text-overflow",
          message: `文字截断（${detail}）：${el.text?.slice(0, 20)}…`,
        });
      }
      const textBg =
        el.backgroundColor &&
        el.backgroundColor !== "transparent" &&
        !String(el.backgroundColor).startsWith("rgba(0,0,0")
          ? el.backgroundColor
          : surfaceIsDark
            ? "#1A1A1A"
            : bg;
      if (contrastRatio(el.color || "#000", textBg) < 4.5) {
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

  if (!hasDataVisual && contentBoxes >= 2 && contentChars < 24) {
    defects.push({
      pageId: page.id,
      kind: "sparse-content",
      message: `文案过稀：约 ${contentChars} 字 / ${contentBoxes} 框，请补足信息密度`,
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
  /** 默认 true：Puppeteer DOM 测高；失败回退字符估高 */
  useDomMeasure?: boolean;
};

/** VisualGate：硬规则 + Puppeteer 文本截断测高 */
export async function runVisualGate(
  doc: CompiledDocument,
  iterations = 0,
  options: RunVisualGateOptions = {}
): Promise<GateReport> {
  const useDom = options.useDomMeasure !== false;
  let overflowHits: Set<string> | undefined;
  let overflowMetrics: Map<string, TextOverflowHit> | undefined;

  if (useDom) {
    try {
      const hits = await measureTextOverflowWithPuppeteer(doc.pages);
      overflowHits = new Set(
        hits.map((h) => overflowHitKey(h.pageId, h.elementId))
      );
      overflowMetrics = new Map(
        hits.map((h) => [overflowHitKey(h.pageId, h.elementId), h])
      );
      if (hits.length > 0) {
        console.log(
          `[visualGate] DOM 测高截断 ${hits.length} 处`
        );
      }
    } catch (err) {
      console.warn(
        `[visualGate] Puppeteer 测高失败，回退字符估高:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const defects = doc.pages.flatMap((page) =>
    inspectPage(page, { overflowHits, overflowMetrics })
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
