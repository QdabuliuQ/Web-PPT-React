import type { PageType, ThemeToken } from "../types";
import type { DesignProfile } from "../design/director";
import type {
  LayoutAlign,
  LayoutDensity,
  LayoutEmphasis,
} from "../htmlTemplates/layoutKnobs";
import type { SlideComposition } from "../modules/composition";

/** 单页故事稿（内容先于版式） */
export type StoryPageDraft = {
  pageId: string;
  pageType: PageType;
  /** 本页一句话主张（生图与排版都围绕它） */
  claim: string;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  metrics?: Array<{ value: string; label: string }>;
  steps?: Array<{ title: string; body: string; iconName?: string }>;
  pillars?: Array<{ title: string; body: string; iconName?: string }>;
  items?: Array<{ title: string; body: string; iconName?: string }>;
  quote?: string;
  attribution?: string;
  leftTitle?: string;
  leftBody?: string;
  rightTitle?: string;
  rightBody?: string;
  members?: Array<{
    name: string;
    role: string;
    blurb: string;
    imagePrompt?: string;
  }>;
  timeline?: Array<{ label: string; detail: string }>;
  footer?: string;
  contact?: string;
  caption?: string;
  /** 本页配图意图（英文，绑定 claim，禁止套话） */
  imageIntent: string;
  density?: LayoutDensity;
  emphasis?: LayoutEmphasis;
  align?: LayoutAlign;
  /**
   * 双平面构图：split | band | card | solid
   * 省略则由 Layout 按 pageType + runId 挑选；禁止全幅底图裸叠字
   */
  composition?: SlideComposition;
  /** 组装优先；失败再回落整页模板（hero/close/breath 始终强制积木） */
  preferModules?: boolean;
};

export type StoryDeck = {
  version: "story-1.0";
  name: string;
  /** 本场叙事角度 */
  angle: string;
  /** 每次运行唯一，用于生图/选套去同质 */
  runId: string;
  pages: StoryPageDraft[];
  theme?: ThemeToken;
  /** Deck 级设计导演档案，供 Layout 选套/积木策略复用 */
  designProfile?: DesignProfile;
};
