import { PanelLargeButton } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { AddOne, ColorFilter, Delete } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Button, ColorPicker } from "antd";
import { memo, type FC } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { IChartProps } from "../index";
import styles from "./panel.module.less";

const SECTION_KEY = "color";

export const ColorPanel: FC = memo(() => {
  const { t } = useTranslation();

  const activeSection = useChartInspectorStore((state) => state.sectionKey);
  const contentEl = useChartInspectorStore((state) => state.contentEl);
  const toggleSection = useChartInspectorStore((state) => state.toggleSection);
  const isActive = activeSection === SECTION_KEY;

  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const chartInfo = usePPTStore((state) => {
    if (!pageId || !elementId) return null;
    const page = state.pages.find((p) => p.id === pageId);
    const element = page?.elements.find((el) => el.id === elementId);
    return (element as IChartProps) || null;
  });

  const defaultColors = [
    "#5F95FF",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
  ];

  const optionColor = chartInfo?.option?.color;
  const colorArray: string[] = Array.isArray(optionColor)
    ? optionColor.map((c) => (typeof c === "string" ? c : String(c)))
    : defaultColors;

  const title = t("chartConfig.color.title");

  const handleColorChange = useMemoizedFn((colors: string[]) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      color: colors,
    };
    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  const handleColorPickerChange = useDebounceFn(
    (index: number, color: any) => {
      const colorObj = color.toRgb();
      const colorValue =
        colorObj.a !== 1
          ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
          : color.toHexString();

      const newColors = [...colorArray];
      newColors[index] = colorValue;
      handleColorChange(newColors);
    },
    { wait: 300 }
  );

  const handleAddColor = useMemoizedFn(() => {
    handleColorChange([...colorArray, "#5F95FF"]);
  });

  const handleDeleteColor = useMemoizedFn((index: number) => {
    if (colorArray.length <= 1) return;
    handleColorChange(colorArray.filter((_, i) => i !== index));
  });

  if (!pageId || !elementId || !chartInfo) return null;

  const content = (
    <div className={styles.inspectorForm}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--divider)]">
          <span className="text-xs text-chrome-secondary leading-snug">
            {t("chartConfig.color.config")}
            <span className="ml-[4px]">{t("chartConfig.color.cycleTip")}</span>
          </span>
          <Button
            type="primary"
            size="small"
            onClick={handleAddColor}
            icon={<AddOne theme="outline" size="14" fill="currentColor" />}
            className="text-xs h-7 flex items-center gap-1 shrink-0"
          >
            {t("chartConfig.color.add")}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {colorArray.map((color, index) => {
            const colorStr = typeof color === "string" ? color : String(color);
            return (
              <ColorPicker
                key={index}
                value={colorStr}
                trigger="click"
                onChange={(c) => handleColorPickerChange.run(index, c)}
                showText={(c) => (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-chrome-text flex-1 truncate">
                      {c.toHexString()}
                    </span>
                    <Delete
                      theme="outline"
                      size="14"
                      fill="currentColor"
                      className={`cursor-pointer text-chrome-muted hover:text-primary flex-shrink-0 ${
                        colorArray.length <= 1
                          ? "opacity-30 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colorArray.length > 1) {
                          handleDeleteColor(index);
                        }
                      }}
                    />
                  </div>
                )}
              />
            );
          })}
        </div>
        {colorArray.length === 0 && (
          <div className="text-center py-10 px-5 text-chrome-muted text-xs">
            {t("chartConfig.color.noColor")}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full">
        <PanelLargeButton
          title={title}
          icon={
            <ColorFilter theme="outline" size="18" fill="var(--icon-color)" />
          }
          active={isActive}
          onClick={() => toggleSection(SECTION_KEY, title)}
        />
      </div>
      {isActive && contentEl ? createPortal(content, contentEl) : null}
    </>
  );
});
