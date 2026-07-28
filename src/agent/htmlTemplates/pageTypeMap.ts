import type { PageType } from "../types";
import type { HtmlTemplateSuiteId } from "./types";
import { TEMPLATE_SUITE } from "./pages/registry";
import type { VisualFamilyId } from "../theme/visualFamily";
import { templateMatchesFamily } from "../theme/visualFamily";
import type { DesignProfile } from "../design/director";

/** 每个 pageType 可选的模板套（LLM 在白名单内选）— 各 ≥6 套；贵价签名靠前 */
export const PAGE_TYPE_TEMPLATE_SUITES: Record<
  PageType,
  readonly HtmlTemplateSuiteId[]
> = {
  hero: [
    // 仅保留安全封面：文字在实色区/实色卡片，媒体是独立槽或不使用媒体。
    "hero-product-showcase",
    "hero-data-monument",
    "hero-report-spine",
    "hero-stage-marquee",
    "hero-slab",
    "hero-bleed",
  ],
  agenda: [
    "agenda-folio",
    "agenda-columns",
    "agenda-steps",
    "agenda-grid",
    "agenda-rail",
    "agenda-strip",
    "agenda-stack",
  ],
  problem: [
    "problem-tight",
    "problem-slash",
    "problem-stack",
    "problem-focus",
    "problem-ledger",
    "problem-band",
    "problem-rail",
  ],
  solution: [
    "solution-flow",
    "solution-ladder",
    "solution-split",
    "solution-band",
    "solution-open",
    "solution-cascade",
  ],
  pillars: [
    "pillars-loose",
    "pillars-spine",
    "pillars-mast",
    "pillars-open",
    "pillars-ladder",
    "pillars-numbers",
    "pillars-stack",
    "pillars-band",
  ],
  metrics: [
    "metrics-monument",
    "metrics-hero",
    "metrics-corner",
    "metrics-ledger",
    "metrics-band",
    "metrics-focus",
    "metrics-stack",
    "metrics-inline",
  ],
  evidence: [
    "evidence-plaza",
    "evidence-stage",
    "evidence-quote",
    "evidence-split",
    "evidence-stack",
    "evidence-rows",
    "evidence-aside",
    "evidence-focus",
  ],
  compare: [
    "compare-duel",
    "compare-stack",
    "compare-band",
    "compare-quiet",
    "compare-flags",
    "compare-panels",
  ],
  breath: [
    "breath-billboard",
    "breath-mark",
    "breath-center",
    "breath-band",
    "breath-type",
    "breath-split",
    "breath-floor",
  ],
  team: [
    "team-strip",
    "team-ladder",
    "team-focus",
    "team-rail",
    "team-band",
    "team-mast",
  ],
  timeline: [
    "timeline-pulse",
    "timeline-vertical",
    "timeline-stack",
    "timeline-split",
    "timeline-band",
    "timeline-mast",
  ],
  close: [
    // 仅保留双平面安全模板
    "close-split",
    "close-band",
  ],
};

/** Wave-4 贵价签名：提高被选概率 */
export const PREMIUM_SIGNATURES = new Set<string>([
  "hero-slab",
  "hero-product-showcase",
  "hero-data-monument",
  "hero-report-spine",
  "hero-stage-marquee",
  "metrics-monument",
  "breath-billboard",
  "evidence-plaza",
  "pillars-loose",
  "problem-tight",
]);

/** 可算「呼吸页」的 template（敢空） */
export const BREATHING_TEMPLATE_IDS = new Set<string>([
  "breath-billboard",
  "breath-mark",
  "breath-center",
  "breath-band",
  "breath-type",
  "breath-split",
  "breath-floor",
  "metrics-monument",
  "metrics-hero",
  "evidence-plaza",
  "evidence-stage",
]);

/** 易被模型「总是首选」的同质栈（勿当作默认答案） */
export const STICKY_TEMPLATE_DEFAULTS = new Set<string>([
  "hero-bleed",
  "agenda-folio",
  "pillars-spine",
  "metrics-hero",
  "evidence-stage",
  "solution-flow",
  "team-strip",
  "timeline-pulse",
  "close-rail",
  "breath-center",
]);

export function hashPromptSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 每次运行新鲜种子：同 prompt 也会换选套/叙事角度 */
export function freshRunSeed(text: string): number {
  const base = hashPromptSeed(text);
  const entropy =
    (Date.now() >>> 0) ^ (Math.floor(Math.random() * 0xffffffff) >>> 0);
  return (base ^ entropy) >>> 0;
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function defaultTemplateForPageType(
  pageType: PageType
): HtmlTemplateSuiteId {
  return PAGE_TYPE_TEMPLATE_SUITES[pageType][0];
}

/** 解析 templateId；非法或不匹配 pageType 时回退默认 */
export function resolveTemplateForPage(
  pageType: PageType,
  templateId?: string | null
): HtmlTemplateSuiteId {
  const allowed = PAGE_TYPE_TEMPLATE_SUITES[pageType];
  if (templateId && (allowed as readonly string[]).includes(templateId)) {
    return templateId as HtmlTemplateSuiteId;
  }
  if (templateId && templateId in TEMPLATE_SUITE) {
    const suite = templateId as HtmlTemplateSuiteId;
    const meta = TEMPLATE_SUITE[suite];
    if (meta.kind === pageType || (pageType === "compare" && meta.kind === "dual")) {
      return suite;
    }
  }
  return allowed[0];
}

/**
 * 按 seed 打乱各 pageType 白名单展示顺序；
 * 当前视觉家族模板置顶，其次贵价签名。
 */
export function formatTemplateCatalogForPrompt(
  seed?: number,
  family?: VisualFamilyId | null,
  designProfile?: DesignProfile
): string {
  const s = seed ?? 0;
  return (Object.keys(PAGE_TYPE_TEMPLATE_SUITES) as PageType[])
    .map((pt, ptIndex) => {
      const shuffled = seededShuffle(
        PAGE_TYPE_TEMPLATE_SUITES[pt],
        (s + ptIndex * 97) >>> 0
      );
      const inFamily = family
        ? shuffled.filter((id) => templateMatchesFamily(id, family))
        : [];
      const preferred = shuffled.filter((id) => PREMIUM_SIGNATURES.has(id));
      const rest = shuffled.filter(
        (id) =>
          !PREMIUM_SIGNATURES.has(id) &&
          !(family && templateMatchesFamily(id, family))
      );
      let ids = [
        ...inFamily,
        ...preferred.filter((id) => !inFamily.includes(id)),
        ...rest,
      ];
      const avoid = new Set(designProfile?.templateAvoidList[pt] || []);
      const nonAvoid = ids.filter((id) => !avoid.has(id));
      if (nonAvoid.length) ids = nonAvoid;
      const boosts = (designProfile?.templateBoosts[pt] || []).filter((id) =>
        ids.includes(id)
      );
      if (boosts.length) {
        ids = [...boosts, ...ids.filter((id) => !boosts.includes(id))];
      }
      const lines = ids
        .map((id) => {
          const famTag =
            family && templateMatchesFamily(id, family) ? " ★家族" : "";
          const directorTag = boosts.includes(id) ? " ★导演" : "";
          return `    - ${id}: ${TEMPLATE_SUITE[id].signature}${famTag}${directorTag}`;
        })
        .join("\n");
      return `  ${pt}:\n${lines}`;
    })
    .join("\n");
}

/**
 * 去同质化：同页型不重复套；缺 templateId 时按 seed 选；
 * 若整套仍大量命中 sticky 默认栈，则强制换到未用过的其他签名。
 * 贵价签名 + 视觉家族在缺省/换套时优先。
 */
export function diversifyTemplateIds<
  T extends { pageType: PageType; templateId?: string | null },
>(
  pages: T[],
  seed: number,
  family?: VisualFamilyId | null,
  designProfile?: DesignProfile
): Array<T & { templateId: HtmlTemplateSuiteId }> {
  const resolved = pages.map((p) => ({
    ...p,
    templateId: p.templateId
      ? resolveTemplateForPage(p.pageType, p.templateId)
      : null,
  }));

  const stickyHits = resolved.filter(
    (p) => p.templateId && STICKY_TEMPLATE_DEFAULTS.has(p.templateId)
  ).length;
  const forceResample =
    stickyHits >= Math.max(3, Math.ceil(pages.length * 0.45));

  const used = new Set<string>();

  return resolved.map((p, i) => {
    const allowed = PAGE_TYPE_TEMPLATE_SUITES[p.pageType];
    let tid: HtmlTemplateSuiteId | null = p.templateId;

    const missing = !tid;
    const conflict = tid != null && used.has(tid);
    const sticky = tid != null && STICKY_TEMPLATE_DEFAULTS.has(tid);
    const offFamily =
      family != null && tid != null && !templateMatchesFamily(tid, family);
    const designAvoided =
      tid != null &&
      (designProfile?.templateAvoidList[p.pageType] || []).includes(tid);

    if (
      missing ||
      conflict ||
      (forceResample && sticky) ||
      offFamily ||
      designAvoided ||
      !tid
    ) {
      let pool = allowed.filter((id) => !used.has(id));
      if (!pool.length) pool = [...allowed];
      if (forceResample && sticky) {
        const nonSticky = pool.filter((id) => !STICKY_TEMPLATE_DEFAULTS.has(id));
        if (nonSticky.length) pool = nonSticky;
      }
      if (family) {
        const famPool = pool.filter((id) => templateMatchesFamily(id, family));
        if (famPool.length) pool = famPool;
      }
      if (designProfile) {
        const avoid = new Set(designProfile.templateAvoidList[p.pageType] || []);
        const nonAvoid = pool.filter((id) => !avoid.has(id));
        if (nonAvoid.length) pool = nonAvoid;

        const boosted = (designProfile.templateBoosts[p.pageType] || []).filter(
          (id) => pool.includes(id)
        );
        const boostRoll =
          (seed + designProfile.runVariant + i * 23 + (seed >>> (i % 12))) %
          100;
        if (boosted.length && boostRoll < 82) {
          pool = boosted;
        }
      }
      const premium = pool.filter((id) => PREMIUM_SIGNATURES.has(id));
      // ~35% 优先贵价签名（降低同质；同 seed 也会因 entropy 换结果）
      if (premium.length && ((seed + i * 17) % 100) < 35) {
        pool = premium;
      }
      const pick = (seed + i * 97 + (seed >>> (i % 16))) % pool.length;
      tid = pool[pick]!;
    }

    used.add(tid);
    return { ...p, templateId: tid };
  });
}

export function isBreathingPage(opts: {
  pageType: PageType;
  templateId?: string | null;
}): boolean {
  if (opts.pageType === "breath") return true;
  const tid = opts.templateId
    ? resolveTemplateForPage(opts.pageType, opts.templateId)
    : "";
  return BREATHING_TEMPLATE_IDS.has(tid);
}
