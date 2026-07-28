import type { AgentRuntimeConfig } from "../config";
import { PLATFORM_LIMITS } from "../catalog";
import { chatJson } from "../clients/llm";
import {
  buildGlobalBgDrawTask,
  enrichImagePrompt,
  mapAspectRatio,
  parseHtmlImageKind,
  type ImageKind,
} from "../image/promptSpec";
import { pageTypesFromPlan, pickPagePlan } from "../layout/sequence";
import { PAGE_TYPE_LAYOUTS } from "../layout/pageTypes";
import {
  materializeTemplatePage,
  materializeTemplatePages,
} from "../htmlTemplates/materialize";
import {
  diversifyTemplateIds,
  defaultTemplateForPageType,
  freshRunSeed,
  isBreathingPage,
} from "../htmlTemplates/pageTypeMap";
import { assembleSlideFromModules } from "../modules/assemble";
import { resolveVisualFamily } from "../theme/visualFamily";
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
import { storyPageToSlots } from "../story/mapToSlots";
import type { StoryDeck } from "../story/types";
import type { DesignProfile } from "../design/director";
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
          "Cinematic dark editorial 16:9 background, real materials soft directional light, darker top-left band for typography, gentle vignette, no tech grid no HUD no stickers no cheap illustration no text no logos",
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

/** 每场至少 1 页呼吸页（breath / 超大 KPI / 全宽 evidence） */
function ensureBreathingPage<
  T extends {
    pageId: string;
    pageType: PageType;
    templateId?: string | null;
    slots: Record<string, unknown>;
  },
>(pages: T[], seed: number, maxPages: number = PAGE_MAX): T[] {
  if (
    pages.some((p) =>
      isBreathingPage({ pageType: p.pageType, templateId: p.templateId })
    )
  ) {
    return pages;
  }

  const closeIdx = pages.findIndex((p) => p.pageType === "close");
  const insertAt = closeIdx > 0 ? closeIdx : Math.max(1, pages.length - 1);

  if (pages.length < maxPages) {
    const breath = {
      pageId: "page_breath",
      pageType: "breath" as PageType,
      templateId: "breath-billboard",
      slots: {
        quote: "留白不是空，是敢把重点说清楚。",
        attribution: "DESIGN PRINCIPLE",
      },
    } as unknown as T;
    const next = [...pages];
    next.splice(insertAt, 0, breath);
    return next.map((p, i) => ({ ...p, pageId: `page_${i + 1}` }));
  }

  const metricsIdx = pages.findIndex((p) => p.pageType === "metrics");
  if (metricsIdx >= 0) {
    return pages.map((p, i) =>
      i === metricsIdx ? { ...p, templateId: "metrics-monument" } : p
    );
  }

  const evidenceIdx = pages.findIndex((p) => p.pageType === "evidence");
  if (evidenceIdx >= 0) {
    return pages.map((p, i) =>
      i === evidenceIdx ? { ...p, templateId: "evidence-plaza" } : p
    );
  }

  const denseIdx = pages.findIndex(
    (p, i) =>
      i > 0 &&
      i < pages.length - 1 &&
      ["pillars", "problem", "solution", "agenda", "team"].includes(p.pageType)
  );
  if (denseIdx >= 0) {
    const title =
      typeof pages[denseIdx]!.slots?.title === "string"
        ? String(pages[denseIdx]!.slots.title)
        : "把重点说清楚";
    return pages.map((p, i) =>
      i === denseIdx
        ? {
            ...p,
            pageType: "breath" as PageType,
            templateId: "breath-billboard",
            slots: {
              quote: title.slice(0, 48),
              attribution: "BRIEF",
            },
          }
        : p
    );
  }

  const target = Math.max(1, pages.length - 2);
  void seed;
  return pages.map((p, i) =>
    i === target
      ? {
          ...p,
          pageType: "breath" as PageType,
          templateId: "breath-billboard",
          slots: {
            quote: "敢空，才有高级感。",
            attribution: "BRIEF",
          },
        }
      : p
  );
}

function mockHtmlDeck(
  theme: ThemeToken,
  userPrompt: string,
  designProfile?: DesignProfile
): HtmlDeck {
  const requested = parseRequestedPageCount(userPrompt);
  const plan = pickPagePlan(userPrompt, designProfile);
  const seq = pageTypesFromPlan(plan, requested);
  const seed = freshRunSeed(userPrompt);
  const family = resolveVisualFamily(theme.visualFamily);
  let rawPages = seq.map((pageType, i) => ({
    pageId: `page_${i + 1}`,
    pageType,
    templateId: defaultTemplateForPageType(pageType),
    slots: {
      ...mockSlotsForPage(pageType, i, theme),
      density: theme.visualFamily === "monument" ? "airy" : "normal",
      emphasis:
        pageType === "metrics"
          ? "number"
          : pageType === "evidence"
            ? "image"
            : "title",
      align: "left",
    },
  }));
  rawPages = ensureBreathingPage(
    diversifyTemplateIds(rawPages, seed, family, designProfile),
    seed,
    requested ?? PAGE_MAX
  );
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
export function extractDrawTasksFromDeck(
  deck: HtmlDeck,
  runId?: string
): DrawTask[] {
  const tasks: DrawTask[] = [];
  const seen = new Set<string>();
  const paletteHint = buildPaletteHint(deck.theme);
  const runTag = runId || `t${Date.now().toString(16).slice(-6)}`;

  const push = (
    assetKey: string,
    prompt: string,
    pageId: string,
    width: number,
    height: number,
    kind: ImageKind
  ) => {
    if (!assetKey || seen.has(assetKey)) return;
    seen.add(assetKey);
    const aspectRatio = mapAspectRatio(width, height);
    const variedPrompt = /variation:/i.test(prompt)
      ? prompt
      : `${prompt.replace(/[.\s]+$/, "")}. variation:${runTag}/${pageId}/${assetKey}`;
    tasks.push({
      assetKey,
      prompt: enrichImagePrompt({
        basePrompt: appendPaletteToImagePrompt(variedPrompt, deck.theme),
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
    // 逐个 image 节点解析，属性顺序不限
    const tagRe = /<[^>]*data-type=["']image["'][^>]*>/gi;
    let tagMatch: RegExpExecArray | null;
    while ((tagMatch = tagRe.exec(html))) {
      const tag = tagMatch[0];
      const assetKey = tag.match(/data-asset-key=["']([^"']+)["']/i)?.[1];
      const prompt =
        tag.match(/data-image-prompt=["']([^"']*)["']/i)?.[1] ||
        "illustration, no text";
      if (!assetKey) continue;
      const kind = parseHtmlImageKind(
        tag.match(/data-image-kind=["']([^"']*)["']/i)?.[1]
      );
      const style = tag.match(/style=["']([^"']*)["']/i)?.[1] || "";
      const wMatch = style.match(/(?:^|;)\s*width\s*:\s*([\d.]+)px/i);
      const hMatch = style.match(/(?:^|;)\s*height\s*:\s*([\d.]+)px/i);
      let width = wMatch ? Number(wMatch[1]) : 0;
      let height = hMatch ? Number(hMatch[1]) : 0;
      if (!(width > 0 && height > 0)) {
        if (kind === "cutout") {
          width = 512;
          height = 512;
        } else if (kind === "photo") {
          width = 800;
          height = 600;
        } else {
          width = 400;
          height = 400;
        }
      }
      push(assetKey, prompt, page.pageId, width, height, kind);
    }

    const bgKey = html.match(/data-bg-image-key=["']([^"']+)["']/)?.[1];
    const bgPrompt =
      html.match(/data-bg-image-prompt=["']([^"']*)["']/)?.[1] ||
      "editorial wide photograph as media panel, atmospheric subject, natural light, no text, no logos";
    if (bgKey) {
      // 遗留整页底图路径：仍生图，但 Gate 会要求字区有实色底板
      push(bgKey, bgPrompt, page.pageId, 1000, 562, "photo");
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
  /** A：故事稿优先；有则不再让 Layout LLM 重写内容 */
  story?: StoryDeck;
  designProfile?: DesignProfile;
  brief?: import("../brief/types").DesignBrief;
}): Promise<HtmlDeck> {
  const { config, theme, userPrompt, story, designProfile, brief } = opts;

  if (story) {
    return layoutFromStory({ config, theme, userPrompt, story, designProfile });
  }

  if (config.mock) {
    return mockHtmlDeck(theme, userPrompt, designProfile);
  }

  const requested = parseRequestedPageCount(userPrompt);
  const catalogSeed = freshRunSeed(userPrompt);
  const family = resolveVisualFamily(
    designProfile?.visualFamily || brief?.visualFamily || theme.visualFamily
  );
  const raw = await chatJson({
    config,
    temperature: 0.82,
    messages: [
      {
        role: "system",
        content: buildLayoutHtmlSystemPrompt(theme, {
          catalogSeed,
          designProfile,
        }),
      },
      {
        role: "user",
        content: buildLayoutHtmlUserPrompt(userPrompt, theme, {
          runSeed: catalogSeed,
          designProfile,
          brief,
        }),
      },
    ],
    parse: (j) => HtmlTemplateDeckLlmSchema.parse(j),
  });

  const diversified = diversifyTemplateIds(
    clampTemplatePages(raw.pages as LlmTemplatePage[], requested),
    catalogSeed,
    family,
    designProfile
  );
  const withBreath = ensureBreathingPage(
    diversified,
    catalogSeed,
    requested ?? PAGE_MAX
  );
  const pages = toHtmlSlidePages(withBreath, theme);
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

/**
 * Story → 积木组装（B）或整页模板填槽（A 回落）
 * 内容全部来自 Story，Layout 不再二次编造文案。
 */
export function layoutFromStory(opts: {
  config: AgentRuntimeConfig;
  theme: ThemeToken;
  userPrompt: string;
  story: StoryDeck;
  designProfile?: DesignProfile;
}): HtmlDeck {
  const { theme, story } = opts;
  const designProfile = opts.designProfile || story.designProfile;
  const family = resolveVisualFamily(
    designProfile?.visualFamily || theme.visualFamily
  );
  const seed = freshRunSeed(`${story.runId}:${story.angle}:${opts.userPrompt}`);

  const forDiversify = story.pages.map((p) => ({
    pageType: p.pageType,
    templateId: null as string | null,
  }));
  const diversified = diversifyTemplateIds(
    forDiversify,
    seed,
    family,
    designProfile
  );

  const pages: HtmlSlidePage[] = story.pages.map((page, i) => {
    const assembled = assembleSlideFromModules(page, theme, story.runId);
    if (assembled) {
      console.log(
        `[LayoutHtml] ${page.pageId} via modules (${page.pageType}/${assembled.templateId.replace("modules:", "")})`
      );
      return {
        pageId: assembled.pageId,
        pageType: assembled.pageType,
        templateId: assembled.templateId,
        slots: assembled.slots,
        html: assembled.html,
      };
    }

    const templateId = diversified[i]?.templateId;
    const slots = storyPageToSlots(page, story.runId);
    const rendered = materializeTemplatePage(
      {
        pageId: page.pageId,
        pageType: page.pageType,
        templateId,
        slots,
      },
      theme
    );
    console.log(
      `[LayoutHtml] ${page.pageId} via template ${rendered.templateId}`
    );
    return {
      pageId: rendered.pageId,
      pageType: rendered.pageType,
      templateId: rendered.templateId,
      slots: rendered.slots as unknown as Record<string, unknown>,
      html: rendered.html,
    };
  });

  const deck: HtmlDeck = {
    version: "html-1.0",
    name: story.name,
    theme,
    pages,
    drawTasks: [],
  };
  deck.drawTasks = extractDrawTasksFromDeck(deck, story.runId);
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

  // 双平面结构缺陷：优先用积木强制 split 重装，避免 LLM 再选全幅叠字模板
  if (/\[unsafe-text-surface\]/.test(instruction)) {
    const slots = (page.slots || {}) as Record<string, unknown>;
    const runId = String(slots.runId || deck.name || "repair");
    const storyPage = {
      ...slots,
      pageId: page.pageId,
      pageType: page.pageType,
      claim: String(slots.claim || page.pageType),
      title: String(slots.title || page.pageId),
      imageIntent: String(
        slots.imageIntent ||
          slots.bgImagePrompt ||
          "editorial media panel, soft light, no text"
      ),
      composition: "split" as const,
      preferModules: true,
    };
    const assembled = assembleSlideFromModules(
      storyPage as import("../story/types").StoryPageDraft,
      deck.theme,
      runId,
      "split"
    );
    if (assembled) {
      const pages = deck.pages.map((p) =>
        p.pageId === pageId
          ? {
              pageId: assembled.pageId,
              pageType: assembled.pageType,
              templateId: assembled.templateId,
              slots: assembled.slots,
              html: assembled.html,
            }
          : p
      );
      const next: HtmlDeck = { ...deck, pages, drawTasks: [] };
      next.drawTasks = extractDrawTasksFromDeck(next, runId);
      return next;
    }
  }

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
