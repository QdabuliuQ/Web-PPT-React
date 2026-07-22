import { existsSync } from "fs";
import type { LaunchOptions } from "puppeteer";

const MAC_CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
];

function firstExisting(paths: string[]): string | undefined {
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }
  return undefined;
}

/** 解析 Puppeteer Chromium：优先环境变量，其次本机 Chrome */
export function resolveChromeExecutable(): string | undefined {
  return firstExisting([
    process.env.PUPPETEER_EXECUTABLE_PATH || "",
    process.env.CHROME_PATH || "",
    ...MAC_CHROME_CANDIDATES,
  ]);
}

export function puppeteerLaunchOptions(
  extra: LaunchOptions = {}
): LaunchOptions {
  const executablePath = resolveChromeExecutable();
  return {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=none",
      "--disable-dev-shm-usage",
    ],
    ...(executablePath ? { executablePath } : {}),
    ...extra,
  };
}
