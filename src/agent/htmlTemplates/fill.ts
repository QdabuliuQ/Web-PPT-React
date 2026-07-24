import type { ThemeToken } from "../types";
import { resolveTemplateId, TEMPLATE_SUITE } from "./pages/registry";
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
  const textOnLight = theme.textOnLight || "#14202B";
  const textOnDark = theme.textOnDark || "#F4F6F8";
  return {
    primary,
    secondary,
    background,
    textOnLight,
    textOnDark,
    muted: "#5C6B7A",
    divider: mixHex(background, primary, 0.14),
    hairline: mixHex(background, primary, 0.08),
    fontTitle: theme.fontTitle || "PingFang SC",
    fontBody: theme.fontBody || "PingFang SC",
    cardFill: "#FFFFFF",
  };
}

/** 深色封面/封底：墨青底 + 亮灰说明 */
export function darkSurfaceColors(
  theme: ThemeToken
): TemplateThemeColors {
  const base = themeToTemplateColors(theme);
  const background = theme.primary || "#121A24";
  const textOnDark = theme.textOnDark || "#F4F6F8";
  return {
    ...base,
    background,
    muted: "#A8B4C0",
    textOnDark,
    secondary: theme.secondary || base.secondary,
    divider: mixHex(background, textOnDark, 0.16),
    hairline: mixHex(background, textOnDark, 0.1),
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
  titlePrefix = "要点"
): ListItem[] {
  const out = [...(items || [])];
  while (out.length < n) {
    out.push({
      title: `${titlePrefix}${out.length + 1}`,
      body: "补充说明。",
    });
  }
  return out.slice(0, n);
}

function padStrings(items: string[], n: number, fallback: string): string[] {
  const out = [...(items || [])];
  while (out.length < n) out.push(fallback);
  return out.slice(0, n);
}

function padMembers(items: TeamMember[]): [TeamMember, TeamMember, TeamMember] {
  const defaults: TeamMember[] = [
    { name: "成员一", role: "角色", blurb: "职责简述。" },
    { name: "成员二", role: "角色", blurb: "职责简述。" },
    { name: "成员三", role: "角色", blurb: "职责简述。" },
  ];
  const out = [...(items || [])];
  while (out.length < 3) out.push(defaults[out.length]);
  return [out[0], out[1], out[2]];
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
    background: escapeAttr(c.background),
    textOnLight: escapeAttr(c.textOnLight),
    textOnDark: escapeAttr(c.textOnDark),
    muted: escapeAttr(c.muted),
    divider: escapeAttr(c.divider),
    hairline: escapeAttr(c.hairline),
    fontTitle: escapeAttr(c.fontTitle),
    fontBody: escapeAttr(c.fontBody),
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
    "i2.title": escapeHtmlText(i2.title),
    "i2.body": escapeHtmlText(i2.body),
    "i3.title": escapeHtmlText(i3.title),
    "i3.body": escapeHtmlText(i3.body),
    "i4.title": escapeHtmlText(i4.title),
    "i4.body": escapeHtmlText(i4.body),
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
    "s2.title": escapeHtmlText(s2.title),
    "s2.body": escapeHtmlText(s2.body),
    "s3.title": escapeHtmlText(s3.title),
    "s3.body": escapeHtmlText(s3.body),
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
    "tm2.name": escapeHtmlText(tm2.name),
    "tm2.role": escapeHtmlText(tm2.role),
    "tm2.blurb": escapeHtmlText(tm2.blurb),
    "tm3.name": escapeHtmlText(tm3.name),
    "tm3.role": escapeHtmlText(tm3.role),
    "tm3.blurb": escapeHtmlText(tm3.blurb),
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

/** pageType → 默认模板 id */
export function templateIdForPageType(
  pageType: string
): HtmlTemplateId | null {
  const map: Record<string, HtmlTemplateId> = {
    hero: "hero-rail",
    metrics: "metrics-ledger",
    pillars: "pillars-open",
    close: "close-rail",
    agenda: "agenda-steps",
    problem: "problem-slash",
    solution: "solution-flow",
    evidence: "evidence-split",
    dual: "compare-duel",
    compare: "compare-duel",
    breath: "breath-mark",
    quote: "breath-mark",
    team: "team-strip",
    timeline: "timeline-pulse",
    narrative: "narrative-column",
  };
  return map[pageType] ?? null;
}
