import { z } from "zod";
import {
  CHART_TYPES,
  ICON_NAME_WHITELIST,
  ICON_THEMES,
  PLACEMENT_KEYS,
  PLATFORM_LIMITS,
  SHAPE_TYPES,
} from "./catalog/platform";

const PAGE_MIN = PLATFORM_LIMITS.agentPages.min;
const PAGE_MAX = PLATFORM_LIMITS.agentPages.max;
const HTML_PAGE_MIN = PLATFORM_LIMITS.agentPagesHtml.min;
const HTML_PAGE_MAX = PLATFORM_LIMITS.agentPagesHtml.max;

export const VisualFamilySchema = z.enum([
  "editorial",
  "monument",
  "product",
  "stage",
]);

export const ThemeMaterialSchema = z.object({
  surface: z.string().min(1),
  light: z.string().min(1),
  coverScrim: z.number().min(0).max(1),
  imageMaterials: z.string().min(1),
  coverImageHint: z.string().min(1),
});

export const ThemeTokenSchema = z.object({
  templateName: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  primary: z.string().min(1),
  secondary: z.string().min(1),
  background: z.string().min(1),
  textOnLight: z.string().min(1),
  textOnDark: z.string().min(1),
  fontTitle: z.string().min(1),
  fontBody: z.string().min(1),
  fontNumeric: z.string().min(1).optional(),
  globalBgPrompt: z.string().optional(),
  globalDecorPrompt: z.string().optional(),
  visualFamily: VisualFamilySchema.optional(),
  material: ThemeMaterialSchema.optional(),
});

export const LayoutKnobsSchema = z.object({
  density: z.enum(["airy", "normal", "dense"]).optional(),
  emphasis: z.enum(["title", "image", "number"]).optional(),
  align: z.enum(["left", "split", "center"]).optional(),
});

export const LayoutKeySchema = z.enum([
  "cover",
  "cover-center",
  "cover-left",
  "cover-right",
  "toc",
  "toc-cards",
  "two-column",
  "image-text",
  "three-points",
  "pillars-icons",
  "kpi",
  "kpi-row",
  "quote",
  "quote-center",
  "chart",
  "chart-wide",
  "table",
  "compare-split",
  "team-cards",
  "team-list",
  "timeline",
  "ending",
  "ending-center",
]);

export const PageTypeSchema = z.enum([
  "hero",
  "agenda",
  "problem",
  "solution",
  "pillars",
  "metrics",
  "evidence",
  "compare",
  "breath",
  "team",
  "timeline",
  "close",
]);

export const DesignArchetypeSchema = z.enum([
  "consulting",
  "productLaunch",
  "dataMonument",
  "editorialStory",
  "opsDashboard",
  "stageGala",
  "personalReview",
]);

export const DeckGenreIdSchema = z.enum([
  "corp-gala",
  "personal-review",
  "pitch",
  "brand",
  "consumer",
  "general",
]);

export const PlacementSchema = z.enum(PLACEMENT_KEYS);
export const ChartTypeSchema = z.enum(CHART_TYPES);
export const ShapeTypeSchema = z.enum(SHAPE_TYPES);
export const IconThemeSchema = z.enum(ICON_THEMES);
export const IconNameSchema = z.enum(ICON_NAME_WHITELIST);

const TABLE_MAX_COLS = PLATFORM_LIMITS.tableMaxGrid.cols;
const TABLE_MAX_ROWS = PLATFORM_LIMITS.tableMaxGrid.rows;

/** 表格中间态：仅值，样式由 Compile/ThemeMapper 注入 */
export const TableDataFillSchema = z
  .object({
    headers: z.array(z.string().min(1)).min(1).max(TABLE_MAX_COLS),
    rows: z
      .array(z.array(z.union([z.string(), z.number()])).min(1).max(TABLE_MAX_COLS))
      .min(1)
      .max(TABLE_MAX_ROWS - 1),
  })
  .superRefine((data, ctx) => {
    const cols = data.headers.length;
    const totalRows = 1 + data.rows.length;
    if (totalRows > TABLE_MAX_ROWS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `表格总行数（含表头）不可超过 ${TABLE_MAX_ROWS}`,
      });
    }
    for (let i = 0; i < data.rows.length; i++) {
      if (data.rows[i].length !== cols) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `第 ${i + 1} 行列数须与 headers（${cols}）一致`,
          path: ["rows", i],
        });
      }
    }
  });

export const MetaSlotFillSchema = z.object({
  role: z.string(),
  elementId: z.string(),
  content: z.string().optional(),
  tableData: TableDataFillSchema.optional(),
  chartSeries: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .optional(),
  chartType: ChartTypeSchema.optional(),
  assetKey: z.string().optional(),
  imagePrompt: z.string().optional(),
  iconName: z.string().optional(),
  shapeType: ShapeTypeSchema.optional(),
});

export const MetaPageSchema = z.object({
  pageId: z.string(),
  pageType: PageTypeSchema,
  layoutKey: LayoutKeySchema,
  slots: z.array(MetaSlotFillSchema),
});

export const DrawTaskSchema = z.object({
  assetKey: z.string(),
  prompt: z.string(),
  scope: z.enum(["global", "page"]),
  pageId: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  aspectRatio: z.string().optional(),
  imageKind: z.string().optional(),
  elementId: z.string().optional(),
});

export const MetaJsonSchema = z.object({
  version: z.literal("1.0"),
  theme: ThemeTokenSchema,
  pages: z.array(MetaPageSchema).min(PAGE_MIN).max(PAGE_MAX),
  drawTasks: z.array(DrawTaskSchema),
});

export const HtmlSlidePageSchema = z.object({
  pageId: z.string().min(1),
  pageType: PageTypeSchema,
  html: z.string().min(20),
  templateId: z.string().optional(),
  slots: z.record(z.string(), z.unknown()).optional(),
});

/** LLM 输出：选套 + 槽位（不再直接写 HTML） */
export const HtmlTemplatePageLlmSchema = z.object({
  pageId: z.string().min(1),
  pageType: PageTypeSchema,
  templateId: z.string().optional(),
  slots: z.record(z.string(), z.unknown()),
});

export const HtmlTemplateDeckLlmSchema = z.object({
  name: z.string().min(1).max(120),
  pages: z
    .array(HtmlTemplatePageLlmSchema)
    .min(HTML_PAGE_MIN)
    .max(HTML_PAGE_MAX),
});

/** @deprecated 自由 HTML 路径；现用 HtmlTemplateDeckLlmSchema */
export const HtmlDeckLlmSchema = HtmlTemplateDeckLlmSchema;

export const HtmlDeckSchema = z.object({
  version: z.literal("html-1.0"),
  name: z.string(),
  theme: ThemeTokenSchema,
  pages: z.array(HtmlSlidePageSchema).min(HTML_PAGE_MIN).max(HTML_PAGE_MAX),
  drawTasks: z.array(DrawTaskSchema),
});

export const HtmlTemplateRepairLlmSchema = z.object({
  pageId: z.string().min(1),
  pageType: PageTypeSchema.optional(),
  templateId: z.string().optional(),
  slots: z.record(z.string(), z.unknown()),
});

export const AssetMapEntrySchema = z.object({
  url: z.string().min(1),
  localPath: z.string().optional(),
  remoteUrl: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const AssetMapSchema = z.record(z.string(), AssetMapEntrySchema);

export const ContentAgentLlmSchema = z.object({
  pages: z
    .array(
      z.object({
        pageType: PageTypeSchema,
        layoutKey: LayoutKeySchema.optional(),
        slots: z.array(
          z.object({
            elementId: z.string(),
            role: z.string(),
            content: z.string().optional(),
            tableData: TableDataFillSchema.optional(),
            chartSeries: z
              .array(z.object({ label: z.string(), value: z.number() }))
              .optional(),
            chartType: ChartTypeSchema.optional(),
            imagePrompt: z.string().optional(),
            iconName: z.string().optional(),
            shapeType: ShapeTypeSchema.optional(),
          })
        ),
      })
    )
    .min(PAGE_MIN)
    .max(PAGE_MAX),
});

/** Story IR：内容先于版式（对 LLM 输出做宽松清洗） */
const optionalEnum = <T extends string>(values: readonly T[]) =>
  z.preprocess((v) => {
    if (v == null || v === "") return undefined;
    const s = String(v).trim().toLowerCase();
    return (values as readonly string[]).includes(s) ? s : undefined;
  }, z.enum(values as [T, ...T[]]).optional());

const optionalString = z.preprocess((v) => {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}, z.string().optional());

const requiredStringLoose = z.preprocess((v) => {
  if (v == null) return "";
  return String(v).trim();
}, z.string());

export const StoryPageDraftSchema = z.object({
  pageId: optionalString,
  pageType: PageTypeSchema,
  claim: requiredStringLoose,
  title: requiredStringLoose,
  subtitle: optionalString,
  body: optionalString,
  bullets: z.array(z.union([z.string(), z.number()]).transform(String)).optional(),
  metrics: z
    .array(
      z.object({
        value: requiredStringLoose,
        label: requiredStringLoose,
      })
    )
    .optional(),
  steps: z
    .array(
      z.object({
        title: requiredStringLoose,
        body: requiredStringLoose,
        iconName: optionalString,
      })
    )
    .optional(),
  pillars: z
    .array(
      z.object({
        title: requiredStringLoose,
        body: requiredStringLoose,
        iconName: optionalString,
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        title: requiredStringLoose,
        body: requiredStringLoose,
        iconName: optionalString,
      })
    )
    .optional(),
  quote: optionalString,
  attribution: optionalString,
  leftTitle: optionalString,
  leftBody: optionalString,
  rightTitle: optionalString,
  rightBody: optionalString,
  members: z
    .array(
      z.object({
        name: requiredStringLoose,
        role: requiredStringLoose,
        blurb: requiredStringLoose,
        imagePrompt: optionalString,
      })
    )
    .optional(),
  timeline: z
    .array(
      z.object({
        label: requiredStringLoose,
        detail: requiredStringLoose,
      })
    )
    .optional(),
  footer: optionalString,
  contact: optionalString,
  caption: optionalString,
  imageIntent: requiredStringLoose,
  density: optionalEnum(["airy", "normal", "dense"] as const),
  emphasis: optionalEnum(["title", "image", "number"] as const),
  align: optionalEnum(["left", "split", "center"] as const),
  composition: optionalEnum(["split", "band", "card", "solid"] as const),
  preferModules: z.preprocess((v) => {
    if (v == null) return undefined;
    if (typeof v === "boolean") return v;
    if (v === "true" || v === 1) return true;
    if (v === "false" || v === 0) return false;
    return undefined;
  }, z.boolean().optional()),
});

export const StoryDeckLlmSchema = z.object({
  name: requiredStringLoose.pipe(z.string().min(1).max(160)),
  angle: requiredStringLoose,
  pages: z
    .array(StoryPageDraftSchema)
    .min(HTML_PAGE_MIN)
    .max(HTML_PAGE_MAX),
});

export const DesignBriefLlmSchema = z.object({
  genreId: DeckGenreIdSchema.default("general"),
  label: requiredStringLoose.pipe(z.string().min(1).max(80)),
  visualFamily: VisualFamilySchema.default("editorial"),
  archetype: DesignArchetypeSchema.default("consulting"),
  narrativeShape: requiredStringLoose,
  pageSequenceHints: z
    .array(PageTypeSchema)
    .min(3)
    .max(HTML_PAGE_MAX),
  themeHints: requiredStringLoose,
  layoutGuidance: requiredStringLoose,
  reason: requiredStringLoose.optional(),
});
