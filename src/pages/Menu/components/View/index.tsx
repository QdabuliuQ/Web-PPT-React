import { PanelLargeButton, PanelSplitLine } from "@/components";
import { displayStatusStore, elementActiveStore, pptStore } from "@/store";
import { Column, GridTwo, Ruler, ViewGridCard } from "@icon-park/react";
import { Dropdown, type MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";

const ViewComponent: FC = () => {
  const displayStatus = displayStatusStore.getDisplayStatus();
  const gridType = pptStore.getGridType();
  const gridSize = pptStore.getGridSize();

  const gridLineMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: 10,
        label: "10px × 10px",
      },
      {
        key: 20,
        label: "20px × 20px",
      },
      {
        key: 30,
        label: "30px × 30px",
      },
      {
        key: 40,
        label: "40px × 40px",
      },
    ],
    []
  );

  return (
    <div className="h-[53px] flex items-center gap-[10px]">
      <PanelLargeButton
        onClick={() => {
          displayStatusStore.setDisplayStatus("default", false);
        }}
        active={displayStatus === "default"}
        aspectRatio={false}
        icon={<Column theme="outline" size="18" fill="#333" />}
        title="普通视图"
      />
      <PanelLargeButton
        onClick={() => {
          elementActiveStore.resetElementActive();
          displayStatusStore.setDisplayStatus("grid", false);
        }}
        active={displayStatus === "grid"}
        aspectRatio={false}
        icon={<ViewGridCard theme="outline" size="18" fill="#333" />}
        title="幻灯片预览"
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
              pptStore.setGridType("grid");
              pptStore.setGridSize(size);
            }
          },
        }}
        placement="bottom"
      >
        <div className="h-full">
          <PanelLargeButton
            onClick={() => {
              pptStore.setGridType(gridType === "grid" ? "none" : "grid");
            }}
            active={gridType === "grid"}
            icon={<GridTwo theme="outline" size="18" fill="#333" />}
            title="网格线"
          />
        </div>
      </Dropdown>
      <PanelLargeButton
        onClick={() => {
          pptStore.setGridType(gridType === "line" ? "none" : "line");
        }}
        active={gridType === "line"}
        icon={<Ruler theme="outline" size="18" fill="#333" />}
        title="标尺"
      />
    </div>
  );
};

export const View: FC = observer(ViewComponent);
