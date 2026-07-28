import type { AgentRuntimeConfig } from "../config";
import { PLATFORM_LIMITS } from "../catalog";
import { chatJson } from "../clients/llm";
import { freshRunSeed } from "../htmlTemplates/pageTypeMap";
import { pageTypesFromPlan, pickPagePlan } from "../layout/sequence";
import {
  buildStoryUserPrompt,
  STORY_SYSTEM_PROMPT,
} from "../prompts/story";
import { parseRequestedPageCount, pickNarrativeAngle } from "../prompts/layoutHtml";
import { StoryDeckLlmSchema } from "../schema";
import type { DesignProfile } from "../design/director";
import type { DesignBrief } from "../brief/types";
import type { PageType, ThemeToken } from "../types";
import type { StoryDeck, StoryPageDraft } from "../story/types";

function makeRunId(seed: number): string {
  return `r${seed.toString(16).slice(0, 8)}`;
}

function runVariant(runId: string): number {
  let h = 0;
  for (let i = 0; i < runId.length; i++) h = (h + runId.charCodeAt(i) * (i + 1)) % 97;
  return h;
}

function hashPick(seed: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return n <= 0 ? 0 : (h >>> 0) % n;
}

function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function withMinimumBody(
  value: unknown,
  fallback: string,
  minChars = 24
): string {
  const text = cleanText(value);
  if (!text) return fallback;
  if (text.length >= minChars) return text;
  return `${text}；${fallback}`;
}

function itemFallback(kind: string, title: string, topic: string): string {
  const t = title || "本项";
  switch (kind) {
    case "agenda":
      return `说明「${t}」要回答的问题、交付边界和后续页证据。`;
    case "pillars":
      return `把「${t}」拆成具体做法、责任边界和可复用检查项。`;
    case "solution":
      return `明确「${t}」的动作、交付物和验收口径，会后可直接分派。`;
    case "timeline":
      return `标清「${t}」阶段的负责人、交付物和验收节点。`;
    default:
      return `围绕「${topic}」补足动作、对象和可验证结果。`;
  }
}

function normalizeItems(
  raw: unknown,
  count: number,
  kind: string,
  topic: string,
  titles: string[]
): Array<{ title: string; body: string; iconName?: string }> {
  const source = Array.isArray(raw) ? raw : [];
  const icons = ["Lightning", "Aiming", "CheckOne", "Star"];
  const out: Array<{ title: string; body: string; iconName?: string }> = [];
  for (let i = 0; i < count; i++) {
    const row =
      source[i] && typeof source[i] === "object"
        ? (source[i] as Record<string, unknown>)
        : {};
    const title = cleanText(row.title) || titles[i] || `要点${i + 1}`;
    out.push({
      title,
      body: withMinimumBody(row.body, itemFallback(kind, title, topic), 24),
      iconName: cleanText(row.iconName) || icons[i] || "CheckOne",
    });
  }
  return out;
}

function normalizeStrings(
  raw: unknown,
  count: number,
  fallback: (i: number) => string,
  minChars = 18
): string[] {
  const source = Array.isArray(raw) ? raw : [];
  return Array.from({ length: count }, (_, i) =>
    withMinimumBody(source[i], fallback(i), minChars)
  );
}

function enrichStoryPageContent(
  page: StoryPageDraft,
  deckName: string,
  angle: string
): StoryPageDraft {
  const topic = cleanText(deckName || page.title || page.claim) || "本项目";
  const title = cleanText(page.title) || cleanText(page.claim) || topic;
  const claim = withMinimumBody(
    page.claim,
    `${title}必须落到可验证场景、明确动作和业务结果。`,
    18
  );
  const base: StoryPageDraft = { ...page, title, claim };

  switch (page.pageType) {
    case "agenda":
      return {
        ...base,
        items: normalizeItems(page.items || page.steps, 4, "agenda", topic, [
          "问题与代价",
          "方案与分工",
          "结果与证据",
          "下一步边界",
        ]),
      };
    case "pillars":
      return {
        ...base,
        pillars: normalizeItems(page.pillars, 3, "pillars", topic, [
          "口径统一",
          "灰度验证",
          "复盘沉淀",
        ]),
      };
    case "solution":
      return {
        ...base,
        steps: normalizeItems(page.steps || page.items, 3, "solution", topic, [
          "先对齐口径",
          "再小步验证",
          "最后沉淀机制",
        ]),
      };
    case "metrics": {
      const source = Array.isArray(page.metrics) ? page.metrics : [];
      const defaults = [
        { value: "37%", label: "核心链路耗时下降，按周中位数统一统计。" },
        { value: "12天", label: "需求交付中位周期，覆盖评审到上线全链路。" },
        { value: "98.6%", label: "月度发布成功率，排除灰度回滚后的重复发布。" },
      ];
      return {
        ...base,
        metrics: defaults.map((fallback, i) => {
          const row = source[i] || fallback;
          return {
            value: cleanText(row.value) || fallback.value,
            label: withMinimumBody(row.label, fallback.label, 18),
          };
        }),
        footer: withMinimumBody(
          page.footer,
          `口径来自「${angle || topic}」，每个数字都对应可复查的数据来源。`,
          24
        ),
      };
    }
    case "problem":
      return {
        ...base,
        body: withMinimumBody(
          page.body,
          `在「${topic}」推进中，问题不是缺少概念，而是责任、数据和交付窗口无法同时对齐，导致评审反复、节奏被打断。`,
          80
        ),
        bullets: normalizeStrings(
          page.bullets,
          3,
          (i) =>
            [
              "同一指标多套口径并存，评审无法快速确认优先级。",
              "发布窗口被临时需求挤占，团队反复切换上下文。",
              "复盘只停留在口头经验，没有进入下次执行清单。",
            ][i] || "补足本问题的场景、影响和后续代价。"
        ),
      };
    case "evidence":
      return {
        ...base,
        caption: withMinimumBody(
          page.caption || page.subtitle,
          `这页用可复查的现场、数据或用户反馈支撑「${claim.slice(0, 28)}」。`,
          34
        ),
        bullets: normalizeStrings(
          page.bullets,
          3,
          (i) =>
            [
              "证据必须对应一个明确判断，避免只贴现象不解释。",
              "保留采样口径和时间范围，让结论可以复查。",
              "把证据转成下一步动作，而不是停在展示层。",
            ][i] || "补充证据解读。"
        ),
      };
    case "compare":
      return {
        ...base,
        leftTitle: cleanText(page.leftTitle) || "之前",
        leftBody: withMinimumBody(
          page.leftBody,
          "问题集中在口径漂移、责任边界模糊和交付节奏不可预测，评审需要反复追问同一组证据。",
          40
        ),
        rightTitle: cleanText(page.rightTitle) || "现在",
        rightBody: withMinimumBody(
          page.rightBody,
          "方案把动作、交付物和验收标准拆开，每个判断都能追到来源，复盘后可以直接复用。",
          40
        ),
      };
    case "team": {
      const source = Array.isArray(page.members) ? page.members : [];
      return {
        ...base,
        members: [0, 1, 2].map((i) => {
          const row = source[i] || {
            name: ["负责人", "执行人", "复盘人"][i],
            role: ["Owner", "Delivery", "Review"][i],
            blurb: "",
          };
          return {
            ...row,
            name: cleanText(row.name) || ["负责人", "执行人", "复盘人"][i],
            role: cleanText(row.role) || ["Owner", "Delivery", "Review"][i],
            blurb: withMinimumBody(
              row.blurb,
              "明确本角色负责的交付物、协作边界和验收依据。",
              22
            ),
          };
        }),
      };
    }
    case "timeline":
      return {
        ...base,
        timeline: normalizeItems(page.timeline, 4, "timeline", topic, [
          "启动",
          "验证",
          "上线",
          "复盘",
        ]).map((it) => ({ label: it.title, detail: it.body })),
      };
    case "hero":
      return {
        ...base,
        subtitle: withMinimumBody(
          page.subtitle,
          `围绕「${topic}」讲清场景、动作和可验证结果。`,
          18
        ),
      };
    case "close":
      return {
        ...base,
        subtitle: withMinimumBody(
          page.subtitle,
          "把本场结论落成下一步里程碑、负责人和验收时间。",
          20
        ),
      };
    case "breath":
      return {
        ...base,
        quote:
          cleanText(page.quote) ||
          "少讲概念，多留一个听得进、查得到、能行动的事实。",
        attribution: cleanText(page.attribution) || topic,
      };
    default:
      return base;
  }
}

function mockStory(
  theme: ThemeToken,
  userPrompt: string,
  runSeed: number,
  runId: string,
  designProfile?: DesignProfile,
  brief?: DesignBrief
): StoryDeck {
  const angle = pickNarrativeAngle(runSeed);
  const requested = parseRequestedPageCount(userPrompt);
  const plan = pickPagePlan(userPrompt, designProfile);
  const seq = pageTypesFromPlan(plan, requested) as PageType[];

  const pages: StoryPageDraft[] = seq.map((pageType, i) => {
    const pageId = `page_${i + 1}`;
    const base = mockPage(pageType, pageId, theme, userPrompt, angle, runId);
    return enrichStoryPageContent(
      base,
      theme.templateName || userPrompt,
      angle
    );
  });

  const occasion =
    brief?.label || designProfile?.label || "通用";

  return {
    version: "story-1.0",
    name: theme.templateName || userPrompt.slice(0, 40) || "演示文稿",
    angle: `${angle} · ${occasion}`,
    runId,
    pages,
    designProfile,
  };
}

function mockPage(
  pageType: PageType,
  pageId: string,
  theme: ThemeToken,
  userPrompt: string,
  angle: string,
  runId: string
): StoryPageDraft {
  const topic = theme.templateName || userPrompt.slice(0, 24);
  const intent = (subject: string) =>
    `${subject}, soft directional light, editorial framing, theme ${theme.primary}/${theme.secondary}, variation:${runId}/${pageId}, no text, no logos`;

  switch (pageType) {
    case "hero":
      return {
        pageId,
        pageType,
        claim: `${topic}：用可验证结果说话`,
        title: topic,
        subtitle: `${angle.split("：")[0] || "成果复盘"} · 把变化讲清楚`,
        footer: (theme.category || "BRIEF").toUpperCase(),
        imageIntent: intent(
          `cinematic media panel for angle「${angle.slice(0, 24)}」, ${
            runVariant(runId) % 2 === 0
              ? "soft fabric and ceramic still life"
              : "warm wood tabletop product atmosphere"
          }`
        ),
        density: "airy",
        emphasis: "title",
        composition: runVariant(runId) % 3 === 0 ? "band" : runVariant(runId) % 3 === 1 ? "card" : "split",
        preferModules: true,
      };
    case "metrics":
      return {
        pageId,
        pageType,
        claim: "关键结果用口径清晰的数字呈现",
        title: "关键结果",
        metrics: [
          { value: "37%", label: "核心链路耗时下降" },
          { value: "12天", label: "需求交付中位周期" },
          { value: "98.6%", label: "月度发布成功率" },
        ],
        footer: angle,
        imageIntent: intent("abstract monumental numerals carved in stone"),
        density: "airy",
        emphasis: "number",
        preferModules: true,
      };
    case "pillars":
      return {
        pageId,
        pageType,
        claim: "三件可复制的事支撑主张",
        title: "方法支柱",
        pillars: [
          {
            title: "口径统一",
            body: "指标定义进仓库，评审只认同一套数。",
            iconName: "Aiming",
          },
          {
            title: "灰度验证",
            body: "先 5% 流量看回归，再全量，失败可回滚。",
            iconName: "Lightning",
          },
          {
            title: "复盘沉淀",
            body: "每次事故留下检查清单，下个迭代直接复用。",
            iconName: "CheckOne",
          },
        ],
        imageIntent: intent("three material objects on a clean desk"),
        preferModules: true,
      };
    case "agenda":
      return {
        pageId,
        pageType,
        claim: "目录即承诺，后面页必须兑现",
        title: "今日议程",
        items: [
          { title: "问题与代价", body: "我们卡在哪、贵在哪" },
          { title: "打法与支柱", body: "怎么拆、谁负责" },
          { title: "结果与证据", body: "数字与现场" },
          { title: "下一步", body: "里程碑与边界" },
        ],
        imageIntent: intent("numbered folio pages on warm paper"),
        preferModules: true,
      };
    case "problem":
      return {
        pageId,
        pageType,
        claim: "问题要写到「谁痛、多痛」",
        title: "真正的卡点",
        body: `在「${topic}」推进中，信息口径不一导致评审反复；线上问题定位平均超过半小时，团队把时间耗在对齐而不是交付。`,
        bullets: [
          "同一指标三份表，结论对不上",
          "发布窗口被临时需求挤占",
          "复盘停留在口头，未进流程",
        ],
        imageIntent: intent("tense workspace with tangled cables metaphor"),
        preferModules: true,
      };
    case "solution":
      return {
        pageId,
        pageType,
        claim: "把动作拆到可验收，方案才真的能落地",
        title: "落地方案",
        steps: [
          { title: "统一口径", body: "先确认渠道、质检和复购三类数据的统计窗口。" },
          { title: "小步验证", body: "用两周试点验证包装话术、试吃转化和售后反馈。" },
          { title: "沉淀清单", body: "把有效动作写入下次上新 SOP，减少重复沟通。" },
        ],
        imageIntent: intent("organized product launch checklist on paper"),
        preferModules: false,
      };
    case "evidence":
      return {
        pageId,
        pageType,
        claim: "证据必须能回到真实场景和统一口径",
        title: "渠道反馈证据",
        caption: "样本来自两周试吃反馈、渠道订单和质检记录。",
        bullets: [
          "试吃转化按同一渠道周均口径统计。",
          "复购反馈拆成包装、口味和价格三类。",
          "每条证据都对应下一步可执行动作。",
        ],
        imageIntent: intent("premium product research desk with packaging samples"),
        preferModules: false,
      };
    case "compare":
      return {
        pageId,
        pageType,
        claim: "对比页要讲清取舍，而不是只摆两个形容词",
        title: "试点前后对比",
        leftTitle: "之前",
        leftBody: "反馈分散在渠道群和表格里，评审反复追问口径，包装迭代节奏被拉长。",
        rightTitle: "现在",
        rightBody: "按同一时间窗看转化、复购和质检，结论能直接变成下一轮试点动作。",
        imageIntent: intent("side by side product planning boards"),
        preferModules: false,
      };
    case "team":
      return {
        pageId,
        pageType,
        claim: "角色清楚，试点才能从反馈走到交付",
        title: "核心协作角色",
        members: [
          { name: "产品负责人", role: "Owner", blurb: "确认目标、资源边界和验收口径。" },
          { name: "渠道运营", role: "Growth", blurb: "收集试吃反馈并推进复购触达。" },
          { name: "供应链伙伴", role: "Quality", blurb: "跟进批次质检、包装调整和交付风险。" },
        ],
        imageIntent: intent("three premium product team portrait cutouts"),
        preferModules: false,
      };
    case "timeline":
      return {
        pageId,
        pageType,
        claim: "路线图要写清节点、交付物和验收方式",
        title: "四周推进节奏",
        timeline: [
          { label: "第1周", detail: "确认试点渠道、样本口径和包装假设。" },
          { label: "第2周", detail: "完成试吃回收，拆解口味与价格反馈。" },
          { label: "第3周", detail: "更新包装话术并复核质检批次。" },
          { label: "第4周", detail: "复盘转化与复购，决定是否扩大投放。" },
        ],
        imageIntent: intent("minimal calendar and product samples on desk"),
        preferModules: false,
      };
    case "breath":
      return {
        pageId,
        pageType,
        claim: "敢空，才有记忆点",
        title: "呼吸",
        quote: "少讲概念，多留一个听得进的事实。",
        attribution: topic,
        imageIntent: intent("vast quiet interior with single light shaft"),
        density: "airy",
        composition: "card",
        preferModules: true,
      };
    case "close":
      return {
        pageId,
        pageType,
        claim: "收束到行动",
        title: "下一步",
        subtitle: "把今天的主张落成可验收里程碑",
        contact: "谢谢",
        imageIntent: intent("dark stage curtain with warm accent glow"),
        composition: "split",
        preferModules: true,
      };
    default:
      return {
        pageId,
        pageType,
        claim: `${pageType}：围绕 ${topic}`,
        title: pageType,
        subtitle: angle,
        body: `围绕「${topic}」展开可执行细节。`,
        bullets: ["场景", "动作", "结果"],
        imageIntent: intent("clean editorial photograph of a concrete subject"),
        preferModules: false,
      };
  }
}

const EDGE_MODULE_TYPES = new Set<PageType>(["close", "breath"]);
const MODULE_CAPABLE_TYPES = new Set<PageType>([
  "hero",
  "close",
  "breath",
  "metrics",
  "pillars",
  "problem",
  "agenda",
]);

function preferModulesForDesign(
  page: StoryPageDraft,
  index: number,
  profile: DesignProfile,
  runId: string
): boolean {
  if (EDGE_MODULE_TYPES.has(page.pageType)) return true;
  if (page.preferModules === false) return false;
  if (!MODULE_CAPABLE_TYPES.has(page.pageType)) return false;
  if (profile.moduleBias === "modules-first") return true;
  if (profile.moduleBias === "templates-first") return false;
  if (profile.templateFirstPageTypes.includes(page.pageType)) return false;
  return hashPick(`${runId}:${profile.archetype}:${page.pageId}:${index}`, 4) !== 0;
}

function applyDesignProfileToStory(
  story: StoryDeck,
  profile?: DesignProfile
): StoryDeck {
  if (!profile) return story;

  const pages = story.pages.map((page, index) => {
    const compositionPool = profile.preferredCompositions.length
      ? profile.preferredCompositions
      : ["solid" as const];
    const composition =
      page.composition ||
      compositionPool[
        hashPick(
          `${story.runId}:${profile.archetype}:${page.pageType}:${page.pageId}`,
          compositionPool.length
        )
      ];
    const imageIntent = page.imageIntent.includes(profile.imageStyle)
      ? page.imageIntent
      : `${page.imageIntent}, ${profile.imageStyle}`;
    const emphasis =
      page.emphasis ||
      (page.pageType === "metrics"
        ? "number"
        : page.pageType === "evidence" || profile.emphasis === "image"
          ? "image"
          : profile.emphasis);

    return {
      ...page,
      density:
        page.density ||
        (page.pageType === "breath" || page.pageType === "hero"
          ? "airy"
          : profile.density),
      emphasis,
      align: page.align || profile.align,
      composition,
      imageIntent,
      preferModules: preferModulesForDesign(page, index, profile, story.runId),
    };
  });

  return {
    ...story,
    angle: `${story.angle} · ${profile.label}`,
    designProfile: profile,
    pages,
  };
}

function normalizeStory(
  raw: {
    name: string;
    angle: string;
    pages: Array<Partial<StoryPageDraft> & { pageType: PageType }>;
  },
  runId: string,
  requested?: number,
  designProfile?: DesignProfile
): StoryDeck {
  let pages = raw.pages.map((p, i) => {
    const pageId = p.pageId || `page_${i + 1}`;
    const title =
      (p.title && String(p.title).trim()) ||
      (p.quote && String(p.quote).trim().slice(0, 40)) ||
      (p.claim && String(p.claim).trim().slice(0, 40)) ||
      `第 ${i + 1} 页`;
    const claim =
      (p.claim && String(p.claim).trim()) ||
      title ||
      "本页主张";
    const imageIntent =
      (p.imageIntent && String(p.imageIntent).trim()) ||
      `editorial photograph related to ${title}, soft light, variation:${runId}/${pageId}, no text, no logos`;
    return {
      ...p,
      pageId,
      claim,
      title,
      imageIntent,
      preferModules: p.preferModules !== false,
      composition:
        p.composition === "split" ||
        p.composition === "band" ||
        p.composition === "card" ||
        p.composition === "solid"
          ? p.composition
          : undefined,
    } as StoryPageDraft;
  });

  if (requested != null) {
    if (pages.length > requested) pages = pages.slice(0, requested);
    if (pages.length < requested) {
      throw new Error(
        `Story 页数 ${pages.length} 少于用户要求的 ${requested} 页`
      );
    }
  } else if (pages.length > PLATFORM_LIMITS.agentPagesHtml.max) {
    pages = pages.slice(0, PLATFORM_LIMITS.agentPagesHtml.max);
  }

  const deckName = (raw.name && String(raw.name).trim()) || "演示文稿";
  const angle = (raw.angle && String(raw.angle).trim()) || "成果复盘";

  return applyDesignProfileToStory({
    version: "story-1.0",
    name: deckName,
    angle,
    runId,
    pages: pages.map((p) => enrichStoryPageContent(p, deckName, angle)),
    designProfile,
  }, designProfile);
}

/** 清洗 LLM 脏字段，避免非法 enum / 缺 title 直接炸 Zod */
function sanitizeStoryLlmPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;
  const pages = Array.isArray(obj.pages) ? obj.pages : [];
  return {
    ...obj,
    name: obj.name == null ? "演示文稿" : String(obj.name),
    angle: obj.angle == null ? "成果复盘" : String(obj.angle),
    pages: pages.map((page, i) => {
      if (!page || typeof page !== "object") {
        return {
          pageType: "pillars",
          claim: `第 ${i + 1} 页`,
          title: `第 ${i + 1} 页`,
          imageIntent: `editorial photo variation page_${i + 1}, no text`,
        };
      }
      const p = page as Record<string, unknown>;
      const densityOk = ["airy", "normal", "dense"].includes(
        String(p.density || "").toLowerCase()
      );
      const emphasisOk = ["title", "image", "number"].includes(
        String(p.emphasis || "").toLowerCase()
      );
      const alignOk = ["left", "split", "center"].includes(
        String(p.align || "").toLowerCase()
      );
      const title =
        p.title != null && String(p.title).trim()
          ? String(p.title)
          : p.quote != null && String(p.quote).trim()
            ? String(p.quote).slice(0, 40)
            : p.claim != null && String(p.claim).trim()
              ? String(p.claim).slice(0, 40)
              : `第 ${i + 1} 页`;
      const claim =
        p.claim != null && String(p.claim).trim()
          ? String(p.claim)
          : title;
      return {
        ...p,
        title,
        claim,
        density: densityOk ? String(p.density).toLowerCase() : undefined,
        emphasis: emphasisOk ? String(p.emphasis).toLowerCase() : undefined,
        align: alignOk ? String(p.align).toLowerCase() : undefined,
        imageIntent:
          p.imageIntent != null && String(p.imageIntent).trim().length >= 8
            ? String(p.imageIntent)
            : `editorial photograph for ${title}, soft light, no text, no logos`,
      };
    }),
  };
}

export async function runStoryAgent(opts: {
  config: AgentRuntimeConfig;
  theme: ThemeToken;
  userPrompt: string;
  designProfile?: DesignProfile;
  brief?: DesignBrief;
}): Promise<StoryDeck> {
  const { config, theme, userPrompt, designProfile, brief } = opts;
  const runSeed = freshRunSeed(userPrompt);
  const runId = makeRunId(runSeed);
  const requested = parseRequestedPageCount(userPrompt);

  if (config.mock) {
    return normalizeStory(
      mockStory(theme, userPrompt, runSeed, runId, designProfile, brief),
      runId,
      requested,
      designProfile
    );
  }

  const raw = await chatJson({
    config,
    temperature: 0.88,
    messages: [
      { role: "system", content: STORY_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildStoryUserPrompt(userPrompt, {
          runSeed,
          runId,
          designProfile,
          brief,
        }),
      },
    ],
    parse: (j) => StoryDeckLlmSchema.parse(sanitizeStoryLlmPayload(j)),
  });

  return normalizeStory(raw, runId, requested, designProfile);
}
