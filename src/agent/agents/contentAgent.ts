import type { AgentRuntimeConfig } from "../config";
import { PLATFORM_LIMITS } from "../catalog";
import { chatJson } from "../clients/llm";
import {
  buildDrawTaskFromSlot,
  buildGlobalBgDrawTask,
} from "../image/promptSpec";
import {
  DEFAULT_PAGE_TYPE_SEQUENCE,
  getLayout,
  listLayouts,
  pickPagePlan,
  resolvePageTypeAndLayout,
  type PagePlanItem,
} from "../layout";
import { normalizeMetaPage, truncatePageContents } from "../meta/normalize";
import { buildContentSystemPrompt } from "../prompts/content";
import { ContentAgentLlmSchema, MetaJsonSchema } from "../schema";
import type {
  DrawTask,
  MetaJson,
  MetaPage,
  ThemeToken,
} from "../types";
import { PAGE_TYPE_LAYOUTS } from "../layout/pageTypes";

const PAGE_MIN = PLATFORM_LIMITS.agentPages.min;
const PAGE_MAX = PLATFORM_LIMITS.agentPages.max;

/** 从 hint「优先 Xxx」解析白名单图标，否则回落 CheckOne */
function pickMockIconName(hint?: string): string {
  if (!hint) return "CheckOne";
  const m = hint.match(/优先\s*([A-Za-z][A-Za-z0-9]*)/);
  if (!m) return "CheckOne";
  return m[1];
}

/** 强制页数落在 6～10 */
function clampPages(pages: MetaPage[]): MetaPage[] {
  if (pages.length > PAGE_MAX) {
    return pages.slice(0, PAGE_MAX).map((p, i) => ({
      ...p,
      pageId: `page_${i + 1}`,
    }));
  }
  if (pages.length < PAGE_MIN) {
    throw new Error(
      `页数 ${pages.length} 少于下限 ${PAGE_MIN}，请重新生成`
    );
  }
  return pages;
}

function buildDrawTasks(pages: MetaPage[], theme?: ThemeToken): DrawTask[] {
  const tasks: DrawTask[] = [];
  for (const p of pages) {
    const layout = getLayout(p.layoutKey);
    for (const s of p.slots) {
      if (!s.assetKey || !s.imagePrompt) continue;
      const slot = layout.slots.find((x) => x.elementId === s.elementId);
      if (!slot || slot.type !== "image") continue;
      tasks.push(
        buildDrawTaskFromSlot({
          assetKey: s.assetKey,
          basePrompt: s.imagePrompt,
          slot,
          pageId: p.pageId,
          layoutKey: p.layoutKey,
        })
      );
    }
  }
  if (theme?.globalBgPrompt || theme) {
    tasks.push(
      buildGlobalBgDrawTask(
        theme.globalBgPrompt ||
          theme.globalDecorPrompt ||
          "soft abstract editorial atmosphere, muted paper-like texture, subtle gradient, no objects, no text"
      )
    );
  }
  return tasks;
}

function mockContent(theme: ThemeToken, plan?: PagePlanItem[]): MetaJson {
  const items: PagePlanItem[] =
    plan?.length
      ? plan
      : DEFAULT_PAGE_TYPE_SEQUENCE.map((pageType) => ({
          pageType,
          layoutKey: PAGE_TYPE_LAYOUTS[pageType][0],
        }));
  const pages: MetaPage[] = items.map((item, i) => {
      const { pageType, layoutKey } = item;
      const layout = getLayout(layoutKey);
      const pageId = `page_${i + 1}`;
      const slots = layout.slots.map((s) => {
        const base = { role: s.role, elementId: s.elementId };
        if (s.type === "text") {
          if (s.role === "decor") {
            return { ...base };
          }
          const samples: Record<string, string> = {
            title: theme.templateName,
            subtitle:
              pageType === "team"
                ? "姓名 · 职位"
                : "专业 · 清晰 · 可商用",
            body:
              pageType === "breath"
                ? "「用可验证的增长，换下一轮信任。」"
                : "本页概述核心观点与落地路径：场景清晰、动作可执行、结果可量化。",
            bullet:
              pageType === "timeline"
                ? `里程碑事件：${s.elementId}`
                : pageType === "team"
                  ? "前大厂负责人，主导过千万级产品。"
                  : `要点：${s.elementId.replace(/_/g, " ")}，含可验证结果。`,
            metric:
              pageType === "timeline"
                ? s.elementId.endsWith("1")
                  ? "2022"
                  : s.elementId.endsWith("2")
                    ? "2023"
                    : s.elementId.endsWith("3")
                      ? "2024"
                      : "2025"
                : s.elementId.endsWith("1")
                  ? "128%"
                  : s.elementId.endsWith("2")
                    ? "￥2.4亿"
                    : "86万",
          };
          return {
            ...base,
            content: (samples[s.role] || s.hint || s.role).slice(
              0,
              s.maxChars || 100
            ),
          };
        }
        if (s.type === "shape") {
          const hintType = s.hint?.match(
            /优先\s*(rect|roundedRect|oval|diamond|triangle|star5)/
          )?.[1];
          const isCard =
            s.width >= 120 && s.height >= 80 && s.role === "decor";
          const isDot = s.width <= 40 && s.height <= 40;
          const isBar = s.height <= 12 || s.width <= 12;
          return {
            ...base,
            shapeType:
              hintType ||
              (isDot
                ? "oval"
                : isCard
                  ? "roundedRect"
                  : isBar || s.role === "decor"
                    ? "rect"
                    : "diamond"),
          };
        }
        if (s.type === "image") {
          const assetKey = `img_${pageId}_${s.elementId}`;
          return {
            ...base,
            assetKey,
            imagePrompt: `${theme.globalDecorPrompt || "modern editorial photo"}, ${layoutKey} ${s.hint || s.elementId}, concrete subject related to the page topic, no abstract texture filler`,
          };
        }
        if (s.type === "chart") {
          return {
            ...base,
            chartType: "line2",
            chartSeries: [
              { label: "Q1", value: 32 },
              { label: "Q2", value: 48 },
              { label: "Q3", value: 55 },
              { label: "Q4", value: 70 },
            ],
          };
        }
        if (s.type === "table") {
          return {
            ...base,
            tableData: {
              headers: ["指标", "本期", "上期", "同比"],
              rows: [
                ["营收", "￥1280万", "￥980万", "+30%"],
                ["毛利率", "62%", "58%", "+4pt"],
                ["活跃用户", "86万", "71万", "+21%"],
                ["复购率", "41%", "36%", "+5pt"],
              ],
            },
          };
        }
        if (s.type === "icon") {
          return { ...base, iconName: pickMockIconName(s.hint) };
        }
        return base;
      });
      return { pageId, pageType, layoutKey, slots };
    });

  return MetaJsonSchema.parse({
    version: "1.0",
    theme,
    pages,
    drawTasks: buildDrawTasks(pages, theme),
  });
}

export async function runContentAgent(opts: {
  config: AgentRuntimeConfig;
  theme: ThemeToken;
  userPrompt: string;
  /** 可选：直接指定 pageType+layout 计划 */
  pagePlan?: PagePlanItem[];
  /** @deprecated 使用 pagePlan；仅 layoutKey 时会反推 pageType */
  layoutSequence?: string[];
}): Promise<MetaJson> {
  const { config, theme, userPrompt } = opts;
  const suggested: PagePlanItem[] =
    opts.pagePlan?.length
      ? opts.pagePlan
      : opts.layoutSequence?.length
        ? opts.layoutSequence.map((layoutKey) =>
            resolvePageTypeAndLayout({ layoutKey })
          )
        : pickPagePlan(userPrompt);

  if (config.mock) {
    return mockContent(theme, suggested);
  }

  const layouts = listLayouts();
  const raw = await chatJson({
    config,
    messages: [
      { role: "system", content: buildContentSystemPrompt(layouts) },
      {
        role: "user",
        content: `主题：${JSON.stringify(theme)}\n用户需求：${userPrompt}\n建议页计划（可微调，须含 hero 与 close）：${suggested
          .map((p) => `${p.pageType}/${p.layoutKey}`)
          .join(" → ")}\n请生成 ${PAGE_MIN}～${PAGE_MAX} 页内容 JSON（硬限制）。`,
      },
    ],
    parse: (data) => ContentAgentLlmSchema.parse(data),
  });

  const pages: MetaPage[] = clampPages(
    raw.pages.map((p, i) => {
      const pageId = `page_${i + 1}`;
      const { pageType, layoutKey } = resolvePageTypeAndLayout({
        pageType: p.pageType,
        layoutKey: p.layoutKey,
      });
      const layout = getLayout(layoutKey);
      const byId = new Map(p.slots.map((s) => [s.elementId, s]));
      const slots = layout.slots.map((sk) => {
        const s = byId.get(sk.elementId);
        const assetKey =
          sk.type === "image" ? `img_${pageId}_${sk.elementId}` : undefined;
        const isCard =
          sk.type === "shape" &&
          sk.role === "decor" &&
          sk.width >= 120 &&
          sk.height >= 80;
        const isDot =
          sk.type === "shape" && sk.width <= 40 && sk.height <= 40;
        return {
          role: (s?.role || sk.role) as MetaPage["slots"][0]["role"],
          elementId: sk.elementId,
          content: s?.content,
          tableData: s?.tableData,
          chartSeries: s?.chartSeries,
          chartType: s?.chartType,
          imagePrompt:
            s?.imagePrompt ||
            (sk.type === "image"
              ? `${theme.globalDecorPrompt || "modern editorial photo"}, ${layout.layoutKey} ${sk.hint || sk.elementId}, concrete subject related to the page topic, no abstract texture filler`
              : undefined),
          iconName: s?.iconName,
          shapeType:
            s?.shapeType ||
            (sk.type === "shape"
              ? isDot
                ? "oval"
                : isCard
                  ? "roundedRect"
                  : "rect"
              : undefined),
          assetKey,
        };
      });
      return { pageId, pageType, layoutKey, slots };
    })
  );

  return MetaJsonSchema.parse({
    version: "1.0",
    theme,
    pages,
    drawTasks: buildDrawTasks(pages, theme),
  });
}

/** 定向回炉：仅重写指定页文案（mock 下缩短 content） */
export async function repairPageContent(opts: {
  config: AgentRuntimeConfig;
  meta: MetaJson;
  pageId: string;
  instruction: string;
}): Promise<MetaJson> {
  const { config, meta, pageId, instruction } = opts;
  const pageIndex = meta.pages.findIndex((p) => p.pageId === pageId);
  if (pageIndex < 0) return meta;
  const page = meta.pages[pageIndex];

  // 纯本地缩短：对比度等问题仍走 LLM，但结构永不被整页替换
  if (config.mock || /text-overflow/i.test(instruction)) {
    const fixed = truncatePageContents(normalizeMetaPage(page), 0.75);
    const pages = meta.pages.map((p, i) => (i === pageIndex ? fixed : p));
    return { ...meta, pages };
  }

  const layout = getLayout(page.layoutKey);
  let rawSlots: unknown[] = [];
  try {
    const raw = await chatJson({
      config,
      model: config.llmModelLight || config.llmModel,
      messages: [
        {
          role: "system",
          content:
            '你修复单页文案。只输出 JSON：{ "slots": [{ "elementId": string, "content"?: string, "imagePrompt"?: string, "iconName"?: string, "shapeType"?: string, "chartType"?: string, "chartSeries"?: object[], "tableData"?: { "headers": string[], "rows": (string|number)[][] } }] }。只改文案相关字段，必须带 elementId。禁止改坐标，禁止省略 elementId。',
        },
        {
          role: "user",
          content: `缺陷：${instruction}\n可改槽位：${JSON.stringify(
            layout.slots.map((s) => ({
              elementId: s.elementId,
              role: s.role,
              maxChars: s.maxChars,
            }))
          )}\n当前：${JSON.stringify(page.slots)}`,
        },
      ],
      parse: (data) => {
        const slots = (data as { slots?: unknown })?.slots;
        if (!Array.isArray(slots)) {
          throw new Error("repair 返回缺少 slots 数组");
        }
        return { slots };
      },
    });
    rawSlots = raw.slots;
  } catch (err) {
    console.warn(
      `[repair] LLM 回炉失败，回退本地截断:`,
      err instanceof Error ? err.message : err
    );
    const fixed = truncatePageContents(normalizeMetaPage(page), 0.75);
    const pages = meta.pages.map((p, i) => (i === pageIndex ? fixed : p));
    return { ...meta, pages };
  }

  // 只按 elementId 打补丁，保留原 role/assetKey/结构
  const updates = new Map<string, Record<string, unknown>>();
  for (const item of rawSlots) {
    if (!item || typeof item !== "object") continue;
    const id = (item as { elementId?: unknown }).elementId;
    if (typeof id !== "string" || !id) continue;
    updates.set(id, item as Record<string, unknown>);
  }

  const patched: MetaPage = {
    ...page,
    slots: page.slots.map((s) => {
      const u = updates.get(s.elementId);
      if (!u) return s;
      return {
        ...s,
        content:
          typeof u.content === "string" ? (u.content as string) : s.content,
        imagePrompt:
          typeof u.imagePrompt === "string"
            ? (u.imagePrompt as string)
            : s.imagePrompt,
        iconName:
          typeof u.iconName === "string" ? (u.iconName as string) : s.iconName,
        shapeType:
          typeof u.shapeType === "string"
            ? (u.shapeType as string)
            : s.shapeType,
        chartType:
          typeof u.chartType === "string"
            ? (u.chartType as string)
            : s.chartType,
        chartSeries: Array.isArray(u.chartSeries)
          ? (u.chartSeries as MetaJson["pages"][0]["slots"][0]["chartSeries"])
          : s.chartSeries,
        tableData:
          u.tableData &&
          typeof u.tableData === "object" &&
          Array.isArray((u.tableData as { headers?: unknown }).headers) &&
          Array.isArray((u.tableData as { rows?: unknown }).rows)
            ? (u.tableData as MetaJson["pages"][0]["slots"][0]["tableData"])
            : s.tableData,
      };
    }),
  };

  const normalized = normalizeMetaPage(patched);
  const pages = meta.pages.map((p, i) => (i === pageIndex ? normalized : p));
  return { ...meta, pages };
}
