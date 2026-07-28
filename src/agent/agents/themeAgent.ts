import type { AgentRuntimeConfig } from "../config";
import { meetsContrast, pickReadableText, relativeLuminance } from "../contrast";
import { chatJson } from "../clients/llm";
import {
  THEME_SYSTEM_PROMPT,
  buildThemeUserPrompt,
} from "../prompts/theme";
import { ThemeTokenSchema } from "../schema";
import type { DesignProfile } from "../design/director";
import type { DesignBrief } from "../brief/types";
import { ensureThemeImagePrompts } from "../theme/colorPrompt";
import {
  applyMaterialPackToTheme,
  resolveVisualFamily,
} from "../theme/visualFamily";
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

function mockTheme(
  userPrompt: string,
  designProfile?: DesignProfile,
  brief?: DesignBrief
): ThemeToken {
  const family =
    designProfile?.visualFamily || brief?.visualFamily || "editorial";
  const base: ThemeToken = {
    templateName: userPrompt.slice(0, 20) || "智能模板",
    category: brief?.label || designProfile?.label || "商务",
    tags: designProfile
      ? [designProfile.label, designProfile.archetype]
      : brief
        ? [brief.label, brief.genreId]
        : ["专业"],
    primary: "#1B3A4B",
    secondary: "#8A9BA8",
    background: "#F7F8FA",
    textOnLight: "#1A1A1A",
    textOnDark: "#F5F5F5",
    fontTitle: "Source Han Serif SC",
    fontBody: "PingFang SC",
    fontNumeric: "Source Han Serif SC",
    visualFamily: family,
    globalBgPrompt: `Soft paper texture, ${brief?.label || "business"} atmosphere, ${designProfile?.imageStyle || "premium editorial materials"}, theme: ${userPrompt}`,
    globalDecorPrompt: `${(brief?.themeHints || designProfile?.themeGuidance || "").slice(0, 160)} Materials and lighting for: ${userPrompt}`,
  };
  return finalizeTheme(
    ThemeTokenSchema.parse(base),
    userPrompt,
    designProfile,
    brief
  );
}

/** 对比度校正 + 视觉家族材质包 + 补齐带配色的生图 Prompt */
export function finalizeTheme(
  theme: ThemeToken,
  userPrompt?: string,
  designProfile?: DesignProfile,
  brief?: DesignBrief
): ThemeToken {
  let paired = ensureFontPairing(ensureContrast(theme));
  const family = resolveVisualFamily(
    designProfile?.visualFamily || brief?.visualFamily || paired.visualFamily
  );
  paired = applyMaterialPackToTheme(paired, family);
  if (designProfile || brief) {
    paired = {
      ...paired,
      category: paired.category || brief?.label || designProfile?.label,
      tags: Array.from(
        new Set([
          ...(paired.tags || []),
          ...(designProfile
            ? [designProfile.label, designProfile.archetype]
            : []),
          ...(brief ? [brief.label, brief.genreId] : []),
        ])
      ),
    };
  }
  if (designProfile) {
    paired = {
      ...paired,
      globalDecorPrompt: `${paired.globalDecorPrompt || ""} ${designProfile.themeGuidance} ${designProfile.imageStyle}`.trim(),
    };
  } else if (brief?.themeHints) {
    paired = {
      ...paired,
      globalDecorPrompt:
        `${paired.globalDecorPrompt || ""} ${brief.themeHints}`.trim(),
    };
  }
  return ensureThemeImagePrompts(paired, userPrompt);
}

/** 标题/正文同字时强制拉开；补齐数字字体 */
function ensureFontPairing(theme: ThemeToken): ThemeToken {
  let fontTitle = theme.fontTitle || "Source Han Serif SC";
  let fontBody = theme.fontBody || "PingFang SC";
  const same =
    fontTitle.trim().toLowerCase() === fontBody.trim().toLowerCase();
  if (same) {
    fontTitle = "Source Han Serif SC";
    fontBody = "PingFang SC";
  }
  const fontNumeric =
    theme.fontNumeric?.trim() ||
    ( /serif|song|songti|stsong/i.test(fontTitle)
      ? fontTitle
      : "Source Han Serif SC");
  return { ...theme, fontTitle, fontBody, fontNumeric };
}

/** 使用外部给定主题（编辑器当前主题 / 预设），跳过 ThemeAgent 抽色 */
export function resolveProvidedTheme(
  input: unknown,
  userPrompt?: string,
  designProfile?: DesignProfile,
  brief?: DesignBrief
): ThemeToken {
  return finalizeTheme(
    ThemeTokenSchema.parse(input),
    userPrompt,
    designProfile,
    brief
  );
}

export async function runThemeAgent(opts: {
  config: AgentRuntimeConfig;
  userPrompt: string;
  sampleImageUrls?: string[];
  /** 若提供则直接使用，不再调用 LLM 抽色 */
  fixedTheme?: ThemeToken;
  designProfile?: DesignProfile;
  brief?: DesignBrief;
}): Promise<ThemeToken> {
  const {
    config,
    userPrompt,
    sampleImageUrls,
    fixedTheme,
    designProfile,
    brief,
  } = opts;

  if (fixedTheme) {
    return resolveProvidedTheme(fixedTheme, userPrompt, designProfile, brief);
  }

  if (config.mock) {
    return mockTheme(userPrompt, designProfile, brief);
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
          ? `${buildThemeUserPrompt(userPrompt, designProfile, brief)}\n下方附带 ${samples.length} 张审美参考图。请提取配色与视觉气质后输出主题 JSON（不要照搬参考图文案）。`
          : buildThemeUserPrompt(userPrompt, designProfile, brief),
    },
  ];
  for (const url of samples) {
    userContent.push({ type: "image_url", image_url: { url } });
  }

  const raw = await chatJson({
    config,
    temperature: 0.65,
    messages: [
      { role: "system", content: THEME_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    parse: (data) => ThemeTokenSchema.parse(data),
  });

  return finalizeTheme(raw, userPrompt, designProfile, brief);
}
