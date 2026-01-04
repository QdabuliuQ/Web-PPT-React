import type { MenuItem } from "@/hooks/useContextMenu";
import { EditOne } from "@icon-park/react";

export const getChartMenuItems = (onEditData?: () => void): MenuItem[] => {
  return [
    ...(onEditData
      ? [
          {
            type: "item" as const,
            label: "编辑数据",
            icon: <EditOne theme="outline" size="16" />,
            onClick: onEditData,
          },
        ]
      : []),
    {
      type: "separator",
    },
  ];
};
