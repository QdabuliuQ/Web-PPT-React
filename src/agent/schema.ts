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
  globalBgPrompt: z.string().optional(),
  globalDecorPrompt: z.string().optional(),
});

export const LayoutKeySchema = z.enum([
  "cover",
  "cover-center",
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
