import { buildPlatformConstraintPrompt } from "../catalog";
import {
  buildPageTypeConstraintPrompt,
  PAGE_TYPE_META,
} from "../layout/pageTypes";
import type { LayoutSkeleton } from "../types";

export function buildContentSystemPrompt(layouts: LayoutSkeleton[]): string {
  const layoutDesc = layouts
    .map((l) => {
      const pts = (l.pageTypes || [])
        .map((pt) => PAGE_TYPE_META[pt]?.label || pt)
        .join("/");
      const slots = l.slots
        .map(
          (s) =>
            `- ${s.elementId} (${s.type}/${s.role})${s.maxChars ? ` maxChars=${s.maxChars}` : ""}${s.hint ? ` // ${s.hint}` : ""}`
        )
        .join("\n");
      return `### ${l.layoutKey} ${l.name}${pts ? ` 〔pageType: ${pts}〕` : ""}\n${slots}`;
    })
    .join("\n\n");

  return `你是 WebPPT 文稿 Agent，产出「信息密度充足、像顾问做的路演稿」，禁止空泛模板腔与干巴巴一两句。
${buildPlatformConstraintPrompt()}

## 页面类型 → 骨架（必须遵守）
先为每页选定 pageType，再在该类型白名单内选 layoutKey（可省略 layoutKey，系统用默认骨架）。
${buildPageTypeConstraintPrompt()}

输出 JSON（中间态，不是 Document）：
{ "pages": [ { "pageType", "layoutKey?", "slots": [ { "elementId", "role", "content?", "imagePrompt?", "chartSeries?", "chartType?", "tableData?", "iconName?", "shapeType?" } ] } ] }

硬性：
- 页数恰好 6～10（含 hero 封面与 close 封底）
- 每页必须有 pageType；layoutKey 若填写必须属于该 pageType 白名单
- 叙事节奏：hero → agenda → problem/solution → pillars/metrics/evidence → team/timeline/breath → close
- 禁止连续两页相同 pageType（agenda/close 除外）
- 密疏交替：论证页 ↔ 并列/指标 ↔ 数据 ↔ 团队/时间线/留白
- 每个 image 槽必须给 imagePrompt；icon 给白名单 iconName；chart 给 chartSeries+chartType；table 给 tableData；metric 给短数字
- shape/decor 给 shapeType（强调条 rect；卡片底板 roundedRect；时间节点 oval；引用装饰 diamond）
- decor 不要写 content
- content 尽量用满 maxChars 的 70%～95%（metric 除外）；禁止半句停
- team：三人姓名职位 + 履历亮点 + 肖像 Prompt
- timeline：四个年份/季度 + 事件
- 禁止输出 animation* / toggleIn*

文案质量：
- 标题要具体（禁「商业计划书」「公司介绍」「核心优势」「未来展望」）
- 正文含数字/场景/动作/对比；目录结果导向；三要点问题→方案→结果

插图 Prompt：
- 必须有业务语义；禁抽象纹理装饰
- 必须服从主题五色（primary/secondary/background/textOnLight/textOnDark）
- imagePrompt 里必须显式写出这 5 个 #RRGGBB，并说明主色/辅色如何定调画面
- hero/close 全幅叠字图偏暗中调留暗区；cover-left/cover-right 半幅侧图干净浅亮；内页图干净浅亮
- 禁止改槽位几何

可用骨架：
${layoutDesc}`;
}
