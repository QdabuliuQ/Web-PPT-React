/**
 * 模板微旋钮：同一套版式可微调疏密 / 强调 / 对齐倾向。
 * 不改模板 HTML 结构，只在渲染后做安全的度量缩放。
 */

export type LayoutDensity = "airy" | "normal" | "dense";
export type LayoutEmphasis = "title" | "image" | "number";
export type LayoutAlign = "left" | "split" | "center";

export type LayoutKnobs = {
  density: LayoutDensity;
  emphasis: LayoutEmphasis;
  align: LayoutAlign;
};

const DENSITY_SET = new Set<string>(["airy", "normal", "dense"]);
const EMPHASIS_SET = new Set<string>(["title", "image", "number"]);
const ALIGN_SET = new Set<string>(["left", "split", "center"]);

export const DEFAULT_LAYOUT_KNOBS: LayoutKnobs = {
  density: "normal",
  emphasis: "title",
  align: "left",
};

export function parseLayoutKnobs(
  slots: Record<string, unknown> | null | undefined,
  fallback?: Partial<LayoutKnobs>
): LayoutKnobs {
  const src = slots || {};
  const density = DENSITY_SET.has(String(src.density))
    ? (String(src.density) as LayoutDensity)
    : fallback?.density || DEFAULT_LAYOUT_KNOBS.density;
  const emphasis = EMPHASIS_SET.has(String(src.emphasis))
    ? (String(src.emphasis) as LayoutEmphasis)
    : fallback?.emphasis || DEFAULT_LAYOUT_KNOBS.emphasis;
  const align = ALIGN_SET.has(String(src.align))
    ? (String(src.align) as LayoutAlign)
    : fallback?.align || DEFAULT_LAYOUT_KNOBS.align;
  return { density, emphasis, align };
}

/** 从内容槽里拆出旋钮，避免塞进模板占位符 */
export function splitSlotsAndKnobs(
  slots: Record<string, unknown>,
  fallback?: Partial<LayoutKnobs>
): { content: Record<string, unknown>; knobs: LayoutKnobs } {
  const { density: _d, emphasis: _e, align: _a, ...content } = slots;
  return {
    content,
    knobs: parseLayoutKnobs(slots, fallback),
  };
}

function scalePxInCss(css: string, factor: number, min = 8, max = 96): string {
  return css.replace(
    /(padding(?:-(?:top|right|bottom|left))?|gap|margin(?:-(?:top|right|bottom|left))?)\s*:\s*([^;]+)/gi,
    (_full, prop: string, value: string) => {
      const next = value.replace(/(\d+(?:\.\d+)?)px/g, (_, n: string) => {
        const v = Math.round(Number(n) * factor);
        return `${Math.max(min, Math.min(max, v))}px`;
      });
      return `${prop}:${next}`;
    }
  );
}

function scaleFontAttrs(
  html: string,
  opts: { minSize: number; factor: number; maxBump?: number }
): string {
  const { minSize, factor, maxBump = 14 } = opts;
  return html.replace(
    /data-font-size="(\d+)"([^>]*?)style="([^"]*)"/gi,
    (full, sizeStr: string, mid: string, style: string) => {
      const size = Number(sizeStr);
      if (!(size >= minSize)) return full;
      const bumped = Math.min(
        size + maxBump,
        Math.round(size * factor)
      );
      const nextStyle = style.replace(
        /font-size\s*:\s*[\d.]+px/i,
        `font-size:${bumped}px`
      );
      return `data-font-size="${bumped}"${mid}style="${nextStyle}"`;
    }
  );
}

/**
 * 把微旋钮落到已渲染 HTML：
 * - density：缩放 padding/gap
 * - emphasis=title：抬标题字号（≥28）
 * - emphasis=number：抬大数字（≥42）
 * - align：写入 data-align（供后续扩展；不破坏几何）
 */
export function applyLayoutKnobs(html: string, knobs: LayoutKnobs): string {
  let out = html;

  // 标记在 #slide 上
  out = out.replace(
    /(<section\b[^>]*\bid=["']slide["'][^>]*)(>)/i,
    (_, open: string, close: string) => {
      let tag = open;
      if (!/data-density=/.test(tag)) {
        tag += ` data-density="${knobs.density}"`;
      }
      if (!/data-emphasis=/.test(tag)) {
        tag += ` data-emphasis="${knobs.emphasis}"`;
      }
      if (!/data-align=/.test(tag)) {
        tag += ` data-align="${knobs.align}"`;
      }
      return `${tag}${close}`;
    }
  );

  const padFactor =
    knobs.density === "airy" ? 1.18 : knobs.density === "dense" ? 0.86 : 1;
  if (padFactor !== 1) {
    out = out.replace(/style="([^"]*)"/gi, (_, css: string) => {
      return `style="${scalePxInCss(css, padFactor)}"`;
    });
  }

  if (knobs.emphasis === "title") {
    out = scaleFontAttrs(out, { minSize: 28, factor: 1.1, maxBump: 10 });
  } else if (knobs.emphasis === "number") {
    out = scaleFontAttrs(out, { minSize: 42, factor: 1.14, maxBump: 16 });
  }
  // image emphasis：几何不动，靠选套 + 生图；标记已写入 data-emphasis

  return out;
}
