import { puppeteerLaunchOptions } from "./puppeteerLaunch";
import type { Elements, Page } from "@/store/zustand/pptStore";
import type { AssetMap } from "../types";
import { mkdir, writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { pathToFileURL } from "url";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";

export type PageScreenshot = {
  pageId: string;
  filePath: string;
  dataUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function placementCss(placement?: string): {
  textAlign: string;
  justifyContent: string;
} {
  const key = placement || "left-top";
  const [h = "left", v = "top"] = key.split("-");
  return {
    textAlign: h === "center" ? "center" : h === "right" ? "right" : "left",
    justifyContent:
      v === "center" ? "center" : v === "bottom" ? "flex-end" : "flex-start",
  };
}

function resolveLocalAsset(
  src: string | undefined,
  assetMap: AssetMap,
  assetsDir?: string
): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("file:")) {
    return src;
  }
  const base = path.basename(src.replace(/^\/agent-assets\//, ""));
  for (const entry of Object.values(assetMap)) {
    if (entry.localPath && path.basename(entry.localPath) === base) {
      return pathToFileURL(path.resolve(entry.localPath)).href;
    }
    if (entry.url && path.basename(entry.url) === base && entry.localPath) {
      return pathToFileURL(path.resolve(entry.localPath)).href;
    }
  }
  if (assetsDir) {
    const candidate = path.join(assetsDir, base);
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  if (entryRemote(assetMap, base)) return entryRemote(assetMap, base);
  return src;
}

function entryRemote(assetMap: AssetMap, base: string): string | undefined {
  for (const entry of Object.values(assetMap)) {
    if (entry.url && path.basename(entry.url) === base && entry.remoteUrl) {
      return entry.remoteUrl;
    }
  }
  return undefined;
}

function pageBackgroundStyle(
  page: Page,
  assetMap: AssetMap,
  assetsDir?: string
): string {
  const type = page.backgroundType || "solidColor";
  if (type === "image" && page.backgroundImage) {
    const url =
      resolveLocalAsset(page.backgroundImage, assetMap, assetsDir) ||
      page.backgroundImage;
    return `background-color:#fff;background-image:url('${url}');background-size:cover;background-position:center;`;
  }
  const color = page.background || page.bgColor || "#FFFFFF";
  return `background-color:${color};`;
}

function renderElement(
  el: Elements,
  assetMap: AssetMap,
  assetsDir?: string
): string {
  const base = `position:absolute;left:0;top:0;width:${el.width}px;height:${el.height}px;transform:translate(${el.x}px,${el.y}px) rotate(${el.rotate || 0}deg);z-index:${el.zIndex || 0};box-sizing:border-box;`;

  if (el.type === "text") {
    const place = placementCss(el.placement);
    const border =
      el.border && el.borderWidth
        ? `border:${el.borderWidth}px ${el.borderStyle || "solid"} ${el.borderColor || "#000"};`
        : "border:none;";
    return `<div style="${base}display:flex;flex-direction:column;align-items:stretch;justify-content:${place.justifyContent};text-align:${place.textAlign};font-size:${el.fontSize || 16}px;font-family:${escapeHtml(el.fontFamily || "Arial")},sans-serif;font-weight:${el.bold ? "bold" : "normal"};font-style:${el.italic ? "italic" : "normal"};line-height:${el.lineHeight || 1.4};color:${el.color || "#000"};background:${el.backgroundColor && el.backgroundColor !== "transparent" ? el.backgroundColor : "transparent"};padding:4px;overflow:hidden;word-break:break-word;${border}"><span>${escapeHtml(el.text || "")}</span></div>`;
  }

  if (el.type === "image") {
    const src = resolveLocalAsset(el.src, assetMap, assetsDir) || el.src || "";
    const radius = el.borderRadius || 0;
    return `<div style="${base}overflow:hidden;border-radius:${radius}px;opacity:${el.opacity ?? 1};"><img src="${escapeHtml(src)}" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`;
  }

  if (el.type === "shape") {
    const fill = el.fill || "#CCCCCC";
    const shapeType = el.shapeType || "rect";
    const radius =
      shapeType === "ellipse" || shapeType === "circle" ? "50%" : "4px";
    return `<div style="${base}background:${fill};border-radius:${radius};"></div>`;
  }

  if (el.type === "icon") {
    const fill = el.fill?.[0] || "#666";
    return `<div style="${base}display:flex;align-items:center;justify-content:center;color:${fill};font-size:${Math.min(el.width, el.height) * 0.55}px;font-family:sans-serif;">◆</div>`;
  }

  if (el.type === "chart" || el.type === "table" || el.type === "mindmap") {
    const label =
      el.type === "chart" ? "Chart" : el.type === "table" ? "Table" : "MindMap";
    return `<div style="${base}display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.04);border:1px dashed #999;color:#666;font:14px sans-serif;">${label}</div>`;
  }

  return "";
}

function buildPageHtml(
  page: Page,
  assetMap: AssetMap,
  assetsDir?: string
): string {
  const els = [...(page.elements || [])]
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    .map((el) => renderElement(el, assetMap, assetsDir))
    .join("\n");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  html,body{margin:0;padding:0;background:#111;}
  .stage{width:${CANVAS_WIDTH}px;height:${CANVAS_HEIGHT}px;position:relative;overflow:hidden;${pageBackgroundStyle(page, assetMap, assetsDir)}}
</style></head>
<body><div class="stage" id="stage">${els}</div></body></html>`;
}

/**
 * Puppeteer 导出每页 PPT 截图（PNG），并返回 data URL 供 VL 打分。
 */
export async function screenshotPagesWithPuppeteer(opts: {
  pages: Page[];
  assetMap: AssetMap;
  outDir: string;
  assetsDir?: string;
}): Promise<PageScreenshot[]> {
  const { pages, assetMap, outDir } = opts;
  const assetsDir = opts.assetsDir || path.join(outDir, "assets");
  await mkdir(outDir, { recursive: true });

  const puppeteer = await import("puppeteer");
  const tmp = await mkdtemp(path.join(tmpdir(), "webppt-shot-"));
  const browser = await puppeteer.default.launch(puppeteerLaunchOptions());

  const results: PageScreenshot[] = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: Math.ceil(CANVAS_WIDTH),
      height: Math.ceil(CANVAS_HEIGHT),
      deviceScaleFactor: 1,
    });

    for (const pptPage of pages) {
      const htmlPath = path.join(tmp, `${pptPage.id}.html`);
      await writeFile(
        htmlPath,
        buildPageHtml(pptPage, assetMap, assetsDir),
        "utf-8"
      );
      await page.goto(pathToFileURL(htmlPath).href, {
        waitUntil: "networkidle0",
      });
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      const shotPath = path.join(outDir, `${pptPage.id}.png`);
      const el = await page.$("#stage");
      if (el) {
        await el.screenshot({ path: shotPath as `${string}.png`, type: "png" });
      } else {
        await page.screenshot({ path: shotPath as `${string}.png`, type: "png" });
      }
      const buf = await readFile(shotPath);
      results.push({
        pageId: pptPage.id,
        filePath: shotPath,
        dataUrl: `data:image/png;base64,${buf.toString("base64")}`,
      });
    }
  } finally {
    await browser.close().catch(() => undefined);
    await rm(tmp, { recursive: true, force: true }).catch(() => undefined);
  }

  return results;
}
