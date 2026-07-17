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
      className="flex flex-col items-center justify-center text-[12px] text-[#595959] cursor-pointer w-[56px] h-[56px] hover:bg-[#fff2e6] hover:text-primary rounded-[6px] transition-colors"
    >
      <span className="mb-[3px]">{icon}</span>
      {title}
    </div>
  );
};
