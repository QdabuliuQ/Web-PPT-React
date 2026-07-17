import type { Page } from "@/store/ppt";
import { snapdom } from "@zumer/snapdom";
import { createElement, useEffect, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const DEBOUNCE_MS = 400;
const CONCURRENCY = 1;
const SNAP_SCALE = 0.4;
const JPEG_QUALITY = 0.72;

type CacheEntry = {
  url: string;
  fingerprint: string;
};

const cache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const queue: Page[] = [];
const queuedIds = new Set<string>();
const generatingIds = new Set<string>();
const pendingRegen = new Map<string, Page>();
let activeJobs = 0;
let version = 0;

function notify() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getPageFingerprint(page: Page): string {
  return JSON.stringify({
    elements: page.elements,
    backgroundType: page.backgroundType,
    background: page.background,
    bgColor: page.bgColor,
    fgColor: page.fgColor,
    bgOpacity: page.bgOpacity,
    selectedTexture: (page as Page & { selectedTexture?: string })
      .selectedTexture,
    visible: page.visible,
  });
}

export function subscribeThumbnails(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getThumbnailVersion() {
  return version;
}

export function getCachedThumbnail(pageId: string): string | null {
  return cache.get(pageId)?.url ?? null;
}

export function isThumbnailFresh(page: Page): boolean {
  const entry = cache.get(page.id);
  if (!entry) return false;
  return entry.fingerprint === getPageFingerprint(page);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * 离屏渲染轻量 PreviewCanvas，生成低分辨率 JPEG 缩略图。
 */
export async function generatePageThumbnail(
  page: Page
): Promise<string | null> {
  const fingerprint = getPageFingerprint(page);
  const existing = cache.get(page.id);
  if (existing?.fingerprint === fingerprint) {
    return existing.url;
  }

  const { PreviewCanvas } = await import("@/views/Canvas/PreviewCanvas");

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "0";
  tempContainer.style.width = `${CANVAS_WIDTH}px`;
  tempContainer.style.height = `${CANVAS_HEIGHT}px`;
  tempContainer.style.backgroundColor = "#fff";
  tempContainer.style.overflow = "hidden";
  tempContainer.style.pointerEvents = "none";
  document.body.appendChild(tempContainer);

  const canvasWrapper = document.createElement("div");
  canvasWrapper.style.width = `${CANVAS_WIDTH}px`;
  canvasWrapper.style.height = `${CANVAS_HEIGHT}px`;
  canvasWrapper.style.position = "relative";
  canvasWrapper.style.backgroundColor = "#fff";
  tempContainer.appendChild(canvasWrapper);

  const root = createRoot(canvasWrapper);
  root.render(createElement(PreviewCanvas, { page }));

  try {
    await delay(120);

    const canvasElement = canvasWrapper.querySelector(
      `#preview-canvas-container-${page.id}`
    ) as HTMLElement | null;

    if (!canvasElement) {
      return null;
    }

    const images = canvasElement.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            const htmlImg = img as HTMLImageElement;
            if (htmlImg.complete && htmlImg.naturalHeight !== 0) {
              resolve();
              return;
            }
            const timeout = setTimeout(() => resolve(), 2000);
            htmlImg.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            htmlImg.onerror = () => {
              clearTimeout(timeout);
              resolve();
            };
          })
      )
    );

    await delay(80);

    const canvas = await snapdom.toCanvas(canvasElement, {
      scale: SNAP_SCALE,
      backgroundColor: "#fff",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      cache: "disabled",
    });

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    cache.set(page.id, { url: dataUrl, fingerprint });
    notify();
    return dataUrl;
  } catch (error) {
    console.error("生成缩略图失败:", error);
    return null;
  } finally {
    root.unmount();
    if (tempContainer.parentNode) {
      document.body.removeChild(tempContainer);
    }
  }
}

function enqueue(page: Page, priority: boolean) {
  if (generatingIds.has(page.id)) {
    // 生成中内容又变了：完成后用最新 page 再跑一遍
    pendingRegen.set(page.id, page);
    return;
  }

  if (queuedIds.has(page.id)) {
    const existingIndex = queue.findIndex((item) => item.id === page.id);
    if (existingIndex >= 0) {
      queue[existingIndex] = page;
      if (priority && existingIndex > 0) {
        queue.splice(existingIndex, 1);
        queue.unshift(page);
      }
    }
    return;
  }

  if (priority) {
    queue.unshift(page);
  } else {
    queue.push(page);
  }
  queuedIds.add(page.id);
  processQueue();
}

function processQueue() {
  while (activeJobs < CONCURRENCY && queue.length > 0) {
    const page = queue.shift()!;
    queuedIds.delete(page.id);

    if (isThumbnailFresh(page)) {
      continue;
    }

    activeJobs += 1;
    generatingIds.add(page.id);

    generatePageThumbnail(page)
      .catch(() => null)
      .finally(() => {
        activeJobs -= 1;
        generatingIds.delete(page.id);

        const pending = pendingRegen.get(page.id);
        if (pending) {
          pendingRegen.delete(page.id);
          if (!isThumbnailFresh(pending)) {
            enqueue(pending, true);
          }
        }

        processQueue();
      });
  }
}

/**
 * 脏页防抖调度：仅 fingerprint 变化时重新生成。
 */
export function scheduleThumbnailUpdate(
  page: Page,
  options?: { immediate?: boolean; priority?: boolean }
) {
  if (isThumbnailFresh(page)) return;

  const wait = options?.immediate ? 0 : DEBOUNCE_MS;
  const prev = debounceTimers.get(page.id);
  if (prev) clearTimeout(prev);

  debounceTimers.set(
    page.id,
    setTimeout(() => {
      debounceTimers.delete(page.id);
      enqueue(page, Boolean(options?.priority));
    }, wait)
  );
}

/** 优先为可视区页生成缩略图 */
export function scheduleVisibleThumbnails(
  pages: Page[],
  options?: { immediate?: boolean }
) {
  pages.forEach((page, index) => {
    scheduleThumbnailUpdate(page, {
      immediate: Boolean(options?.immediate) && index < 6,
      priority: true,
    });
  });
}

export function pruneThumbnailCache(validIds: Set<string>) {
  let changed = false;
  for (const id of cache.keys()) {
    if (!validIds.has(id)) {
      cache.delete(id);
      changed = true;
    }
  }
  if (changed) notify();
}

export function usePageThumbnail(page: Page): string | null {
  useSyncExternalStore(
    subscribeThumbnails,
    getThumbnailVersion,
    getThumbnailVersion
  );

  const fingerprint = getPageFingerprint(page);

  useEffect(() => {
    scheduleThumbnailUpdate(page);
    // fingerprint 变化才调度；page 取最新引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id, fingerprint]);

  return getCachedThumbnail(page.id);
}

/** 订阅整表缩略图缓存变更（虚拟列表父级用） */
export function useThumbnailCacheVersion() {
  return useSyncExternalStore(
    subscribeThumbnails,
    getThumbnailVersion,
    getThumbnailVersion
  );
}

/** 页面增删改时：清理失效缓存，并为脏页防抖调度生成 */
export function usePagesThumbnailSync(pages: Page[]) {
  useThumbnailCacheVersion();

  useEffect(() => {
    const validIds = new Set(pages.map((p) => p.id));
    pruneThumbnailCache(validIds);
    pages.forEach((page) => {
      if (!isThumbnailFresh(page)) {
        scheduleThumbnailUpdate(page);
      }
    });
  }, [pages]);
}
