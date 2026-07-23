import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { pathToFileURL } from "url";
import puppeteer, { type Page } from "puppeteer";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { puppeteerLaunchOptions } from "../gate/puppeteerLaunch";
import { buildAssetHrefMap } from "./assets";
import type { AssetMap } from "../types";

/** 从 getComputedStyle 采到的边框/内边距，供 JSON 映射 */
export type MeasuredChrome = {
  borderWidth: number;
  borderColor: string;
  borderStyle: string;
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

/** 测量与编辑器对齐的中文优先字体栈（避免 Puppeteer/本机 Chrome 默认字体不同导致换行行数不一致） */
const MEASURE_FONT_STACK =
  '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif';

function wrapSlideHtml(fragment: string): string {
  const hasHtml = /<html[\s>]/i.test(fragment);
  if (hasHtml) return fragment;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:#111;}
  *{box-sizing:border-box;}
  #slide, #slide *{
    font-family:${MEASURE_FONT_STACK};
  }
</style>
</head><body>${fragment}</body></html>`;
}

/**
 * 注意：page.evaluate 回调会被序列化进浏览器。
 * 回调内禁止具名内部函数（tsx/esbuild 会注入 __name，页面里不存在 → ReferenceError）。
 */
async function prepareSlideDom(page: Page, assetHrefs: Record<string, string>) {
  await page.evaluate((hrefs) => {
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

        // 只同步 data-* → 字体样式；不要改 padding/nowrap/height，以免量到的盒子偏离页面
        if (type === "text") {
          const fs = Number(ds.fontSize);
          if (Number.isFinite(fs) && fs > 0) {
            el.style.fontSize = fs + "px";
          }
          const lh = Number(ds.lineHeight);
          if (Number.isFinite(lh) && lh > 0) {
            el.style.lineHeight = String(lh);
          }
          const ff =
            ds.fontFamily ||
            '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif';
          el.style.fontFamily = ff;
          if (!ds.fontFamily) {
            el.dataset.fontFamily = "PingFang SC";
          }
          if (Object.prototype.hasOwnProperty.call(ds, "bold")) {
            el.style.fontWeight = "700";
          }
          if (Object.prototype.hasOwnProperty.call(ds, "italic")) {
            el.style.fontStyle = "italic";
          }
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
        if (href) {
          el.style.backgroundImage = 'url("' + href + '")';
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.style.backgroundRepeat = "no-repeat";
        }
      }

      if (type === "icon" && !el.innerHTML.trim()) {
        el.style.display = el.style.display || "block";
      }
    }
  }, assetHrefs);

  await page.evaluate(async () => {
    const doc = document as Document & { fonts?: { ready: Promise<unknown> } };
    if (doc.fonts && doc.fonts.ready) {
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
      setTimeout(resolve, 50);
    });
  });
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
      waitUntil: "domcontentloaded",
      timeout: 30000,
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
        const zRaw = el.style.zIndex || getComputedStyle(el).zIndex;
        const zIndex = Number.parseInt(zRaw, 10);
        const cs = getComputedStyle(el);

        const bt = parseFloat(cs.borderTopWidth) || 0;
        const br = parseFloat(cs.borderRightWidth) || 0;
        const bb = parseFloat(cs.borderBottomWidth) || 0;
        const bl = parseFloat(cs.borderLeftWidth) || 0;
        const borderWidth = Math.max(bt, br, bb, bl);
        const borderStyle = cs.borderTopStyle || cs.borderStyle || "none";
        const borderColor = cs.borderTopColor || cs.borderColor || "";
        const paddingX =
          (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const paddingY =
          (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);

        let width = Math.max(1, Math.round(r.width));
        let height = Math.max(1, Math.round(r.height));
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

        nodes.push({
          type: type,
          text: text,
          dataset: dataset,
          x: Math.round(r.left - slideRect.left),
          y: Math.round(r.top - slideRect.top),
          width: width,
          height: height,
          zIndex: Number.isFinite(zIndex) ? zIndex : index,
          chrome: {
            borderWidth: borderWidth,
            borderColor: borderColor,
            borderStyle: borderStyle,
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
