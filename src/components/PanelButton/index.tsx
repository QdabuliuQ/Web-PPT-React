import { useMemoizedFn } from "ahooks";
import {
  cloneElement,
  isValidElement,
  useMemo,
  type FC,
  type ReactElement,
} from "react";

interface IPanelButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Keep hover/active look (e.g. while a popover is open) */
  active?: boolean;
}

const activeClassName =
  "bg-chrome-soft text-[var(--primary-color)] [&_svg]:![color:inherit] [&_path]:![stroke:currentColor] [&_rect]:![stroke:currentColor]";

const idleClassName =
  "text-chrome-secondary cursor-pointer hover:bg-chrome-soft hover:text-[var(--primary-color)] [&:hover_svg]:![color:inherit] [&:hover_path]:![stroke:currentColor] [&:hover_rect]:![stroke:currentColor]";

export const PanelButton: FC<IPanelButtonProps> = ({
  icon,
  title,
  onClick,
  disabled = false,
  active = false,
}) => {
  const clickHandle = useMemoizedFn(() => {
    if (!disabled) {
      onClick?.();
    }
  });

  // IconPark 会把 fill 写进 SVG stroke；用 currentColor 才能跟随按钮 color / hover
  const renderIcon = useMemo(() => {
    if (!isValidElement(icon)) return icon;

    return cloneElement(icon as ReactElement<{ fill?: string }>, {
      fill: disabled ? "var(--text-disabled)" : "currentColor",
    });
  }, [icon, disabled]);

  return (
    <div
      onClick={clickHandle}
      className={`flex flex-col items-center justify-center text-[12px] h-[56px] px-[8px] w-auto whitespace-nowrap rounded-[6px] transition-colors ${
        disabled
          ? "text-chrome-disabled cursor-not-allowed"
          : active
            ? `${activeClassName} cursor-pointer`
            : idleClassName
      }`}
    >
      <span className="mb-[3px] flex items-center justify-center text-current leading-none">
        {renderIcon}
      </span>
      {title}
    </div>
  );
};
