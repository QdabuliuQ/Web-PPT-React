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

const ViewComponent: FC = () => {
  // 使用 Zustand hooks 订阅状态变化
  const displayStatus = useDisplayStatusStore((state) => state.displayStatus);
  const setDisplayStatus = useDisplayStatusStore(
    (state) => state.setDisplayStatus
  );
  const gridType = usePPTStore((state) => state.gridType);
  const gridSize = usePPTStore((state) => state.gridSize);
  const guideLineShow = usePPTStore((state) => state.guideLineShow);
  const setGridType = usePPTStore((state) => state.setGridType);
  const setGridSize = usePPTStore((state) => state.setGridSize);
  const setGuideLineShow = usePPTStore((state) => state.setGuideLineShow);
  const setHorizontalLine = usePPTStore((state) => state.setHorizontalLine);
  const setVerticalLine = usePPTStore((state) => state.setVerticalLine);

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
          setDisplayStatus("default");
        }}
        active={displayStatus === "default"}
        aspectRatio={false}
        icon={<Column theme="outline" size="18" fill="#333" />}
        title="普通视图"
      />
      <PanelLargeButton
        onClick={() => {
          elementActiveStore.resetElementActive();
          setDisplayStatus("grid");
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
            icon={<GridTwo theme="outline" size="18" fill="#333" />}
            title="网格线"
          />
        </div>
      </Dropdown>
      <PanelLargeButton
        onClick={() => {
          setGridType(gridType === "line" ? "none" : "line");
        }}
        active={gridType === "line"}
        icon={<Ruler theme="outline" size="18" fill="#333" />}
        title="标尺"
      />
      <PanelLargeButton
        onClick={() => {
          setGuideLineShow(!guideLineShow);
        }}
        active={guideLineShow}
        disabled={gridType !== "line"}
        icon={<DividingLineOne theme="outline" size="18" fill="#333" />}
        title="参考线"
      />
      <PanelLargeButton
        onClick={() => {
          setHorizontalLine([]);
          setVerticalLine([]);
        }}
        aspectRatio={false}
        disabled={gridType !== "line"}
        icon={<Clear theme="outline" size="18" fill="#333" />}
        title="清除参考线"
      />
    </div>
  );
};

export const View: FC = ViewComponent;
