import { useMemo, type FC } from "react";
import { menuActiveStore } from "@/store";
import styles from './index.module.less';
import { observer } from "mobx-react-lite";

export const Header: FC = observer(() => {
    const menuItems = useMemo(
      () => [
        {
          label: "开始",
          key: "start",
        },
        {
          label: "插入",
          key: "insert",
        },
      ],
      []
    );
  
         return (
       <div className="px-[20px] pt-[10px] pb-[15px] flex items-center justify-around">
         <div className="flex items-center gap-[30px]">
           {menuItems.map((item) => (
             <div
               className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
                 menuActiveStore.isActive(item.key) 
                   ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                   : "text-gray-600 hover:text-[var(--primary-color)]"
               }`}
               key={item.key}
               onClick={() => menuActiveStore.setActiveMenu(item.key)}
             >
               {item.label}
             </div>
           ))}
         </div>
       </div>
     );
});
