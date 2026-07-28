import { mkdir, rm } from "fs/promises";
import path from "path";

/**
 * 每次生成前清空输出目录，避免旧 html / assets / document 残留干扰。
 * 断点续跑（resumeMeta / resumeAssetMap）时跳过，以免删掉可复用产物。
 */
export async function prepareOutDir(
  outDir: string,
  opts?: { resume?: boolean }
): Promise<string> {
  const resolved = path.resolve(outDir);
  if (!opts?.resume) {
    await rm(resolved, { recursive: true, force: true });
    console.log(`[pipeline] cleared outDir: ${resolved}`);
  }
  await mkdir(resolved, { recursive: true });
  await mkdir(path.join(resolved, "assets"), { recursive: true });
  return resolved;
}
