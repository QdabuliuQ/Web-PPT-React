/**
 * 轻量审计不同 prompt 是否落到不同设计策略 / 页型 / 模板组合。
 * 不跑生图和视觉门禁，只检查 agent 决策层是否有足够差异。
 */
import fs from "node:fs";
import path from "node:path";
import {
  directDesign,
  loadAgentConfig,
  runLayoutHtmlAgent,
  runStoryAgent,
  runThemeAgent,
} from "../src/agent";

const DEFAULT_PROMPTS = [
  "小狗鸡肉罐头产品介绍 7页",
  "AI SaaS 融资路演 8页",
  "前端工程师年终述职 8页",
  "区域门店增长复盘 8页",
];

const OUT_DIR = path.resolve("agent-output/design-variety-audit");

function uniqueCount(values: string[]): number {
  return new Set(values).size;
}

async function inspectPrompt(prompt: string) {
  const config = loadAgentConfig({
    mock: true,
    pipelineMode: "html",
    skipImageGen: true,
    usePageScore: false,
  });
  const designProfile = directDesign(prompt);
  const theme = await runThemeAgent({
    config,
    userPrompt: prompt,
    designProfile,
  });
  const story = await runStoryAgent({
    config,
    theme,
    userPrompt: prompt,
    designProfile,
  });
  const deck = await runLayoutHtmlAgent({
    config,
    theme,
    userPrompt: prompt,
    story,
    designProfile,
  });
  const pages = deck.pages.map((page) => ({
    pageType: page.pageType,
    templateId: page.templateId || "(none)",
    composition:
      typeof page.slots?.composition === "string"
        ? page.slots.composition
        : "(template)",
  }));
  return {
    prompt,
    archetype: designProfile.archetype,
    visualFamily: designProfile.visualFamily,
    moduleBias: designProfile.moduleBias,
    firstPageType: pages[0]?.pageType || "(none)",
    firstPageTemplate: pages[0]?.templateId || "(none)",
    pageTypes: pages.map((p) => p.pageType),
    templates: pages.map((p) => p.templateId),
    pages,
    signature: pages.map((p) => `${p.pageType}:${p.templateId}`).join("|"),
  };
}

async function main() {
  const prompts = process.argv.slice(2).filter(Boolean);
  const inputs = prompts.length ? prompts : DEFAULT_PROMPTS;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const prompt of inputs) {
    results.push(await inspectPrompt(prompt));
  }

  const summary = {
    promptCount: results.length,
    uniqueArchetypes: uniqueCount(results.map((r) => r.archetype)),
    uniqueFirstPageTemplates: uniqueCount(results.map((r) => r.firstPageTemplate)),
    uniquePageTypeSequences: uniqueCount(results.map((r) => r.pageTypes.join(">"))),
    uniqueTemplateSignatures: uniqueCount(results.map((r) => r.signature)),
    results,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );
  console.log(JSON.stringify(summary, null, 2));

  if (
    inputs.length > 1 &&
    (summary.uniqueArchetypes <= 1 ||
      summary.uniqueFirstPageTemplates <= 1 ||
      summary.uniqueTemplateSignatures <= 1 ||
      results.some((r) => r.firstPageTemplate.startsWith("modules:hero")))
  ) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
