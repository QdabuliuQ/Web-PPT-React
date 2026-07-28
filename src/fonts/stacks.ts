/**
 * 测量 HTML 与编辑器共用的字体栈。
 * 主题里写的「Source Han Serif SC / PingFang SC」在缺字时回退到已加载的 Noto，
 * 保证 Puppeteer 量框与浏览器渲染字宽一致。
 */

export const WEB_FONT_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap";

/** 标题/数字衬线：主题名 + 可加载的 Noto 回退 */
export const FONT_STACK_SERIF =
  '"Source Han Serif SC","Noto Serif SC","Songti SC","STSong",serif';

/** 正文无衬线 */
export const FONT_STACK_SANS =
  '"PingFang SC","Noto Sans SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';

function isSerifFamily(name: string): boolean {
  return /serif|song|songti|stsong|simsun/i.test(name);
}

function alreadyExpanded(raw: string): boolean {
  return /Noto Serif SC|Noto Sans SC/i.test(raw);
}

/** 把主题/data 里的单字体名展开为测量=渲染共用栈 */
export function resolveFontStack(fontFamily?: string | null): string {
  const raw = String(fontFamily || "").trim();
  if (!raw) return FONT_STACK_SANS;
  if (alreadyExpanded(raw)) return raw;

  const primary = raw.split(",")[0]?.replace(/["']/g, "").trim() || "";
  if (!primary) return FONT_STACK_SANS;

  if (isSerifFamily(primary)) {
    // 主名字优先，其后接标准衬线回退（含 Noto Serif SC）
    const rest = FONT_STACK_SERIF.replace(/^"[^"]+",\s*/, "");
    if (/^source han serif sc$/i.test(primary)) {
      return FONT_STACK_SERIF;
    }
    return `"${primary}",${rest}`;
  }

  const rest = FONT_STACK_SANS.replace(/^"[^"]+",\s*/, "");
  if (/^pingfang sc$/i.test(primary)) {
    return FONT_STACK_SANS;
  }
  return `"${primary}",${rest}`;
}

/** 注入到测量页 <head> 的样式（与编辑器 globals 对齐） */
export function buildSharedFontCss(): string {
  return `
@import url('${WEB_FONT_STYLESHEET_HREF}');
:root {
  --webppt-font-serif: ${FONT_STACK_SERIF};
  --webppt-font-sans: ${FONT_STACK_SANS};
}
html, body {
  font-family: var(--webppt-font-sans);
}
`.trim();
}
