import { useElementHoverActiveStore } from "@/store";
import { getAllElementPanelInfo } from "@/utils/tool";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CloseOne, Drag } from "@icon-park/react";
import type { ComponentType } from "react";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";

export interface SortableItemProps {
  element: any;
  index: number;
  elementActive: string | null;
  getElementTypeName: (type: string) => string;
  getAnimationDisplayName: (animationName: string) => string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export const SortableItem: FC<SortableItemProps> = ({
  element,
  index,
  elementActive,
  getElementTypeName: _getElementTypeName,
  getAnimationDisplayName,
  onSelect,
  onDelete,
  disabled = false,
}) => {
  const { t } = useTranslation();
  // 使用 Zustand hook 获取方法
  const setElementHoverActive = useElementHoverActiveStore(
    (state) => state.setElementHoverActive
  );
  const resetElementHoverActive = useElementHoverActiveStore(
    (state) => state.resetElementHoverActive
  );
  // 动态获取所有元素面板信息并创建映射（包含名称和图标）
  const elementInfoMap = useMemo(() => {
    const panels = getAllElementPanelInfo();
    const map = new Map<
      string,
      { name: string; icon?: ComponentType<unknown> }
    >();
    panels.forEach((panel) => {
      map.set(panel.key, { name: panel.name, icon: panel.icon });
    });
    return map;
  }, []);

  // 根据 element.type 获取元素信息
  const getElementInfo = (type: string) => {
    const info = elementInfoMap.get(type);
    return {
      name: info?.name || type,
      icon: info?.icon,
    };
  };

  const elementInfo = getElementInfo(element.type);
  const ElementIcon = elementInfo.icon as
    | React.ComponentType<{
        theme?: string;
        size?: string | number;
        fill?: string;
        className?: string;
      }>
    | undefined;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-[8px] text-[12px] text-[#666] hover:bg-white px-[10px] py-[5px] rounded ${
        elementActive === element.id
          ? "border border-primary bg-white"
          : "border border-transparent"
      }`}
      onClick={() => {
        onSelect(element.id);
      }}
      onMouseEnter={() => {
        setElementHoverActive(element.id);
      }}
      onMouseLeave={() => {
        resetElementHoverActive();
      }}
    >
      {!disabled && (
        <div
          {...listeners}
          className="cursor-move select-none flex items-center"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Drag theme="outline" size="13" fill="#333" />
        </div>
      )}
      {disabled && (
        <div className="select-none flex items-center w-[13px]">
          {/* 占位，保持布局一致 */}
        </div>
      )}
      <span className="text-[#999] font-semibold">{index + 1}</span>
      {ElementIcon && (
        <ElementIcon
          theme="outline"
          size="14"
          fill="#666"
          className="flex-shrink-0"
        />
      )}
      <span className="flex-1 line-clamp-1 cursor-pointer">
        {(t as (key: string) => string)(elementInfo.name)} -{" "}
        {getAnimationDisplayName(element.animationName || "")}
      </span>
      {elementActive === element.id && (
        <CloseOne
          className="cursor-pointer"
          theme="outline"
          size="12"
          fill="#333"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
        />
      )}
    </div>
  );
};
