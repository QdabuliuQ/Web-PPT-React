import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { MAX_ELEMENTS_PER_PAGE } from "@/constants/limits";
import type { Elements, Page } from "@/store/zustand/pptStore";
import { contrastRatio } from "../contrast";
import type { GateReport, PageDefect } from "../types";
import type { CompiledDocument } from "../compile/engine";

const VAGUE_TITLE_RE =
  /^(商业计划书|公司介绍|核心优势|未来展望|产品介绍|关于我们|总结|概述|目录|谢谢|thank\s*you|introduction|overview)$/i;

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
    // 大标题：字号偏大且较短
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

export function inspectPage(page: Page): PageDefect[] {
  const defects: PageDefect[] = [];

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
        ? page.bgColor || "#0F1115"
        : page.background || page.bgColor || "#FFFFFF"
      : page.bgColor || page.background || "#FFFFFF";

  const surfaceIsDark =
    page.backgroundType === "image" ||
    (typeof bg === "string" &&
      (() => {
        try {
          return contrastRatio("#FFFFFF", bg) > contrastRatio("#111111", bg);
        } catch {
          return false;
        }
      })());

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

      if (estimateTextOverflow(el)) {
        defects.push({
          pageId: page.id,
          elementId: el.id,
          kind: "text-overflow",
          message: `疑似文字溢出：${el.text?.slice(0, 20)}…`,
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

  // —— 观感软规则 ——
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

  // 有多个正文框却几乎没字（纯数据页豁免）
  if (!hasDataVisual && contentBoxes >= 2 && contentChars < 24) {
    defects.push({
      pageId: page.id,
      kind: "sparse-content",
      message: `文案过稀：约 ${contentChars} 字 / ${contentBoxes} 框，请补足信息密度`,
    });
  }

  // 单框塞满超长文（易溢出与拥挤）
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

/** Node 侧静态视觉门禁（浏览器 DOM 测高可后续接入 PreviewCanvas） */
export function runVisualGate(
  doc: CompiledDocument,
  iterations = 0
): GateReport {
  const defects = doc.pages.flatMap(inspectPage);
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
