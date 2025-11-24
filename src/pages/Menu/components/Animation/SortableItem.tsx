import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CloseOne, Drag } from "@icon-park/react";
import { type FC } from "react";

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
  getElementTypeName,
  getAnimationDisplayName,
  onSelect,
  onDelete,
  disabled = false,
}) => {
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
      <span className="flex-1 line-clamp-1 cursor-pointer">
        {getElementTypeName(element.type)} -{" "}
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

