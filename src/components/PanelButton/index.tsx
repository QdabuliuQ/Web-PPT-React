import { useMemoizedFn } from "ahooks";
import { type FC } from "react";
interface IPanelButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}

export const PanelButton: FC<IPanelButtonProps> = ({
  icon,
  title,
  onClick,
}) => {
  const clickHandle = useMemoizedFn(() => {
    onClick?.();
  });

  return (
    <div
      onClick={clickHandle}
      className="flex flex-col items-center justify-center text-[12px] text-gray-500 cursor-pointer w-[60px] h-[60px] hover:bg-[#f0f0f0] rounded-[10px]"
    >
      <span className="mb-[3px]">{icon}</span>
      {title}
    </div>
  );
};
