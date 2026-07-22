import { puppeteerLaunchOptions } from "./puppeteerLaunch";
import type { Elements, Page } from "@/store/zustand/pptStore";
import { writeFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { pathToFileURL } from "url";

export type TextOverflowHit = {
  pageId: string;
  elementId: string;
  scrollHeight: number;
  clientHeight: number;
  contentHeight: number;
};

type TextProbe = {
  pageId: string;
  elementId: string;
  text: string;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  justifyContent: "flex-start" | "center" | "flex-end";
  padding: number;
  borderWidth: number;
};

const EPSILON = 2;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function placementStyle(placement?: string): Pick<
  TextProbe,
  "textAlign" | "justifyContent"
> {
  const key = placement || "left-top";
  const [h = "left", v = "top"] = key.split("-");
  return {
    textAlign: h === "center" ? "center" : h === "right" ? "right" : "left",
    justifyContent:
      v === "center" ? "center" : v === "bottom" ? "flex-end" : "flex-start",
  };
}

function isAccentOrEmptyText(el: Extract<Elements, { type: "text" }>): boolean {
  return (
    (el.height || 0) <= 10 ||
    !(el.text || "").trim() ||
    !!(
      el.backgroundColor &&
      el.backgroundColor !== "transparent" &&
      el.color === el.backgroundColor
    )
  );
}

export function collectTextProbes(pages: Page[]): TextProbe[] {
  const probes: TextProbe[] = [];
  for (const page of pages) {
    for (const el of page.elements || []) {
      if (el.type !== "text" || isAccentOrEmptyText(el)) continue;
      const place = placementStyle(el.placement);
      probes.push({
        pageId: page.id,
        elementId: el.id,
        text: el.text || "",
        width: el.width,
        height: el.height,
        fontSize: el.fontSize || 16,
        fontFamily: el.fontFamily || "Arial",
        fontWeight: el.bold ? "bold" : "normal",
        fontStyle: el.italic ? "italic" : "normal",
        lineHeight: el.lineHeight || 1.4,
        textAlign: place.textAlign,
        justifyContent: place.justifyContent,
        // 与 Text/index.module.less 预览态一致
        padding: 4,
        borderWidth: el.border ? el.borderWidth || 1 : 0,
      });
    }
  }
  return probes;
}

function buildMeasureHtml(probes: TextProbe[]): string {
  const boxes = probes
    .map((p, i) => {
      const id = `probe_${i}`;
      return `<div id="${id}" class="text-box" data-page="${escapeHtml(p.pageId)}" data-el="${escapeHtml(p.elementId)}" style="
        width:${p.width}px;
        height:${p.height}px;
        font-size:${p.fontSize}px;
        font-family:${escapeHtml(p.fontFamily)}, sans-serif;
        font-weight:${p.fontWeight};
        font-style:${p.fontStyle};
        line-height:${p.lineHeight};
        text-align:${p.textAlign};
        justify-content:${p.justifyContent};
        padding:${p.padding}px;
        border-width:${p.borderWidth}px;
      "><span>${escapeHtml(p.text)}</span></div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 16px; background: #fff; }
  .text-box {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    word-break: break-word;
    overflow: hidden;
    border-style: solid;
    border-color: transparent;
    margin: 0 0 12px 0;
  }
  .text-box > span { display: block; width: 100%; }
</style>
</head>
<body>
${boxes}
</body>
</html>`;
}

/**
 * 用 Puppeteer 按 Text 预览样式真实测高：scrollHeight / 放开高度后的 contentHeight vs clientHeight。
 */
export async function measureTextOverflowWithPuppeteer(
  pages: Page[],
  options?: { timeoutMs?: number; headless?: boolean }
): Promise<TextOverflowHit[]> {
  const probes = collectTextProbes(pages);
  if (probes.length === 0) return [];

  const puppeteer = await import("puppeteer");
  const dir = await mkdtemp(path.join(tmpdir(), "webppt-gate-"));
  const htmlPath = path.join(dir, "measure.html");
  await writeFile(htmlPath, buildMeasureHtml(probes), "utf-8");

  const browser = await puppeteer.default.launch(
    puppeteerLaunchOptions({ headless: options?.headless ?? true })
  );

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(options?.timeoutMs ?? 30_000);
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: "networkidle0",
    });
    // 等字体就绪，避免首次测高偏短
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const results = (await page.evaluate((epsilon: number) => {
      const nodes = Array.from(
        document.querySelectorAll(".text-box")
      ) as HTMLElement[];
      return nodes.map((el) => {
        const clientHeight = el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const prevH = el.style.height;
        const prevO = el.style.overflow;
        const prevJ = el.style.justifyContent;
        el.style.height = "auto";
        el.style.overflow = "visible";
        el.style.justifyContent = "flex-start";
        const contentHeight = el.getBoundingClientRect().height;
        el.style.height = prevH;
        el.style.overflow = prevO;
        el.style.justifyContent = prevJ;
        const overflow =
          scrollHeight > clientHeight + epsilon ||
          contentHeight > clientHeight + epsilon;
        return {
          pageId: el.getAttribute("data-page") || "",
          elementId: el.getAttribute("data-el") || "",
          scrollHeight,
          clientHeight,
          contentHeight,
          overflow,
        };
      });
    }, EPSILON)) as Array<TextOverflowHit & { overflow: boolean }>;

    return results
      .filter((r) => r.overflow)
      .map(({ pageId, elementId, scrollHeight, clientHeight, contentHeight }) => ({
        pageId,
        elementId,
        scrollHeight,
        clientHeight,
        contentHeight,
      }));
  } finally {
    await browser.close().catch(() => undefined);
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export function overflowHitKey(pageId: string, elementId: string): string {
  return `${pageId}::${elementId}`;
}
