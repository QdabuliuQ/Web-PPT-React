import { copyFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import type { AgentRuntimeConfig } from "../config";
import {
  generateImage,
  mapPool,
  PUBLIC_ASSET_URL_PREFIX,
} from "../clients/image";
import {
  colorFromAssetKey,
  createSolidColorPng,
  sizeFromAspectRatio,
} from "../clients/solidPng";
import type { AssetMap, MetaJson } from "../types";

const PUBLIC_ASSET_DIR = path.join(process.cwd(), "public", "agent-assets");

/** 失败时写本地纯色占位，不用远程 placehold */
async function writeLocalPlaceholder(
  outDir: string,
  assetKey: string,
  aspectRatio?: string
): Promise<{ url: string; localPath: string }> {
  const { width, height } = sizeFromAspectRatio(aspectRatio);
  const png = createSolidColorPng(width, height, colorFromAssetKey(assetKey));
  await mkdir(outDir, { recursive: true });
  await mkdir(PUBLIC_ASSET_DIR, { recursive: true });
  const fileName = `${assetKey}.png`;
  const localPath = path.join(outDir, fileName);
  await writeFile(localPath, png);
  await copyFile(localPath, path.join(PUBLIC_ASSET_DIR, fileName));
  return {
    url: `${PUBLIC_ASSET_URL_PREFIX}/${fileName}`,
    localPath,
  };
}

export async function runImageAgent(opts: {
  config: AgentRuntimeConfig;
  meta?: MetaJson;
  /** 直接传任务（HTML 流水线）；与 meta.drawTasks 二选一 */
  drawTasks?: MetaJson["drawTasks"];
  outDir?: string;
}): Promise<AssetMap> {
  const { config, outDir } = opts;
  const tasks = opts.drawTasks || opts.meta?.drawTasks || [];
  const assetsDir =
    outDir || path.join(process.cwd(), "agent-output", "assets");
  const map: AssetMap = {};

  if (config.skipImageGen || config.mock) {
    console.log(
      `[ImageAgent] 跳过生图 API（${config.skipImageGen ? "skipImageGen" : "mock"}），写入 ${tasks.length} 张纯色占位`
    );
  }

  const results = await mapPool(
    tasks,
    config.imageConcurrency,
    async (task) => {
      try {
        const r = await generateImage({
          config,
          prompt: task.prompt,
          assetKey: task.assetKey,
          aspectRatio: task.aspectRatio,
          outDir: assetsDir,
        });
        return { key: task.assetKey, entry: r, error: null as string | null };
      } catch (err) {
        return {
          key: task.assetKey,
          entry: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }
  );

  for (const r of results) {
    if (r.entry) {
      map[r.key] = {
        url: r.entry.url,
        localPath: r.entry.localPath,
        remoteUrl: r.entry.remoteUrl,
      };
    } else {
      console.warn(`[ImageAgent] ${r.key} 失败: ${r.error}`);
      const task = tasks.find((t) => t.assetKey === r.key);
      const ph = await writeLocalPlaceholder(
        assetsDir,
        r.key,
        task?.aspectRatio
      );
      map[r.key] = { url: ph.url, localPath: ph.localPath };
    }
  }

  return map;
}
