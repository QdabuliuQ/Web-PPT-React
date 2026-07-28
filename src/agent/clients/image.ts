import { copyFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import type { AgentRuntimeConfig } from "../config";
import {
  colorFromAssetKey,
  createSolidColorPng,
  sizeFromAspectRatio,
} from "./solidPng";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

const PUBLIC_ASSET_DIR = path.join(process.cwd(), "public", "agent-assets");
export const PUBLIC_ASSET_URL_PREFIX = "/agent-assets";

type CustomImageResponse = {
  id?: string;
  progress?: number;
  results?: Array<{ url?: string }>;
  status?: string;
  failure_reason?: string;
  error?: string;
  code?: number;
  msg?: string;
  data?: CustomImageResponse | null;
};

type OpenAIImageResponse = {
  data?: Array<{
    url?: string;
    b64_json?: string;
    task_id?: string;
    status?: string;
  }>;
  error?: { message?: string; code?: string | number };
};

type MaiziTaskResponse = {
  id?: string;
  status?: string;
  display_status?: string;
  progress?: number;
  result_urls?: string[] | null;
  error_msg?: string | null;
};

/** 下载远程图 → agent-output/assets + public/agent-assets，返回同源本地链接 */
async function materializeLocalAsset(
  remoteUrl: string,
  outDir: string,
  assetKey: string
): Promise<{ url: string; localPath: string; remoteUrl: string }> {
  await mkdir(outDir, { recursive: true });
  await mkdir(PUBLIC_ASSET_DIR, { recursive: true });

  let buf: Buffer;
  if (remoteUrl.startsWith("data:")) {
    const b64 = remoteUrl.split(",")[1];
    if (!b64) throw new Error("无效 data URL");
    buf = Buffer.from(b64, "base64");
  } else if (remoteUrl.startsWith("http")) {
    const imgRes = await fetch(remoteUrl);
    if (!imgRes.ok) {
      throw new Error(`下载图片失败 ${imgRes.status}: ${remoteUrl.slice(0, 80)}`);
    }
    buf = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error(`不支持的图片地址: ${remoteUrl.slice(0, 80)}`);
  }

  if (buf.length < 32) throw new Error("下载图片过小，可能无效");

  const fileName = `${assetKey}.png`;
  const localPath = path.join(outDir, fileName);
  const publicPath = path.join(PUBLIC_ASSET_DIR, fileName);
  await writeFile(localPath, buf);
  await copyFile(localPath, publicPath);

  return {
    remoteUrl,
    localPath,
    url: `${PUBLIC_ASSET_URL_PREFIX}/${fileName}`,
  };
}

async function generateImageCustom(
  config: AgentRuntimeConfig,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  if (!config.imageBaseUrl) {
    throw new Error("未配置 IMAGE_API_BASE_URL（自定义生图完整接口地址）");
  }

  const endpoint = config.imageBaseUrl.replace(/\/$/, "");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.imageApiKey || config.llmApiKey}`,
    },
    body: JSON.stringify({
      model: config.imageModel,
      prompt,
      aspectRatio,
      shutProgress: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API ${res.status}: ${text.slice(0, 400)}`);
  }

  const text = await res.text();
  const data = parseCustomImageBody(text);
  return extractCustomImageUrl(data);
}

function parseCustomImageBody(text: string): CustomImageResponse {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("生图返回空 body");

  if (trimmed.startsWith("data:") || trimmed.includes("\ndata:")) {
    let last: CustomImageResponse | null = null;
    for (const line of trimmed.split(/\r?\n/)) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        last = JSON.parse(payload) as CustomImageResponse;
      } catch {
        /* skip */
      }
    }
    if (!last) throw new Error(`无法解析 SSE 生图响应: ${trimmed.slice(0, 200)}`);
    return last;
  }

  let raw: CustomImageResponse;
  try {
    raw = JSON.parse(trimmed) as CustomImageResponse;
  } catch {
    throw new Error(`生图返回非 JSON: ${trimmed.slice(0, 200)}`);
  }

  if (typeof raw.code === "number" && raw.code !== 0 && raw.code !== 200) {
    throw new Error(raw.msg || `生图业务错误 code=${raw.code}`);
  }
  return (raw.data && typeof raw.data === "object" ? raw.data : raw) as CustomImageResponse;
}

function extractCustomImageUrl(data: CustomImageResponse): string {
  if (data.error || data.failure_reason) {
    throw new Error(data.error || data.failure_reason || "生图失败");
  }

  if (data.status === "succeeded" || (data.progress ?? 0) >= 100) {
    const url = data.results?.[0]?.url;
    if (!url) throw new Error("生图成功但 results 无 url");
    return url;
  }

  const url = data.results?.[0]?.url;
  if (url) return url;

  throw new Error(
    `生图未完成 status=${data.status || "unknown"} progress=${data.progress ?? 0}`
  );
}

function extractSyncImageUrl(
  item: NonNullable<OpenAIImageResponse["data"]>[number] | undefined
): string | null {
  if (!item) return null;
  if (item.url) return item.url;
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  return null;
}

/** MaiziTech 等网关：images/generations 先返回 task_id，再轮询 /tasks/{id} */
async function pollMaiziImageTask(
  host: string,
  apiKey: string,
  taskId: string,
  opts?: { timeoutMs?: number; intervalMs?: number }
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 180_000;
  const intervalMs = opts?.intervalMs ?? 2_000;
  const started = Date.now();
  let lastStatus = "pending";

  while (Date.now() - started < timeoutMs) {
    const res = await fetch(`${host}/tasks/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`任务查询 ${res.status}: ${text.slice(0, 300)}`);
    }

    let task: MaiziTaskResponse;
    try {
      task = JSON.parse(text) as MaiziTaskResponse;
    } catch {
      throw new Error(`任务响应非 JSON: ${text.slice(0, 200)}`);
    }

    lastStatus = task.status || task.display_status || lastStatus;
    const url = task.result_urls?.find((u) => !!u);
    if (url) return url;

    if (
      lastStatus === "failed" ||
      lastStatus === "error" ||
      lastStatus === "cancelled"
    ) {
      throw new Error(task.error_msg || `生图任务失败 status=${lastStatus}`);
    }

    if (
      (lastStatus === "completed" ||
        lastStatus === "succeeded" ||
        lastStatus === "success") &&
      !url
    ) {
      throw new Error(`生图任务完成但无 result_urls: ${text.slice(0, 300)}`);
    }

    await sleep(intervalMs);
  }

  throw new Error(
    `生图任务超时（${Math.round(timeoutMs / 1000)}s）task=${taskId} lastStatus=${lastStatus}`
  );
}

async function generateImageOpenAI(
  config: AgentRuntimeConfig,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const host = (config.imageBaseUrl || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const apiKey = config.imageApiKey || config.llmApiKey || "";
  // 精确像素：直接传 HTML/槽位宽高映射出的 size（如 320x180 / 1000x562）
  const size =
    aspectRatio && aspectRatio !== "auto" ? aspectRatio : "auto";
  const res = await fetch(`${host}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.imageModel || "gpt-image-2",
      prompt,
      size,
      resolution: config.imageResolution || "1K",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API ${res.status}: ${text.slice(0, 400)}`);
  }

  const rawText = await res.text();
  let data: OpenAIImageResponse;
  try {
    data = JSON.parse(rawText) as OpenAIImageResponse;
  } catch {
    throw new Error(`生图返回非 JSON: ${rawText.slice(0, 200)}`);
  }

  if (data.error?.message) {
    throw new Error(`生图错误: ${data.error.message}`);
  }

  const item = data.data?.[0];
  const syncUrl = extractSyncImageUrl(item);
  if (syncUrl) return syncUrl;

  const taskId = item?.task_id;
  if (taskId) {
    return pollMaiziImageTask(host, apiKey, taskId);
  }

  throw new Error(
    `生图返回空（无 url/b64/task_id）: ${rawText.slice(0, 280)}`
  );
}

/** 纯色占位图（跳过生图 / mock / 无 key） */
async function writeSolidPlaceholder(
  outDir: string,
  assetKey: string,
  aspectRatio: string
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

export async function generateImage(opts: {
  config: AgentRuntimeConfig;
  prompt: string;
  assetKey: string;
  aspectRatio?: string;
  outDir?: string;
  retries?: number;
}): Promise<{ url: string; localPath: string; remoteUrl?: string }> {
  const { config, assetKey, prompt } = opts;
  const retries = opts.retries ?? 2;
  const aspectRatio =
    opts.aspectRatio || config.imageAspectRatio || "auto";
  const outDir =
    opts.outDir || path.join(process.cwd(), "agent-output", "assets");

  if (config.skipImageGen || config.mock || !config.imageApiKey) {
    return writeSolidPlaceholder(outDir, assetKey, aspectRatio);
  }

  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const remoteUrl =
        config.imageProvider === "openai"
          ? await generateImageOpenAI(config, prompt, aspectRatio)
          : await generateImageCustom(config, prompt, aspectRatio);

      return await materializeLocalAsset(remoteUrl, outDir, assetKey);
    } catch (err) {
      lastErr = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) || 1 },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
