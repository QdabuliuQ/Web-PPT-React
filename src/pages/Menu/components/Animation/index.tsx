import {
  PanelAnimationSelect,
  PanelLargeButton,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import { PanelDropdownButton } from "@/components/PanelDropdownButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CloseOne,
  DeleteFive,
  DeleteFour,
  Drag,
  Play,
  SortAmountDown,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Popover, Select } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState, type FC } from "react";
import { toggleInDelayOptions, toggleInDurationOptions } from "../Toggle";

// 元素动画列表
const elementAnimationName = [
  {
    type: "",
    name: "无动画",
  },
  {
    type: "backInDown",
    name: "回弹下",
  },
  {
    type: "backInLeft",
    name: "回弹左",
  },
  {
    type: "backInRight",
    name: "回弹右",
  },
  {
    type: "backInUp",
    name: "回弹上",
  },
  {
    type: "bounceInDown",
    name: "弹跳下",
  },
  {
    type: "bounceInLeft",
    name: "弹跳左",
  },
  {
    type: "bounceInRight",
    name: "弹跳右",
  },
  {
    type: "bounceInUp",
    name: "弹跳上",
  },
  {
    type: "fadeIn",
    name: "淡入",
  },
  {
    type: "fadeInDown",
    name: "淡入下",
  },
  {
    type: "fadeInDownBig",
    name: "淡入下(快)",
  },
  {
    type: "fadeInLeft",
    name: "淡入左",
  },
  {
    type: "fadeInLeftBig",
    name: "淡入左(快)",
  },
  {
    type: "fadeInRight",
    name: "淡入右",
  },
  {
    type: "fadeInRightBig",
    name: "淡入右(快)",
  },
  {
    type: "fadeInUp",
    name: "淡入上",
  },
  {
    type: "fadeInUpBig",
    name: "淡入上(快)",
  },
  {
    type: "fadeInTopLeft",
    name: "淡入左上",
  },
  {
    type: "fadeInTopRight",
    name: "淡入右上",
  },
  {
    type: "fadeInBottomLeft",
    name: "淡入左下",
  },
  {
    type: "fadeInBottomRight",
    name: "淡入右下",
  },
  {
    type: "flipInX",
    name: "翻转X",
  },
  {
    type: "flipInY",
    name: "翻转Y",
  },
  {
    type: "lightSpeedInRight",
    name: "光速右",
  },
  {
    type: "lightSpeedInLeft",
    name: "光速左",
  },
  {
    type: "rotateInDownLeft",
    name: "旋转左下",
  },
  {
    type: "rotateInDownRight",
    name: "旋转右下",
  },
  {
    type: "zoomIn",
    name: "缩放",
  },
  {
    type: "zoomInDown",
    name: "缩放下",
  },
  {
    type: "zoomInLeft",
    name: "缩放左",
  },
  {
    type: "zoomInRight",
    name: "缩放右",
  },
  {
    type: "zoomInUp",
    name: "缩放上",
  },
  {
    type: "slideInDown",
    name: "滑入下",
  },
  {
    type: "slideInLeft",
    name: "滑入左",
  },
  {
    type: "slideInRight",
    name: "滑入右",
  },
  {
    type: "slideInUp",
    name: "滑入上",
  },
];

const animationTriggerOptions = [
  {
    value: "click",
    label: "单击",
  },
  {
    value: "default",
    label: "立即",
  },
];

// 可拖拽的列表项组件
interface SortableItemProps {
  element: any;
  index: number;
  elementActive: string | null;
  getElementTypeName: (type: string) => string;
  getAnimationDisplayName: (animationName: string) => string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableItem: FC<SortableItemProps> = ({
  element,
  index,
  elementActive,
  getElementTypeName,
  getAnimationDisplayName,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

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
      <div
        {...listeners}
        className="cursor-move select-none flex items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Drag theme="outline" size="13" fill="#333" />
      </div>
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

const AnimationComponent: FC = () => {
  const [animationName, setAnimationName] = useState<string>("");
  // 动画列表中选中的元素ID（独立状态）
  const [selectedAnimationElementId, setSelectedAnimationElementId] = useState<
    string | null
  >(null);

  // 获取当前选中的元素
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();
  const currentElement =
    pageActive && elementActive
      ? pptStore.getElementInfo(pageActive, elementActive)
      : null;
  const currentAnimationName = currentElement?.animationName || "";

  // 获取动画列表中选中的元素
  const selectedAnimationElement =
    pageActive && selectedAnimationElementId
      ? pptStore.getElementInfo(pageActive, selectedAnimationElementId)
      : null;

  // 回显选中元素的动画属性
  const currentAnimationDuration =
    selectedAnimationElement?.animationDuration || "default";
  const currentAnimationDelay =
    selectedAnimationElement?.animationDelay || "0s";
  const currentAnimationTrigger =
    selectedAnimationElement?.animationTrigger || "click";

  // 前6个动画
  const displayAnimations = elementAnimationName.slice(0, 6);
  // 剩余的动画
  const moreAnimations = elementAnimationName.slice(6);

  const mouseEnterHandle = useMemoizedFn((type: string) => {
    setAnimationName(type);
  });

  const mouseLeaveHandle = useMemoizedFn(() => setAnimationName(""));

  // 处理动画选择
  const handleAnimationSelect = useMemoizedFn((type: string) => {
    if (!pageActive || !elementActive || !currentElement) return;

    pptStore.setElementInfo(pageActive, elementActive, {
      ...currentElement,
      animationName: type,
    } as any);
  });

  // 处理元素动画属性变化（通用函数）
  const handleAnimationPropertyChange = useMemoizedFn(
    (
      elementId: string,
      property: "animationDuration" | "animationDelay" | "animationTrigger",
      value: string
    ) => {
      if (!pageActive) return;

      const element = pptStore.getElementInfo(pageActive, elementId);
      if (!element) return;

      pptStore.setElementInfo(pageActive, elementId, {
        ...element,
        [property]: value,
      } as any);
    }
  );

  // 处理选中动画列表中的元素
  const handleSelectAnimationElement = useMemoizedFn((elementId: string) => {
    setSelectedAnimationElementId(elementId);
  });
  // 处理删除动画
  const handleDeleteAnimation = useMemoizedFn((key: string) => {
    if (!pageActive) return;

    if (key === "deleteItem") {
      // 删除当前对象的动画
      if (!elementActive || !currentElement) return;

      pptStore.setElementInfo(pageActive, elementActive, {
        ...currentElement,
        animationName: "",
      } as any);
    } else if (key === "deleteAll") {
      // 删除当前页面所有对象的动画
      const allElements = pptStore.getAllElementInfo(pageActive);
      allElements.forEach((element) => {
        pptStore.setElementInfo(pageActive, element.id, {
          ...element,
          animationName: "",
        } as any);
      });
    }
  });

  // 获取当前页面所有设置了动画的元素，并按 animationIndex 排序
  // 不使用 useMemo，让 observer 自动响应 MobX store 的变化
  const animatedElements = (() => {
    if (!pageActive) return [];
    const allElements = pptStore.getAllElementInfo(pageActive);
    const filtered = allElements.filter(
      (element) => element.animationName && element.animationName !== ""
    );
    // 按 animationIndex 排序
    return filtered.sort((a, b) => {
      const indexA = a.animationIndex ?? 0;
      const indexB = b.animationIndex ?? 0;
      return indexA - indexB;
    });
  })();

  // 获取元素类型的中文名称
  const getElementTypeName = useMemoizedFn((type: string) => {
    const typeMap: Record<string, string> = {
      text: "文本",
      table: "表格",
      icon: "图标",
      image: "图片",
    };
    return typeMap[type] || type;
  });

  // 获取动画名称的中文显示
  const getAnimationDisplayName = useMemoizedFn((animationName: string) => {
    const animation = elementAnimationName.find(
      (item) => item.type === animationName
    );
    return animation?.name || animationName;
  });

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束事件
  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !pageActive) return;

    const oldIndex = animatedElements.findIndex((el) => el.id === active.id);
    const newIndex = animatedElements.findIndex((el) => el.id === over.id);

    if (oldIndex !== newIndex) {
      const newOrderedElements = arrayMove(
        animatedElements,
        oldIndex,
        newIndex
      );
      console.log(newOrderedElements, "newOrderedElements");

      // 更新所有元素的 animationIndex
      newOrderedElements.forEach((element, index) => {
        pptStore.setElementInfo(pageActive, element.id, {
          ...element,
          animationIndex: index,
        } as any);
      });
    }
  });

  // 处理删除单个元素的动画
  const handleDeleteElementAnimation = useMemoizedFn((elementId: string) => {
    if (!pageActive) return;
    const element = pptStore.getElementInfo(pageActive, elementId);
    if (!element) return;

    pptStore.setElementInfo(pageActive, elementId, {
      ...element,
      animationName: "",
    } as any);

    // 如果删除的是选中的元素，清空选中状态
    if (selectedAnimationElementId === elementId) {
      setSelectedAnimationElementId(null);
    }
  });

  const orderContent = useMemo(() => {
    // 在 useMemo 内部重新获取选中元素，确保值正确更新
    const selectedElement =
      pageActive && selectedAnimationElementId
        ? pptStore.getElementInfo(pageActive, selectedAnimationElementId)
        : null;

    // 获取选中元素的动画属性值
    const animationDuration = selectedElement?.animationDuration || "default";
    const animationDelay = selectedElement?.animationDelay || "0s";
    const animationTrigger = selectedElement?.animationTrigger || "click";

    return (
      <div className="flex flex-col gap-[10px] w-[200px]">
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-[#666] mr-[10px]">过渡时间</div>
          <Select
            value={animationDuration}
            options={toggleInDurationOptions}
            size="small"
            style={{ width: 70 }}
            disabled={!selectedAnimationElementId}
            onChange={(value) => {
              if (selectedAnimationElementId) {
                handleAnimationPropertyChange(
                  selectedAnimationElementId,
                  "animationDuration",
                  value
                );
              }
            }}
            className="flex flex-1"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-[#666] mr-[10px]">延迟时间</div>
          <Select
            value={animationDelay}
            options={toggleInDelayOptions}
            size="small"
            style={{ width: 70 }}
            disabled={!selectedAnimationElementId}
            onChange={(value) => {
              if (selectedAnimationElementId) {
                handleAnimationPropertyChange(
                  selectedAnimationElementId,
                  "animationDelay",
                  value
                );
              }
            }}
            className="flex flex-1"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-[#666] mr-[10px]">触发方式</div>
          <Select
            value={animationTrigger}
            options={animationTriggerOptions}
            size="small"
            style={{ width: 70 }}
            disabled={!selectedAnimationElementId}
            onChange={(value) => {
              if (selectedAnimationElementId) {
                handleAnimationPropertyChange(
                  selectedAnimationElementId,
                  "animationTrigger",
                  value
                );
              }
            }}
            className="flex flex-1"
          />
        </div>
        <div className="p-[6px] bg-gray-50 rounded-sm">
          {animatedElements.length === 0 ? (
            <div className="text-[12px] h-[250px] text-[#999] flex items-center justify-center">
              暂无动画
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={animatedElements.map((el) => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-[5px] min-h-[250px] max-h-[250px] overflow-y-auto">
                  {animatedElements.map((element, index) => (
                    <SortableItem
                      key={element.id}
                      element={element}
                      index={index}
                      elementActive={selectedAnimationElementId}
                      getElementTypeName={getElementTypeName}
                      getAnimationDisplayName={getAnimationDisplayName}
                      onSelect={handleSelectAnimationElement}
                      onDelete={handleDeleteElementAnimation}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    );
  }, [
    pageActive,
    selectedAnimationElementId,
    handleAnimationPropertyChange,
    animatedElements,
    getElementTypeName,
    getAnimationDisplayName,
    handleDragEnd,
    handleDeleteElementAnimation,
    handleSelectAnimationElement,
    sensors,
  ]);

  return (
    <div className="flex gap-[10px] h-[53px]">
      <PanelAnimationSelect
        displayAnimations={displayAnimations}
        moreAnimations={moreAnimations}
        selectedAnimation={currentAnimationName}
        onSelect={handleAnimationSelect}
        onAnimationHover={mouseEnterHandle}
        onAnimationLeave={mouseLeaveHandle}
        hoverAnimation={animationName}
      />
      <PanelSplitLine />
      <div className="flex flex-col justify-between mr-[5px]">
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">过渡时间</span>
          <PanelSelect
            value={currentAnimationDuration}
            options={toggleInDurationOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              if (elementActive) {
                handleAnimationPropertyChange(
                  elementActive,
                  "animationDuration",
                  value
                );
              }
            }}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">延迟时间</span>
          <PanelSelect
            value={currentAnimationDelay}
            options={toggleInDelayOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              if (elementActive) {
                handleAnimationPropertyChange(
                  elementActive,
                  "animationDelay",
                  value
                );
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">触发方式</span>
          <PanelSelect
            value={currentAnimationTrigger}
            options={animationTriggerOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              if (elementActive) {
                handleAnimationPropertyChange(
                  elementActive,
                  "animationTrigger",
                  value
                );
              }
            }}
          />
        </div>
        <Button
          size="small"
          type="text"
          variant="outlined"
          icon={<Play theme="outline" size="14" fill="#333" />}
          className="bg-gray-100 text-[12px]"
        >
          预览动画
        </Button>
      </div>
      <PanelSplitLine />
      <div className="flex gap-[5px]">
        <PanelDropdownButton
          button={
            <PanelLargeButton
              title="删除动画"
              aspectRatio={false}
              icon={<CloseOne theme="outline" size="18" fill="#333" />}
            />
          }
          onSelect={handleDeleteAnimation}
          menu={{
            items: [
              {
                key: "deleteItem",
                label: "删除当前对象的动画",
                icon: <DeleteFour theme="outline" size="18" fill="#333" />,
              },
              {
                key: "deleteAll",
                label: "删除当前幻灯片所有对象的动画",
                icon: <DeleteFive theme="outline" size="18" fill="#333" />,
              },
            ],
          }}
        />
        <Popover trigger="hover" content={orderContent}>
          <div>
            <PanelLargeButton
              title="动画排序"
              aspectRatio={false}
              icon={<SortAmountDown theme="outline" size="18" fill="#333" />}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export const Animation: FC = observer(AnimationComponent);
