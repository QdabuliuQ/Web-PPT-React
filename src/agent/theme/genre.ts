import type { ThemeToken } from "../types";
import type { VisualFamilyId } from "./visualFamily";
import { GENRE_TO_FAMILY } from "./visualFamily";

export type DeckGenreId =
  | "corp-gala"
  | "personal-review"
  | "pitch"
  | "brand"
  | "consumer"
  | "general";

export type DeckGenre = {
  id: DeckGenreId;
  label: string;
  /** 默认视觉家族 */
  visualFamily: VisualFamilyId;
  /** Layout 选套 / 叙事提示 */
  layoutGuidance: string;
  /** Theme 配色与材质提示 */
  themeGuidance: string;
  /** mock / 兜底色板 */
  palette: Pick<
    ThemeToken,
    | "primary"
    | "secondary"
    | "background"
    | "textOnLight"
    | "textOnDark"
    | "category"
    | "tags"
  >;
};

/** 根据用户需求推断场合 — 仅 mock / Brief 失败兜底，主路径由 BriefAgent 决策 */
export function detectDeckGenre(userPrompt: string): DeckGenre {
  const p = userPrompt;
  if (/年会|集团|股东|董事会|全员大会|表彰|盛典/.test(p)) {
    return {
      id: "corp-gala",
      label: "集团/年会庆典汇报",
      visualFamily: GENRE_TO_FAMILY["corp-gala"],
      layoutGuidance: `pageType 偏庆典与成果：hero → agenda → metrics → evidence → compare或pillars → team → breath → close。
少用 problem。视觉家族 stage：hero-stage-marquee / hero-slab；metrics-monument / metrics-band；evidence-plaza / evidence-quote；breath-billboard / breath-floor；close-floor。`,
      themeGuidance: `气质：暖金庆典（舞台暗场）。primary 用墨金/酒红/深酒红一类庄重色（如 #3D2B1F / #5C1A1B / #1F2A24），secondary 用暖金/香槟（#C4A574 / #D4AF37），background 暖米纸（#F7F1E8）。材质：丝绸、金属箔、舞台柔光，禁止科技蓝紫霓虹。`,
      palette: {
        category: "年会庆典",
        tags: ["暖金", "庆典", "庄重", "stage"],
        primary: "#3D2B1F",
        secondary: "#C4A574",
        background: "#F7F1E8",
        textOnLight: "#1C1410",
        textOnDark: "#F8F4EC",
      },
    };
  }
  if (/猫粮|狗粮|犬粮|小狗|幼犬|成犬|宠物|宠物食品|主食罐|猫罐|犬罐|罐头|冻干|零食|美妆|护肤|食品|饮料|电商|消费|零售|母婴|潮牌/.test(p)) {
    return {
      id: "consumer",
      label: "消费品牌/产品",
      visualFamily: GENRE_TO_FAMILY.consumer,
      layoutGuidance: `pageType：hero → breath → pillars或metrics → evidence → compare或solution → close。
视觉家族 product：hero-product-showcase / hero-slab / hero-bleed；breath-billboard；pillars-loose；evidence-plaza；metrics-monument。少用冰冷工程竖轨。`,
      themeGuidance: `气质：奶油品牌（产品摄影）。primary 用品牌识别色但避免荧光（暖橙/陶土/雾蓝等），secondary 浅一档同色相，background 奶油纸（#FDF7F2 / #F6F3EE）。材质：纸张、柔光产品摄影、天然质感，禁止电路板/HUD/爪印贴纸堆砌。`,
      palette: {
        category: "消费品牌",
        tags: ["奶油", "产品", "温暖", "product"],
        primary: "#C45C26",
        secondary: "#E8A87C",
        background: "#FDF7F2",
        textOnLight: "#2A211C",
        textOnDark: "#FFFFFF",
      },
    };
  }
  if (/述职|个人总结|绩效考核|工程师|前端|后端|岗位回顾|个人年终/.test(p)) {
    return {
      id: "personal-review",
      label: "个人/工程师述职",
      visualFamily: GENRE_TO_FAMILY["personal-review"],
      layoutGuidance: `pageType：hero → agenda → problem或pillars → solution → metrics → evidence或timeline → breath → close。
视觉家族 editorial：hero-report-spine / hero-slab / hero-bleed；problem-tight / problem-ledger；metrics-corner / metrics-monument；breath-billboard；close-quiet。`,
      themeGuidance: `气质：冷灰工程（杂志编辑克制）。primary 炭青/岩灰（#1F2A33 / #243447），secondary 单一冷强调（雾蓝 #5B8FA8 或岩灰亮阶），background 冷纸灰（#F4F6F8）。材质：混凝土、金属拉丝、清晰信息图，禁止黄铜庆典感与暖金箔。`,
      palette: {
        category: "工程述职",
        tags: ["冷灰", "克制", "工程", "editorial"],
        primary: "#1F2A33",
        secondary: "#5B8FA8",
        background: "#F4F6F8",
        textOnLight: "#152028",
        textOnDark: "#F2F5F7",
      },
    };
  }
  if (/融资|路演|pitch|商业计划|BP/.test(p)) {
    return {
      id: "pitch",
      label: "融资/路演",
      visualFamily: GENRE_TO_FAMILY.pitch,
      layoutGuidance: `pageType：hero → problem → solution → metrics → evidence → compare → breath → close。
视觉家族 monument：hero-data-monument / hero-slab；metrics-monument；compare-duel；breath-billboard。`,
      themeGuidance: `气质：深底高对比路演（纪念碑）。primary 近黑墨（#121820），secondary 鲜明但不荧光（电青/琥珀择一），background 浅冷灰。材质：舞台光、干净产品渲染。`,
      palette: {
        category: "融资路演",
        tags: ["高对比", "路演", "monument"],
        primary: "#121820",
        secondary: "#3D9B8F",
        background: "#F3F5F7",
        textOnLight: "#111827",
        textOnDark: "#F8FAFC",
      },
    };
  }
  if (/发布会|品牌|愿景|slogan|理念/.test(p)) {
    return {
      id: "brand",
      label: "品牌/发布",
      visualFamily: GENRE_TO_FAMILY.brand,
      layoutGuidance: `pageType：hero → breath → pillars → evidence → close。
视觉家族 editorial：hero-report-spine / hero-slab / hero-bleed；breath-billboard；pillars-loose；close-quiet。`,
      themeGuidance: `气质：编辑奢侈。primary 深espresso或墨绿，secondary 鼠尾草/香槟，background 暖奶油。材质：印刷纸张、柔焦摄影。`,
      palette: {
        category: "品牌发布",
        tags: ["编辑", "留白", "editorial"],
        primary: "#2C241B",
        secondary: "#A89F91",
        background: "#F8F5F0",
        textOnLight: "#1A1612",
        textOnDark: "#F7F3EC",
      },
    };
  }
  return {
    id: "general",
    label: "通用商务简报",
    visualFamily: GENRE_TO_FAMILY.general,
    layoutGuidance: `按主题自选 pageType；必须含至少一页呼吸页（breath / metrics-monument / evidence-plaza）。视觉家族默认 editorial，禁止默认同质栈。`,
    themeGuidance: `按行业自选色相，避免永远墨青+黄铜。background 浅纸色，secondary 克制。`,
    palette: {
      category: "商务",
      tags: ["专业", "editorial"],
      primary: "#1B3A4B",
      secondary: "#8A9BA8",
      background: "#F7F8FA",
      textOnLight: "#1A1A1A",
      textOnDark: "#F5F5F5",
    },
  };
}
