import type { AgentRuntimeConfig } from "../config";
import { meetsContrast, pickReadableText, relativeLuminance } from "../contrast";
import { ThemeTokenSchema } from "../schema";
import type { ThemeToken } from "../types";
import { chatJson } from "../clients/llm";
import { THEME_SYSTEM_PROMPT } from "../prompts/theme";

function ensureContrast(theme: ThemeToken): ThemeToken {
  const bg = theme.background;
  let textOnLight = theme.textOnLight;
  let textOnDark = theme.textOnDark;

  // 叠深色图的字必须够亮
  if (relativeLuminance(textOnDark) < 0.6) {
    textOnDark = "#FFFFFF";
  }
  // 浅底上的字必须够暗
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
  return ensureContrast(ThemeTokenSchema.parse(base));
}

export async function runThemeAgent(opts: {
  config: AgentRuntimeConfig;
  userPrompt: string;
  sampleImageUrls?: string[];
}): Promise<ThemeToken> {
  const { config, userPrompt, sampleImageUrls } = opts;

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

  return ensureContrast(raw);
}
