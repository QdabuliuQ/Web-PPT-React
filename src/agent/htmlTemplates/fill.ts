import type { ThemeToken } from "../types";
import { resolveTemplateId, TEMPLATE_SUITE } from "./pages/registry";
import { resolveFontStack } from "@/fonts/stacks";
import type {
  AgendaTemplateSlots,
  AnyTemplateSlots,
  BreathTemplateSlots,
  CloseTemplateSlots,
  DualTemplateSlots,
  EvidenceTemplateSlots,
  HeroTemplateSlots,
  HtmlTemplateId,
  HtmlTemplateSuiteId,
  ListItem,
  MetricItem,
  MetricsTemplateSlots,
  NarrativeTemplateSlots,
  PillarItem,
  PillarsTemplateSlots,
  ProblemTemplateSlots,
  SolutionTemplateSlots,
  TeamMember,
  TeamTemplateSlots,
  TemplateThemeColors,
  TimelineStep,
  TimelineTemplateSlots,
} from "./types";

export function escapeHtmlText(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 属性值转义（含引号） */
export function escapeAttr(s: string): string {
  return escapeHtmlText(s).replace(/'/g, "&#39;");
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(h: string): [number, number, number] | null {
  const m = String(h || "")
    .replace("#", "")
    .match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** t=0 → a，t=1 → b */
export function mixHex(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  if (!A || !B) return a;
  const mix = (i: number) =>
    clampByte(A[i] * (1 - t) + B[i] * t)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(0)}${mix(1)}${mix(2)}`;
}

function channelLin(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  return (
    0.2126 * channelLin(rgb[0]) +
    0.7152 * channelLin(rgb[1]) +
    0.0722 * channelLin(rgb[2])
  );
}

/** WCAG contrast ratio */
export function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * 深色页辅色：对比不足时向「更亮或更暗」两侧试探，取对比更高者。
 * （禁止无脑向白色抬升——暖色品牌上会变成米色字叠亮橙底。）
 */
function adjustAccentOnSurface(
  accent: string,
  surface: string,
  textOnDark: string,
  textOnLight: string
): string {
  if (contrastRatio(accent, surface) >= 3.2) return accent;
  const towardLight = mixHex(accent, textOnDark, 0.55);
  const towardDark = mixHex(accent, textOnLight, 0.55);
  return contrastRatio(towardLight, surface) >= contrastRatio(towardDark, surface)
    ? towardLight
    : towardDark;
}

/** 用作文字的强调色：保留 secondary 气质，但必须先过 4.5 对比度。 */
function readableAccentOnSurface(
  accent: string,
  surface: string,
  textOnDark: string,
  textOnLight: string
): string {
  if (contrastRatio(accent, surface) >= 4.5) return accent;
  const candidates = [
    mixHex(accent, textOnLight, 0.35),
    mixHex(accent, textOnLight, 0.55),
    mixHex(accent, textOnLight, 0.75),
    mixHex(accent, textOnDark, 0.35),
    mixHex(accent, textOnDark, 0.55),
    mixHex(accent, textOnDark, 0.75),
    textOnLight,
    textOnDark,
  ];
  return (
    candidates.find((c) => contrastRatio(c, surface) >= 4.5) ||
    candidates.sort(
      (a, b) => contrastRatio(b, surface) - contrastRatio(a, surface)
    )[0] ||
    textOnLight
  );
}

/** 叠在色块/底图上的小字：在 textOnDark / textOnLight 中选对比更高者 */
function pickOverlayInk(
  surface: string,
  textOnDark: string,
  textOnLight: string
): string {
  const preferred = [textOnDark, textOnLight].sort(
    (a, b) => contrastRatio(b, surface) - contrastRatio(a, surface)
  );
  const bestPreferred = preferred[0] || textOnDark;
  if (contrastRatio(bestPreferred, surface) >= 4.5) return bestPreferred;

  const fallback = ["#FFFFFF", "#000000"].sort(
    (a, b) => contrastRatio(b, surface) - contrastRatio(a, surface)
  );
  return fallback[0] || bestPreferred;
}

function readableMutedOnSurface(ink: string, surface: string): string {
  const candidates = [0.28, 0.2, 0.12, 0.06, 0].map((t) =>
    mixHex(ink, surface, t)
  );
  return candidates.find((c) => contrastRatio(c, surface) >= 4.5) || ink;
}

function ellipsize(s: string, max: number): string {
  const t = String(s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(1, max - 1))}…`;
}

export function themeToTemplateColors(
  theme: ThemeToken
): TemplateThemeColors {
  const background = theme.background || "#EEF1F4";
  const primary = theme.primary || "#1A2B3C";
  const secondary = theme.secondary || "#B8954A";
  const rawTextOnLight = theme.textOnLight || "#14202B";
  const rawTextOnDark = theme.textOnDark || "#F4F6F8";
  const textOnLight = pickOverlayInk(background, rawTextOnDark, rawTextOnLight);
  const textOnDark = pickOverlayInk(primary, rawTextOnDark, rawTextOnLight);
  const eyebrow = pickOverlayInk(background, textOnDark, textOnLight);
  const primaryInk = pickOverlayInk(primary, textOnDark, textOnLight);
  const primaryText = readableAccentOnSurface(
    primary,
    background,
    textOnDark,
    textOnLight
  );
  const secondaryInk = pickOverlayInk(secondary, textOnDark, textOnLight);
  const accentText = readableAccentOnSurface(
    secondary,
    background,
    textOnDark,
    textOnLight
  );
  const accentOnPrimary = readableAccentOnSurface(
    secondary,
    primary,
    textOnDark,
    textOnLight
  );
  const scrimStrength = theme.material?.coverScrim ?? 0.28;
  return {
    primary,
    secondary,
    accentText,
    primaryInk,
    primaryText,
    secondaryInk,
    accentOnPrimary,
    background,
    textOnLight,
    textOnDark,
    eyebrow,
    scrim: mixHex(background, "#000000", scrimStrength),
    // 弱化正文仍必须可读，避免浅底灰字过浅。
    muted: readableMutedOnSurface(textOnLight, background),
    divider: mixHex(background, primary, 0.14),
    hairline: mixHex(background, primary, 0.08),
    fontTitle: resolveFontStack(theme.fontTitle || "Source Han Serif SC"),
    fontBody: resolveFontStack(theme.fontBody || "PingFang SC"),
    fontNumeric: resolveFontStack(
      theme.fontNumeric ||
        (/serif|song|songti|stsong/i.test(theme.fontTitle || "")
          ? theme.fontTitle || "Source Han Serif SC"
          : "Source Han Serif SC")
    ),
    cardFill: mixHex("#FFFFFF", background, 0.12),
  };
}

/** 深色封面/封底：墨底 + 叠字墨水自动选高对比；辅色双向校正 */
export function darkSurfaceColors(
  theme: ThemeToken
): TemplateThemeColors {
  const base = themeToTemplateColors(theme);
  const background = theme.primary || "#121A24";
  const textOnLight = theme.textOnLight || "#14202B";
  const textOnDark = pickOverlayInk(
    background,
    theme.textOnDark || "#F4F6F8",
    textOnLight
  );
  const eyebrow = pickOverlayInk(background, textOnDark, textOnLight);
  const secondary = adjustAccentOnSurface(
    theme.secondary || base.secondary,
    background,
    textOnDark,
    textOnLight
  );
  const primaryInk = pickOverlayInk(base.primary, textOnDark, textOnLight);
  const secondaryInk = pickOverlayInk(secondary, textOnDark, textOnLight);
  const accentText = readableAccentOnSurface(
    secondary,
    background,
    textOnDark,
    textOnLight
  );
  const accentOnPrimary = readableAccentOnSurface(
    secondary,
    base.primary,
    textOnDark,
    textOnLight
  );
  const muted = readableMutedOnSurface(textOnDark, background);
  const scrimStrength = Math.min(
    0.62,
    Math.max(0.3, theme.material?.coverScrim ?? 0.42)
  );
  return {
    ...base,
    background,
    textOnDark,
    textOnLight,
    eyebrow,
    scrim: mixHex(background, "#000000", scrimStrength),
    muted,
    secondary,
    accentText,
    primaryInk,
    primaryText: readableAccentOnSurface(
      base.primary,
      background,
      textOnDark,
      textOnLight
    ),
    secondaryInk,
    accentOnPrimary,
    divider: mixHex(background, eyebrow, 0.2),
    hairline: mixHex(background, eyebrow, 0.12),
  };
}

function fillPlaceholders(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v != null ? v : "";
  });
}

function padMetrics(items: MetricItem[]): [MetricItem, MetricItem, MetricItem] {
  const defaults: MetricItem[] = [
    { value: "—", label: "指标一" },
    { value: "—", label: "指标二" },
    { value: "—", label: "指标三" },
  ];
  const out = [...items];
  while (out.length < 3) out.push(defaults[out.length]);
  return [out[0], out[1], out[2]].map((m) => ({
    value: ellipsize(m.value, 12),
    label: ellipsize(m.label, 36),
  })) as [MetricItem, MetricItem, MetricItem];
}

function padPillars(items: PillarItem[]): [PillarItem, PillarItem, PillarItem] {
  const defaults: PillarItem[] = [
    {
      iconName: "Lightning",
      title: "要点一",
      body: "补充本要点的具体成果与方法。",
    },
    {
      iconName: "Aiming",
      title: "要点二",
      body: "补充本要点的具体成果与方法。",
    },
    {
      iconName: "CheckOne",
      title: "要点三",
      body: "补充本要点的具体成果与方法。",
    },
  ];
  const out = [...items];
  while (out.length < 3) out.push(defaults[out.length]);
  return [out[0], out[1], out[2]];
}

function padList(
  items: ListItem[],
  n: number,
  titlePrefix = "要点",
  iconDefaults: string[] = ["Lightning", "Aiming", "CheckOne", "Star"]
): ListItem[] {
  const out = [...(items || [])];
  while (out.length < n) {
    out.push({
      title: `${titlePrefix}${out.length + 1}`,
      body: "明确动作、交付物与判断依据，避免停留在口号。",
      iconName: iconDefaults[out.length % iconDefaults.length],
    });
  }
  return out.slice(0, n).map((it, i) => ({
    ...it,
    title: String(it.title || "").trim() || `${titlePrefix}${i + 1}`,
    body:
      String(it.body || "").trim() ||
      "明确动作、交付物与判断依据，避免停留在口号。",
    iconName:
      it.iconName || iconDefaults[i % iconDefaults.length] || "CheckOne",
  }));
}

function padStrings(items: string[], n: number, fallback: string): string[] {
  const out = [...(items || [])];
  while (out.length < n) out.push(fallback);
  return out.slice(0, n);
}

function padMembers(items: TeamMember[]): [TeamMember, TeamMember, TeamMember] {
  const defaults: TeamMember[] = [
    {
      name: "成员一",
      role: "角色",
      blurb: "职责简述。",
      imagePrompt:
        "Professional head-and-shoulders portrait, soft studio lighting, isolated on transparent background, PNG cutout, no text",
    },
    {
      name: "成员二",
      role: "角色",
      blurb: "职责简述。",
      imagePrompt:
        "Professional head-and-shoulders portrait, soft studio lighting, isolated on transparent background, PNG cutout, no text",
    },
    {
      name: "成员三",
      role: "角色",
      blurb: "职责简述。",
      imagePrompt:
        "Professional head-and-shoulders portrait, soft studio lighting, isolated on transparent background, PNG cutout, no text",
    },
  ];
  const out = [...(items || [])];
  while (out.length < 3) out.push(defaults[out.length]);
  return [out[0], out[1], out[2]].map((m, i) => ({
    ...m,
    imagePrompt: m.imagePrompt || defaults[i].imagePrompt,
  })) as [TeamMember, TeamMember, TeamMember];
}

function padTimeline(
  items: TimelineStep[]
): [TimelineStep, TimelineStep, TimelineStep, TimelineStep] {
  const defaults: TimelineStep[] = [
    { label: "阶段一", detail: "说明" },
    { label: "阶段二", detail: "说明" },
    { label: "阶段三", detail: "说明" },
    { label: "阶段四", detail: "说明" },
  ];
  const out = [...(items || [])];
  while (out.length < 4) out.push(defaults[out.length]);
  return [out[0], out[1], out[2], out[3]];
}

function flatThemeVars(c: TemplateThemeColors): Record<string, string> {
  return {
    primary: escapeAttr(c.primary),
    secondary: escapeAttr(c.secondary),
    accentText: escapeAttr(c.accentText),
    primaryInk: escapeAttr(c.primaryInk),
    primaryText: escapeAttr(c.primaryText),
    secondaryInk: escapeAttr(c.secondaryInk),
    accentOnPrimary: escapeAttr(c.accentOnPrimary),
    background: escapeAttr(c.background),
    textOnLight: escapeAttr(c.textOnLight),
    textOnDark: escapeAttr(c.textOnDark),
    eyebrow: escapeAttr(c.eyebrow),
    scrim: escapeAttr(c.scrim),
    muted: escapeAttr(c.muted),
    divider: escapeAttr(c.divider),
    hairline: escapeAttr(c.hairline),
    fontTitle: escapeAttr(c.fontTitle),
    fontBody: escapeAttr(c.fontBody),
    fontNumeric: escapeAttr(c.fontNumeric),
    cardFill: escapeAttr(c.cardFill),
  };
}

function colorsForSuite(
  id: HtmlTemplateSuiteId,
  theme: ThemeToken
): TemplateThemeColors {
  return TEMPLATE_SUITE[id].dark
    ? darkSurfaceColors(theme)
    : themeToTemplateColors(theme);
}

function renderWithHtml(
  id: HtmlTemplateSuiteId,
  vars: Record<string, string>
): string {
  return fillPlaceholders(TEMPLATE_SUITE[id].html, vars);
}

export function renderHeroTemplate(
  slots: HeroTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "hero-rail"
): string {
  const c = colorsForSuite(suiteId, theme);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    subtitle: escapeHtmlText(slots.subtitle),
    footer: escapeHtmlText(slots.footer || ""),
    bgImageKey: escapeAttr(slots.bgImageKey),
    bgImagePrompt: escapeAttr(slots.bgImagePrompt),
  });
}

export function renderMetricsTemplate(
  slots: MetricsTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "metrics-ledger"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [m1, m2, m3] = padMetrics(slots.metrics || []);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    footer: escapeHtmlText(slots.footer),
    "m1.value": escapeHtmlText(m1.value),
    "m1.label": escapeHtmlText(m1.label),
    "m2.value": escapeHtmlText(m2.value),
    "m2.label": escapeHtmlText(m2.label),
    "m3.value": escapeHtmlText(m3.value),
    "m3.label": escapeHtmlText(m3.label),
  });
}

export function renderPillarsTemplate(
  slots: PillarsTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "pillars-open"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [p1, p2, p3] = padPillars(slots.pillars || []);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    "p1.iconName": escapeAttr(p1.iconName),
    "p1.title": escapeHtmlText(p1.title),
    "p1.body": escapeHtmlText(p1.body),
    "p2.iconName": escapeAttr(p2.iconName),
    "p2.title": escapeHtmlText(p2.title),
    "p2.body": escapeHtmlText(p2.body),
    "p3.iconName": escapeAttr(p3.iconName),
    "p3.title": escapeHtmlText(p3.title),
    "p3.body": escapeHtmlText(p3.body),
  });
}

export function renderCloseTemplate(
  slots: CloseTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "close-rail"
): string {
  const c = colorsForSuite(suiteId, theme);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    subtitle: escapeHtmlText(slots.subtitle),
    contact: escapeHtmlText(slots.contact || ""),
    bgImageKey: escapeAttr(slots.bgImageKey),
    bgImagePrompt: escapeAttr(slots.bgImagePrompt),
  });
}

export function renderAgendaTemplate(
  slots: AgendaTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "agenda-steps"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [i1, i2, i3, i4] = padList(slots.items || [], 4, "议程");
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    "i1.title": escapeHtmlText(i1.title),
    "i1.body": escapeHtmlText(i1.body),
    "i1.iconName": escapeAttr(i1.iconName || "Lightning"),
    "i2.title": escapeHtmlText(i2.title),
    "i2.body": escapeHtmlText(i2.body),
    "i2.iconName": escapeAttr(i2.iconName || "Aiming"),
    "i3.title": escapeHtmlText(i3.title),
    "i3.body": escapeHtmlText(i3.body),
    "i3.iconName": escapeAttr(i3.iconName || "CheckOne"),
    "i4.title": escapeHtmlText(i4.title),
    "i4.body": escapeHtmlText(i4.body),
    "i4.iconName": escapeAttr(i4.iconName || "Star"),
  });
}

export function renderProblemTemplate(
  slots: ProblemTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "problem-slash"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [pt1, pt2, pt3] = padStrings(slots.points || [], 3, "补充要点");
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    body: escapeHtmlText(slots.body),
    pt1: escapeHtmlText(pt1),
    pt2: escapeHtmlText(pt2),
    pt3: escapeHtmlText(pt3),
  });
}

export function renderSolutionTemplate(
  slots: SolutionTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "solution-flow"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [s1, s2, s3] = padList(slots.steps || [], 3, "步骤");
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    "s1.title": escapeHtmlText(s1.title),
    "s1.body": escapeHtmlText(s1.body),
    "s1.iconName": escapeAttr(s1.iconName || "Lightning"),
    "s2.title": escapeHtmlText(s2.title),
    "s2.body": escapeHtmlText(s2.body),
    "s2.iconName": escapeAttr(s2.iconName || "Aiming"),
    "s3.title": escapeHtmlText(s3.title),
    "s3.body": escapeHtmlText(s3.body),
    "s3.iconName": escapeAttr(s3.iconName || "CheckOne"),
  });
}

export function renderEvidenceTemplate(
  slots: EvidenceTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "evidence-split"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [b1, b2, b3] = padStrings(slots.bullets || [], 3, "解读要点");
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    caption: escapeHtmlText(slots.caption),
    b1: escapeHtmlText(b1),
    b2: escapeHtmlText(b2),
    b3: escapeHtmlText(b3),
    imageKey: escapeAttr(slots.imageKey || `${slots.pageId}_evidence`),
    imagePrompt: escapeAttr(
      slots.imagePrompt ||
        "Clean editorial photograph of a modern product dashboard, soft daylight, light surface, no readable text, no logos, no watermark"
    ),
  });
}

export function renderDualTemplate(
  slots: DualTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "compare-duel"
): string {
  const c = colorsForSuite(suiteId, theme);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    leftTitle: escapeHtmlText(slots.leftTitle),
    leftBody: escapeHtmlText(slots.leftBody),
    rightTitle: escapeHtmlText(slots.rightTitle),
    rightBody: escapeHtmlText(slots.rightBody),
  });
}

export function renderBreathTemplate(
  slots: BreathTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "breath-mark"
): string {
  const c = colorsForSuite(suiteId, theme);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    quote: escapeHtmlText(slots.quote),
    attribution: escapeHtmlText(slots.attribution),
  });
}

export function renderTeamTemplate(
  slots: TeamTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "team-strip"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [tm1, tm2, tm3] = padMembers(slots.members || []);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    "tm1.name": escapeHtmlText(tm1.name),
    "tm1.role": escapeHtmlText(tm1.role),
    "tm1.blurb": escapeHtmlText(tm1.blurb),
    "tm1.imageKey": escapeAttr(tm1.imageKey || `${slots.pageId}_avatar_1`),
    "tm1.imagePrompt": escapeAttr(tm1.imagePrompt || ""),
    "tm2.name": escapeHtmlText(tm2.name),
    "tm2.role": escapeHtmlText(tm2.role),
    "tm2.blurb": escapeHtmlText(tm2.blurb),
    "tm2.imageKey": escapeAttr(tm2.imageKey || `${slots.pageId}_avatar_2`),
    "tm2.imagePrompt": escapeAttr(tm2.imagePrompt || ""),
    "tm3.name": escapeHtmlText(tm3.name),
    "tm3.role": escapeHtmlText(tm3.role),
    "tm3.blurb": escapeHtmlText(tm3.blurb),
    "tm3.imageKey": escapeAttr(tm3.imageKey || `${slots.pageId}_avatar_3`),
    "tm3.imagePrompt": escapeAttr(tm3.imagePrompt || ""),
  });
}

export function renderTimelineTemplate(
  slots: TimelineTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "timeline-pulse"
): string {
  const c = colorsForSuite(suiteId, theme);
  const [t1, t2, t3, t4] = padTimeline(slots.steps || []);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    "t1.label": escapeHtmlText(t1.label),
    "t1.detail": escapeHtmlText(t1.detail),
    "t2.label": escapeHtmlText(t2.label),
    "t2.detail": escapeHtmlText(t2.detail),
    "t3.label": escapeHtmlText(t3.label),
    "t3.detail": escapeHtmlText(t3.detail),
    "t4.label": escapeHtmlText(t4.label),
    "t4.detail": escapeHtmlText(t4.detail),
  });
}

export function renderNarrativeTemplate(
  slots: NarrativeTemplateSlots,
  theme: ThemeToken,
  suiteId: HtmlTemplateSuiteId = "narrative-column"
): string {
  const c = colorsForSuite(suiteId, theme);
  return renderWithHtml(suiteId, {
    ...flatThemeVars(c),
    pageId: escapeAttr(slots.pageId),
    title: escapeHtmlText(slots.title),
    body: escapeHtmlText(slots.body),
    aside: escapeHtmlText(slots.aside || ""),
  });
}

export function renderHtmlTemplate(
  id: HtmlTemplateId,
  slots: AnyTemplateSlots,
  theme: ThemeToken
): string {
  const suiteId = resolveTemplateId(id);
  if (!suiteId) throw new Error(`未知模板: ${id}`);

  const kind = TEMPLATE_SUITE[suiteId].kind;

  switch (kind) {
    case "hero":
      return renderHeroTemplate(slots as HeroTemplateSlots, theme, suiteId);
    case "metrics":
      return renderMetricsTemplate(
        slots as MetricsTemplateSlots,
        theme,
        suiteId
      );
    case "pillars":
      return renderPillarsTemplate(
        slots as PillarsTemplateSlots,
        theme,
        suiteId
      );
    case "close":
      return renderCloseTemplate(slots as CloseTemplateSlots, theme, suiteId);
    case "agenda":
      return renderAgendaTemplate(slots as AgendaTemplateSlots, theme, suiteId);
    case "problem":
      return renderProblemTemplate(slots as ProblemTemplateSlots, theme, suiteId);
    case "solution":
      return renderSolutionTemplate(
        slots as SolutionTemplateSlots,
        theme,
        suiteId
      );
    case "evidence":
      return renderEvidenceTemplate(
        slots as EvidenceTemplateSlots,
        theme,
        suiteId
      );
    case "dual":
      return renderDualTemplate(slots as DualTemplateSlots, theme, suiteId);
    case "breath":
      return renderBreathTemplate(slots as BreathTemplateSlots, theme, suiteId);
    case "team":
      return renderTeamTemplate(slots as TeamTemplateSlots, theme, suiteId);
    case "timeline":
      return renderTimelineTemplate(
        slots as TimelineTemplateSlots,
        theme,
        suiteId
      );
    case "narrative":
      return renderNarrativeTemplate(
        slots as NarrativeTemplateSlots,
        theme,
        suiteId
      );
    default:
      throw new Error(`未知模板: ${id}`);
  }
}
