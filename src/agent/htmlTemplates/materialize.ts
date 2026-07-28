import type { PageType, ThemeToken } from "../types";
import { renderHtmlTemplate } from "./fill";
import { resolveTemplateForPage } from "./pageTypeMap";
import {
  applyLayoutKnobs,
  splitSlotsAndKnobs,
  type LayoutKnobs,
} from "./layoutKnobs";
import { getMaterialPack } from "../theme/visualFamily";
import type {
  AnyTemplateSlots,
  HtmlTemplateSuiteId,
} from "./types";
import { TEMPLATE_SUITE } from "./pages/registry";

const FALLBACK_BG_PROMPT =
  "Cinematic 16:9 dark editorial background, soft vignette, darker midtones and lower band for light title overlay, atmospheric corporate mood, no readable text, no logos, no watermark";

const DEFAULT_EVIDENCE_IMAGE_PROMPT =
  "Clean editorial photograph of a modern product dashboard on a dual monitor desk, soft daylight, light desk surface matching a pale presentation background, restrained accent UI glow, subject filling the frame, no readable text on screens, no logos, no watermark";

const DEFAULT_AVATAR_IMAGE_PROMPT =
  "Professional head-and-shoulders portrait of a business professional, soft studio lighting, neutral expression, isolated subject on fully transparent background, PNG cutout style, no text, no logos, no watermark";

function defaultBgPrompt(theme: ThemeToken): string {
  const hint =
    theme.material?.coverImageHint ||
    (theme.visualFamily
      ? getMaterialPack(theme.visualFamily).coverImageHint
      : "");
  const mats = theme.material?.imageMaterials || "";
  if (!hint && !mats) return FALLBACK_BG_PROMPT;
  return [hint || FALLBACK_BG_PROMPT, mats, "no readable text, no logos, no watermark"]
    .filter(Boolean)
    .join(", ");
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function normalizeHeroClose(
  slots: Record<string, unknown>,
  pageId: string,
  kind: "hero" | "close",
  theme: ThemeToken
): AnyTemplateSlots {
  const bg = defaultBgPrompt(theme);
  if (kind === "hero") {
    return {
      pageId,
      title: str(slots.title, "演示文稿"),
      subtitle: str(slots.subtitle, "副标题"),
      footer: str(slots.footer, ""),
      bgImageKey: str(slots.bgImageKey, `${pageId}_bg`),
      bgImagePrompt: str(slots.bgImagePrompt, bg),
    };
  }
  return {
    pageId,
    title: str(slots.title, "谢谢"),
    subtitle: str(slots.subtitle, ""),
    contact: str(slots.contact, ""),
    bgImageKey: str(slots.bgImageKey, `${pageId}_bg`),
    bgImagePrompt: str(slots.bgImagePrompt, bg),
  };
}

function normalizeByKind(
  kind: string,
  slots: Record<string, unknown>,
  pageId: string,
  theme: ThemeToken
): AnyTemplateSlots {
  switch (kind) {
    case "hero":
      return normalizeHeroClose(slots, pageId, "hero", theme);
    case "close":
      return normalizeHeroClose(slots, pageId, "close", theme);
    case "metrics": {
      const metrics = Array.isArray(slots.metrics)
        ? slots.metrics.map((m) => {
            const row = asRecord(m);
            return {
              value: str(row.value, "—"),
              label: str(row.label, "指标"),
            };
          })
        : [];
      return {
        pageId,
        title: str(slots.title, "关键成果"),
        metrics,
        footer: str(slots.footer, ""),
      };
    }
    case "pillars": {
      const pillars = Array.isArray(slots.pillars)
        ? slots.pillars.map((p) => {
            const row = asRecord(p);
            return {
              iconName: str(row.iconName, "Lightning"),
              title: str(row.title, "要点"),
              body: str(row.body, ""),
            };
          })
        : [];
      return {
        pageId,
        title: str(slots.title, "核心要点"),
        pillars,
      };
    }
    case "agenda": {
      const items = Array.isArray(slots.items)
        ? slots.items.map((it) => {
            const row = asRecord(it);
            return {
              title: str(row.title, "议程"),
              body: str(row.body, ""),
              iconName: str(row.iconName, "") || undefined,
            };
          })
        : [];
      return { pageId, title: str(slots.title, "议程"), items };
    }
    case "problem": {
      const points = Array.isArray(slots.points)
        ? slots.points.map((p) => str(p))
        : [];
      return {
        pageId,
        title: str(slots.title, "问题"),
        body: str(slots.body, ""),
        points,
      };
    }
    case "solution": {
      const steps = Array.isArray(slots.steps)
        ? slots.steps.map((s) => {
            const row = asRecord(s);
            return {
              title: str(row.title, "步骤"),
              body: str(row.body, ""),
              iconName: str(row.iconName, "") || undefined,
            };
          })
        : [];
      return {
        pageId,
        title: str(slots.title, "方案"),
        steps,
      };
    }
    case "evidence": {
      const bullets = Array.isArray(slots.bullets)
        ? slots.bullets.map((b) => str(b))
        : [];
      return {
        pageId,
        title: str(slots.title, "证据"),
        caption: str(slots.caption, ""),
        bullets,
        imageKey: str(slots.imageKey, `${pageId}_evidence`),
        imagePrompt: str(slots.imagePrompt, DEFAULT_EVIDENCE_IMAGE_PROMPT),
      };
    }
    case "dual":
      return {
        pageId,
        title: str(slots.title, "对比"),
        leftTitle: str(slots.leftTitle, "方案 A"),
        leftBody: str(slots.leftBody, ""),
        rightTitle: str(slots.rightTitle, "方案 B"),
        rightBody: str(slots.rightBody, ""),
      };
    case "breath":
      return {
        pageId,
        quote: str(slots.quote, "金句"),
        attribution: str(slots.attribution, ""),
      };
    case "team": {
      const members = Array.isArray(slots.members)
        ? slots.members.map((m, i) => {
            const row = asRecord(m);
            return {
              name: str(row.name, "成员"),
              role: str(row.role, "角色"),
              blurb: str(row.blurb, ""),
              imageKey: str(row.imageKey, `${pageId}_avatar_${i + 1}`),
              imagePrompt: str(row.imagePrompt, DEFAULT_AVATAR_IMAGE_PROMPT),
            };
          })
        : [];
      return {
        pageId,
        title: str(slots.title, "团队"),
        members,
      };
    }
    case "timeline": {
      const steps = Array.isArray(slots.steps)
        ? slots.steps.map((s) => {
            const row = asRecord(s);
            return {
              label: str(row.label, "阶段"),
              detail: str(row.detail, ""),
            };
          })
        : [];
      return {
        pageId,
        title: str(slots.title, "里程碑"),
        steps,
      };
    }
    case "narrative":
      return {
        pageId,
        title: str(slots.title, "叙事"),
        body: str(slots.body, ""),
        aside: str(slots.aside, ""),
      };
    default:
      return {
        pageId,
        title: str(slots.title, "页面"),
        subtitle: str(slots.subtitle, ""),
        footer: str(slots.footer, ""),
        bgImageKey: `${pageId}_bg`,
        bgImagePrompt: defaultBgPrompt(theme),
      };
  }
}

export type MaterializePageInput = {
  pageId: string;
  pageType: PageType;
  templateId?: string | null;
  slots: unknown;
};

export type MaterializedPage = {
  pageId: string;
  pageType: PageType;
  templateId: HtmlTemplateSuiteId;
  slots: AnyTemplateSlots & Partial<LayoutKnobs>;
  html: string;
};

function defaultKnobsFromTheme(theme: ThemeToken): Partial<LayoutKnobs> {
  if (!theme.visualFamily) return {};
  const pack = getMaterialPack(theme.visualFamily);
  return {
    density: pack.defaultDensity,
    emphasis: pack.defaultEmphasis,
  };
}

/** 槽位 JSON → 规范化 → 填模板 HTML → 微旋钮 */
export function materializeTemplatePage(
  input: MaterializePageInput,
  theme: ThemeToken
): MaterializedPage {
  const templateId = resolveTemplateForPage(
    input.pageType,
    input.templateId
  );
  const kind = TEMPLATE_SUITE[templateId].kind;
  const rawSlots = asRecord(input.slots);
  const { content, knobs } = splitSlotsAndKnobs(
    rawSlots,
    defaultKnobsFromTheme(theme)
  );
  const slots = {
    ...normalizeByKind(kind, content, input.pageId, theme),
    density: knobs.density,
    emphasis: knobs.emphasis,
    align: knobs.align,
  };
  const html = applyLayoutKnobs(
    renderHtmlTemplate(templateId, slots, theme),
    knobs
  );
  return {
    pageId: input.pageId,
    pageType: input.pageType,
    templateId,
    slots,
    html,
  };
}

export function materializeTemplatePages(
  pages: MaterializePageInput[],
  theme: ThemeToken
): MaterializedPage[] {
  return pages.map((p, i) =>
    materializeTemplatePage(
      {
        ...p,
        pageId: p.pageId || `page_${i + 1}`,
      },
      theme
    )
  );
}
