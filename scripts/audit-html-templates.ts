/**
 * 批量渲染 HTML 模板并跑 VisualGate。
 *
 * 默认只审当前 pageType 白名单中可被 agent 选中的模板；
 * 加 --all 可包含注册表里的旧/备用模板。
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
  type TemplateKind,
} from "../src/agent/htmlTemplates";
import { compileHtmlDocument } from "../src/agent/htmlCompile";
import { runVisualGate } from "../src/agent/gate/visualGate";
import type { AssetMap, HtmlDeck, PageType, ThemeToken } from "../src/agent/types";

const OUT_DIR = path.resolve("agent-output/html-template-audit");

const THEMES: ThemeToken[] = [
  {
    templateName: "audit-muted-secondary",
    category: "audit",
    tags: ["audit"],
    primary: "#1B3A4B",
    secondary: "#8A9BA8",
    background: "#F7F8FA",
    textOnLight: "#1A1A1A",
    textOnDark: "#F5F5F5",
    fontTitle: "Source Han Serif SC",
    fontBody: "PingFang SC",
  },
  {
    templateName: "audit-warm-accent",
    category: "audit",
    tags: ["audit"],
    primary: "#23322E",
    secondary: "#B9864D",
    background: "#F4F1EA",
    textOnLight: "#18211F",
    textOnDark: "#F7F3EA",
    fontTitle: "Source Han Serif SC",
    fontBody: "PingFang SC",
  },
];

function unique<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

function selectedTemplateIds(): HtmlTemplateSuiteId[] {
  if (process.argv.includes("--all")) return [...HTML_TEMPLATE_SUITE_IDS];
  return unique(
    Object.values(PAGE_TYPE_TEMPLATE_SUITES).flat()
  ) as HtmlTemplateSuiteId[];
}

function pageTypeForKind(kind: TemplateKind): PageType {
  if (kind === "dual") return "compare";
  if (kind === "narrative") return "breath";
  return kind as PageType;
}

function sampleSlots(kind: TemplateKind, pageId: string): AnyTemplateSlots {
  const longAction =
    "明确动作、交付物和验收口径，会后可以直接分派到负责人。";
  switch (kind) {
    case "hero":
      return {
        pageId,
        title: "小狗鸡肉罐头增长复盘",
        subtitle: "围绕试吃转化、复购路径和渠道反馈，讲清可验证结果。",
        footer: "PRODUCT BRIEF",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt:
          "premium pet food product scene on warm tabletop, soft directional light, no readable text, no logos",
      };
    case "close":
      return {
        pageId,
        title: "下一步",
        subtitle: "把今天结论落成渠道实验、负责人和两周验收节点。",
        contact: "THANK YOU",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt:
          "quiet premium product closing scene, soft light, no text, no logos",
      };
    case "metrics":
      return {
        pageId,
        title: "关键结果",
        metrics: [
          { value: "37%", label: "试吃后首单转化提升，按渠道周均口径统计。" },
          { value: "12天", label: "从反馈收集到包装迭代的中位周期。" },
          { value: "98.6%", label: "核心批次质检通过率，排除重复抽检样本。" },
        ],
        footer: "所有数字统一到同一时间窗，避免用不同口径拼接结论。",
      };
    case "pillars":
      return {
        pageId,
        title: "三件必须做对的事",
        pillars: [
          { iconName: "Aiming", title: "口径统一", body: longAction },
          { iconName: "Lightning", title: "小步验证", body: longAction },
          { iconName: "CheckOne", title: "复盘沉淀", body: longAction },
        ],
      };
    case "agenda":
      return {
        pageId,
        title: "今日议程",
        items: [
          { title: "问题与代价", body: "说明卡点、受影响人群和后续页证据。" },
          { title: "方案与分工", body: "拆出动作、负责人和可验收交付物。" },
          { title: "结果与证据", body: "用统一口径展示数据和现场反馈。" },
          { title: "下一步边界", body: "写清里程碑、风险和暂不处理事项。" },
        ],
      };
    case "problem":
      return {
        pageId,
        title: "真正的卡点",
        body:
          "试吃反馈、渠道订单和质检批次分别在三套表里流转，团队需要反复对齐口径；问题定位平均超过半小时，发布窗口经常被临时需求挤占。",
        points: [
          "同一指标三份表，评审无法快速确认优先级。",
          "发布窗口被临时需求挤占，团队频繁切换上下文。",
          "复盘没有进入检查清单，下次迭代继续重做。",
        ],
      };
    case "solution":
      return {
        pageId,
        title: "解法：模板化执行",
        steps: [
          { title: "先对齐口径", body: longAction },
          { title: "再小步验证", body: longAction },
          { title: "最后沉淀机制", body: longAction },
        ],
      };
    case "evidence":
      return {
        pageId,
        title: "证据：渠道反馈可复查",
        caption:
          "样本来自两周试吃反馈、渠道订单和质检记录，统一到同一时间窗后再比较。",
        bullets: [
          "每条证据对应一个判断，避免只展示现象。",
          "保留采样口径和时间范围，让结论可复查。",
          "证据必须转成下一步动作，而不是停在展示层。",
        ],
        imageKey: `${pageId}_evidence`,
        imagePrompt:
          "clean product research desk with pet food packaging samples, soft daylight, no readable text, no logos",
      };
    case "dual":
      return {
        pageId,
        title: "前后对比",
        leftTitle: "之前",
        leftBody:
          "口径漂移、责任边界模糊，评审会反复追问同一组数字，渠道试点也经常因为缺少验收标准而延迟。",
        rightTitle: "现在",
        rightBody:
          "动作、交付物和验收标准拆开，每个判断都能追到证据来源，复盘后可以直接沉淀成下次执行清单。",
      };
    case "breath":
      return {
        pageId,
        quote: "少讲概念，多留一个听得进、查得到、能行动的事实。",
        attribution: "PRODUCT BRIEF",
      };
    case "team":
      return {
        pageId,
        title: "核心角色",
        members: [
          {
            name: "负责人",
            role: "Owner",
            blurb: "确认目标、资源边界和验收口径，避免团队在评审阶段反复改方向。",
          },
          {
            name: "执行人",
            role: "Delivery",
            blurb: "推进交付物、记录阻塞点，并在每个里程碑同步风险和下一步动作。",
          },
          {
            name: "复盘人",
            role: "Review",
            blurb: "把结果、异常和检查项沉淀成复用标准，下一轮可以直接沿用。",
          },
        ],
      };
    case "timeline":
      return {
        pageId,
        title: "里程碑",
        steps: [
          {
            label: "启动",
            detail: "确认负责人、数据口径和实验范围，同时写清暂不处理的边界。",
          },
          {
            label: "验证",
            detail: "完成小流量试点，记录异常样本、用户反馈和是否继续放量的判断。",
          },
          {
            label: "上线",
            detail: "按验收标准推进全量发布，保留回滚预案和渠道同步节奏。",
          },
          {
            label: "复盘",
            detail: "把结论、风险和检查项写入下次执行清单，减少重复对齐。",
          },
        ],
      };
    case "narrative":
      return {
        pageId,
        title: "为什么从产品复盘切入",
        body:
          "产品复盘页型稳定：封面、问题、方案、证据、指标和收束。先把这条叙事链跑通，再扩展到销售、培训和融资场景。",
        aside: "审计重点：对比度、越界、图片文字双平面和内容密度。",
      };
  }
}

function placeholderDataUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="${color}"/><circle cx="1160" cy="260" r="280" fill="rgba(255,255,255,0.22)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildAssetMap(deck: HtmlDeck, color: string): AssetMap {
  const assetMap: AssetMap = {};
  const add = (key: string | undefined) => {
    if (!key || assetMap[key]) return;
    assetMap[key] = { url: placeholderDataUrl(color), width: 1600, height: 900 };
  };
  for (const page of deck.pages) {
    const html = page.html;
    for (const m of html.matchAll(/data-asset-key=["']([^"']+)["']/gi)) {
      add(m[1]);
    }
    for (const m of html.matchAll(/data-bg-image-key=["']([^"']+)["']/gi)) {
      add(m[1]);
    }
  }
  return assetMap;
}

async function auditTheme(theme: ThemeToken, ids: HtmlTemplateSuiteId[]) {
  const pageTypeById: Record<string, string> = {};
  const pages = ids.map((id, index) => {
    const meta = TEMPLATE_SUITE[id];
    const pageType = pageTypeForKind(meta.kind);
    const pageId = `page_${index + 1}_${id}`;
    pageTypeById[pageId] = meta.kind === "narrative" ? "narrative" : pageType;
    return {
      pageId,
      pageType,
      templateId: id,
      slots: sampleSlots(meta.kind, pageId) as Record<string, unknown>,
      html: renderHtmlTemplate(id, sampleSlots(meta.kind, pageId), theme),
    };
  });

  const deck: HtmlDeck = {
    version: "html-1.0",
    name: theme.templateName,
    theme,
    pages,
    drawTasks: [],
  };
  const document = await compileHtmlDocument(
    deck,
    buildAssetMap(deck, theme.primary)
  );
  const report = await runVisualGate(document, 0, { pageTypeById });
  return {
    theme: theme.templateName,
    ok: report.ok,
    defects: report.defects,
    counts: report.defects.reduce<Record<string, number>>((acc, defect) => {
      acc[defect.kind] = (acc[defect.kind] || 0) + 1;
      return acc;
    }, {}),
  };
}

async function main() {
  const ids = selectedTemplateIds();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const reports = [];
  for (const theme of THEMES) {
    console.log(`[audit] ${theme.templateName}: ${ids.length} templates`);
    reports.push(await auditTheme(theme, ids));
  }

  const summary = {
    mode: process.argv.includes("--all") ? "all" : "selectable",
    templateCount: ids.length,
    reports,
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  const failed = reports.some((r) => !r.ok);
  console.log(JSON.stringify(summary, null, 2));
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
