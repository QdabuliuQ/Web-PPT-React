import type { LayoutAlign, LayoutDensity, LayoutEmphasis } from "../htmlTemplates/layoutKnobs";
import type { HtmlTemplateSuiteId } from "../htmlTemplates/types";
import type { SlideComposition } from "../modules/composition";
import type { DesignBrief } from "../brief/types";
import type { PageType, VisualFamilyId } from "../types";

export type DesignArchetypeId =
  | "consulting"
  | "productLaunch"
  | "dataMonument"
  | "editorialStory"
  | "opsDashboard"
  | "stageGala"
  | "personalReview";

export type DesignModuleBias =
  | "modules-first"
  | "templates-first"
  | "mixed";

export type DesignProfile = {
  version: "design-profile-1.0";
  archetype: DesignArchetypeId;
  label: string;
  visualFamily: VisualFamilyId;
  narrativeShape: string;
  preferredCompositions: SlideComposition[];
  moduleBias: DesignModuleBias;
  density: LayoutDensity;
  emphasis: LayoutEmphasis;
  align: LayoutAlign;
  pageSequenceHints: PageType[];
  templateBoosts: Partial<Record<PageType, HtmlTemplateSuiteId[]>>;
  templateAvoidList: Partial<Record<PageType, HtmlTemplateSuiteId[]>>;
  templateFirstPageTypes: PageType[];
  themeGuidance: string;
  imageStyle: string;
  runVariant: number;
};

type ProfileDraft = Omit<DesignProfile, "version" | "runVariant">;

function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotate<T>(items: readonly T[], offset: number): T[] {
  if (!items.length) return [];
  const n = offset % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

function avoidDefaults(ids: HtmlTemplateSuiteId[]): HtmlTemplateSuiteId[] {
  return ids;
}

const PROFILES: Record<DesignArchetypeId, ProfileDraft> = {
  consulting: {
    archetype: "consulting",
    label: "咨询报告式",
    visualFamily: "editorial",
    narrativeShape: "先立判断，再给证据，最后收束到可执行建议。",
    preferredCompositions: ["solid", "split", "band"],
    moduleBias: "templates-first",
    density: "normal",
    emphasis: "title",
    align: "left",
    pageSequenceHints: [
      "hero",
      "agenda",
      "problem",
      "evidence",
      "solution",
      "compare",
      "breath",
      "metrics",
      "timeline",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-report-spine", "hero-slab"],
      agenda: ["agenda-columns", "agenda-rail", "agenda-stack"],
      problem: ["problem-tight", "problem-ledger", "problem-slash"],
      evidence: ["evidence-quote", "evidence-aside", "evidence-rows"],
      solution: ["solution-split", "solution-ladder", "solution-open"],
      compare: ["compare-duel", "compare-quiet"],
      metrics: ["metrics-corner", "metrics-ledger"],
      breath: ["breath-type", "breath-mark"],
      close: ["close-split"],
    },
    templateAvoidList: {
      agenda: avoidDefaults(["agenda-folio"]),
      pillars: avoidDefaults(["pillars-spine"]),
      metrics: avoidDefaults(["metrics-hero"]),
      evidence: avoidDefaults(["evidence-stage"]),
    },
    templateFirstPageTypes: ["hero", "agenda", "problem", "solution", "metrics", "pillars"],
    themeGuidance:
      "冷静、可信、像咨询报告：低饱和主色、清晰信息层级、少装饰，多证据。",
    imageStyle:
      "editorial report photography, printed paper, annotated desk materials, soft north light, restrained premium consulting mood",
  },
  productLaunch: {
    archetype: "productLaunch",
    label: "产品发布式",
    visualFamily: "product",
    narrativeShape: "先给产品记忆点，再用场景、证据和对比证明值得买。",
    preferredCompositions: ["split", "card", "band"],
    moduleBias: "templates-first",
    density: "airy",
    emphasis: "image",
    align: "split",
    pageSequenceHints: [
      "hero",
      "breath",
      "evidence",
      "pillars",
      "compare",
      "metrics",
      "solution",
      "team",
      "timeline",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-product-showcase", "hero-bleed", "hero-slab"],
      breath: ["breath-billboard", "breath-split"],
      evidence: ["evidence-plaza", "evidence-stage", "evidence-split"],
      pillars: ["pillars-loose", "pillars-open"],
      compare: ["compare-panels", "compare-duel"],
      metrics: ["metrics-inline", "metrics-hero", "metrics-monument"],
      solution: ["solution-open", "solution-cascade"],
      team: ["team-focus", "team-strip"],
      close: ["close-split"],
    },
    templateAvoidList: {
      problem: ["problem-ledger", "problem-rail"],
      agenda: ["agenda-rail", "agenda-folio"],
      metrics: ["metrics-ledger"],
    },
    templateFirstPageTypes: ["hero", "evidence", "pillars", "metrics", "solution"],
    themeGuidance:
      "像高端新品提案：真实产品摄影、柔和纸面、强单品焦点，避免工程感和仪表盘感。",
    imageStyle:
      "premium product photography, tactile packaging, soft cream tabletop, natural shadows, macro detail, no clipart",
  },
  dataMonument: {
    archetype: "dataMonument",
    label: "数据纪念碑式",
    visualFamily: "monument",
    narrativeShape: "用一个大数字建立势能，再解释问题、方案和增长证据。",
    preferredCompositions: ["solid", "band", "split"],
    moduleBias: "mixed",
    density: "airy",
    emphasis: "number",
    align: "center",
    pageSequenceHints: [
      "hero",
      "metrics",
      "problem",
      "solution",
      "evidence",
      "compare",
      "breath",
      "pillars",
      "timeline",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-data-monument", "hero-slab"],
      metrics: ["metrics-monument", "metrics-focus", "metrics-corner"],
      problem: ["problem-focus", "problem-tight", "problem-slash"],
      solution: ["solution-flow", "solution-split"],
      evidence: ["evidence-plaza", "evidence-focus"],
      compare: ["compare-flags", "compare-duel"],
      breath: ["breath-type", "breath-billboard"],
      pillars: ["pillars-numbers", "pillars-loose"],
      close: ["close-split"],
    },
    templateAvoidList: {
      agenda: ["agenda-folio", "agenda-strip"],
      team: ["team-strip"],
      metrics: ["metrics-inline"],
    },
    templateFirstPageTypes: ["hero", "metrics", "problem", "evidence", "compare"],
    themeGuidance:
      "像路演/战报的大屏关键页：强对比、超大数字、少正文，禁止表格墙。",
    imageStyle:
      "monumental data atmosphere, concrete or brushed metal, museum lighting, oversized numeric focus, high contrast quiet space",
  },
  editorialStory: {
    archetype: "editorialStory",
    label: "杂志叙事式",
    visualFamily: "editorial",
    narrativeShape: "像一组杂志跨页：观点页和证据页交替，让留白承担节奏。",
    preferredCompositions: ["band", "split", "card"],
    moduleBias: "templates-first",
    density: "airy",
    emphasis: "title",
    align: "left",
    pageSequenceHints: [
      "hero",
      "breath",
      "pillars",
      "evidence",
      "problem",
      "solution",
      "metrics",
      "compare",
      "timeline",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-report-spine", "hero-slab"],
      breath: ["breath-mark", "breath-type", "breath-billboard"],
      pillars: ["pillars-loose", "pillars-open", "pillars-mast"],
      evidence: ["evidence-quote", "evidence-stack", "evidence-aside"],
      problem: ["problem-ledger", "problem-tight"],
      solution: ["solution-open", "solution-cascade"],
      metrics: ["metrics-ledger", "metrics-corner"],
      compare: ["compare-quiet", "compare-panels"],
      timeline: ["timeline-mast", "timeline-split"],
      close: ["close-split"],
    },
    templateAvoidList: {
      agenda: ["agenda-folio"],
      metrics: ["metrics-hero"],
    },
    templateFirstPageTypes: ["hero", "pillars", "evidence", "problem", "solution", "metrics"],
    themeGuidance:
      "像高级杂志专题：大标题、非对称、纸张质感，避免模板化三栏。",
    imageStyle:
      "luxury editorial still life, print paper grain, muted ink, asymmetric framing, soft daylight",
  },
  opsDashboard: {
    archetype: "opsDashboard",
    label: "运营驾驶舱式",
    visualFamily: "editorial",
    narrativeShape: "像管理驾驶舱：先看状态，再看异常、动作和里程碑。",
    preferredCompositions: ["solid", "split", "band"],
    moduleBias: "mixed",
    density: "dense",
    emphasis: "number",
    align: "left",
    pageSequenceHints: [
      "hero",
      "metrics",
      "agenda",
      "problem",
      "solution",
      "timeline",
      "evidence",
      "compare",
      "breath",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-report-spine", "hero-slab", "hero-bleed"],
      metrics: ["metrics-focus", "metrics-stack", "metrics-corner"],
      agenda: ["agenda-grid", "agenda-steps"],
      problem: ["problem-rail", "problem-ledger"],
      solution: ["solution-ladder", "solution-flow"],
      timeline: ["timeline-pulse", "timeline-vertical"],
      evidence: ["evidence-rows", "evidence-aside"],
      compare: ["compare-stack", "compare-quiet"],
      breath: ["breath-band", "breath-center"],
      close: ["close-split"],
    },
    templateAvoidList: {
      hero: ["hero-stage-marquee"],
      breath: ["breath-floor"],
      evidence: ["evidence-stage"],
    },
    templateFirstPageTypes: ["hero", "metrics", "agenda", "timeline", "evidence"],
    themeGuidance:
      "像运营复盘/平台汇报：冷静、结构化、密度更高但留出一页强呼吸。",
    imageStyle:
      "clean operational workspace, product analytics surfaces, precise documentation, cool grey engineering light, no HUD",
  },
  stageGala: {
    archetype: "stageGala",
    label: "舞台庆典式",
    visualFamily: "stage",
    narrativeShape: "先营造舞台气氛，再用成果、人物和一句宣言收束。",
    preferredCompositions: ["band", "card", "split"],
    moduleBias: "mixed",
    density: "normal",
    emphasis: "title",
    align: "center",
    pageSequenceHints: [
      "hero",
      "agenda",
      "metrics",
      "evidence",
      "pillars",
      "team",
      "breath",
      "compare",
      "timeline",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-stage-marquee", "hero-slab"],
      agenda: ["agenda-columns", "agenda-strip"],
      metrics: ["metrics-band", "metrics-hero", "metrics-monument"],
      evidence: ["evidence-quote", "evidence-stage"],
      pillars: ["pillars-band", "pillars-mast"],
      team: ["team-mast", "team-band"],
      breath: ["breath-floor", "breath-band", "breath-billboard"],
      compare: ["compare-band", "compare-panels"],
      timeline: ["timeline-band", "timeline-mast"],
      close: ["close-band"],
    },
    templateAvoidList: {
      problem: ["problem-ledger", "problem-rail"],
      agenda: ["agenda-grid"],
      metrics: ["metrics-ledger"],
    },
    templateFirstPageTypes: ["hero", "metrics", "evidence", "pillars", "team"],
    themeGuidance:
      "像年会主视觉：暗场、暖金、舞台光和仪式感，少做问题分析页。",
    imageStyle:
      "gala stage photography, silk and warm metallic foil, soft spotlight, deep vignette, ceremonial mood",
  },
  personalReview: {
    archetype: "personalReview",
    label: "个人述职式",
    visualFamily: "editorial",
    narrativeShape: "像一份克制述职：职责边界、关键项目、数字结果和下一步。",
    preferredCompositions: ["solid", "split", "card"],
    moduleBias: "mixed",
    density: "normal",
    emphasis: "title",
    align: "left",
    pageSequenceHints: [
      "hero",
      "agenda",
      "metrics",
      "problem",
      "solution",
      "timeline",
      "evidence",
      "breath",
      "pillars",
      "close",
    ],
    templateBoosts: {
      hero: ["hero-report-spine", "hero-slab", "hero-bleed"],
      agenda: ["agenda-steps", "agenda-rail"],
      metrics: ["metrics-corner", "metrics-focus", "metrics-ledger"],
      problem: ["problem-tight", "problem-ledger"],
      solution: ["solution-flow", "solution-ladder"],
      timeline: ["timeline-pulse", "timeline-split"],
      evidence: ["evidence-aside", "evidence-rows"],
      breath: ["breath-mark", "breath-billboard"],
      pillars: ["pillars-ladder", "pillars-open"],
      close: ["close-split"],
    },
    templateAvoidList: {
      evidence: ["evidence-stage"],
      metrics: ["metrics-hero"],
      team: ["team-mast"],
    },
    templateFirstPageTypes: ["hero", "metrics", "problem", "solution", "timeline"],
    themeGuidance:
      "像高级工程述职：冷灰、清楚、克制，把贡献和证据讲实。",
    imageStyle:
      "restrained engineering editorial photography, concrete, brushed metal, clean review documents, cool daylight",
  },
};

/**
 * 用 BriefAgent 决策结果组装 DesignProfile。
 * PROFILES 只当「风格配方库」；场合/页序/气质由 Brief 覆盖。
 */
export function buildDesignProfileFromBrief(
  brief: DesignBrief,
  seed?: number
): DesignProfile {
  const runVariant =
    (seed ?? hashText(`${brief.archetype}:${brief.label}:${brief.reason}`)) %
    997;
  const base = PROFILES[brief.archetype] || PROFILES.consulting;
  const compositionOffset = Math.floor(runVariant / 7);
  const preferredCompositions = rotate(
    base.preferredCompositions,
    compositionOffset
  );
  const pageSequenceHints =
    brief.pageSequenceHints?.length >= 3
      ? [...brief.pageSequenceHints]
      : [...base.pageSequenceHints];

  return {
    ...base,
    version: "design-profile-1.0",
    archetype: brief.archetype,
    label: brief.label || base.label,
    visualFamily: brief.visualFamily || base.visualFamily,
    narrativeShape: brief.narrativeShape || base.narrativeShape,
    preferredCompositions,
    pageSequenceHints,
    themeGuidance: brief.themeHints || base.themeGuidance,
    runVariant,
  };
}

/** @deprecated 主路径请用 BriefAgent；兼容旧调用时回落 consulting 配方 */
export function directDesign(userPrompt: string, seed?: number): DesignProfile {
  const runVariant = (seed ?? hashText(userPrompt)) % 997;
  const base = PROFILES.consulting;
  return {
    ...base,
    version: "design-profile-1.0",
    label: userPrompt.slice(0, 24) || base.label,
    preferredCompositions: rotate(base.preferredCompositions, runVariant % 3),
    pageSequenceHints: [...base.pageSequenceHints],
    runVariant,
  };
}

export function formatDesignProfileForPrompt(profile: DesignProfile): string {
  const templateBoosts = Object.entries(profile.templateBoosts)
    .map(([pageType, ids]) => `${pageType}: ${(ids || []).join(", ")}`)
    .join("\n");
  return `【设计导演策略】
archetype=${profile.archetype}（${profile.label}）
visualFamily=${profile.visualFamily}
narrativeShape=${profile.narrativeShape}
moduleBias=${profile.moduleBias}
defaultKnobs=density:${profile.density}, emphasis:${profile.emphasis}, align:${profile.align}
preferredCompositions=${profile.preferredCompositions.join(", ")}
pageSequenceHints=${profile.pageSequenceHints.join(" → ")}
templateBoosts:
${templateBoosts || "(none)"}
themeGuidance=${profile.themeGuidance}
imageStyle=${profile.imageStyle}`;
}
