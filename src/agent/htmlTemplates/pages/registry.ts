import type { HtmlTemplateSuiteId } from "../types";
import {
  HERO_RAIL,
  HERO_SPLIT,
  HERO_TYPE,
  MANIFESTO_COVER,
} from "./heroes";
import {
  METRICS_BAND,
  METRICS_FOCUS,
  METRICS_LEDGER,
} from "./metricsFamily";
import {
  CLOSE_QUIET,
  CLOSE_RAIL,
  PILLARS_LADDER,
  PILLARS_OPEN,
} from "./pillarsClose";
import {
  AGENDA_GRID,
  AGENDA_RAIL,
  AGENDA_STACK,
  AGENDA_STRIP,
  BREATH_BAND,
  BREATH_CENTER,
  BREATH_SPLIT,
  BREATH_TYPE,
  CLOSE_BAND,
  CLOSE_SPLIT,
  CLOSE_TYPE,
  COMPARE_BAND,
  COMPARE_FLAGS,
  COMPARE_QUIET,
  COMPARE_STACK,
  EVIDENCE_ASIDE,
  EVIDENCE_FOCUS,
  EVIDENCE_ROWS,
  EVIDENCE_STACK,
  HERO_FRAME,
  METRICS_INLINE,
  METRICS_STACK,
  PILLARS_BAND,
  PILLARS_NUMBERS,
  PILLARS_STACK,
  PROBLEM_BAND,
  PROBLEM_FOCUS,
  PROBLEM_LEDGER,
  PROBLEM_STACK,
  SOLUTION_BAND,
  SOLUTION_LADDER,
  SOLUTION_OPEN,
  SOLUTION_SPLIT,
  TEAM_BAND,
  TEAM_FOCUS,
  TEAM_LADDER,
  TEAM_RAIL,
  TIMELINE_BAND,
  TIMELINE_SPLIT,
  TIMELINE_STACK,
  TIMELINE_VERTICAL,
} from "./expand";
import {
  AGENDA_STEPS,
  BREATH_MARK,
  COMPARE_DUEL,
  EVIDENCE_SPLIT,
  NARRATIVE_COLUMN,
  PROBLEM_SLASH,
  SOLUTION_FLOW,
  TEAM_STRIP,
  TIMELINE_PULSE,
} from "./story";

export type TemplateKind =
  | "hero"
  | "metrics"
  | "pillars"
  | "close"
  | "agenda"
  | "dual"
  | "breath"
  | "team"
  | "timeline"
  | "narrative"
  | "evidence"
  | "problem"
  | "solution";

export type TemplateMeta = {
  id: HtmlTemplateSuiteId;
  kind: TemplateKind;
  /** 深色封面/封底类 */
  dark?: boolean;
  title: string;
  signature: string;
  html: string;
};

/** 61 套实体模板（frontend-design 差异化签名） */
export const TEMPLATE_SUITE: Record<HtmlTemplateSuiteId, TemplateMeta> = {
  "hero-rail": {
    id: "hero-rail",
    kind: "hero",
    dark: true,
    title: "竖轨封面",
    signature: "左侧黄铜竖轨 + 左下大标题",
    html: HERO_RAIL,
  },
  "hero-split": {
    id: "hero-split",
    kind: "hero",
    dark: true,
    title: "分栏封面",
    signature: "左墨区标题 + 右黄铜实底说明",
    html: HERO_SPLIT,
  },
  "hero-type": {
    id: "hero-type",
    kind: "hero",
    dark: true,
    title: "巨型标题封面",
    signature: "标题即画面",
    html: HERO_TYPE,
  },
  "hero-frame": {
    id: "hero-frame",
    kind: "hero",
    dark: true,
    title: "框线封面",
    signature: "四角 L 形框线锚定标题区",
    html: HERO_FRAME,
  },
  "manifesto-cover": {
    id: "manifesto-cover",
    kind: "hero",
    dark: true,
    title: "宣言封面",
    signature: "左边条 + 右窄栏副文",
    html: MANIFESTO_COVER,
  },
  "metrics-ledger": {
    id: "metrics-ledger",
    kind: "metrics",
    title: "账本 KPI",
    signature: "左对齐大数字 + 细竖分隔",
    html: METRICS_LEDGER,
  },
  "metrics-band": {
    id: "metrics-band",
    kind: "metrics",
    title: "色带 KPI",
    signature: "主色横贯色带承载三项",
    html: METRICS_BAND,
  },
  "metrics-focus": {
    id: "metrics-focus",
    kind: "metrics",
    title: "焦点 KPI",
    signature: "左侧巨型主指标 + 右辅两项",
    html: METRICS_FOCUS,
  },
  "metrics-stack": {
    id: "metrics-stack",
    kind: "metrics",
    title: "堆叠 KPI",
    signature: "纵向堆叠三项大数字",
    html: METRICS_STACK,
  },
  "metrics-inline": {
    id: "metrics-inline",
    kind: "metrics",
    title: "内联 KPI",
    signature: "单行居中三指标 + 竖分隔",
    html: METRICS_INLINE,
  },
  "pillars-open": {
    id: "pillars-open",
    kind: "pillars",
    title: "开放三栏",
    signature: "去白卡墙，顶黄铜线",
    html: PILLARS_OPEN,
  },
  "pillars-ladder": {
    id: "pillars-ladder",
    kind: "pillars",
    title: "阶梯要点",
    signature: "竖向序号阶梯（真实顺序）",
    html: PILLARS_LADDER,
  },
  "pillars-numbers": {
    id: "pillars-numbers",
    kind: "pillars",
    title: "序号要点",
    signature: "巨型序号 01–03 作列头",
    html: PILLARS_NUMBERS,
  },
  "pillars-stack": {
    id: "pillars-stack",
    kind: "pillars",
    title: "堆叠要点",
    signature: "纵向堆叠三要点，左图标行",
    html: PILLARS_STACK,
  },
  "pillars-band": {
    id: "pillars-band",
    kind: "pillars",
    title: "色带要点",
    signature: "底墨带三列要点",
    html: PILLARS_BAND,
  },
  "close-rail": {
    id: "close-rail",
    kind: "close",
    dark: true,
    title: "竖轨封底",
    signature: "与封面同竖轨，左下收束",
    html: CLOSE_RAIL,
  },
  "close-quiet": {
    id: "close-quiet",
    kind: "close",
    dark: true,
    title: "留白封底",
    signature: "极端留白单句收束",
    html: CLOSE_QUIET,
  },
  "close-split": {
    id: "close-split",
    kind: "close",
    dark: true,
    title: "分栏封底",
    signature: "右黄铜实底 + 左下收束",
    html: CLOSE_SPLIT,
  },
  "close-type": {
    id: "close-type",
    kind: "close",
    dark: true,
    title: "巨型收束",
    signature: "超大字号收束贴底",
    html: CLOSE_TYPE,
  },
  "close-band": {
    id: "close-band",
    kind: "close",
    dark: true,
    title: "色带封底",
    signature: "底黄铜横带收束",
    html: CLOSE_BAND,
  },
  "agenda-steps": {
    id: "agenda-steps",
    kind: "agenda",
    title: "议程四步",
    signature: "编号序列议程行",
    html: AGENDA_STEPS,
  },
  "agenda-grid": {
    id: "agenda-grid",
    kind: "agenda",
    title: "网格议程",
    signature: "2×2 网格，编号在格内左上",
    html: AGENDA_GRID,
  },
  "agenda-rail": {
    id: "agenda-rail",
    kind: "agenda",
    title: "竖轨议程",
    signature: "左竖轨 + 右议程列表",
    html: AGENDA_RAIL,
  },
  "agenda-strip": {
    id: "agenda-strip",
    kind: "agenda",
    title: "色带议程",
    signature: "横贯色带承载四项议程",
    html: AGENDA_STRIP,
  },
  "agenda-stack": {
    id: "agenda-stack",
    kind: "agenda",
    title: "堆叠议程",
    signature: "大标题堆叠 + 细线分隔",
    html: AGENDA_STACK,
  },
  "problem-slash": {
    id: "problem-slash",
    kind: "problem",
    title: "问题劈栏",
    signature: "左墨区问题 + 右要点",
    html: PROBLEM_SLASH,
  },
  "problem-stack": {
    id: "problem-stack",
    kind: "problem",
    title: "堆叠问题",
    signature: "全宽纵向堆叠，标题→叙事→要点",
    html: PROBLEM_STACK,
  },
  "problem-focus": {
    id: "problem-focus",
    kind: "problem",
    title: "焦点问题",
    signature: "居中焦点标题 + 下方三要点",
    html: PROBLEM_FOCUS,
  },
  "problem-ledger": {
    id: "problem-ledger",
    kind: "problem",
    title: "账本问题",
    signature: "账本横线分隔三要点",
    html: PROBLEM_LEDGER,
  },
  "problem-band": {
    id: "problem-band",
    kind: "problem",
    title: "色带问题",
    signature: "底墨带承载问题叙事",
    html: PROBLEM_BAND,
  },
  "solution-flow": {
    id: "solution-flow",
    kind: "solution",
    title: "方案三流",
    signature: "顶线 + 大序号流程",
    html: SOLUTION_FLOW,
  },
  "solution-ladder": {
    id: "solution-ladder",
    kind: "solution",
    title: "阶梯方案",
    signature: "竖向阶梯三步骤（01→03）",
    html: SOLUTION_LADDER,
  },
  "solution-split": {
    id: "solution-split",
    kind: "solution",
    title: "分栏方案",
    signature: "左标题区 + 右三步骤",
    html: SOLUTION_SPLIT,
  },
  "solution-band": {
    id: "solution-band",
    kind: "solution",
    title: "色带方案",
    signature: "主色横带承载三步骤",
    html: SOLUTION_BAND,
  },
  "solution-open": {
    id: "solution-open",
    kind: "solution",
    title: "开放方案",
    signature: "开放三列，顶线分隔无卡片",
    html: SOLUTION_OPEN,
  },
  "evidence-split": {
    id: "evidence-split",
    kind: "evidence",
    title: "证据分栏",
    signature: "左证据块 + 右解读",
    html: EVIDENCE_SPLIT,
  },
  "evidence-stack": {
    id: "evidence-stack",
    kind: "evidence",
    title: "堆叠证据",
    signature: "证据块在上，解读三行在下",
    html: EVIDENCE_STACK,
  },
  "evidence-rows": {
    id: "evidence-rows",
    kind: "evidence",
    title: "行式证据",
    signature: "三行解读横排，左黄铜标记",
    html: EVIDENCE_ROWS,
  },
  "evidence-aside": {
    id: "evidence-aside",
    kind: "evidence",
    title: "侧注证据",
    signature: "右窄栏侧注 + 左主证据",
    html: EVIDENCE_ASIDE,
  },
  "evidence-focus": {
    id: "evidence-focus",
    kind: "evidence",
    title: "焦点证据",
    signature: "巨型证据块垄断画面",
    html: EVIDENCE_FOCUS,
  },
  "compare-duel": {
    id: "compare-duel",
    kind: "dual",
    title: "双栏对比",
    signature: "中线对决两栏",
    html: COMPARE_DUEL,
  },
  "compare-stack": {
    id: "compare-stack",
    kind: "dual",
    title: "堆叠对比",
    signature: "上下堆叠对比两栏",
    html: COMPARE_STACK,
  },
  "compare-band": {
    id: "compare-band",
    kind: "dual",
    title: "色带对比",
    signature: "主色横带承载双栏对比",
    html: COMPARE_BAND,
  },
  "compare-quiet": {
    id: "compare-quiet",
    kind: "dual",
    title: "极简对比",
    signature: "极简留白双栏，细线分隔",
    html: COMPARE_QUIET,
  },
  "compare-flags": {
    id: "compare-flags",
    kind: "dual",
    title: "旗标对比",
    signature: "左右旗标色块标记两栏",
    html: COMPARE_FLAGS,
  },
  "breath-mark": {
    id: "breath-mark",
    kind: "breath",
    title: "金句留白",
    signature: "竖轨引用标记",
    html: BREATH_MARK,
  },
  "breath-center": {
    id: "breath-center",
    kind: "breath",
    title: "居中金句",
    signature: "居中巨型金句",
    html: BREATH_CENTER,
  },
  "breath-band": {
    id: "breath-band",
    kind: "breath",
    title: "色带金句",
    signature: "主色横带承载金句",
    html: BREATH_BAND,
  },
  "breath-type": {
    id: "breath-type",
    kind: "breath",
    title: "巨型金句",
    signature: "超大字号金句贴顶",
    html: BREATH_TYPE,
  },
  "breath-split": {
    id: "breath-split",
    kind: "breath",
    title: "分栏金句",
    signature: "左金句 + 右归属",
    html: BREATH_SPLIT,
  },
  "team-strip": {
    id: "team-strip",
    kind: "team",
    title: "团队横条",
    signature: "三列人像点 + 角色",
    html: TEAM_STRIP,
  },
  "team-ladder": {
    id: "team-ladder",
    kind: "team",
    title: "阶梯团队",
    signature: "纵向阶梯三人",
    html: TEAM_LADDER,
  },
  "team-focus": {
    id: "team-focus",
    kind: "team",
    title: "焦点团队",
    signature: "左侧焦点成员 + 右辅两人",
    html: TEAM_FOCUS,
  },
  "team-rail": {
    id: "team-rail",
    kind: "team",
    title: "竖轨团队",
    signature: "左竖轨 + 右成员列表",
    html: TEAM_RAIL,
  },
  "team-band": {
    id: "team-band",
    kind: "team",
    title: "色带团队",
    signature: "底墨带三成员横排",
    html: TEAM_BAND,
  },
  "timeline-pulse": {
    id: "timeline-pulse",
    kind: "timeline",
    title: "时间脉搏",
    signature: "横轴四节点",
    html: TIMELINE_PULSE,
  },
  "timeline-vertical": {
    id: "timeline-vertical",
    kind: "timeline",
    title: "竖轴时间",
    signature: "左竖轴四节点",
    html: TIMELINE_VERTICAL,
  },
  "timeline-stack": {
    id: "timeline-stack",
    kind: "timeline",
    title: "堆叠时间",
    signature: "纵向堆叠四阶段",
    html: TIMELINE_STACK,
  },
  "timeline-split": {
    id: "timeline-split",
    kind: "timeline",
    title: "分栏时间",
    signature: "左标题 + 右时间轴",
    html: TIMELINE_SPLIT,
  },
  "timeline-band": {
    id: "timeline-band",
    kind: "timeline",
    title: "色带时间",
    signature: "主色横带四节点",
    html: TIMELINE_BAND,
  },
  "narrative-column": {
    id: "narrative-column",
    kind: "narrative",
    title: "叙事双栏",
    signature: "主文 + 侧注",
    html: NARRATIVE_COLUMN,
  },
};

/** 短别名 → 实体套 */
export const TEMPLATE_ALIASES: Record<string, HtmlTemplateSuiteId> = {
  hero: "hero-rail",
  metrics: "metrics-ledger",
  pillars: "pillars-open",
  close: "close-rail",
};

export function resolveTemplateId(id: string): HtmlTemplateSuiteId | null {
  if (id in TEMPLATE_SUITE) return id as HtmlTemplateSuiteId;
  if (id in TEMPLATE_ALIASES) return TEMPLATE_ALIASES[id];
  return null;
}
