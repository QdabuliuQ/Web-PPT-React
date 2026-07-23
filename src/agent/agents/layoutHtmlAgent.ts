import type { AgentRuntimeConfig } from "../config";
import { PLATFORM_LIMITS } from "../catalog";
import { chatJson } from "../clients/llm";
import {
  buildGlobalBgDrawTask,
  enrichImagePrompt,
  mapAspectRatio,
} from "../image/promptSpec";
import { DEFAULT_PAGE_TYPE_SEQUENCE } from "../layout/sequence";
import { PAGE_TYPE_LAYOUTS } from "../layout/pageTypes";
import {
  buildLayoutHtmlSystemPrompt,
  buildLayoutHtmlUserPrompt,
  buildRepairHtmlPagePrompt,
  parseRequestedPageCount,
} from "../prompts/layoutHtml";
import { HtmlDeckLlmSchema, HtmlSlidePageSchema } from "../schema";
import {
  appendPaletteToImagePrompt,
  buildPaletteHint,
} from "../theme/colorPrompt";
import type {
  DrawTask,
  HtmlDeck,
  HtmlSlidePage,
  MetaJson,
  PageType,
  ThemeToken,
} from "../types";

const PAGE_MIN = PLATFORM_LIMITS.agentPagesHtml.min;
const PAGE_MAX = PLATFORM_LIMITS.agentPagesHtml.max;
const PAGE_DEFAULT_MIN = PLATFORM_LIMITS.agentPages.min;

function clampPages(
  pages: HtmlSlidePage[],
  requested?: number
): HtmlSlidePage[] {
  let list = pages.map((p, i) => ({
    ...p,
    pageId: p.pageId || `page_${i + 1}`,
  }));

  if (requested != null) {
    if (list.length > requested) list = list.slice(0, requested);
    if (list.length < requested) {
      throw new Error(
        `页数 ${list.length} 少于用户要求的 ${requested} 页，请重新生成`
      );
    }
    return list;
  }

  if (list.length > PAGE_MAX) return list.slice(0, PAGE_MAX);
  if (list.length < PAGE_MIN) {
    throw new Error(`页数 ${list.length} 少于下限 ${PAGE_MIN}`);
  }
  // 未指定时若明显偏少，仍接受 ≥1，但提示日志由上层处理
  if (list.length < PAGE_DEFAULT_MIN) {
    console.warn(
      `[LayoutHtml] 未指定页数却只生成 ${list.length} 页（建议 ${PAGE_DEFAULT_MIN}～${PAGE_MAX}）`
    );
  }
  return list;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function mockPageHtml(
  pageType: PageType,
  index: number,
  theme: ThemeToken
): string {
  const bg = theme.background || "#0B1220";
  const fg = theme.textOnDark || "#FFFFFF";
  const muted = theme.textOnLight || "#B8C0CC";
  const accent = theme.primary || "#F5B942";
  const title =
    pageType === "hero"
      ? theme.templateName || "演示文稿"
      : pageType === "close"
        ? "谢谢"
        : `第 ${index + 1} 页 · ${pageType}`;
  const body =
    pageType === "metrics"
      ? "核心指标示意"
      : "本页概述观点与路径，HTML 流水线 mock。";

  const extra =
    pageType === "metrics"
      ? `
  <div style="display:flex;gap:20px;margin-top:36px;">
    ${[1, 2, 3]
      .map(
        (n) => `
    <div style="position:relative;flex:1;height:200px;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="#FFFFFF"
        style="position:absolute;inset:0;background:#fff;border-radius:16px;"></div>
      <div style="position:relative;padding:24px;display:flex;flex-direction:column;gap:8px;">
        <div data-element="1" data-type="text" data-font-size="14" data-color="#6B7280" data-placement="left-center"
          style="font-size:14px;color:#6B7280;">指标 ${n}</div>
        <div data-element="1" data-type="text" data-font-size="36" data-bold data-color="#111827" data-placement="left-center"
          style="font-size:36px;font-weight:700;color:#111;">${20 + n * 10}%</div>
      </div>
    </div>`
      )
      .join("")}
  </div>`
      : pageType === "hero" || pageType === "close"
        ? `<div data-element="1" data-type="image" data-asset-key="page_${index + 1}_img"
        data-image-prompt="Clean editorial illustration matching page topic, soft daylight, restrained theme accents, concrete subject, no abstract filler only, no readable text, no logos, no watermark"
        data-border-radius="0"
        style="display:none;width:1px;height:1px;"></div>`
        : "";

  const bgKey =
    pageType === "hero" || pageType === "close"
      ? ` data-bg-image-key="page_${index + 1}_bg" data-bg-image-prompt="Cinematic 16:9 hero background, darker midtones with soft vignette, clear darker center and lower band for light title overlay, atmospheric corporate mood using theme colors, no readable text, no logos, no pale white wash"`
      : "";

  return `<section id="slide" data-page-id="page_${index + 1}" data-bg="${escapeAttr(bg)}"${bgKey}
  style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(bg)};box-sizing:border-box;padding:48px 56px;font-family:${escapeAttr(theme.fontTitle || "PingFang SC")},sans-serif;color:${escapeAttr(fg)};">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
    <div data-element="1" data-type="icon" data-icon-name="Lightning" data-icon-theme="outline"
      style="width:32px;height:32px;flex-shrink:0;background:${escapeAttr(accent)};border-radius:8px;"></div>
    <div data-element="1" data-type="text" data-font-size="30" data-bold data-color="${escapeAttr(fg)}" data-placement="left-center"
      style="font-size:30px;font-weight:700;line-height:1.2;">${escapeAttr(title)}</div>
  </div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(accent)}"
    style="width:48px;height:4px;background:${escapeAttr(accent)};margin-bottom:24px;"></div>
  <div data-element="1" data-type="text" data-font-size="16" data-color="${escapeAttr(muted)}" data-placement="left-top" data-line-height="1.5"
    style="font-size:16px;line-height:1.5;max-width:640px;color:${escapeAttr(muted)};">${escapeAttr(body)}</div>
  ${extra}
</section>`;
}

function mockHtmlDeck(theme: ThemeToken, userPrompt: string): HtmlDeck {
  const requested = parseRequestedPageCount(userPrompt);
  const seq = DEFAULT_PAGE_TYPE_SEQUENCE.slice(
    0,
    requested ?? DEFAULT_PAGE_TYPE_SEQUENCE.length
  );
  const pages = seq.map((pageType, i) => ({
    pageId: `page_${i + 1}`,
    pageType,
    html: mockPageHtml(pageType, i, theme),
  }));
  const deck: HtmlDeck = {
    version: "html-1.0",
    name: theme.templateName || userPrompt.slice(0, 40) || "HTML Deck",
    theme,
    pages,
    drawTasks: [],
  };
  deck.drawTasks = extractDrawTasksFromDeck(deck);
  return deck;
}

/** 从 HTML 抽取生图任务 */
export function extractDrawTasksFromDeck(deck: HtmlDeck): DrawTask[] {
  const tasks: DrawTask[] = [];
  const seen = new Set<string>();
  const paletteHint = buildPaletteHint(deck.theme);

  const push = (
    assetKey: string,
    prompt: string,
    pageId: string,
    width: number,
    height: number,
    kind: "hero" | "illustration" | "texture"
  ) => {
    if (!assetKey || seen.has(assetKey)) return;
    seen.add(assetKey);
    const aspectRatio = mapAspectRatio(width, height);
    tasks.push({
      assetKey,
      prompt: enrichImagePrompt({
        basePrompt: appendPaletteToImagePrompt(prompt, deck.theme),
        width,
        height,
        kind,
        aspectRatio,
        paletteHint,
      }),
      scope: "page",
      pageId,
      width,
      height,
      aspectRatio,
      imageKind: kind,
    });
  };

  for (const page of deck.pages) {
    const html = page.html;
    const imgRe =
      /data-type=["']image["'][^>]*data-asset-key=["']([^"']+)["'][^>]*data-image-prompt=["']([^"']*)["']/gi;
    const imgRe2 =
      /data-asset-key=["']([^"']+)["'][^>]*data-type=["']image["'][^>]*data-image-prompt=["']([^"']*)["']/gi;
    for (const re of [imgRe, imgRe2]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html))) {
        push(m[1], m[2] || "illustration, no text", page.pageId, 400, 400, "illustration");
      }
    }

    const bgKey =
      html.match(/data-bg-image-key=["']([^"']+)["']/)?.[1] ||
      html.match(/data-bg-image-key=["']([^"']+)["']/)?.[1];
    const bgPrompt =
      html.match(/data-bg-image-prompt=["']([^"']*)["']/)?.[1] ||
      "cinematic wide 16:9 hero background, darker midtones, soft vignette, clear darker band for white title overlay, atmospheric corporate mood, no text, no logos, no pale white wash";
    if (bgKey) {
      push(bgKey, bgPrompt, page.pageId, 1000, 562, "hero");
    }
  }

  if (deck.theme.globalBgPrompt || deck.theme.globalDecorPrompt) {
    tasks.push(
      buildGlobalBgDrawTask(
        deck.theme.globalBgPrompt ||
          deck.theme.globalDecorPrompt ||
          "soft abstract editorial atmosphere",
        paletteHint
      )
    );
  }

  return tasks;
}

/** 将 HtmlDeck 转为兼容 MetaJson（空 slots，供 Gate/Score） */
export function htmlDeckToCompatMeta(deck: HtmlDeck): MetaJson {
  return {
    version: "1.0",
    theme: deck.theme,
    pages: deck.pages.map((p) => ({
      pageId: p.pageId,
      pageType: p.pageType,
      layoutKey: PAGE_TYPE_LAYOUTS[p.pageType][0],
      slots: [],
    })),
    drawTasks: deck.drawTasks,
  };
}

export async function runLayoutHtmlAgent(opts: {
  config: AgentRuntimeConfig;
  theme: ThemeToken;
  userPrompt: string;
}): Promise<HtmlDeck> {
  const { config, theme, userPrompt } = opts;

  if (config.mock) {
    return mockHtmlDeck(theme, userPrompt);
  }

  const requested = parseRequestedPageCount(userPrompt);
  const raw = await chatJson({
    config,
    messages: [
      { role: "system", content: buildLayoutHtmlSystemPrompt(theme) },
      { role: "user", content: buildLayoutHtmlUserPrompt(userPrompt) },
    ],
    parse: (j) => HtmlDeckLlmSchema.parse(j),
  });

  const pages = clampPages(raw.pages, requested);
  const deck: HtmlDeck = {
    version: "html-1.0",
    name: raw.name,
    theme,
    pages,
    drawTasks: [],
  };
  deck.drawTasks = extractDrawTasksFromDeck(deck);
  return deck;
}

export async function repairHtmlPage(opts: {
  config: AgentRuntimeConfig;
  deck: HtmlDeck;
  pageId: string;
  instruction: string;
}): Promise<HtmlDeck> {
  const { config, deck, pageId, instruction } = opts;
  const page = deck.pages.find((p) => p.pageId === pageId);
  if (!page) return deck;

  if (config.mock) {
    return deck;
  }

  const fixed = await chatJson({
    config,
    messages: [
      { role: "system", content: buildLayoutHtmlSystemPrompt(deck.theme) },
      {
        role: "user",
        content: buildRepairHtmlPagePrompt({
          pageId: page.pageId,
          pageType: page.pageType,
          html: page.html,
          instruction,
        }),
      },
    ],
    parse: (j) => HtmlSlidePageSchema.parse(j),
  });

  const pages = deck.pages.map((p) =>
    p.pageId === pageId
      ? { ...p, html: fixed.html, pageType: fixed.pageType || p.pageType }
      : p
  );
  const next: HtmlDeck = { ...deck, pages, drawTasks: [] };
  next.drawTasks = extractDrawTasksFromDeck(next);
  return next;
}
