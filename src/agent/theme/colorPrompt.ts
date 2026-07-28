import type { ThemeToken } from "../types";

export type ThemeColorRole =
  | "primary"
  | "secondary"
  | "background"
  | "textOnLight"
  | "textOnDark";

/** 主题五色（生成顺序固定） */
export function getThemeFiveColors(theme: ThemeToken): Array<{
  role: ThemeColorRole;
  hex: string;
  usage: string;
}> {
  return [
    {
      role: "primary",
      hex: theme.primary,
      usage: "标题强调/图标主色/强调条/图表主系列",
    },
    {
      role: "secondary",
      hex: theme.secondary,
      usage: "点缀/图标辅色/图表次系列",
    },
    {
      role: "background",
      hex: theme.background,
      usage: "页面底色/浅色氛围",
    },
    {
      role: "textOnLight",
      hex: theme.textOnLight,
      usage: "浅底正文与标题字色",
    },
    {
      role: "textOnDark",
      hex: theme.textOnDark,
      usage: "叠图/深底字色",
    },
  ];
}

/** 生图 Prompt：锁定五色 */
export function buildPaletteHint(theme: ThemeToken): string {
  const colors = getThemeFiveColors(theme)
    .map((c) => `${c.role} ${c.hex}`)
    .join("; ");
  return [
    `THEME_5_COLORS locked: ${colors}`,
    "grade lighting and materials toward these five hex colors only",
    "no unrelated neon or clash palette",
  ].join(". ");
}

/** 确保 imagePrompt 文本里显式带上五色 hex（供生图模型读到） */
export function appendPaletteToImagePrompt(
  basePrompt: string,
  theme: ThemeToken
): string {
  const base = (basePrompt || "").trim().replace(/[.\s]+$/, "");
  const colors = getThemeFiveColors(theme);
  const already = colors.every((c) =>
    base.toLowerCase().includes(c.hex.toLowerCase())
  );
  if (already) return base;
  const list = colors.map((c) => `${c.role}:${c.hex}`).join(", ");
  return `${base}. color grade using theme 5 colors: ${list}`;
}

/** 缺省时补齐全局氛围 / 装饰 Prompt，并带上五色与场合材质 */
export function ensureThemeImagePrompts(
  theme: ThemeToken,
  userPrompt?: string
): ThemeToken {
  const topic = (userPrompt || theme.templateName || "presentation").slice(
    0,
    80
  );
  const palette = buildPaletteHint(theme);
  const mat = theme.material;
  let genreMaterial =
    mat?.imageMaterials ||
    [
      mat?.surface,
      mat?.light,
    ]
      .filter(Boolean)
      .join(", ");
  if (!genreMaterial && userPrompt) {
    const cat = `${theme.category || ""} ${(theme.tags || []).join(" ")}`;
    if (/年会|庆典|暖金|stage/.test(cat)) {
      genreMaterial =
        "warm gala materials: silk, foil, stage soft light; no tech neon";
    } else if (/消费|奶油|产品|product/.test(cat)) {
      genreMaterial =
        "cream brand materials: paper, soft product photography; no HUD or circuit";
    } else if (/工程|冷灰|克制|editorial/.test(cat)) {
      genreMaterial =
        "cool engineering materials: concrete, brushed metal; no warm brass foil";
    } else if (/路演|融资|monument/.test(cat)) {
      genreMaterial = "pitch stage lighting, clean product render";
    }
  }
  const coverHint = mat?.coverImageHint || "";
  const globalBgPrompt = appendPaletteToImagePrompt(
    theme.globalBgPrompt?.trim() ||
      [
        "soft abstract editorial atmosphere",
        "muted paper-like texture",
        "subtle gradient",
        "no objects",
        "no text",
        `mood for: ${topic}`,
        genreMaterial,
        coverHint,
      ]
        .filter(Boolean)
        .join(", "),
    theme
  );

  const globalDecorPrompt = appendPaletteToImagePrompt(
    theme.globalDecorPrompt?.trim() ||
      [
        "clean editorial photography or illustration",
        "soft natural light",
        "concrete subject",
        "no abstract filler only",
        "no text",
        "no logos",
        `topic: ${topic}`,
        genreMaterial,
      ]
        .filter(Boolean)
        .join(", "),
    theme
  );

  const materialSuffix = genreMaterial ? ` ${genreMaterial}.` : "";
  return {
    ...theme,
    globalBgPrompt: `${globalBgPrompt}. ${palette}.${materialSuffix}`,
    globalDecorPrompt: `${globalDecorPrompt}. ${palette}.${materialSuffix}`,
  };
}

/** 给 ContentAgent 的五色说明 */
export function formatThemeForContentPrompt(theme: ThemeToken): string {
  const five = getThemeFiveColors(theme)
    .map((c, i) => `${i + 1}. ${c.role}=${c.hex}  // ${c.usage}`)
    .join("\n");
  const mat = theme.material;
  return [
    `templateName=${theme.templateName}`,
    `category=${theme.category}`,
    theme.visualFamily ? `visualFamily=${theme.visualFamily}` : "",
    `fonts: title=${theme.fontTitle}; body=${theme.fontBody}`,
    "THEME_5_COLORS（必须全部服从，禁止另起色系）:",
    five,
    mat
      ? `material: surface=${mat.surface}; light=${mat.light}; coverScrim=${mat.coverScrim}`
      : "",
    mat?.imageMaterials ? `imageMaterials=${mat.imageMaterials}` : "",
    theme.globalBgPrompt ? `globalBgPrompt=${theme.globalBgPrompt}` : "",
    theme.globalDecorPrompt
      ? `globalDecorPrompt=${theme.globalDecorPrompt}`
      : "",
    "imagePrompt 必须显式写出上述 5 个 #RRGGBB，并描述如何用主色/辅色给画面定调。",
  ]
    .filter(Boolean)
    .join("\n");
}
