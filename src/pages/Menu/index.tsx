import { useMemo, type FC } from "react";
import Panel from "./components"
import { observer } from "mobx-react-lite";
import { menuActiveStore } from "@/store";

export const Menu: FC = observer(() => {
    const activePanelKey = menuActiveStore.activeMenu as keyof typeof Panel;
    const ActivePanelComponent = useMemo(() => Panel[activePanelKey], [activePanelKey]) as unknown as React.ComponentType
    console.log(activePanelKey, Panel);
    
    return (
        <div className="mx-[20px] bg-[#fff] rounded-[10px] p-[20px]">
            {ActivePanelComponent && typeof ActivePanelComponent === "function" ? (
                <ActivePanelComponent />
            ) : null}
        </div>
    );
})