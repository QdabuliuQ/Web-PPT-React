import type { MenuItem } from "@/hooks/useContextMenu";
import { Download, EditOne } from "@icon-park/react";
import i18n from "@/i18n";
import { exportChartAsImage } from "./utils";

export const getChartMenuItems = (
  onEditData?: () => void,
  elementId?: string
): MenuItem[] => {
  const t = i18n.t.bind(i18n);
  
  return [
    ...(onEditData
      ? [
          {
            type: "item" as const,
            label: t('elements.chart.editData'),
            icon: <EditOne theme="outline" size="16" />,
            onClick: onEditData,
          },
        ]
      : []),
    ...(elementId
      ? [
          {
            type: "item" as const,
            label: t('elements.chart.downloadImage'),
            icon: <Download theme="outline" size="16" />,
            onClick: async () => {
              await exportChartAsImage(elementId, "chart", "png");
            },
          },
        ]
      : []),
  ];
};
