import { copyFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import type { AgentRuntimeConfig } from "../config";

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
  data?: Array<{ url?: string; b64_json?: string }>;
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

async function generateImageOpenAI(
  config: AgentRuntimeConfig,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const host = (config.imageBaseUrl || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const size = aspectRatio.includes("x") ? aspectRatio : "1024x1024";
  const res = await fetch(`${host}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.imageApiKey || config.llmApiKey}`,
    },
    body: JSON.stringify({
      model: config.imageModel,
      prompt,
      n: 1,
      size,
      response_format: "url",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as OpenAIImageResponse;
  const item = data.data?.[0];
  let url = item?.url;
  if (!url && item?.b64_json) {
    url = `data:image/png;base64,${item.b64_json}`;
  }
  if (!url) throw new Error("生图返回空");
  return url;
}

export async function generateImage(opts: {
  config: AgentRuntimeConfig;
  prompt: string;
  assetKey: string;
  aspectRatio?: string;
  outDir?: string;
  retries?: number;
}): Promise<{ url: string; localPath: string; remoteUrl?: string }> {
  const { config, prompt, assetKey } = opts;
  const retries = opts.retries ?? 3;
  const aspectRatio =
    opts.aspectRatio || config.imageAspectRatio || "1024x1024";
  const outDir =
    opts.outDir || path.join(process.cwd(), "agent-output", "assets");

  if (config.mock || !config.imageApiKey) {
    const grayPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    await mkdir(outDir, { recursive: true });
    await mkdir(PUBLIC_ASSET_DIR, { recursive: true });
    const fileName = `${assetKey}.png`;
    const localPath = path.join(outDir, fileName);
    await writeFile(localPath, grayPng);
    await copyFile(localPath, path.join(PUBLIC_ASSET_DIR, fileName));
    return {
      url: `${PUBLIC_ASSET_URL_PREFIX}/${fileName}`,
      localPath,
    };
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
