import { AddFour } from "@icon-park/react";
import { Tooltip } from "antd";
import { memo, type FC } from "react";

export const Preview: FC = memo(() => {
  return (
    <div className="w-[230px] min-w-[230px] box-border border-r border-[#ccc] flex flex-col gap-[5px]">
      <div className="flex-1">preview</div>
      <Tooltip placement="top" title="添加页面">
        <div className="flex items-center justify-center cursor-pointer py-[8px] mr-[10px] hover:bg-[#e4e4e4] rounded-[3px]">
          <AddFour />
        </div>
      </Tooltip>
    </div>
  );
});
