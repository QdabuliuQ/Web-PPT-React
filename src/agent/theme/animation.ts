import {
  ANIMATION_DELAYS,
  ANIMATION_DURATIONS,
  ANIMATION_TRIGGERS,
  ELEMENT_ANIMATION_NAMES,
  PAGE_TOGGLE_ANIMATION_NAMES,
  normalizeElementAnimation,
  normalizePageToggleAnimation,
} from "../catalog/platform";
import { isHeroOverlayLayout } from "./mapper";
import type { ElementType, LayoutKey, SlotRole } from "../types";

export type ElementAnimationTokens = {
  animationName: (typeof ELEMENT_ANIMATION_NAMES)[number] | "";
  animationDuration: (typeof ANIMATION_DURATIONS)[number];
  animationDelay: (typeof ANIMATION_DELAYS)[number];
  animationTrigger: (typeof ANIMATION_TRIGGERS)[number];
  animationIndex: number;
};

export type PageToggleAnimationTokens = {
  toggleInAnimation: (typeof PAGE_TOGGLE_ANIMATION_NAMES)[number] | "";
  toggleInDuration: (typeof ANIMATION_DURATIONS)[number];
  toggleInDelay: (typeof ANIMATION_DELAYS)[number];
};

/**
 * 按槽位角色注入进场动画（播放模式：页进场结束后 default 触发）。
 * 不交给 LLM；与 ThemeMapper 同层。
 */
export function mapElementAnimation(opts: {
  role: SlotRole;
  type: ElementType;
  layoutKey: LayoutKey;
  /** 同页已生成的可动画元素序号，用于 animationIndex */
  index: number;
}): ElementAnimationTokens {
  const { role, type, layoutKey, index } = opts;
  const hero = isHeroOverlayLayout(layoutKey);

  // 细强调条不播动画；大块卡片底板可淡入
  if (role === "decor" && type === "shape") {
    // 卡片 vs 强调条在 compile 侧按尺寸区分；此处保守：无动画避免闪烁
    return {
      animationName: "",
      animationDuration: "default",
      animationDelay: "0s",
      animationTrigger: "default",
      animationIndex: index,
    };
  }

  let name: string = "fadeIn";
  let duration: (typeof ANIMATION_DURATIONS)[number] = "fast";

  if (role === "title") {
    name = "fadeInUp";
    duration = "fast";
  } else if (role === "subtitle") {
    name = "fadeInUp";
    duration = "default";
  } else if (role === "body") {
    name = layoutKey === "quote" ? "fadeIn" : "fadeInUp";
    duration = "default";
  } else if (role === "metric") {
    name = "zoomIn";
    duration = "fast";
  } else if (role === "bullet") {
    name = "fadeInLeft";
    duration = "fast";
  } else if (role === "image" || type === "image") {
    name = hero ? "fadeIn" : "zoomIn";
    duration = "default";
  } else if (role === "icon" || type === "icon") {
    name = "zoomIn";
    duration = "faster";
  } else if (type === "shape") {
    name = "fadeIn";
    duration = "faster";
  } else if (role === "chart" || type === "chart") {
    name = "fadeInUp";
    duration = "default";
  } else if (role === "table" || type === "table") {
    name = "fadeInUp";
    duration = "default";
  }

  return {
    animationName: normalizeElementAnimation(name),
    animationDuration: duration,
    animationDelay: "0s",
    animationTrigger: "default",
    animationIndex: index,
  };
}

/** 页面切换进场：轻微淡入，不抢元素动画 */
export function mapPageToggleAnimation(
  layoutKey: LayoutKey
): PageToggleAnimationTokens {
  const hero = isHeroOverlayLayout(layoutKey);
  return {
    toggleInAnimation: normalizePageToggleAnimation("fadeIn"),
    toggleInDuration: hero ? "default" : "fast",
    toggleInDelay: "0s",
  };
}
