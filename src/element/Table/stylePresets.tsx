import { PanelLargeButton } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { Theme } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { ITableProps } from ".";
import styles from "./stylePresets.module.less";

const SECTION_KEY = "table-style";
const PREVIEW_ROWS = 4;
const PREVIEW_COLS = 4;

export type TableRowPattern = "odd" | "even";

export interface TableStylePreset {
  id: string;
  pattern: TableRowPattern;
  accentBg: string;
  accentColor: string;
  normalBg: string;
  normalColor: string;
}

/** 单数行 / 双数行交替配色预设 */
export const TABLE_STYLE_PRESETS: TableStylePreset[] = [
  // —— 单数行着色 ——
  {
    id: "odd-black",
    pattern: "odd",
    accentBg: "#1f1f1f",
    accentColor: "#ffffff",
    normalBg: "#ffffff",
    normalColor: "#1f1f1f",
  },
  {
    id: "odd-slate",
    pattern: "odd",
    accentBg: "#334155",
    accentColor: "#ffffff",
    normalBg: "#f8fafc",
    normalColor: "#0f172a",
  },
  {
    id: "odd-blue",
    pattern: "odd",
    accentBg: "#1d4ed8",
    accentColor: "#ffffff",
    normalBg: "#eff6ff",
    normalColor: "#1e3a8a",
  },
  {
    id: "odd-teal",
    pattern: "odd",
    accentBg: "#0f766e",
    accentColor: "#ffffff",
    normalBg: "#f0fdfa",
    normalColor: "#134e4a",
  },
  {
    id: "odd-green",
    pattern: "odd",
    accentBg: "#15803d",
    accentColor: "#ffffff",
    normalBg: "#f0fdf4",
    normalColor: "#14532d",
  },
  {
    id: "odd-amber",
    pattern: "odd",
    accentBg: "#b45309",
    accentColor: "#ffffff",
    normalBg: "#fffbeb",
    normalColor: "#78350f",
  },
  {
    id: "odd-rose",
    pattern: "odd",
    accentBg: "#be123c",
    accentColor: "#ffffff",
    normalBg: "#fff1f2",
    normalColor: "#881337",
  },
  {
    id: "odd-violet",
    pattern: "odd",
    accentBg: "#6d28d9",
    accentColor: "#ffffff",
    normalBg: "#f5f3ff",
    normalColor: "#4c1d95",
  },
  // —— 双数行着色 ——
  {
    id: "even-black",
    pattern: "even",
    accentBg: "#1f1f1f",
    accentColor: "#ffffff",
    normalBg: "#ffffff",
    normalColor: "#1f1f1f",
  },
  {
    id: "even-slate",
    pattern: "even",
    accentBg: "#334155",
    accentColor: "#ffffff",
    normalBg: "#f8fafc",
    normalColor: "#0f172a",
  },
  {
    id: "even-blue",
    pattern: "even",
    accentBg: "#1d4ed8",
    accentColor: "#ffffff",
    normalBg: "#eff6ff",
    normalColor: "#1e3a8a",
  },
  {
    id: "even-teal",
    pattern: "even",
    accentBg: "#0f766e",
    accentColor: "#ffffff",
    normalBg: "#f0fdfa",
    normalColor: "#134e4a",
  },
  {
    id: "even-green",
    pattern: "even",
    accentBg: "#15803d",
    accentColor: "#ffffff",
    normalBg: "#f0fdf4",
    normalColor: "#14532d",
  },
  {
    id: "even-amber",
    pattern: "even",
    accentBg: "#b45309",
    accentColor: "#ffffff",
    normalBg: "#fffbeb",
    normalColor: "#78350f",
  },
  {
    id: "even-rose",
    pattern: "even",
    accentBg: "#be123c",
    accentColor: "#ffffff",
    normalBg: "#fff1f2",
    normalColor: "#881337",
  },
  {
    id: "even-violet",
    pattern: "even",
    accentBg: "#6d28d9",
    accentColor: "#ffffff",
    normalBg: "#f5f3ff",
    normalColor: "#4c1d95",
  },
];

function isAccentRow(rowIndex: number, pattern: TableRowPattern): boolean {
  return pattern === "odd" ? rowIndex % 2 === 0 : rowIndex % 2 === 1;
}

export function applyTableStylePreset(
  dataSource: ITableProps["dataSource"],
  preset: TableStylePreset
): ITableProps["dataSource"] {
  return dataSource.map((row, rowIndex) => {
    const accent = isAccentRow(rowIndex, preset.pattern);
    return row.map((cell) => ({
      ...cell,
      backgroundColor: accent ? preset.accentBg : preset.normalBg,
      color: accent ? preset.accentColor : preset.normalColor,
    }));
  });
}

const PREVIEW_LABELS = ["Aa", "Bb", "Cc", "Dd"];

const TableStylePreview: FC<{ preset: TableStylePreset }> = ({ preset }) => {
  const cells = useMemo(() => {
    return Array.from({ length: PREVIEW_ROWS }, (_, rowIndex) => {
      const accent = isAccentRow(rowIndex, preset.pattern);
      return Array.from({ length: PREVIEW_COLS }, (_, colIndex) => ({
        key: `${rowIndex}-${colIndex}`,
        label: PREVIEW_LABELS[colIndex] ?? "Aa",
        backgroundColor: accent ? preset.accentBg : preset.normalBg,
        color: accent ? preset.accentColor : preset.normalColor,
      }));
    });
  }, [preset]);

  return (
    <div className={styles.preview} aria-hidden>
      {cells.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.previewRow}>
          {row.map((cell) => (
            <div
              key={cell.key}
              className={styles.previewCell}
              style={{
                backgroundColor: cell.backgroundColor,
                color: cell.color,
              }}
            >
              {cell.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const TableStylePanel: FC = memo(() => {
  const { t } = useTranslation();
  const activeSection = useChartInspectorStore((state) => state.sectionKey);
  const contentEl = useChartInspectorStore((state) => state.contentEl);
  const toggleSection = useChartInspectorStore((state) => state.toggleSection);
  const isActive = activeSection === SECTION_KEY;

  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const tableInfo = usePPTStore((state) => {
    if (!pageId || !elementId) return null;
    const page = state.pages.find((p) => p.id === pageId);
    const element = page?.elements.find((el) => el.id === elementId);
    if (element && element.type === "table") {
      return element as ITableProps;
    }
    return null;
  });

  const title = t("tablePanel.style");
  const oddPresets = useMemo(
    () => TABLE_STYLE_PRESETS.filter((p) => p.pattern === "odd"),
    []
  );
  const evenPresets = useMemo(
    () => TABLE_STYLE_PRESETS.filter((p) => p.pattern === "even"),
    []
  );

  const handleApply = useMemoizedFn((preset: TableStylePreset) => {
    if (!pageId || !elementId) return;
    const latestPages = usePPTStore.getState().pages;
    const latestPage = latestPages.find((p) => p.id === pageId);
    const latestElement = latestPage?.elements.find(
      (el) => el.id === elementId
    ) as ITableProps | undefined;
    if (!latestElement || latestElement.type !== "table") return;

    setElementInfo(pageId, elementId, {
      ...latestElement,
      dataSource: applyTableStylePreset(latestElement.dataSource, preset),
    } as ITableProps);
  });

  if (!pageId || !elementId || !tableInfo) return null;

  const content = (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {t("tablePanel.styleOddRows")}
        </h4>
        <div className={styles.grid}>
          {oddPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.presetBtn}
              title={t("tablePanel.applyStyle")}
              onClick={() => handleApply(preset)}
            >
              <TableStylePreview preset={preset} />
            </button>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {t("tablePanel.styleEvenRows")}
        </h4>
        <div className={styles.grid}>
          {evenPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.presetBtn}
              title={t("tablePanel.applyStyle")}
              onClick={() => handleApply(preset)}
            >
              <TableStylePreview preset={preset} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <>
      <div className="h-full">
        <PanelLargeButton
          title={title}
          icon={<Theme theme="outline" size="18" fill="var(--icon-color)" />}
          active={isActive}
          onClick={() => toggleSection(SECTION_KEY, title)}
        />
      </div>
      {isActive && contentEl ? createPortal(content, contentEl) : null}
    </>
  );
});
