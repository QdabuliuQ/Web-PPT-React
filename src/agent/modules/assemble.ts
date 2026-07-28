import {
  applyLayoutKnobs,
  parseLayoutKnobs,
} from "../htmlTemplates/layoutKnobs";
import {
  darkSurfaceColors,
  escapeAttr,
  escapeHtmlText,
  themeToTemplateColors,
} from "../htmlTemplates/fill";
import { resolveFontStack } from "@/fonts/stacks";
import { diversifyImageIntent } from "../story/mapToSlots";
import type { StoryPageDraft } from "../story/types";
import type { ThemeToken } from "../types";
import {
  compositionNeedsMedia,
  resolveComposition,
  type SlideComposition,
} from "./composition";
import {
  MODULE_PAGE_TYPES,
  type AssembledSlide,
  type AssembleContext,
} from "./types";

export function canAssembleWithModules(page: StoryPageDraft): boolean {
  // close / breath 继续强制双平面积木；hero 可由 DesignDirector 放行到安全模板池。
  if (page.pageType === "close" || page.pageType === "breath") {
    return true;
  }
  if (page.preferModules === false) return false;
  return MODULE_PAGE_TYPES.has(page.pageType);
}

/** 积木组装整页 HTML；不支持则返回 null */
export function assembleSlideFromModules(
  page: StoryPageDraft,
  theme: ThemeToken,
  runId: string,
  forceComposition?: SlideComposition
): AssembledSlide | null {
  if (!canAssembleWithModules(page)) return null;
  const composition = forceComposition || resolveComposition(page, runId);
  const ctx: AssembleContext = { theme, page, runId, composition };
  let html: string | null = null;
  switch (page.pageType) {
    case "hero":
      html = assembleHero(ctx);
      break;
    case "close":
      html = assembleClose(ctx);
      break;
    case "metrics":
      html = assembleMetrics(ctx);
      break;
    case "pillars":
      html = assemblePillars(ctx);
      break;
    case "breath":
      html = assembleBreath(ctx);
      break;
    case "problem":
      html = assembleProblem(ctx);
      break;
    case "agenda":
      html = assembleAgenda(ctx);
      break;
    default:
      return null;
  }
  if (!html) return null;

  const knobs = parseLayoutKnobs(page, {
    density: page.density,
    emphasis: page.emphasis,
    align: page.align,
  });
  html = applyLayoutKnobs(html, knobs);

  return {
    pageId: page.pageId,
    pageType: page.pageType,
    templateId: `modules:${page.pageType}:${composition}`,
    slots: { ...page, via: "modules", runId, composition },
    html,
    via: "modules",
  };
}

function mediaPrompt(ctx: AssembleContext): string {
  return escapeAttr(
    diversifyImageIntent(
      ctx.page.imageIntent,
      ctx.page.claim,
      ctx.runId,
      ctx.page.pageId
    )
  );
}

function mediaKey(pageId: string): string {
  return `${pageId}_media`;
}

/** 媒体槽：独立 image 元素，绝不做整页 bg 叠字 */
function mediaImageTag(
  key: string,
  prompt: string,
  style: string,
  z = 4
): string {
  return `<div data-element="1" data-type="image" data-asset-key="${escapeAttr(key)}" data-image-prompt="${prompt}" data-image-kind="photo" data-border-radius="0" data-z-index="${z}" style="${style};z-index:${z};overflow:hidden;"></div>`;
}

function slideRoot(
  pageId: string,
  bg: string,
  font: string,
  body: string
): string {
  return `<section id="slide" data-page-id="${escapeAttr(pageId)}" data-bg="${escapeAttr(bg)}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(bg)};box-sizing:border-box;font-family:${escapeAttr(resolveFontStack(font))};">
${body}
</section>`;
}

function assembleHero(ctx: AssembleContext): string {
  const c = darkSurfaceColors(ctx.theme);
  const p = ctx.page;
  const comp = ctx.composition || "split";
  const key = mediaKey(p.pageId);
  const prompt = mediaPrompt(ctx);
  const eyebrow = escapeHtmlText(p.footer || "BRIEF");
  const title = escapeHtmlText(p.title);
  const sub = escapeHtmlText(p.subtitle || p.claim);

  if (comp === "solid") {
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="20" style="position:absolute;left:64px;top:160px;width:5px;height:240px;background:${escapeAttr(c.secondary)};z-index:20;"></div>
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:92px;top:52px;width:720px;font-size:11px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};letter-spacing:0.18em;color:${escapeAttr(c.eyebrow)};line-height:1.3;z-index:30;">${eyebrow}</div>
  <div data-element="1" data-type="text" data-font-size="48" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.12" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:92px;bottom:150px;width:760px;font-size:48px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.12;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="16" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;left:92px;bottom:68px;width:640px;font-size:16px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">${sub}</div>`
    );
  }

  if (comp === "band") {
    // 上下实色字带 + 中部媒体
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:120px;width:1000px;height:280px", 4)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;left:0;top:0;width:1000px;height:120px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;left:0;bottom:0;width:1000px;height:162.5px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:56px;top:40px;width:720px;font-size:11px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};letter-spacing:0.18em;color:${escapeAttr(c.eyebrow)};line-height:1.3;z-index:30;">${eyebrow}</div>
  <div data-element="1" data-type="text" data-font-size="40" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.12" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:56px;bottom:72px;width:720px;font-size:40px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.12;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.45" data-placement="left-top" data-z-index="32" style="position:absolute;left:56px;bottom:28px;width:640px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.45;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">${sub}</div>`
    );
  }

  if (comp === "card") {
    // 全幅媒体 + 实色卡片承载全部文字
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:0;width:1000px;height:562.5px", 2)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="12" style="position:absolute;left:56px;top:88px;width:440px;height:386px;background:${escapeAttr(c.background)};z-index:12;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="20" style="position:absolute;left:80px;top:120px;width:40px;height:3px;background:${escapeAttr(c.secondary)};z-index:20;"></div>
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:80px;top:140px;width:360px;font-size:11px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};letter-spacing:0.18em;color:${escapeAttr(c.eyebrow)};line-height:1.3;z-index:30;">${eyebrow}</div>
  <div data-element="1" data-type="text" data-font-size="36" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="31" style="position:absolute;left:80px;top:180px;width:360px;font-size:36px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.15;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;left:80px;bottom:120px;width:360px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">${sub}</div>`
    );
  }

  // split（默认）：左实色字区 | 右媒体
  return slideRoot(
    p.pageId,
    c.background,
    c.fontTitle,
    `
  ${mediaImageTag(key, prompt, "position:absolute;left:480px;top:0;width:520px;height:562.5px", 4)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;left:0;top:0;width:480px;height:562.5px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="20" style="position:absolute;left:56px;top:168px;width:5px;height:220px;background:${escapeAttr(c.secondary)};z-index:20;"></div>
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:76px;top:52px;width:360px;font-size:11px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};letter-spacing:0.18em;color:${escapeAttr(c.eyebrow)};line-height:1.3;z-index:30;">${eyebrow}</div>
  <div data-element="1" data-type="text" data-font-size="42" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.12" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:76px;bottom:150px;width:360px;font-size:42px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.12;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="15" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;left:76px;bottom:68px;width:360px;font-size:15px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">${sub}</div>`
  );
}

function assembleClose(ctx: AssembleContext): string {
  const c = darkSurfaceColors(ctx.theme);
  const p = ctx.page;
  const comp = ctx.composition || "split";
  const key = mediaKey(p.pageId);
  const prompt = mediaPrompt(ctx);
  const title = escapeHtmlText(p.title);
  const sub = escapeHtmlText(p.subtitle || p.claim);
  const contact = escapeHtmlText(p.contact || p.footer || "");

  if (comp === "solid" || !compositionNeedsMedia(comp)) {
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="5" style="position:absolute;left:0;top:0;width:100%;height:3px;background:${escapeAttr(c.secondary)};z-index:5;"></div>
  <div data-element="1" data-type="text" data-font-size="44" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.12" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:56px;bottom:140px;width:720px;font-size:44px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.12;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="15" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;left:56px;bottom:72px;width:560px;font-size:15px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">${sub}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.4" data-placement="left-top" data-z-index="33" translate="no" style="position:absolute;left:56px;bottom:36px;width:480px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};letter-spacing:0.06em;color:${escapeAttr(c.eyebrow)};line-height:1.4;z-index:33;">${contact}</div>`
    );
  }

  if (comp === "band") {
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:0;width:1000px;height:360px", 4)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;left:0;bottom:0;width:1000px;height:220px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="text" data-font-size="36" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="31" style="position:absolute;left:56px;bottom:100px;width:720px;font-size:36px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.15;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.5" data-placement="left-top" data-z-index="32" style="position:absolute;left:56px;bottom:56px;width:520px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.5;z-index:32;">${sub}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.4" data-placement="left-top" data-z-index="33" translate="no" style="position:absolute;left:56px;bottom:28px;width:480px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.eyebrow)};line-height:1.4;z-index:33;">${contact}</div>`
    );
  }

  if (comp === "card") {
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:0;width:1000px;height:562.5px", 2)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="12" style="position:absolute;left:280px;top:140px;width:440px;height:280px;background:${escapeAttr(c.background)};z-index:12;"></div>
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="31" style="position:absolute;left:316px;top:180px;width:368px;font-size:32px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.15;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.5" data-placement="left-top" data-z-index="32" style="position:absolute;left:316px;top:280px;width:368px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.5;z-index:32;">${sub}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.4" data-placement="left-top" data-z-index="33" translate="no" style="position:absolute;left:316px;bottom:172px;width:368px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.eyebrow)};line-height:1.4;z-index:33;">${contact}</div>`
    );
  }

  // split
  return slideRoot(
    p.pageId,
    c.background,
    c.fontTitle,
    `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:0;width:520px;height:562.5px", 4)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;right:0;top:0;width:480px;height:562.5px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="text" data-font-size="40" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.12" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;right:56px;bottom:150px;width:360px;font-size:40px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.12;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">${title}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;right:56px;bottom:88px;width:360px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:32;">${sub}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.eyebrow)}" data-line-height="1.4" data-placement="left-top" data-z-index="33" translate="no" style="position:absolute;right:56px;bottom:48px;width:360px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.eyebrow)};line-height:1.4;z-index:33;">${contact}</div>`
  );
}

function assembleMetrics(ctx: AssembleContext): string {
  const c = themeToTemplateColors(ctx.theme);
  const p = ctx.page;
  const metrics = [...(p.metrics || [])];
  while (metrics.length < 3) metrics.push({ value: "—", label: "指标" });
  const hero = metrics[0] || { value: "—", label: "指标" };
  const second = metrics[1] || { value: "—", label: "指标" };
  const third = metrics[2] || { value: "—", label: "指标" };

  return `<section id="slide" data-page-id="${escapeAttr(p.pageId)}" data-bg="${escapeAttr(c.background)}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(c.background)};box-sizing:border-box;font-family:${escapeAttr(resolveFontStack(c.fontBody))};">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="5" style="position:absolute;left:56px;top:54px;width:46px;height:3px;background:${escapeAttr(c.secondary)};z-index:5;"></div>
  <div data-element="1" data-type="text" data-font-size="31" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.18" data-placement="left-top" data-bold data-z-index="30" style="position:absolute;left:56px;top:76px;width:640px;font-size:31px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.18;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">${escapeHtmlText(p.title)}</div>
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.cardFill)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="24" data-z-index="10" style="position:absolute;left:56px;top:164px;width:548px;height:294px;background:${escapeAttr(c.cardFill)};border:1px solid ${escapeAttr(c.hairline)};border-radius:24px;z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.background)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="18" data-z-index="11" style="position:absolute;left:632px;top:164px;width:312px;height:132px;background:${escapeAttr(c.background)};border:1px solid ${escapeAttr(c.hairline)};border-radius:18px;z-index:11;"></div>
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.background)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="18" data-z-index="11" style="position:absolute;left:632px;top:326px;width:312px;height:132px;background:${escapeAttr(c.background)};border:1px solid ${escapeAttr(c.hairline)};border-radius:18px;z-index:11;"></div>
  <div data-element="1" data-type="text" data-font-size="50" data-font-family="${escapeAttr(c.fontNumeric)}" data-color="${escapeAttr(c.primary)}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="32" style="position:absolute;left:92px;top:218px;width:460px;font-size:50px;font-family:${escapeAttr(resolveFontStack(c.fontNumeric))};font-weight:700;color:${escapeAttr(c.primary)};line-height:1;z-index:32;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">${escapeHtmlText(hero.value)}</div>
  <div data-element="1" data-type="text" data-font-size="15" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="33" style="position:absolute;left:94px;top:328px;width:430px;font-size:15px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:33;overflow-wrap:anywhere;">${escapeHtmlText(hero.label)}</div>
  <div data-element="1" data-type="text" data-font-size="40" data-font-family="${escapeAttr(c.fontNumeric)}" data-color="${escapeAttr(c.primary)}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="34" style="position:absolute;left:660px;top:192px;width:236px;font-size:40px;font-family:${escapeAttr(resolveFontStack(c.fontNumeric))};font-weight:700;color:${escapeAttr(c.primary)};line-height:1;z-index:34;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">${escapeHtmlText(second.value)}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.4" data-placement="left-top" data-z-index="35" style="position:absolute;left:662px;top:246px;width:240px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.4;z-index:35;overflow-wrap:anywhere;">${escapeHtmlText(second.label)}</div>
  <div data-element="1" data-type="text" data-font-size="40" data-font-family="${escapeAttr(c.fontNumeric)}" data-color="${escapeAttr(c.primary)}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="36" style="position:absolute;left:660px;top:354px;width:236px;font-size:40px;font-family:${escapeAttr(resolveFontStack(c.fontNumeric))};font-weight:700;color:${escapeAttr(c.primary)};line-height:1;z-index:36;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">${escapeHtmlText(third.value)}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.4" data-placement="left-top" data-z-index="37" style="position:absolute;left:662px;top:408px;width:240px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.4;z-index:37;overflow-wrap:anywhere;">${escapeHtmlText(third.label)}</div>
  <div data-element="1" data-type="text" data-font-size="12" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.45" data-placement="left-top" data-z-index="40" style="position:absolute;left:56px;top:494px;width:760px;font-size:12px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.45;z-index:40;text-wrap:pretty;overflow-wrap:anywhere;">${escapeHtmlText(p.footer || p.claim)}</div>
</section>`;
}

function assemblePillars(ctx: AssembleContext): string {
  const c = themeToTemplateColors(ctx.theme);
  const p = ctx.page;
  const pillars = [...(p.pillars || [])];
  const icons = ["Lightning", "Aiming", "CheckOne"];
  while (pillars.length < 3) {
    pillars.push({ title: "要点", body: "", iconName: icons[pillars.length] });
  }
  const cols = pillars
    .slice(0, 3)
    .map((col, i) => {
      const x = [56, 362, 668][i] || 56;
      const y = [164, 204, 136][i] || 164;
      const h = [284, 244, 312][i] || 260;
      return `
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.cardFill)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="22" data-z-index="${10 + i}" style="position:absolute;left:${x}px;top:${y}px;width:276px;height:${h}px;background:${escapeAttr(c.cardFill)};border:1px solid ${escapeAttr(c.hairline)};border-radius:22px;z-index:${10 + i};"></div>
  <div data-element="1" data-type="icon" data-icon-name="${escapeAttr(col.iconName || icons[i] || "Star")}" data-icon-theme="outline" data-fill="${escapeAttr(c.primary)}" data-stroke-width="2" data-z-index="${30 + i}" style="position:absolute;left:${x + 28}px;top:${y + 30}px;width:30px;height:30px;color:${escapeAttr(c.primary)};z-index:${30 + i};"></div>
  <div data-element="1" data-type="text" data-font-size="18" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.28" data-placement="left-top" data-bold data-z-index="${40 + i}" style="position:absolute;left:${x + 28}px;top:${y + 88}px;width:212px;font-size:18px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.28;z-index:${40 + i};text-wrap:balance;overflow-wrap:anywhere;">${escapeHtmlText(col.title)}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.55" data-placement="left-top" data-z-index="${50 + i}" style="position:absolute;left:${x + 28}px;top:${y + 144}px;width:218px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.55;z-index:${50 + i};overflow-wrap:anywhere;">${escapeHtmlText(col.body)}</div>`;
    })
    .join("");

  return `<section id="slide" data-page-id="${escapeAttr(p.pageId)}" data-bg="${escapeAttr(c.background)}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(c.background)};box-sizing:border-box;font-family:${escapeAttr(resolveFontStack(c.fontBody))};">
  <div data-element="1" data-type="text" data-font-size="30" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.2" data-placement="left-top" data-bold data-z-index="28" style="position:absolute;left:56px;top:54px;width:640px;font-size:30px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.2;z-index:28;text-wrap:balance;overflow-wrap:anywhere;">${escapeHtmlText(p.title)}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="12" style="position:absolute;right:56px;top:70px;width:104px;height:4px;background:${escapeAttr(c.secondary)};z-index:12;"></div>
  ${cols}
</section>`;
}

function assembleBreath(ctx: AssembleContext): string {
  const light = themeToTemplateColors(ctx.theme);
  const dark = darkSurfaceColors(ctx.theme);
  const p = ctx.page;
  const comp = ctx.composition || "solid";
  const quote = escapeHtmlText(p.quote || p.claim);
  const attr = escapeHtmlText(p.attribution || p.title || "");
  const key = mediaKey(p.pageId);
  const prompt = mediaPrompt(ctx);

  if (comp === "split") {
    const c = dark;
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;right:0;top:0;width:420px;height:562.5px", 4)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="10" style="position:absolute;left:0;top:0;width:580px;height:562.5px;background:${escapeAttr(c.background)};z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="20" style="position:absolute;left:56px;top:140px;width:8px;height:240px;background:${escapeAttr(c.secondary)};z-index:20;"></div>
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.35" data-placement="left-center" data-bold data-z-index="30" style="position:absolute;left:88px;top:160px;width:440px;font-size:32px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.35;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">${quote}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.4" data-placement="left-top" data-z-index="31" style="position:absolute;left:88px;bottom:72px;width:400px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.4;z-index:31;">${attr}</div>`
    );
  }

  if (comp === "card") {
    const c = dark;
    return slideRoot(
      p.pageId,
      c.background,
      c.fontTitle,
      `
  ${mediaImageTag(key, prompt, "position:absolute;left:0;top:0;width:1000px;height:562.5px", 2)}
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.background)}" data-z-index="12" style="position:absolute;left:120px;top:140px;width:760px;height:280px;background:${escapeAttr(c.background)};z-index:12;"></div>
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.35" data-placement="left-center" data-bold data-z-index="30" style="position:absolute;left:160px;top:190px;width:680px;font-size:28px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnDark)};line-height:1.35;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">${quote}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.4" data-placement="left-top" data-z-index="31" style="position:absolute;left:160px;bottom:172px;width:400px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.4;z-index:31;">${attr}</div>`
    );
  }

  // solid
  const c = light;
  return slideRoot(
    p.pageId,
    c.background,
    c.fontTitle,
    `
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="10" style="position:absolute;left:56px;top:120px;width:8px;height:280px;background:${escapeAttr(c.secondary)};z-index:10;"></div>
  <div data-element="1" data-type="text" data-font-size="36" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.35" data-placement="left-center" data-bold data-z-index="30" style="position:absolute;left:100px;top:160px;width:780px;font-size:36px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.35;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">${quote}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.4" data-placement="left-top" data-z-index="31" style="position:absolute;left:100px;bottom:72px;width:480px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.4;z-index:31;">${attr}</div>`
  );
}

function assembleProblem(ctx: AssembleContext): string {
  const c = themeToTemplateColors(ctx.theme);
  const p = ctx.page;
  const points = (p.bullets || []).slice(0, 3);
  while (points.length < 3) points.push("");
  const list = points
    .map(
      (pt, i) => {
        const y = 174 + i * 88;
        return `
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.cardFill)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="16" data-z-index="${12 + i}" style="position:absolute;left:570px;top:${y}px;width:374px;height:66px;background:${escapeAttr(c.cardFill)};border:1px solid ${escapeAttr(c.hairline)};border-radius:16px;z-index:${12 + i};"></div>
  <div data-element="1" data-type="text" data-font-size="16" data-font-family="${escapeAttr(c.fontNumeric)}" data-color="${escapeAttr(c.primary)}" data-line-height="1" data-placement="center-center" data-bold data-z-index="${40 + i}" style="position:absolute;left:594px;top:${y + 20}px;width:34px;font-size:16px;font-family:${escapeAttr(resolveFontStack(c.fontNumeric))};font-weight:700;color:${escapeAttr(c.primary)};line-height:1;z-index:${40 + i};font-variant-numeric:tabular-nums;">0${i + 1}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.45" data-placement="left-center" data-z-index="${50 + i}" style="position:absolute;left:646px;top:${y + 14}px;width:254px;font-size:14px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.textOnLight)};line-height:1.45;z-index:${50 + i};overflow-wrap:anywhere;">${escapeHtmlText(pt)}</div>`;
      }
    )
    .join("");

  return `<section id="slide" data-page-id="${escapeAttr(p.pageId)}" data-bg="${escapeAttr(c.background)}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(c.background)};box-sizing:border-box;font-family:${escapeAttr(resolveFontStack(c.fontBody))};">
  <div data-element="1" data-type="text" data-font-size="30" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.2" data-placement="left-top" data-bold data-z-index="28" style="position:absolute;left:56px;top:54px;width:600px;font-size:30px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.2;z-index:28;text-wrap:balance;overflow-wrap:anywhere;">${escapeHtmlText(p.title)}</div>
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.primary)}" data-border-radius="26" data-z-index="10" style="position:absolute;left:56px;top:168px;width:456px;height:278px;background:${escapeAttr(c.primary)};border-radius:26px;z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="12" style="position:absolute;left:92px;top:204px;width:52px;height:4px;background:${escapeAttr(c.secondary)};z-index:12;"></div>
  <div data-element="1" data-type="text" data-font-size="17" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.textOnDark)}" data-line-height="1.66" data-placement="left-top" data-z-index="30" style="position:absolute;left:92px;top:236px;width:376px;font-size:17px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.textOnDark)};line-height:1.66;z-index:30;text-wrap:pretty;overflow-wrap:anywhere;">${escapeHtmlText(p.body || p.claim)}</div>
  ${list}
</section>`;
}

function assembleAgenda(ctx: AssembleContext): string {
  const c = themeToTemplateColors(ctx.theme);
  const p = ctx.page;
  const items = [...(p.items || p.steps || [])];
  while (items.length < 3) items.push({ title: "条目", body: "" });
  const rows = items
    .slice(0, 4)
    .map(
      (it, i) => {
        const y = 116 + i * 92;
        return `
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.hairline)}" data-z-index="${9 + i}" style="position:absolute;left:424px;top:${y + 74}px;width:484px;height:1px;background:${escapeAttr(c.hairline)};z-index:${9 + i};"></div>
  <div data-element="1" data-type="text" data-font-size="20" data-font-family="${escapeAttr(c.fontNumeric)}" data-color="${escapeAttr(c.primary)}" data-line-height="1" data-placement="left-top" data-bold data-z-index="${30 + i}" style="position:absolute;left:424px;top:${y}px;width:48px;font-size:20px;font-family:${escapeAttr(resolveFontStack(c.fontNumeric))};font-weight:700;color:${escapeAttr(c.primary)};line-height:1;z-index:${30 + i};font-variant-numeric:tabular-nums;">0${i + 1}</div>
  <div data-element="1" data-type="text" data-font-size="18" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="${40 + i}" style="position:absolute;left:496px;top:${y - 2}px;width:350px;font-size:18px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.25;z-index:${40 + i};overflow-wrap:anywhere;">${escapeHtmlText(it.title)}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="${escapeAttr(c.fontBody)}" data-color="${escapeAttr(c.muted)}" data-line-height="1.45" data-placement="left-top" data-z-index="${50 + i}" style="position:absolute;left:496px;top:${y + 30}px;width:370px;font-size:13px;font-family:${escapeAttr(resolveFontStack(c.fontBody))};color:${escapeAttr(c.muted)};line-height:1.45;z-index:${50 + i};overflow-wrap:anywhere;">${escapeHtmlText(it.body)}</div>`;
      }
    )
    .join("");

  return `<section id="slide" data-page-id="${escapeAttr(p.pageId)}" data-bg="${escapeAttr(c.background)}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:${escapeAttr(c.background)};box-sizing:border-box;font-family:${escapeAttr(resolveFontStack(c.fontBody))};">
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="${escapeAttr(c.cardFill)}" data-border data-border-color="${escapeAttr(c.hairline)}" data-border-width="1" data-border-radius="28" data-z-index="8" style="position:absolute;left:56px;top:64px;width:308px;height:404px;background:${escapeAttr(c.cardFill)};border:1px solid ${escapeAttr(c.hairline)};border-radius:28px;z-index:8;"></div>
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="${escapeAttr(c.fontTitle)}" data-color="${escapeAttr(c.textOnLight)}" data-line-height="1.16" data-placement="left-top" data-bold data-z-index="28" style="position:absolute;left:88px;top:106px;width:232px;font-size:32px;font-family:${escapeAttr(resolveFontStack(c.fontTitle))};font-weight:700;color:${escapeAttr(c.textOnLight)};line-height:1.16;z-index:28;text-wrap:balance;overflow-wrap:anywhere;">${escapeHtmlText(p.title)}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="${escapeAttr(c.secondary)}" data-z-index="12" style="position:absolute;left:88px;top:374px;width:88px;height:4px;background:${escapeAttr(c.secondary)};z-index:12;"></div>
  ${rows}
</section>`;
}
