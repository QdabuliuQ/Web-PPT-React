import { PanelLargeButton, PanelSplitLine } from "@/components";
import {
  elementActiveStore,
  useDisplayStatusStore,
  usePPTStore,
} from "@/store";
import {
  Clear,
  Column,
  DividingLineOne,
  GridTwo,
  Ruler,
  ViewGridCard,
} from "@icon-park/react";
import { Dropdown, type MenuProps } from "antd";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";

const ViewComponent: FC = () => {
  const { t } = useTranslation();
  const displayStatus = useDisplayStatusStore((state) => state.displayStatus);
  const setDisplayStatus = useDisplayStatusStore(
    (state) => state.setDisplayStatus
  );
  const gridType = usePPTStore((state) => state.gridType);
  const gridSize = usePPTStore((state) => state.gridSize);
  const guideLineShow = usePPTStore((state) => state.guideLineShow);
  const horizontalLine = usePPTStore((state) => state.horizontalLine);
  const verticalLine = usePPTStore((state) => state.verticalLine);
  const setGridType = usePPTStore((state) => state.setGridType);
  const setGridSize = usePPTStore((state) => state.setGridSize);
  const setGuideLineShow = usePPTStore((state) => state.setGuideLineShow);
  const setHorizontalLine = usePPTStore((state) => state.setHorizontalLine);
  const setVerticalLine = usePPTStore((state) => state.setVerticalLine);

  const gridLineMenuItems: MenuProps["items"] = useMemo(
    () => [
      { key: 10, label: "10px × 10px" },
      { key: 20, label: "20px × 20px" },
      { key: 30, label: "30px × 30px" },
      { key: 40, label: "40px × 40px" },
    ],
    []
  );

  return (
    <div className="h-[53px] flex items-center gap-[10px]">
      <PanelLargeButton
        onClick={() => {
          setDisplayStatus("default");
        }}
        active={displayStatus === "default"}
        icon={<Column theme="outline" size="18" fill="var(--icon-color)" />}
        title={t("viewPanel.normalView")}
      />
      <PanelLargeButton
        onClick={() => {
          elementActiveStore.resetElementActive();
          setDisplayStatus("grid");
        }}
        active={displayStatus === "grid"}
        icon={<ViewGridCard theme="outline" size="18" fill="var(--icon-color)" />}
        title={t("viewPanel.slidePreview")}
      />
      <PanelSplitLine />
      <Dropdown
        trigger={["hover"]}
        menu={{
          items: gridLineMenuItems,
          selectable: gridType === "grid",
          selectedKeys: gridType === "grid" ? [String(gridSize)] : [],
          onClick: ({ key }) => {
            const size = Number(key);
            if (!Number.isNaN(size)) {
              setGridType("grid");
              setGridSize(size);
            }
          },
        }}
        placement="bottom"
      >
        <div className="h-full">
          <PanelLargeButton
            onClick={() => {
              setGridType(gridType === "grid" ? "none" : "grid");
            }}
            active={gridType === "grid"}
            icon={<GridTwo theme="outline" size="18" fill="var(--icon-color)" />}
            title={t("viewPanel.gridLines")}
          />
        </div>
      </Dropdown>
      <PanelLargeButton
        onClick={() => {
          setGridType(gridType === "line" ? "none" : "line");
        }}
        active={gridType === "line"}
        icon={<Ruler theme="outline" size="18" fill="var(--icon-color)" />}
        title={t("viewPanel.ruler")}
      />
      <PanelLargeButton
        onClick={() => {
          setGuideLineShow(!guideLineShow);
        }}
        active={guideLineShow}
        disabled={gridType !== "line"}
        icon={<DividingLineOne theme="outline" size="18" fill="var(--icon-color)" />}
        title={t("viewPanel.guides")}
      />
      <PanelLargeButton
        onClick={() => {
          setHorizontalLine([]);
          setVerticalLine([]);
        }}

        disabled={
          gridType !== "line" ||
          (horizontalLine.length === 0 && verticalLine.length === 0)
        }
        icon={<Clear theme="outline" size="18" fill="var(--icon-color)" />}
        title={t("viewPanel.clearGuides")}
      />
    </div>
  );
};

export const View: FC = ViewComponent;
