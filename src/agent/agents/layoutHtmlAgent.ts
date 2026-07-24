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
  materializeTemplatePage,
  materializeTemplatePages,
} from "../htmlTemplates/materialize";
import { defaultTemplateForPageType } from "../htmlTemplates/pageTypeMap";
import type { AnyTemplateSlots } from "../htmlTemplates/types";
import {
  buildLayoutHtmlSystemPrompt,
  buildLayoutHtmlUserPrompt,
  buildRepairHtmlPagePrompt,
  parseRequestedPageCount,
} from "../prompts/layoutHtml";
import {
  HtmlTemplateDeckLlmSchema,
  HtmlTemplateRepairLlmSchema,
} from "../schema";
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

type LlmTemplatePage = {
  pageId: string;
  pageType: PageType;
  templateId?: string;
  slots: Record<string, unknown>;
};

function clampTemplatePages(
  pages: LlmTemplatePage[],
  requested?: number
): LlmTemplatePage[] {
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
  if (list.length < PAGE_DEFAULT_MIN) {
    console.warn(
      `[LayoutHtml] 未指定页数却只生成 ${list.length} 页（建议 ${PAGE_DEFAULT_MIN}～${PAGE_MAX}）`
    );
  }
  return list;
}

function mockSlotsForPage(
  pageType: PageType,
  index: number,
  theme: ThemeToken
): Record<string, unknown> {
  const pageId = `page_${index + 1}`;
  const name = theme.templateName || "演示文稿";
  switch (pageType) {
    case "hero":
      return {
        title: name,
        subtitle: "平台稳定性、交付效率与设计系统落地回顾",
        footer: "WEB PLATFORM · BRIEF",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt:
          "Cinematic dark editorial 16:9 background, soft vignette, darker lower band for title, no text no logos",
      };
    case "close":
      return {
        title: "谢谢",
        subtitle: "把约束变成可交付的版式",
        contact: "platform@example.com",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt:
          "Quiet dark close background, soft vignette, no text no logos",
      };
    case "metrics":
      return {
        title: "年度关键成果",
        metrics: [
          { value: "40%", label: "首屏性能提升" },
          { value: "95%", label: "代码复用率" },
          { value: "12", label: "核心模块数" },
        ],
        footer: "基于自建监控与评审口径",
      };
    case "pillars":
      return {
        title: "三件必须做对的事",
        pillars: [
          {
            iconName: "Lightning",
            title: "稳定编译",
            body: "HTML→坐标路径可复现。",
          },
          {
            iconName: "Aiming",
            title: "版式约束",
            body: "槽位固定，内容可变。",
          },
          {
            iconName: "CheckOne",
            title: "可审阅",
            body: "预览与编辑器同源测量。",
          },
        ],
      };
    case "agenda":
      return {
        title: "今日议程",
        items: [
          { title: "背景", body: "为什么模板化" },
          { title: "版式", body: "20 套签名构图" },
          { title: "槽位", body: "JSON → HTML" },
          { title: "接入", body: "流水线与门禁" },
        ],
      };
    case "problem":
      return {
        title: "自由 HTML 不稳定",
        body: "模型一次生成整页，版式漂移与测量失败同时出现。",
        points: ["构图不一致", "几何难排查", "修复成本高"],
      };
    case "solution":
      return {
        title: "解法：模板 + 槽位",
        steps: [
          { title: "选型", body: "按 pageType 选套" },
          { title: "填槽", body: "只写内容字段" },
          { title: "编译", body: "测量导出 JSON" },
        ],
      };
    case "evidence":
      return {
        title: "证据：结构可复现",
        caption: "同一槽位多次渲染得到一致 HTML 结构。",
        bullets: ["利于 diff", "门禁聚焦内容", "改模板源即可"],
      };
    case "compare":
      return {
        title: "前后对比",
        leftTitle: "自由生成",
        leftBody: "构图漂移、卡片堆叠反复出现。",
        rightTitle: "模板填槽",
        rightBody: "签名固定，内容替换，路径更短。",
      };
    case "breath":
      return {
        quote: "约束不是审美的敌人，是交付的前提。",
        attribution: "— 工程述职简报",
      };
    case "team":
      return {
        title: "核心角色",
        members: [
          { name: "版式", role: "Design", blurb: "固化构图。" },
          { name: "编译", role: "Pipeline", blurb: "测量导出。" },
          { name: "内容", role: "Agent", blurb: "选套填槽。" },
        ],
      };
    case "timeline":
      return {
        title: "里程碑",
        steps: [
          { label: "Q1", detail: "四页 MVP" },
          { label: "Q2", detail: "20 套扩展" },
          { label: "Q3", detail: "Agent 接槽" },
          { label: "Q4", detail: "主题族扩展" },
        ],
      };
    default:
      return { title: `第 ${index + 1} 页`, subtitle: String(pageType) };
  }
}

function mockHtmlDeck(theme: ThemeToken, userPrompt: string): HtmlDeck {
  const requested = parseRequestedPageCount(userPrompt);
  const seq = DEFAULT_PAGE_TYPE_SEQUENCE.slice(
    0,
    requested ?? DEFAULT_PAGE_TYPE_SEQUENCE.length
  );
  const rawPages = seq.map((pageType, i) => ({
    pageId: `page_${i + 1}`,
    pageType,
    templateId: defaultTemplateForPageType(pageType),
    slots: mockSlotsForPage(pageType, i, theme),
  }));
  const pages = materializeTemplatePages(rawPages, theme).map((p) => ({
    pageId: p.pageId,
    pageType: p.pageType,
    templateId: p.templateId,
    slots: p.slots as unknown as Record<string, unknown>,
    html: p.html,
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
        push(
          m[1],
          m[2] || "illustration, no text",
          page.pageId,
          400,
          400,
          "illustration"
        );
      }
    }

    const bgKey = html.match(/data-bg-image-key=["']([^"']+)["']/)?.[1];
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

function toHtmlSlidePages(
  pages: LlmTemplatePage[],
  theme: ThemeToken
): HtmlSlidePage[] {
  return materializeTemplatePages(pages, theme).map((p) => ({
    pageId: p.pageId,
    pageType: p.pageType,
    templateId: p.templateId,
    slots: p.slots as unknown as Record<string, unknown>,
    html: p.html,
  }));
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
    parse: (j) => HtmlTemplateDeckLlmSchema.parse(j),
  });

  const pages = toHtmlSlidePages(
    clampTemplatePages(raw.pages as LlmTemplatePage[], requested),
    theme
  );
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
          templateId: page.templateId,
          slots: page.slots ?? {},
          instruction,
        }),
      },
    ],
    parse: (j) => HtmlTemplateRepairLlmSchema.parse(j),
  });

  const pageType = (fixed.pageType || page.pageType) as PageType;
  const rendered = materializeTemplatePage(
    {
      pageId: page.pageId,
      pageType,
      templateId: fixed.templateId || page.templateId,
      slots: fixed.slots,
    },
    deck.theme
  );

  const pages = deck.pages.map((p) =>
    p.pageId === pageId
      ? {
          pageId: rendered.pageId,
          pageType: rendered.pageType,
          templateId: rendered.templateId,
          slots: rendered.slots as unknown as Record<string, unknown>,
          html: rendered.html,
        }
      : p
  );
  const next: HtmlDeck = { ...deck, pages, drawTasks: [] };
  next.drawTasks = extractDrawTasksFromDeck(next);
  return next;
}

/** 供外部直接用槽位渲染一页 */
export function renderPageFromSlots(opts: {
  pageId: string;
  pageType: PageType;
  templateId?: string;
  slots: AnyTemplateSlots | Record<string, unknown>;
  theme: ThemeToken;
}): HtmlSlidePage {
  const rendered = materializeTemplatePage(
    {
      pageId: opts.pageId,
      pageType: opts.pageType,
      templateId: opts.templateId,
      slots: opts.slots,
    },
    opts.theme
  );
  return {
    pageId: rendered.pageId,
    pageType: rendered.pageType,
    templateId: rendered.templateId,
    slots: rendered.slots as unknown as Record<string, unknown>,
    html: rendered.html,
  };
}
