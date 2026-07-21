import { getLayout, resolvePageTypeAndLayout } from "../layout";
import type { MetaJson, MetaPage, MetaSlotFill } from "../types";

/**
 * 编译前规范化：补齐 pageType/layoutKey，并按骨架补齐 elementId/role。
 */
export function normalizeMetaPages(meta: MetaJson): MetaJson {
  const pages = meta.pages.map((page) => normalizeMetaPage(page));
  return { ...meta, pages };
}

export function normalizeMetaPage(page: MetaPage): MetaPage {
  const { pageType, layoutKey } = resolvePageTypeAndLayout({
    pageType: page.pageType,
    layoutKey: page.layoutKey,
  });
  const layout = getLayout(layoutKey);
  const byId = new Map(
    (page.slots || [])
      .filter((s) => s && typeof s.elementId === "string")
      .map((s) => [s.elementId, s])
  );

  const slots: MetaSlotFill[] = layout.slots.map((sk) => {
    const prev = byId.get(sk.elementId);
    const roleRaw = prev?.role || sk.role;
    const role =
      typeof roleRaw === "string" && roleRaw.includes("/")
        ? roleRaw.split("/").pop() || sk.role
        : typeof roleRaw === "string" && roleRaw
          ? roleRaw
          : sk.role;

    return {
      role,
      elementId: sk.elementId,
      content: prev?.content,
      tableData: prev?.tableData,
      chartSeries: prev?.chartSeries,
      chartType: prev?.chartType,
      assetKey: prev?.assetKey,
      imagePrompt: prev?.imagePrompt,
      iconName: prev?.iconName,
      shapeType: prev?.shapeType,
    };
  });

  return { ...page, pageType, layoutKey, slots };
}

/** 本地缩短超长文案（不调 LLM） */
export function truncatePageContents(page: MetaPage, ratio = 0.8): MetaPage {
  const layout = getLayout(page.layoutKey);
  const maxById = new Map(
    layout.slots.map((s) => [s.elementId, s.maxChars] as const)
  );
  return {
    ...page,
    slots: page.slots.map((s) => {
      const max = maxById.get(s.elementId);
      if (!s.content || !max || s.content.length <= max) return s;
      const keep = Math.max(1, Math.floor(max * ratio));
      return { ...s, content: s.content.slice(0, keep) + (keep < s.content.length ? "…" : "") };
    }),
  };
}
