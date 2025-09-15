import { useMemo, type FC } from "react";
interface IPanelPreviewProps {}

export const PanelPreview: FC<IPanelPreviewProps> = (props) => {
  const selectItem = useMemo(
    () => [
      {
        color: "green",
      },
    ],
    []
  );

  return <div>PanelPreview</div>;
};
