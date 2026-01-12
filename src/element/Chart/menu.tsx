import type { MenuItem } from "@/hooks/useContextMenu";
import { Download, EditOne } from "@icon-park/react";
import { exportChartAsImage } from "./utils";

export const getChartMenuItems = (
  onEditData?: () => void,
  elementId?: string
): MenuItem[] => {
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
    ...(elementId
      ? [
          {
            type: "item" as const,
            label: "下载图片",
            icon: <Download theme="outline" size="16" />,
            onClick: async () => {
              await exportChartAsImage(elementId, "chart", "png");
            },
          },
        ]
      : []),
  ];
};
