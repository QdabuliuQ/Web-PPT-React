/**
 * 把已有 agent-output 里的远程图改成本地 /agent-assets/ 链接
 * 用法：pnpm exec tsx scripts/localize-agent-assets.ts
 */
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "agent-output");
const ASSETS = path.join(OUT, "assets");
const PUBLIC = path.join(ROOT, "public", "agent-assets");
const PREFIX = "/agent-assets";

async function main() {
  const mapPath = path.join(OUT, "asset-map.json");
  const docPath = path.join(OUT, "document.json");
  if (!existsSync(mapPath) || !existsSync(docPath)) {
    console.error("缺少 agent-output/asset-map.json 或 document.json");
    process.exit(1);
  }

  await mkdir(PUBLIC, { recursive: true });
  await mkdir(ASSETS, { recursive: true });

  const map = JSON.parse(await readFile(mapPath, "utf-8")) as Record<
    string,
    { url: string; localPath?: string; remoteUrl?: string }
  >;

  const urlRewrite = new Map<string, string>();

  for (const [key, entry] of Object.entries(map)) {
    const fileName = `${key}.png`;
    const localPath = path.join(ASSETS, fileName);
    const publicPath = path.join(PUBLIC, fileName);
    const localUrl = `${PREFIX}/${fileName}`;

    const remote =
      entry.remoteUrl ||
      (entry.url.startsWith("http") && !entry.url.includes("placehold")
        ? entry.url
        : undefined);

    if (existsSync(localPath)) {
      await copyFile(localPath, publicPath);
    } else if (entry.localPath && existsSync(entry.localPath)) {
      await copyFile(entry.localPath, localPath);
      await copyFile(localPath, publicPath);
    } else if (remote) {
      const res = await fetch(remote);
      if (!res.ok) {
        console.warn(`下载失败 ${key}: ${res.status}，写本地占位`);
        const gray = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "base64"
        );
        await writeFile(localPath, gray);
        await copyFile(localPath, publicPath);
      } else {
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(localPath, buf);
        await copyFile(localPath, publicPath);
      }
    } else {
      console.warn(`无本地文件 ${key}，写本地占位`);
      const gray = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      );
      await writeFile(localPath, gray);
      await copyFile(localPath, publicPath);
    }

    if (entry.url !== localUrl) {
      urlRewrite.set(entry.url, localUrl);
    }
    if (remote) urlRewrite.set(remote, localUrl);
    map[key] = {
      url: localUrl,
      localPath,
      remoteUrl: remote || entry.remoteUrl,
    };
    console.log(`ok ${key} → ${localUrl}`);
  }

  await writeFile(mapPath, JSON.stringify(map, null, 2), "utf-8");

  let docText = await readFile(docPath, "utf-8");
  for (const [from, to] of urlRewrite) {
    docText = docText.split(from).join(to);
  }
  // 顺带把仍指向 CDN / placehold 但 key 已知的 src 换成本地
  const doc = JSON.parse(docText) as {
    pages: Array<{ elements: Array<{ type?: string; src?: string }> }>;
  };
  for (const page of doc.pages || []) {
    for (const el of page.elements || []) {
      if (el.type !== "image" || !el.src) continue;
      if (el.src.startsWith(PREFIX)) continue;
      // 若 src 仍是远程，尝试用 map 里同名文件匹配不上则按 asset-map url 已改写
    }
  }
  await writeFile(docPath, JSON.stringify(doc, null, 2), "utf-8");

  // 再按 map 的 remote/旧 url 精确替换一次 src
  const doc2 = JSON.parse(await readFile(docPath, "utf-8")) as typeof doc;
  const remoteToLocal = new Map<string, string>();
  for (const entry of Object.values(map)) {
    if (entry.remoteUrl) remoteToLocal.set(entry.remoteUrl, entry.url);
    remoteToLocal.set(entry.url, entry.url);
  }
  for (const page of doc2.pages || []) {
    for (const el of page.elements || []) {
      if (el.type === "image" && el.src && remoteToLocal.has(el.src)) {
        el.src = remoteToLocal.get(el.src)!;
      } else if (
        el.type === "image" &&
        el.src &&
        !el.src.startsWith(PREFIX) &&
        !el.src.startsWith("data:")
      ) {
        // 从文件名猜 key
        const m = el.src.match(/img_page_[^/?#]+/);
        if (m && map[m[0]]) el.src = map[m[0]].url;
        else if (el.src.includes("placehold")) {
          // placehold 对应失败项：找 asset-map 里仍是 placehold 的已本地化项
        }
      }
    }
  }
  // placehold → 已本地化的同 key
  for (const page of doc2.pages || []) {
    for (const el of page.elements || []) {
      if (el.type !== "image" || !el.src?.includes("placehold")) continue;
      const textMatch = el.src.match(/text=([^&]+)/);
      if (!textMatch) continue;
      const key = decodeURIComponent(textMatch[1]);
      if (map[key]) el.src = map[key].url;
    }
  }

  await writeFile(docPath, JSON.stringify(doc2, null, 2), "utf-8");
  console.log(`\n已更新:\n  ${mapPath}\n  ${docPath}\n  ${PUBLIC}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
