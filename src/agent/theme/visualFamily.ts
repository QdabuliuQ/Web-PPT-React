import type { DeckGenreId } from "./genre";
import type { ThemeToken } from "../types";

/** 整场 PPT 的视觉家族（先选气质，再选模板） */
export type VisualFamilyId =
  | "editorial"
  | "monument"
  | "product"
  | "stage";

export type MaterialPack = {
  id: VisualFamilyId;
  label: string;
  /** 给 Theme / Layout 的选套与叙事提示 */
  layoutGuidance: string;
  /** 表面材质（纸/金属/织物…） */
  surface: string;
  /** 光照气质 */
  light: string;
  /** 封面叠字暗带强度 0～1 */
  coverScrim: number;
  /** 生图材质提示 */
  imageMaterials: string;
  /** 封面生图额外约束 */
  coverImageHint: string;
  fonts: {
    fontTitle: string;
    fontBody: string;
    fontNumeric: string;
  };
  /** 默认微旋钮建议 */
  defaultDensity: "airy" | "normal" | "dense";
  defaultEmphasis: "title" | "image" | "number";
};

export const VISUAL_FAMILIES: Record<VisualFamilyId, MaterialPack> = {
  editorial: {
    id: "editorial",
    label: "杂志编辑",
    layoutGuidance:
      "大衬线标题、非对称分栏、敢空；优先 hero-report-spine / hero-slab / pillars-loose / breath-billboard / evidence-quote / close-quiet。少用密三栏与工程竖轨堆叠。",
    surface: "warm print paper, soft grain, editorial stock",
    light: "soft north-window daylight, gentle falloff",
    coverScrim: 0.36,
    imageMaterials:
      "printed paper texture, muted ink, soft photography, no neon HUD",
    coverImageHint:
      "cinematic editorial still, darker top-left band for typography, soft vignette, paper or fabric materials",
    fonts: {
      fontTitle: "Source Han Serif SC",
      fontBody: "PingFang SC",
      fontNumeric: "Source Han Serif SC",
    },
    defaultDensity: "airy",
    defaultEmphasis: "title",
  },
  monument: {
    id: "monument",
    label: "纪念碑数字",
    layoutGuidance:
      "超大数字/标题、极少正文；优先 hero-data-monument / hero-slab / metrics-monument / metrics-hero / breath-type / evidence-plaza / problem-tight。禁止密页连密页。",
    surface: "stone, concrete, brushed metal, monumental quiet",
    light: "directional museum light, deep shadow pockets",
    coverScrim: 0.44,
    imageMaterials:
      "monumental materials, concrete stone metal, high contrast quiet space",
    coverImageHint:
      "dark monumental surface, strong vignette, large empty field for oversized type",
    fonts: {
      fontTitle: "Source Han Serif SC",
      fontBody: "PingFang SC",
      fontNumeric: "Source Han Serif SC",
    },
    defaultDensity: "airy",
    defaultEmphasis: "number",
  },
  product: {
    id: "product",
    label: "产品摄影",
    layoutGuidance:
      "大图说话、少 icon；优先 hero-product-showcase / hero-bleed / hero-slab / evidence-plaza / evidence-stage / breath-billboard / pillars-loose / close-quiet。少用冰冷竖轨账本风。",
    surface: "soft product photography, cream desk, natural materials",
    light: "soft beauty light, gentle specular highlights",
    coverScrim: 0.3,
    imageMaterials:
      "real product photography, tactile materials, soft cream neutrals, no clipart",
    coverImageHint:
      "hero product or lifestyle photo, darker left band for title, soft directional light",
    fonts: {
      fontTitle: "Source Han Serif SC",
      fontBody: "PingFang SC",
      fontNumeric: "Source Han Serif SC",
    },
    defaultDensity: "normal",
    defaultEmphasis: "image",
  },
  stage: {
    id: "stage",
    label: "舞台暗场",
    layoutGuidance:
      "暗底庆典、暖金点缀；优先 hero-stage-marquee / hero-slab / metrics-band / breath-floor / evidence-quote / close-floor。少用浅底工程灰。",
    surface: "silk, foil, stage curtain, warm metal",
    light: "warm stage soft light, spotlight falloff",
    coverScrim: 0.48,
    imageMaterials:
      "gala stage materials, silk foil warm metal, soft spotlight, no tech neon",
    coverImageHint:
      "dark stage atmosphere, warm accent glow, deep vignette for light typography",
    fonts: {
      fontTitle: "Source Han Serif SC",
      fontBody: "PingFang SC",
      fontNumeric: "Source Han Serif SC",
    },
    defaultDensity: "normal",
    defaultEmphasis: "title",
  },
};

/** 场合 → 默认视觉家族 */
export const GENRE_TO_FAMILY: Record<DeckGenreId, VisualFamilyId> = {
  "corp-gala": "stage",
  "personal-review": "editorial",
  pitch: "monument",
  brand: "editorial",
  consumer: "product",
  general: "editorial",
};

/**
 * 模板所属家族（可多属）。未列出的模板视为全家族可用，但选套时优先匹配当前家族。
 */
export const TEMPLATE_VISUAL_FAMILY: Record<string, VisualFamilyId[]> = {
  // hero
  "hero-type": ["monument", "editorial"],
  "hero-slab": ["editorial", "monument", "stage", "product"],
  "hero-bleed": ["editorial", "product", "stage"],
  "hero-product-showcase": ["product"],
  "hero-data-monument": ["monument"],
  "hero-report-spine": ["editorial"],
  "hero-stage-marquee": ["stage"],
  "hero-floor": ["stage"],
  "hero-rail": ["editorial", "stage"],
  "hero-split": ["editorial", "stage"],
  "hero-frame": ["editorial", "monument"],
  "manifesto-cover": ["editorial", "stage", "monument"],
  // metrics
  "metrics-monument": ["monument"],
  "metrics-hero": ["monument", "product"],
  "metrics-corner": ["editorial", "monument"],
  "metrics-band": ["stage", "monument"],
  "metrics-ledger": ["editorial"],
  "metrics-focus": ["monument", "editorial"],
  "metrics-stack": ["editorial"],
  "metrics-inline": ["editorial", "product"],
  // pillars
  "pillars-loose": ["editorial", "product", "monument"],
  "pillars-spine": ["editorial"],
  "pillars-mast": ["editorial", "stage"],
  "pillars-open": ["editorial", "product"],
  "pillars-ladder": ["editorial"],
  "pillars-numbers": ["monument"],
  "pillars-stack": ["editorial"],
  "pillars-band": ["stage", "editorial"],
  // evidence
  "evidence-plaza": ["monument", "product"],
  "evidence-stage": ["product", "stage"],
  "evidence-quote": ["editorial", "stage"],
  "evidence-split": ["product", "editorial"],
  "evidence-stack": ["editorial"],
  "evidence-rows": ["editorial"],
  "evidence-aside": ["editorial", "product"],
  "evidence-focus": ["product", "monument"],
  // breath
  "breath-billboard": ["editorial", "monument", "product", "stage"],
  "breath-type": ["monument", "editorial"],
  "breath-mark": ["editorial", "monument"],
  "breath-center": ["editorial"],
  "breath-band": ["stage", "editorial"],
  "breath-split": ["editorial", "product"],
  "breath-floor": ["stage"],
  // problem / solution
  "problem-tight": ["monument", "editorial"],
  "problem-slash": ["monument", "editorial"],
  "problem-ledger": ["editorial"],
  "problem-rail": ["editorial"],
  "problem-stack": ["editorial"],
  "problem-focus": ["monument"],
  "problem-band": ["stage", "editorial"],
  "solution-flow": ["editorial"],
  "solution-cascade": ["editorial", "product"],
  "solution-open": ["editorial", "product"],
  "solution-ladder": ["editorial"],
  "solution-split": ["editorial"],
  "solution-band": ["stage"],
  // agenda / compare / team / timeline / close
  "agenda-folio": ["editorial"],
  "agenda-columns": ["editorial", "monument"],
  "agenda-steps": ["editorial"],
  "agenda-grid": ["editorial"],
  "agenda-rail": ["editorial"],
  "agenda-strip": ["product", "editorial"],
  "agenda-stack": ["editorial"],
  "compare-duel": ["monument", "editorial"],
  "compare-panels": ["editorial", "stage"],
  "compare-quiet": ["editorial"],
  "compare-flags": ["monument"],
  "compare-stack": ["editorial"],
  "compare-band": ["stage"],
  "team-mast": ["editorial", "stage"],
  "team-strip": ["product", "editorial"],
  "team-focus": ["product", "editorial"],
  "team-ladder": ["editorial"],
  "team-rail": ["editorial"],
  "team-band": ["stage"],
  "timeline-mast": ["editorial", "stage"],
  "timeline-pulse": ["editorial"],
  "timeline-vertical": ["editorial"],
  "timeline-stack": ["editorial"],
  "timeline-split": ["editorial"],
  "timeline-band": ["stage"],
  "close-quiet": ["editorial", "product", "monument"],
  "close-floor": ["stage"],
  "close-type": ["monument", "editorial"],
  "close-rail": ["editorial", "stage"],
  "close-split": ["editorial"],
  "close-band": ["stage"],
  "narrative-column": ["editorial"],
};

export function resolveVisualFamily(
  input?: VisualFamilyId | string | null,
  genreId?: DeckGenreId
): VisualFamilyId {
  if (
    input === "editorial" ||
    input === "monument" ||
    input === "product" ||
    input === "stage"
  ) {
    return input;
  }
  if (genreId) return GENRE_TO_FAMILY[genreId];
  return "editorial";
}

export function getMaterialPack(family: VisualFamilyId): MaterialPack {
  return VISUAL_FAMILIES[family];
}

export function templateMatchesFamily(
  templateId: string,
  family: VisualFamilyId
): boolean {
  const families = TEMPLATE_VISUAL_FAMILY[templateId];
  if (!families || families.length === 0) return true;
  return families.includes(family);
}

/** 把材质包落到 ThemeToken（字体、家族、生图材质） */
export function applyMaterialPackToTheme(
  theme: ThemeToken,
  family: VisualFamilyId
): ThemeToken {
  const pack = getMaterialPack(family);
  const tags = Array.from(
    new Set([...(theme.tags || []), pack.label, family])
  );
  return {
    ...theme,
    visualFamily: family,
    material: {
      surface: pack.surface,
      light: pack.light,
      coverScrim: pack.coverScrim,
      imageMaterials: pack.imageMaterials,
      coverImageHint: pack.coverImageHint,
    },
    fontTitle: theme.fontTitle || pack.fonts.fontTitle,
    fontBody: theme.fontBody || pack.fonts.fontBody,
    fontNumeric: theme.fontNumeric || pack.fonts.fontNumeric,
    tags,
  };
}

export function formatFamilyCatalogHint(family: VisualFamilyId): string {
  const pack = getMaterialPack(family);
  return `视觉家族=${pack.id}（${pack.label}）
选套：${pack.layoutGuidance}
材质：${pack.surface}；光：${pack.light}
默认微旋钮建议 density=${pack.defaultDensity}，emphasis=${pack.defaultEmphasis}`;
}
