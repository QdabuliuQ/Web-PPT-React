import type { AgentRuntimeConfig } from "../config";
import { meetsContrast, pickReadableText, relativeLuminance } from "../contrast";
import { chatJson } from "../clients/llm";
import { THEME_SYSTEM_PROMPT } from "../prompts/theme";
import { ThemeTokenSchema } from "../schema";
import { ensureThemeImagePrompts } from "../theme/colorPrompt";
import type { ThemeToken } from "../types";

function ensureContrast(theme: ThemeToken): ThemeToken {
  const bg = theme.background;
  let textOnLight = theme.textOnLight;
  let textOnDark = theme.textOnDark;

  if (relativeLuminance(textOnDark) < 0.6) {
    textOnDark = "#FFFFFF";
  }
  if (relativeLuminance(textOnLight) > 0.35) {
    textOnLight = "#1A1A1A";
  }

  if (!meetsContrast(textOnLight, bg) && !meetsContrast(textOnDark, bg)) {
    textOnLight = "#111111";
    textOnDark = "#FFFFFF";
  }

  const readable = pickReadableText(bg, textOnLight, textOnDark);
  if (readable === textOnLight) {
    textOnLight = readable;
  }

  return { ...theme, textOnLight, textOnDark };
}

function mockTheme(userPrompt: string): ThemeToken {
  const base: ThemeToken = {
    templateName: userPrompt.slice(0, 20) || "智能模板",
    category: "商务",
    tags: ["专业", "路演"],
    primary: "#1B3A4B",
    secondary: "#C4A574",
    background: "#F7F8FA",
    textOnLight: "#1A1A1A",
    textOnDark: "#F5F5F5",
    fontTitle: "PingFang SC",
    fontBody: "PingFang SC",
    globalBgPrompt: `Soft paper texture, muted editorial, theme: ${userPrompt}`,
    globalDecorPrompt: `Clean editorial illustration, soft lighting: ${userPrompt}`,
  };
  return finalizeTheme(ThemeTokenSchema.parse(base), userPrompt);
}

/** 对比度校正 + 补齐带配色的生图 Prompt */
export function finalizeTheme(
  theme: ThemeToken,
  userPrompt?: string
): ThemeToken {
  return ensureThemeImagePrompts(ensureContrast(theme), userPrompt);
}

/** 使用外部给定主题（编辑器当前主题 / 预设），跳过 ThemeAgent 抽色 */
export function resolveProvidedTheme(
  input: unknown,
  userPrompt?: string
): ThemeToken {
  return finalizeTheme(ThemeTokenSchema.parse(input), userPrompt);
}

export async function runThemeAgent(opts: {
  config: AgentRuntimeConfig;
  userPrompt: string;
  sampleImageUrls?: string[];
  /** 若提供则直接使用，不再调用 LLM 抽色 */
  fixedTheme?: ThemeToken;
}): Promise<ThemeToken> {
  const { config, userPrompt, sampleImageUrls, fixedTheme } = opts;

  if (fixedTheme) {
    return resolveProvidedTheme(fixedTheme, userPrompt);
  }

  if (config.mock) {
    return mockTheme(userPrompt);
  }

  const samples = sampleImageUrls || [];
  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text:
        samples.length > 0
          ? `用户需求：${userPrompt}\n下方附带 ${samples.length} 张审美参考图。请提取配色与视觉气质后输出主题 JSON（不要照搬参考图文案）。`
          : `用户需求：${userPrompt}\n请输出主题 JSON。`,
    },
  ];
  for (const url of samples) {
    userContent.push({ type: "image_url", image_url: { url } });
  }

  const raw = await chatJson({
    config,
    messages: [
      { role: "system", content: THEME_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    parse: (data) => ThemeTokenSchema.parse(data),
  });

  return finalizeTheme(raw, userPrompt);
}
