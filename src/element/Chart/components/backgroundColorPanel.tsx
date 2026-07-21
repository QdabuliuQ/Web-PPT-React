import { PanelLargeButton } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { BackgroundColor } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { ColorPicker } from "antd";
import { memo, useEffect, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { IChartProps } from "../index";
import styles from "./panel.module.less";

const SECTION_KEY = "backgroundColor";

export const BackgroundColorPanel: FC = memo(() => {
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

  const backgroundColor = chartInfo?.option?.backgroundColor || "rgba(0,0,0,0)";
  const [localColor, setLocalColor] = useState<string>(
    typeof backgroundColor === "string" ? backgroundColor : "rgba(0,0,0,0)"
  );

  const title = t("chartConfig.backgroundColor.title");

  useEffect(() => {
    const storeColor =
      typeof backgroundColor === "string" ? backgroundColor : "rgba(0,0,0,0)";
    setLocalColor(storeColor);
  }, [backgroundColor]);

  const handleBackgroundColorChange = useMemoizedFn((color: string) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      backgroundColor: color,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  const handleColorPickerChangeDebounced = useDebounceFn(
    (color: any) => {
      const colorObj = color.toRgb();
      const colorValue =
        colorObj.a !== 1
          ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
          : color.toHexString();

      handleBackgroundColorChange(colorValue);
    },
    { wait: 300 }
  );

  const handleColorPickerChange = useMemoizedFn((color: any) => {
    const colorObj = color.toRgb();
    const colorValue =
      colorObj.a !== 1
        ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        : color.toHexString();

    setLocalColor(colorValue);
    handleColorPickerChangeDebounced.run(color);
  });

  if (!pageId || !elementId || !chartInfo) return null;

  const content = (
    <div className={styles.inspectorForm}>
      <div className="flex flex-col gap-3">
        <label className={styles.inspectorFormLabel}>
          {t("chartConfig.backgroundColor.title")}
        </label>
        <ColorPicker
          value={localColor}
          trigger="click"
          onChange={handleColorPickerChange}
          showText={(color) => (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-chrome-text flex-1 truncate">
                {color.toHexString()}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full">
        <PanelLargeButton
          title={title}
          icon={
            <BackgroundColor
              theme="outline"
              size="18"
              fill="var(--icon-color)"
            />
          }
          active={isActive}
          onClick={() => toggleSection(SECTION_KEY, title)}
        />
      </div>
      {isActive && contentEl ? createPortal(content, contentEl) : null}
    </>
  );
});
