import type { PageType } from "../types";
import type { StoryPageDraft } from "./types";

/** Story 页稿 → 现有整页模板 slots（A 回落路径） */
export function storyPageToSlots(
  page: StoryPageDraft,
  runId: string
): Record<string, unknown> {
  const pageId = page.pageId;
  const intent = diversifyImageIntent(page.imageIntent, page.claim, runId, pageId);
  const knobs = {
    density: page.density || "normal",
    emphasis: page.emphasis || defaultEmphasis(page.pageType),
    align: page.align || "left",
  };

  switch (page.pageType) {
    case "hero":
      return {
        ...knobs,
        title: page.title,
        subtitle: page.subtitle || page.claim,
        footer: page.footer || "",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt: intent,
      };
    case "close":
      return {
        ...knobs,
        title: page.title,
        subtitle: page.subtitle || page.claim,
        contact: page.contact || page.footer || "",
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt: intent,
      };
    case "metrics":
      return {
        ...knobs,
        title: page.title,
        metrics: padMetrics(page.metrics),
        footer: page.footer || page.claim,
      };
    case "pillars":
      return {
        ...knobs,
        title: page.title,
        pillars: padPillars(page.pillars),
      };
    case "agenda":
      return {
        ...knobs,
        title: page.title,
        items: padItems(page.items || page.steps),
      };
    case "problem":
      return {
        ...knobs,
        title: page.title,
        body: page.body || page.claim,
        points: page.bullets?.slice(0, 3) || [page.claim, "", ""].filter(Boolean),
      };
    case "solution":
      return {
        ...knobs,
        title: page.title,
        steps: padItems(page.steps || page.items),
      };
    case "evidence":
      return {
        ...knobs,
        title: page.title,
        caption: compactCaption(page.caption || page.subtitle || page.claim),
        bullets: page.bullets?.slice(0, 3) || [],
        imageKey: `${pageId}_evidence`,
        imagePrompt: intent,
      };
    case "compare":
      return {
        ...knobs,
        title: page.title,
        leftTitle: page.leftTitle || "之前",
        leftBody: page.leftBody || "",
        rightTitle: page.rightTitle || "现在",
        rightBody: page.rightBody || "",
      };
    case "breath":
      return {
        ...knobs,
        density: page.density || "airy",
        quote: page.quote || page.claim,
        attribution: page.attribution || page.title || "",
      };
    case "team":
      return {
        ...knobs,
        title: page.title,
        members: (page.members || []).slice(0, 3).map((m, i) => ({
          ...m,
          imageKey: `${pageId}_avatar_${i + 1}`,
          imagePrompt:
            m.imagePrompt ||
            diversifyImageIntent(
              "professional headshot, transparent background, isolated cutout",
              m.name,
              runId,
              `${pageId}_a${i}`
            ),
        })),
      };
    case "timeline":
      return {
        ...knobs,
        title: page.title,
        steps: padTimeline(page.timeline),
      };
    default:
      return {
        ...knobs,
        title: page.title,
        subtitle: page.subtitle || page.claim,
        body: page.body || "",
      };
  }
}

export function diversifyImageIntent(
  intent: string,
  claim: string,
  runId: string,
  salt: string
): string {
  const base = (intent || "").trim().replace(/[.\s]+$/, "");
  const claimBit = (claim || "").slice(0, 80);
  return [
    base || "editorial photograph, soft light, no text, no logos",
    claimBit ? `visual metaphor for: ${claimBit}` : "",
    `unique variation key=${runId}/${salt}`,
    "no reusable stock cliché of the same prop every time",
    "no readable text, no logos, no watermark",
  ]
    .filter(Boolean)
    .join(". ");
}

function defaultEmphasis(pageType: PageType) {
  if (pageType === "metrics") return "number" as const;
  if (pageType === "evidence" || pageType === "hero") return "image" as const;
  return "title" as const;
}

function compactCaption(text: string): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= 72) return clean;
  return `${clean.slice(0, 70)}…`;
}

function padMetrics(m?: Array<{ value: string; label: string }>) {
  const out = [...(m || [])];
  while (out.length < 3) out.push({ value: "—", label: "指标" });
  return out.slice(0, 3);
}

function padPillars(
  m?: Array<{ title: string; body: string; iconName?: string }>
) {
  const icons = ["Lightning", "Aiming", "CheckOne"];
  const out = [...(m || [])];
  while (out.length < 3) {
    out.push({
      title: "要点",
      body: "",
      iconName: icons[out.length] || "Star",
    });
  }
  return out.slice(0, 3).map((p, i) => ({
    iconName: p.iconName || icons[i] || "Star",
    title: p.title || `要点${i + 1}`,
    body:
      p.body ||
      "明确具体做法、责任边界和验收依据，避免停留在口号。",
  }));
}

function padItems(
  m?: Array<{ title: string; body: string; iconName?: string }>
) {
  const out = [...(m || [])];
  while (out.length < 3) {
    out.push({
      title: `条目${out.length + 1}`,
      body: "写清动作、交付物和验收口径，会后可以直接推进。",
    });
  }
  return out.slice(0, 4).map((it, i) => ({
    ...it,
    title: it.title || `条目${i + 1}`,
    body:
      it.body ||
      "写清动作、交付物和验收口径，会后可以直接推进。",
  }));
}

function padTimeline(m?: Array<{ label: string; detail: string }>) {
  const out = [...(m || [])];
  while (out.length < 4) {
    out.push({
      label: `阶段${out.length + 1}`,
      detail: "标清负责人、交付物和验收节点。",
    });
  }
  return out.slice(0, 4).map((it, i) => ({
    label: it.label || `阶段${i + 1}`,
    detail: it.detail || "标清负责人、交付物和验收节点。",
  }));
}
