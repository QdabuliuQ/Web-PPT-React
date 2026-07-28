import type { DesignArchetypeId } from "../design/director";
import type { DeckGenreId } from "../theme/genre";
import type { VisualFamilyId } from "../theme/visualFamily";
import type { PageType } from "../types";

/**
 * 设计简报：由 BriefAgent（LLM）决策场合/气质/页序。
 * 代码只校验白名单，不靠关键词猜场合。
 */
export type DesignBrief = {
  version: "brief-1.0";
  /** 场合桶（白名单） */
  genreId: DeckGenreId;
  /** 给人看的场合名 */
  label: string;
  visualFamily: VisualFamilyId;
  /** 风格配方键 → DesignProfile 模板库 */
  archetype: DesignArchetypeId;
  /** 叙事主线一句话 */
  narrativeShape: string;
  /** 建议页序 */
  pageSequenceHints: PageType[];
  /** 给 Theme 的配色/材质提示 */
  themeHints: string;
  /** 给 Layout/Story 的版式提示 */
  layoutGuidance: string;
  /** 简短决策理由 */
  reason: string;
};
