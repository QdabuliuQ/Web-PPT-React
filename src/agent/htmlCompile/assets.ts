import { existsSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { AssetMap } from "../types";

/** 解析资源为 Puppeteer 可用的 file:// 或 http(s)/data URL */
export function resolveAssetHref(
  assetKey: string,
  assetMap: AssetMap,
  assetsDir?: string
): string | undefined {
  const entry = assetMap[assetKey];
  if (!entry) return undefined;
  if (entry.localPath && existsSync(entry.localPath)) {
    return pathToFileURL(path.resolve(entry.localPath)).href;
  }
  if (assetsDir) {
    const candidate = path.join(assetsDir, `${assetKey}.png`);
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  if (entry.remoteUrl) return entry.remoteUrl;
  if (
    entry.url?.startsWith("http") ||
    entry.url?.startsWith("data:") ||
    entry.url?.startsWith("file:")
  ) {
    return entry.url;
  }
  return undefined;
}

export function buildAssetHrefMap(
  assetMap: AssetMap,
  assetsDir?: string
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(assetMap)) {
    const href = resolveAssetHref(key, assetMap, assetsDir);
    if (href) map[key] = href;
  }
  return map;
}

/** 文档内使用的同源路径（编辑器） */
export function resolveDocumentSrc(
  assetKey: string,
  assetMap: AssetMap
): string {
  const entry = assetMap[assetKey];
  if (!entry) return "";
  return entry.url || entry.remoteUrl || "";
}
