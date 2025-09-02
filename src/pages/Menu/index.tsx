import { menuActiveStore } from "@/store";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import Panel from "./components";

export const Menu: FC = observer(() => {
  const activePanelKey = menuActiveStore.menuActive as keyof typeof Panel;
  const ActivePanelComponent = useMemo(
    () => Panel[activePanelKey] || null,
    [activePanelKey]
  ) as unknown as React.ComponentType;

  return (
    <div className="mx-[20px] bg-[#fff] rounded-[10px] h-[65px] py-[7px] flex items-center justify-center">
      {ActivePanelComponent && typeof ActivePanelComponent === "function" ? (
        <ActivePanelComponent />
      ) : null}
    </div>
  );
});
