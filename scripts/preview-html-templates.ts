/**
 * 生成 61 套 HTML 模板预览到 agent-output/html-templates-preview/
 * 用法: npx tsx scripts/preview-html-templates.ts
 */
import fs from "node:fs";
import path from "node:path";
import {
  HTML_TEMPLATE_SUITE_IDS,
  PAGE_TYPE_TEMPLATE_SUITES,
  TEMPLATE_SUITE,
  renderHtmlTemplate,
  type AnyTemplateSlots,
  type HtmlTemplateSuiteId,
} from "../src/agent/htmlTemplates";
import type { PageType, ThemeToken } from "../src/agent/types";

const theme: ThemeToken = {
  templateName: "engineering-brief",
  category: "report",
  tags: ["ink", "brass"],
  primary: "#1A2B3C",
  secondary: "#B8954A",
  background: "#EEF1F4",
  textOnLight: "#14202B",
  textOnDark: "#F4F6F8",
  fontTitle: "PingFang SC",
  fontBody: "PingFang SC",
};

/** 各 kind 的 canonical 样例（显式维护） */
const canonicalSamples: Partial<Record<HtmlTemplateSuiteId, AnyTemplateSlots>> = {
  "hero-rail": {
    pageId: "hero-rail",
    title: "工程述职简报",
    subtitle: "平台稳定性、交付效率与设计系统落地一年回顾",
    footer: "WEB PLATFORM · 2025",
    bgImageKey: "hero_bg",
    bgImagePrompt: "abstract dark engineering atmosphere",
  },
  "metrics-ledger": {
    pageId: "metrics-ledger",
    title: "年度关键成果",
    metrics: [
      { value: "40%", label: "首屏加载性能提升" },
      { value: "95%", label: "代码复用率" },
      { value: "12", label: "核心模块重构数" },
    ],
    footer: "基于 Lighthouse 与自建监控，全站性能优于同业 85% 以上",
  },
  "pillars-open": {
    pageId: "pillars-open",
    title: "三件必须做对的事",
    pillars: [
      {
        iconName: "Lightning",
        title: "稳定编译",
        body: "HTML→绝对坐标的路径可复现，避免手改 JSON。",
      },
      {
        iconName: "Aiming",
        title: "版式约束",
        body: "槽位固定，内容可变；签名构图不被内容冲散。",
      },
      {
        iconName: "CheckOne",
        title: "可审阅",
        body: "预览与编辑器同源测量，差异可解释。",
      },
    ],
  },
  "close-rail": {
    pageId: "close-rail",
    title: "下一程：把模板接进流水线",
    subtitle: "从样例到默认路径，缩短改稿循环。",
    contact: "platform@example.com",
    bgImageKey: "close_bg",
    bgImagePrompt: "quiet dark close",
  },
  "agenda-steps": {
    pageId: "agenda-steps",
    title: "今日议程",
    items: [
      { title: "背景与目标", body: "为什么做模板化" },
      { title: "版式家族", body: "61 套签名构图" },
      { title: "槽位契约", body: "JSON → HTML" },
      { title: "接入计划", body: "Agent 与门禁" },
    ],
  },
  "problem-slash": {
    pageId: "problem-slash",
    title: "自由 HTML 不稳定",
    body: "模型一次生成整页，版式漂移、文字溢出、测量失败同时出现。",
    points: [
      "同一主题多次生成构图不一致",
      "编辑器与预览几何偏差难排查",
      "修复轮次成本高于模板改槽",
    ],
  },
  "solution-flow": {
    pageId: "solution-flow",
    title: "解法：模板 + 槽位",
    steps: [
      { title: "选型", body: "按 pageType 选套" },
      { title: "填槽", body: "LLM 只写内容字段" },
      { title: "编译", body: "Puppeteer 测量导出" },
    ],
  },
  "evidence-split": {
    pageId: "evidence-split",
    title: "证据：预览可复现",
    caption:
      "同一槽位 JSON 多次渲染得到字节级一致的 HTML 结构；差异只来自主题色与文案。",
    bullets: [
      "结构稳定利于 diff 与回归",
      "门禁可聚焦内容与可读性",
      "设计迭代改模板源即可",
    ],
  },
  "compare-duel": {
    pageId: "compare-duel",
    title: "前后对比",
    leftTitle: "自由生成",
    leftBody: "构图漂移、卡片堆叠、短下划线三件套反复出现。",
    rightTitle: "模板填槽",
    rightBody: "签名固定，内容替换；编译路径短、可审阅。",
  },
  "breath-mark": {
    pageId: "breath-mark",
    quote: "约束不是审美的敌人，是交付的前提。",
    attribution: "— 工程述职简报设计原则",
  },
  "team-strip": {
    pageId: "team-strip",
    title: "核心角色",
    members: [
      {
        name: "版式",
        role: "Design System",
        blurb: "固化构图与签名元素。",
      },
      {
        name: "编译",
        role: "HTML Pipeline",
        blurb: "测量、映射、导出 JSON。",
      },
      {
        name: "内容",
        role: "Layout Agent",
        blurb: "选套与填槽，不改骨架。",
      },
    ],
  },
  "timeline-pulse": {
    pageId: "timeline-pulse",
    title: "里程碑",
    steps: [
      { label: "Q1", detail: "四页 MVP" },
      { label: "Q2", detail: "61 套扩展" },
      { label: "Q3", detail: "Agent 接槽" },
      { label: "Q4", detail: "主题族扩展" },
    ],
  },
  "narrative-column": {
    pageId: "narrative-column",
    title: "为什么从述职场景切入",
    body: "述职页型稳定：封面、指标、要点、收束，外加议程与对比。先把这条叙事链模板化，再扩展到销售与培训。",
    aside: "侧注：主题色来自 ThemeToken；字体默认 PingFang SC，便于中文密度。",
  },
};

/** kind → canonical 样例 id */
const kindCanonical: Record<string, HtmlTemplateSuiteId> = {
  hero: "hero-rail",
  metrics: "metrics-ledger",
  pillars: "pillars-open",
  close: "close-rail",
  agenda: "agenda-steps",
  problem: "problem-slash",
  solution: "solution-flow",
  evidence: "evidence-split",
  dual: "compare-duel",
  breath: "breath-mark",
  team: "team-strip",
  timeline: "timeline-pulse",
  narrative: "narrative-column",
};

function buildSampleSlots(): Record<HtmlTemplateSuiteId, AnyTemplateSlots> {
  const out = {} as Record<HtmlTemplateSuiteId, AnyTemplateSlots>;
  for (const id of HTML_TEMPLATE_SUITE_IDS) {
    if (canonicalSamples[id]) {
      out[id] = { ...canonicalSamples[id]!, pageId: id };
    } else {
      const kind = TEMPLATE_SUITE[id].kind;
      const canonId = kindCanonical[kind];
      const base = canonicalSamples[canonId] ?? canonicalSamples["hero-rail"]!;
      out[id] = { ...base, pageId: id };
    }
  }
  return out;
}

const sampleSlots = buildSampleSlots();

function wrapPreview(id: string, title: string, slideHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN" style="color-scheme:dark">
<head>
<meta charset="utf-8"/>
<meta name="theme-color" content="#0e1218"/>
<title>${title}</title>
<style>
  html,body{margin:0;background:#0e1218;color:#eee;font-family:system-ui,sans-serif;}
  .wrap{padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;}
  .meta{font-size:13px;letter-spacing:0.08em;opacity:0.7;}
  .stage{box-shadow:0 12px 40px rgba(0,0,0,0.45);}
  a{color:#B8954A;}
  a:hover{color:#D4B56A;}
  a:focus-visible{outline:2px solid #B8954A;outline-offset:3px;}
</style>
</head>
<body>
<main class="wrap">
  <p class="meta"><a href="./index.html">← 目录</a> · <span translate="no">${id}</span> · ${title}</p>
  <div class="stage">${slideHtml}</div>
</main>
</body>
</html>`;
}

const outDir = path.resolve("agent-output/html-templates-preview");
fs.mkdirSync(outDir, { recursive: true });

const suiteCount = HTML_TEMPLATE_SUITE_IDS.length;
const indexSections: string[] = [];

for (const [pageType, ids] of Object.entries(PAGE_TYPE_TEMPLATE_SUITES) as [
  PageType,
  readonly HtmlTemplateSuiteId[],
][]) {
  const rows: string[] = [];
  for (const id of ids) {
    const meta = TEMPLATE_SUITE[id];
    const html = renderHtmlTemplate(id, sampleSlots[id], theme);
    const file = `${id}.html`;
    fs.writeFileSync(
      path.join(outDir, file),
      wrapPreview(id, meta.title, html),
      "utf8"
    );
    rows.push(
      `<li><a href="./${file}"><code translate="no">${id}</code></a> — ${meta.title} · ${meta.signature}</li>`
    );
    console.log("wrote", file);
  }
  indexSections.push(
    `<section><h2>${pageType} <span style="opacity:0.6;font-weight:400;font-size:0.85em;">(${ids.length})</span></h2><ol>${rows.join("\n")}</ol></section>`
  );
}

// narrative-column 不在 pageType 中，单独列出
{
  const id = "narrative-column" as HtmlTemplateSuiteId;
  const meta = TEMPLATE_SUITE[id];
  const html = renderHtmlTemplate(id, sampleSlots[id], theme);
  const file = `${id}.html`;
  fs.writeFileSync(
    path.join(outDir, file),
    wrapPreview(id, meta.title, html),
    "utf8"
  );
  indexSections.push(
    `<section><h2>narrative <span style="opacity:0.6;font-weight:400;font-size:0.85em;">(1)</span></h2><ol><li><a href="./${file}"><code translate="no">${id}</code></a> — ${meta.title} · ${meta.signature}</li></ol></section>`
  );
  console.log("wrote", file);
}

fs.writeFileSync(
  path.join(outDir, "index.html"),
  `<!DOCTYPE html>
<html lang="zh-CN" style="color-scheme:dark"><head>
<meta charset="utf-8"/>
<meta name="theme-color" content="#0e1218"/>
<title>${suiteCount} HTML Templates</title>
<style>
body{font-family:system-ui;padding:32px;background:#0e1218;color:#e8ecf0;max-width:52rem;}
h1{font-size:1.5rem;text-wrap:balance;margin:0 0 1.25rem;}
h2{font-size:1.1rem;margin:1.75rem 0 0.75rem;text-transform:capitalize;}
a{color:#B8954A;text-underline-offset:3px;}
a:hover{color:#D4B56A;}
a:focus-visible{outline:2px solid #B8954A;outline-offset:3px;}
ol{padding-left:1.25rem;}
li{margin:10px 0;line-height:1.45;}
code{font-variant-numeric:tabular-nums;font-size:0.92em;}
</style></head>
<body><main>
<h1>${suiteCount} 套模板预览</h1>
${indexSections.join("\n")}
</main></body></html>`,
  "utf8"
);

console.log("index →", path.join(outDir, "index.html"));
