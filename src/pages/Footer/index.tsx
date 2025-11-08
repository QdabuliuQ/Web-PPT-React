import { displayStatusStore, pageActiveStore, pptStore } from "@/store";
import { Column, ViewGridCard } from "@icon-park/react";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { type FC } from "react";

const FooterComponent: FC = () => {
  const pages = pptStore.getPages();
  const pageIndex = pageActiveStore.getPageIndex(pages);
  const displayStatus = displayStatusStore.getDisplayStatus();

  return (
    <div className="mx-[20px] h-[30px] flex items-center justify-between box-border border-t border-[#ccc] text-[12px]">
      <div className="text-[#9b9b9b]">
        <span className="mr-[10px]">幻灯片</span>
        {pageIndex + 1} / {pages.length}
      </div>
      <div className="flex items-center gap-[15px]">
        <Tooltip title="普通视图">
          <span
            className="cursor-pointer"
            onClick={() => displayStatusStore.setDisplayStatus("default")}
          >
            <Column
              theme="outline"
              size="15"
              fill={displayStatus === "default" ? "#f25f00" : "#333"}
            />
          </span>
        </Tooltip>
        <Tooltip title="幻灯片预览">
          <span
            className="cursor-pointer"
            onClick={() => displayStatusStore.setDisplayStatus("grid")}
          >
            <ViewGridCard
              theme="outline"
              size="15"
              fill={displayStatus === "grid" ? "#f25f00" : "#333"}
            />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export const Footer: FC = observer(FooterComponent);
