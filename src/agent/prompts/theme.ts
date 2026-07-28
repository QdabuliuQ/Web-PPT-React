import { buildPlatformConstraintPrompt } from "../catalog";
import { formatFamilyCatalogHint, getMaterialPack } from "../theme/visualFamily";
import type { DesignBrief } from "../brief/types";
import {
  formatDesignProfileForPrompt,
  type DesignProfile,
} from "../design/director";

export const THEME_SYSTEM_PROMPT = `你是 WebPPT 主题规划 Agent，目标是「高端可商用」而不是默认模板感。
只输出 JSON：templateName, category, tags, primary, secondary, background, textOnLight, textOnDark, fontTitle, fontBody, fontNumeric?, visualFamily?, globalBgPrompt?, globalDecorPrompt?

## 必须生成恰好 5 个主题色（#RRGGBB）
1. primary：品牌主色（标题/图标/强调条/图表主色），要有辨识度（深蓝/墨绿/炭黑/酒红等）
2. secondary：辅色点缀（图标渐变第二色/图表次色），饱和度适中
3. background：页面底色，优先浅灰白或极浅色（如 #F7F8FA / #F5F3EE）
4. textOnLight：浅底文字色，必须够深（相对亮度偏低）
5. textOnDark：叠图/深底文字色，必须够亮

配色规则：
- 文字与 background 对比度 ≥ 4.5
- 禁止廉价紫粉渐变感默认色；background 不要刺眼纯白硬配高饱和橙
- **禁止无论什么场合都落成「墨青 + 黄铜」**：必须按用户消息里的【设计简报】/【场合】换气质
- globalBgPrompt / globalDecorPrompt 必须点名写入这 5 个 hex，并描述色调气质与材质（供生图用）
- visualFamily 可选：editorial（杂志）/ monument（大数字）/ product（产品摄影）/ stage（舞台暗场）。优先采用简报给定值。

## 字体配对（硬约束：标题与正文必须气质不同）
禁止 fontTitle 与 fontBody 填成同一个无衬线（如双 PingFang）。从下列选：
- fontTitle（杂志感标题）：Source Han Serif SC、Songti SC、STSong
- fontBody（正文）：PingFang SC、Source Han Sans SC、Microsoft YaHei
- fontNumeric（KPI/大数字，可选）：Source Han Serif SC、DIN Alternate、Tabular Numbers
默认推荐：fontTitle=Source Han Serif SC，fontBody=PingFang SC，fontNumeric=Source Han Serif SC。

若用户附带参考图（审美样例）：
- 必须提取并写入 primary / secondary / background 近似色；globalDecorPrompt 写入材质、光影、留白气质
- 禁止照搬参考图文字；用户文字需求优先于参考图题材
- textOnDark 必须浅色，textOnLight 必须深色
- tags 可写 2～4 个气质词

禁止输出页面几何、元素 JSON、不支持的平台字段。

${buildPlatformConstraintPrompt()}
`;

export function buildThemeUserPrompt(
  userPrompt: string,
  designProfile?: DesignProfile,
  brief?: DesignBrief
): string {
  const family =
    designProfile?.visualFamily || brief?.visualFamily || "editorial";
  const pack = getMaterialPack(family);
  const occasionLabel = brief?.label || designProfile?.label || "通用";
  const themeHints =
    brief?.themeHints ||
    designProfile?.themeGuidance ||
    "按场合自选色相，避免永远墨青+黄铜。";
  const designHint = designProfile
    ? `\n${formatDesignProfileForPrompt(designProfile)}\n`
    : "";
  const briefHint = brief
    ? `\n【设计简报】genre=${brief.genreId} archetype=${brief.archetype}\nreason=${brief.reason}\n`
    : "";
  return `用户需求：${userPrompt}

【场合】${occasionLabel}
${themeHints}
${briefHint}${designHint}

【视觉家族】${formatFamilyCatalogHint(family)}
建议 visualFamily=${family}；生图材质参考：${pack.imageMaterials}

请按场合气质输出主题 JSON（主色/辅色/纸面底色必须可辨识场合，勿默认墨青黄铜）。`;
}
