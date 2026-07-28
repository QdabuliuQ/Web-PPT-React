import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { pathToFileURL } from "url";
import puppeteer, { type Page } from "puppeteer";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import {
  FONT_STACK_SANS,
  FONT_STACK_SERIF,
  WEB_FONT_STYLESHEET_HREF,
  resolveFontStack,
} from "@/fonts/stacks";
import { puppeteerLaunchOptions } from "../gate/puppeteerLaunch";
import { buildAssetHrefMap } from "./assets";
import type { AssetMap } from "../types";

/** 从 getComputedStyle 采到的边框/内边距，供 JSON 映射 */
export type MeasuredChrome = {
  borderWidth: number;
  borderColor: string;
  borderStyle: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
};

export type MeasuredNode = {
  type: string;
  text: string;
  dataset: Record<string, string>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  chrome?: MeasuredChrome;
};

/** 与编辑器共用 Web 字体；用 link 加载 Noto，避免 @import 时序不稳 */
function wrapSlideHtml(fragment: string): string {
  const hasHtml = /<html[\s>]/i.test(fragment);
  if (hasHtml) return fragment;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="${WEB_FONT_STYLESHEET_HREF}"/>
<style>
  :root {
    --webppt-font-serif: ${FONT_STACK_SERIF};
    --webppt-font-sans: ${FONT_STACK_SANS};
  }
  html,body{margin:0;padding:0;background:#111;font-family:var(--webppt-font-sans);}
  *{box-sizing:border-box;}
</style>
</head><body>${fragment}</body></html>`;
}

/**
 * 注意：page.evaluate 回调会被序列化进浏览器。
 * 回调内禁止具名内部函数（tsx/esbuild 会注入 __name，页面里不存在 → ReferenceError）。
 */
async function prepareSlideDom(page: Page, assetHrefs: Record<string, string>) {
  await page.evaluate(
    (hrefs, fontStacks) => {
      const expandFont = (raw: string) => {
        const name = String(raw || "")
          .split(",")[0]
          .replace(/["']/g, "")
          .trim();
        if (!name) return fontStacks.sans;
        if (/Noto Serif SC|Noto Sans SC/i.test(raw)) return raw;
        if (/serif|song|songti|stsong|simsun/i.test(name)) {
          if (/^source han serif sc$/i.test(name)) return fontStacks.serif;
          return '"' + name + '",' + fontStacks.serif.replace(/^"[^"]+",\s*/, "");
        }
        if (/^pingfang sc$/i.test(name)) return fontStacks.sans;
        return '"' + name + '",' + fontStacks.sans.replace(/^"[^"]+",\s*/, "");
      };

      const slide = document.querySelector("#slide");
      if (!slide) throw new Error("缺少 #slide");
      const slideEl = slide as HTMLElement;

      const bgKey = slide.getAttribute("data-bg-image-key");
      if (bgKey && hrefs[bgKey]) {
        slideEl.style.backgroundImage = 'url("' + hrefs[bgKey] + '")';
        slideEl.style.backgroundSize = "cover";
        slideEl.style.backgroundPosition = "center";
      }

      const els = document.querySelectorAll('[data-element="1"]');
      for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLElement;
        const type = el.getAttribute("data-type") || "";
        const ds = el.dataset;

        const zFromData = Number(ds.zIndex);
        if (Number.isFinite(zFromData)) {
          el.style.zIndex = String(zFromData);
          if (!el.style.position || el.style.position === "static") {
            el.style.position = "relative";
          }
        }

        if (type === "text") {
          const fs = Number(ds.fontSize);
          if (Number.isFinite(fs) && fs > 0) {
            el.style.fontSize = fs + "px";
          }
          const lh = Number(ds.lineHeight);
          if (Number.isFinite(lh) && lh > 0) {
            el.style.lineHeight = String(lh);
          }
          const familyRaw =
            ds.fontFamily ||
            (el.style.fontFamily || "").split(",")[0] ||
            "";
          if (familyRaw) {
            el.style.fontFamily = expandFont(familyRaw);
          } else {
            el.style.fontFamily = fontStacks.sans;
          }
          if (Object.prototype.hasOwnProperty.call(ds, "bold")) {
            el.style.fontWeight = "700";
          }
          if (Object.prototype.hasOwnProperty.call(ds, "italic")) {
            el.style.fontStyle = "italic";
          }
          if (ds.color) el.style.color = ds.color;
          if (Object.prototype.hasOwnProperty.call(ds, "border")) {
            const bw = Number(ds.borderWidth);
            const w = Number.isFinite(bw) && bw > 0 ? bw : 1;
            const color = ds.borderColor || "#000000";
            const style = ds.borderStyle || "solid";
            el.style.border = w + "px " + style + " " + color;
          }
        }

        if (type === "image") {
          const key = el.getAttribute("data-asset-key") || "";
          const href = key ? hrefs[key] : "";
          const kind = (el.getAttribute("data-image-kind") || "").toLowerCase();
          const isCutout =
            kind === "cutout" || kind === "transparent" || kind === "avatar";
          if (href) {
            if (isCutout) {
              el.style.backgroundImage = "none";
              el.style.backgroundColor = "transparent";
              el.innerHTML = "";
              const img = document.createElement("img");
              img.src = href;
              img.alt = "";
              img.style.width = "100%";
              img.style.height = "100%";
              img.style.objectFit = "contain";
              img.style.display = "block";
              img.style.pointerEvents = "none";
              el.appendChild(img);
            } else {
              el.style.backgroundImage = 'url("' + href + '")';
              el.style.backgroundSize = "cover";
              el.style.backgroundPosition = "center";
              el.style.backgroundRepeat = "no-repeat";
            }
          }
          const br = Number(ds.borderRadius);
          if (Number.isFinite(br) && br >= 0) {
            el.style.borderRadius = br + "px";
            el.style.overflow = el.style.overflow || "hidden";
          }
          if (Object.prototype.hasOwnProperty.call(ds, "border")) {
            const bw = Number(ds.borderWidth);
            const w = Number.isFinite(bw) && bw > 0 ? bw : 1;
            const color = ds.borderColor || "#000000";
            const style = ds.borderStyle || "solid";
            el.style.border = w + "px " + style + " " + color;
            el.style.boxSizing = "border-box";
          }
        }

        if (type === "shape") {
          const br = Number(ds.borderRadius);
          if (Number.isFinite(br) && br >= 0) {
            el.style.borderRadius = br + "px";
          }
        }

        if (type === "icon" && !el.innerHTML.trim()) {
          el.style.display = el.style.display || "block";
        }
      }
    },
    assetHrefs,
    {
      serif: resolveFontStack("Source Han Serif SC"),
      sans: resolveFontStack("PingFang SC"),
    }
  );

  await page.evaluate(async () => {
    const doc = document as Document & {
      fonts?: {
        ready: Promise<unknown>;
        load?: (font: string) => Promise<unknown>;
      };
    };
    try {
      if (doc.fonts?.load) {
        await Promise.all([
          doc.fonts.load('700 40px "Noto Serif SC"'),
          doc.fonts.load('400 16px "Noto Sans SC"'),
          doc.fonts.load('700 16px "Noto Sans SC"'),
        ]);
      }
    } catch {
      /* ignore */
    }
    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }
    const imgs = Array.from(document.images);
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (img.complete) continue;
      await new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 80);
    });
  });

  // 字体就绪后再：① text 按内容锁宽 ② 剥离 transform 并烘焙为 left/top/width/height
  const transformHits = await page.evaluate(() => {
    const slide = document.querySelector("#slide");
    if (!slide) return 0;
    const slideEl = slide as HTMLElement;
    const slideRect = slideEl.getBoundingClientRect();
    const els = document.querySelectorAll('[data-element="1"]');
    let hits = 0;

    for (let i = 0; i < els.length; i++) {
      const el = els[i] as HTMLElement;
      const type = el.getAttribute("data-type") || "";

      if (type === "text") {
        // Text 无 padding：强制清零，几何 = 可见文字外接框
        el.style.boxSizing = "border-box";
        el.style.padding = "0";
        if (!Object.prototype.hasOwnProperty.call(el.dataset, "border")) {
          el.style.border = "none";
        }
        const w = (el.style.width || "").trim();
        if (!w || w === "auto") {
          el.style.width = "max-content";
        }
      }

      const cs = getComputedStyle(el);
      if (cs.transform && cs.transform !== "none") {
        hits += 1;
        const r = el.getBoundingClientRect();
        el.style.transform = "none";
        el.style.position = "absolute";
        el.style.left = Math.round(r.left - slideRect.left) + "px";
        el.style.top = Math.round(r.top - slideRect.top) + "px";
        el.style.right = "auto";
        el.style.bottom = "auto";
        el.style.margin = "0";
        el.style.width = Math.max(1, Math.round(r.width)) + "px";
        el.style.height = Math.max(1, Math.round(r.height)) + "px";
      }
    }
    return hits;
  });

  if (transformHits > 0) {
    console.warn(
      `[htmlCompile] 已剥离 ${transformHits} 个导出节点的 transform；请改用无 transform 布局（显式 width / flex）`
    );
  }
}

/**
 * Puppeteer 渲染单页 HTML，测量 [data-element="1"] 相对 #slide 的几何与 data-*。
 */
export async function measureSlideHtml(opts: {
  html: string;
  assetMap: AssetMap;
  assetsDir?: string;
}): Promise<{
  nodes: MeasuredNode[];
  pageBg?: string;
  pageBgImageKey?: string;
  pageId?: string;
}> {
  const { html, assetMap, assetsDir } = opts;
  const assetHrefs = buildAssetHrefMap(assetMap, assetsDir);
  const tmp = await mkdtemp(path.join(tmpdir(), "webppt-html-slide-"));
  const htmlPath = path.join(tmp, "slide.html");
  await writeFile(htmlPath, wrapSlideHtml(html), "utf-8");

  const browser = await puppeteer.launch(puppeteerLaunchOptions());
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: Math.ceil(CANVAS_WIDTH),
      height: Math.ceil(CANVAS_HEIGHT),
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    await prepareSlideDom(page, assetHrefs);

    const measured = await page.evaluate(() => {
      const slide = document.querySelector("#slide");
      if (!slide) throw new Error("缺少 #slide");
      const slideRect = (slide as HTMLElement).getBoundingClientRect();
      const pageBg = slide.getAttribute("data-bg") || undefined;
      const pageBgImageKey =
        slide.getAttribute("data-bg-image-key") || undefined;
      const pageId = slide.getAttribute("data-page-id") || undefined;

      const els = document.querySelectorAll('[data-element="1"]');
      const nodes: Array<{
        type: string;
        text: string;
        dataset: Record<string, string>;
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex: number;
        chrome: {
          borderWidth: number;
          borderColor: string;
          borderStyle: string;
          borderRadius: number;
          paddingX: number;
          paddingY: number;
        };
      }> = [];
      for (let index = 0; index < els.length; index++) {
        const el = els[index] as HTMLElement;
        const r = el.getBoundingClientRect();
        const dataset: Record<string, string> = {};
        const rawDs = el.dataset;
        for (const k in rawDs) {
          if (Object.prototype.hasOwnProperty.call(rawDs, k)) {
            const v = rawDs[k];
            if (v != null) dataset[k] = String(v);
          }
        }
        const type = el.getAttribute("data-type") || dataset.type || "text";
        // 叠层：优先 data-z-index；否则用 DOM 顺序。忽略 style 里随意写的 z-index:1（常把字压在卡片下）
        const fromData = Number(dataset.zIndex);
        const zIndex = Number.isFinite(fromData) ? fromData : index;
        const cs = getComputedStyle(el);

        const bt = parseFloat(cs.borderTopWidth) || 0;
        const br = parseFloat(cs.borderRightWidth) || 0;
        const bb = parseFloat(cs.borderBottomWidth) || 0;
        const bl = parseFloat(cs.borderLeftWidth) || 0;
        const borderWidth = Math.max(bt, br, bb, bl);
        const borderStyle = cs.borderTopStyle || cs.borderStyle || "none";
        const borderColor = cs.borderTopColor || cs.borderColor || "";
        // 百分比圆角（如 50%）按盒子短边换算成 px；纯 px 直接取
        let borderRadius = 0;
        const brRaw = cs.borderTopLeftRadius || "";
        if (brRaw.indexOf("%") >= 0) {
          const pct = parseFloat(brRaw);
          if (Number.isFinite(pct) && pct > 0) {
            borderRadius = (pct / 100) * Math.min(r.width, r.height);
          }
        } else {
          borderRadius = parseFloat(brRaw) || 0;
        }
        const paddingX =
          (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const paddingY =
          (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);

        const width = Math.max(1, Math.round(r.width));
        const height = Math.max(1, Math.round(r.height));
        // 几何以 getBoundingClientRect 为准，不用 scrollWidth 拉大

        // textContent 会丢掉 <br>；innerText 会按渲染把 <br>/块级折成 \n
        let text = "";
        if (type === "text") {
          text = (el.innerText || el.textContent || "")
            .replace(/\r\n/g, "\n")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

          // 把计算后的 line-height 写回 dataset，避免只有 CSS 1.6 而 JSON 默认成 1.4
          if (dataset.lineHeight == null || dataset.lineHeight === "") {
            const fsPx = parseFloat(cs.fontSize) || 0;
            const lhRaw = cs.lineHeight;
            if (lhRaw && lhRaw !== "normal" && fsPx > 0) {
              const lhPx = parseFloat(lhRaw);
              if (Number.isFinite(lhPx) && lhPx > 0) {
                const ratio = Math.round((lhPx / fsPx) * 100) / 100;
                if (ratio > 0.5 && ratio < 4) {
                  dataset.lineHeight = String(ratio);
                }
              }
            }
          }
        } else {
          text = (el.textContent || "").trim();
        }

        // shape/image：仅有 CSS border-radius 时回写 dataset，供 mapElement 落盘
        if (
          (type === "shape" || type === "image") &&
          (dataset.borderRadius == null || dataset.borderRadius === "") &&
          borderRadius > 0.5
        ) {
          dataset.borderRadius = String(Math.round(borderRadius));
        }

        nodes.push({
          type: type,
          text: text,
          dataset: dataset,
          x: Math.round(r.left - slideRect.left),
          y: Math.round(r.top - slideRect.top),
          width: width,
          height: height,
          zIndex: zIndex,
          chrome: {
            borderWidth: borderWidth,
            borderColor: borderColor,
            borderStyle: borderStyle,
            borderRadius: borderRadius,
            paddingX: paddingX,
            paddingY: paddingY,
          },
        });
      }

      return {
        nodes: nodes,
        pageBg: pageBg,
        pageBgImageKey: pageBgImageKey,
        pageId: pageId,
      };
    });

    return measured;
  } finally {
    await browser.close().catch(() => undefined);
    await rm(tmp, { recursive: true, force: true }).catch(() => undefined);
  }
}
