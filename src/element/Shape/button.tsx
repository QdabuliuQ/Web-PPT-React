import { PanelButton } from "@/components/PanelButton";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { GraphicDesign } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { memo, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateShape } from ".";
import { ShapeSvg, SHAPE_TYPES, type ShapeType } from "./shapes";
import styles from "./button.module.less";

export default function ShapeButton() {
  const { t } = useTranslation();
  const pageId = usePageActiveStore((state) => state.pageActive) || "";
  const addElement = usePPTStore((state) => state.addElement);
  const setElementActive = useElementActiveStore(
    (state) => state.setElementActive
  );
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  });

  const handleClose = useMemoizedFn(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  });

  const handleCreateShape = useMemoizedFn((shapeType: ShapeType) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const option = CreateShape({
      shapeType,
      borderRadius: shapeType === "roundedRect" ? 14 : 0,
    });
    const ok = addElement(pageId, option);
    if (ok && pageId) {
      setElementActive(option.id);
    }
    setOpen(false);
  });

  const content = useMemo(
    () => (
      <div
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className={styles.picker}
      >
        <div className={styles.grid}>
          {SHAPE_TYPES.map((shapeType) => (
            <button
              key={shapeType}
              type="button"
              className={styles.item}
              title={t(`elements.shape.types.${shapeType}`)}
              onClick={() => handleCreateShape(shapeType)}
            >
              <div className={styles.preview}>
                <ShapeSvg shapeType={shapeType} fill="var(--icon-color)" />
              </div>
              <span className={styles.label}>
                {t(`elements.shape.types.${shapeType}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    ),
    [handleOpen, handleClose, handleCreateShape, t]
  );

  return (
    <Popover
      open={open}
      placement="bottom"
      content={content}
      trigger={[]}
      styles={{
        body: {
          background: "var(--panel-bg-solid)",
          boxShadow: "var(--panel-shadow)",
        },
      }}
    >
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <PanelButton
          active={open}
          icon={
            <GraphicDesign theme="outline" size="24" fill="currentColor" />
          }
          title={t("elements.shape.button")}
        />
      </div>
    </Popover>
  );
}

export const ShapeButtonComponent = memo(ShapeButton);
