import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** 内置审美参考图目录 */
export const DEFAULT_SAMPLE_DIR = path.join(
  process.cwd(),
  "src",
  "agent",
  "assets"
);

function toDataUrl(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const buf = readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function listImagesInDir(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(dir, name))
    .sort();
}

/**
 * 解析本地参考图路径：文件、目录、逗号分隔均可。
 * 返回可供 ThemeAgent 使用的 data URL 列表。
 */
export function loadSampleImageUrls(
  inputs: string[],
  opts?: { maxImages?: number }
): { urls: string[]; files: string[] } {
  const maxImages = opts?.maxImages ?? 5;
  const files: string[] = [];

  for (const raw of inputs) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    for (const part of trimmed.split(",")) {
      const p = path.resolve(part.trim());
      if (!existsSync(p)) {
        console.warn(`[samples] 路径不存在，已跳过: ${p}`);
        continue;
      }
      if (statSync(p).isDirectory()) {
        files.push(...listImagesInDir(p));
      } else if (IMAGE_EXT.has(path.extname(p).toLowerCase())) {
        files.push(p);
      } else {
        console.warn(`[samples] 非图片文件，已跳过: ${p}`);
      }
    }
  }

  const unique = [...new Set(files)].slice(0, maxImages);
  if (files.length > maxImages) {
    console.warn(
      `[samples] 共 ${files.length} 张，仅取前 ${maxImages} 张以免请求过大`
    );
  }

  const urls = unique.map(toDataUrl);
  return { urls, files: unique };
}
