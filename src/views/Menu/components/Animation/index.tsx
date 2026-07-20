import {
  PanelItemSelect,
  PanelLargeButton,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import { PanelDropdownButton } from "@/components/PanelDropdownButton";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { globalEventBus } from "@/utils/eventBus";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CloseOne,
  DeleteFive,
  DeleteFour,
  Play,
  SortAmountDown,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Popover, Select } from "antd";
import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  getToggleInDelayOptions,
  getToggleInDurationOptions,
} from "../Toggle";
import { SortableItem } from "./SortableItem";

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

const AnimationComponent: FC = () => {
  const { t } = useTranslation();
  const [animationName, setAnimationName] = useState<string>("");
  // 动画列表中选中的元素ID（独立状态）
  const [selectedAnimationElementId, setSelectedAnimationElementId] = useState<
    string | null
  >(null);

  const durationOptions = useMemo(
    () => getToggleInDurationOptions(t),
    [t]
  );
  const delayOptions = useMemo(() => getToggleInDelayOptions(t), [t]);

  // 使用 Zustand hooks 订阅状态变化
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const elementActive = useElementActiveStore((state) => state.elementActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);
  const getAllElementInfo = usePPTStore((state) => state.getAllElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const currentElement =
    pageActive && elementActive
      ? getElementInfo(pageActive, elementActive)
      : null;
  const currentAnimationName = currentElement?.animationName || "";

  // 获取动画列表中选中的元素
  const selectedAnimationElement =
    pageActive && selectedAnimationElementId
      ? getElementInfo(pageActive, selectedAnimationElementId)
      : null;

  // 回显选中元素的动画属性
  // 如果选中了动画列表中的元素，显示那个元素的属性；否则显示当前激活元素的属性
  const targetElementForDisplay = selectedAnimationElement || currentElement;
  const currentAnimationDuration =
    targetElementForDisplay?.animationDuration || "default";
  const currentAnimationDelay = targetElementForDisplay?.animationDelay || "0s";
  const currentAnimationTrigger =
    targetElementForDisplay?.animationTrigger || "default";

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

    setElementInfo(pageActive, elementActive, {
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

      const element = getElementInfo(pageActive, elementId);
      if (!element) return;

      setElementInfo(pageActive, elementId, {
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

      setElementInfo(pageActive, elementActive, {
        ...currentElement,
        animationName: "",
      } as any);
    } else if (key === "deleteAll") {
      // 删除当前页面所有对象的动画
      const allElements = getAllElementInfo(pageActive);
      allElements.forEach((element) => {
        setElementInfo(pageActive, element.id, {
          ...element,
          animationName: "",
        } as any);
      });
    }
  });

  // 获取当前页面所有设置了动画的元素，并按 animationTrigger 分组
  // default 元素放在前面，click 元素放在后面
  // 使用 useMemo 来响应 pages 和 pageActive 的变化
  const pages = usePPTStore((state) => state.pages);
  const { defaultElements, clickElements, animatedElements } = useMemo(() => {
    if (!pageActive) {
      return {
        defaultElements: [],
        clickElements: [],
        animatedElements: [],
      };
    }
    // 依赖 pages，确保 store 页面数据变化时重新计算
    if (!pages.some((page) => page.id === pageActive)) {
      return {
        defaultElements: [],
        clickElements: [],
        animatedElements: [],
      };
    }
    const allElements = getAllElementInfo(pageActive);
    const filtered = allElements.filter(
      (element) => element.animationName && element.animationName !== ""
    );

    // 分为两组
    const defaultEls = filtered.filter(
      (element) =>
        element.animationTrigger === "default" || !element.animationTrigger
    );
    const clickEls = filtered.filter(
      (element) => element.animationTrigger === "click"
    );

    // default 元素不需要排序（按原始顺序）
    // click 元素按 animationIndex 排序
    const sortedClickEls = [...clickEls].sort((a, b) => {
      const indexA = a.animationIndex ?? 0;
      const indexB = b.animationIndex ?? 0;
      return indexA - indexB;
    });

    // 合并后的元素列表（用于显示索引）
    const animatedEls = [...defaultEls, ...sortedClickEls];

    return {
      defaultElements: defaultEls,
      clickElements: sortedClickEls,
      animatedElements: animatedEls,
    };
  }, [pageActive, pages, getAllElementInfo]);

  // 获取元素类型的中文名称
  const getElementTypeName = useMemoizedFn((type: string) => {
    const keyMap: Record<string, string> = {
      text: "element.text",
      table: "element.table",
      icon: "element.icon",
      image: "element.image",
      chart: "element.chart",
      mindmap: "element.mindMap",
    };
    const key = keyMap[type];
    return key ? t(key) : type;
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

  // 处理拖拽结束事件（只处理 click 元素的排序）
  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !pageActive) return;

    // 检查拖拽的元素是否是 click 元素
    const draggedElement = clickElements.find((el) => el.id === active.id);
    const targetElement = clickElements.find((el) => el.id === over.id);

    // 如果拖拽的不是 click 元素，或者目标不是 click 元素，不处理
    if (!draggedElement || !targetElement) return;

    const oldIndex = clickElements.findIndex((el) => el.id === active.id);
    const newIndex = clickElements.findIndex((el) => el.id === over.id);

    if (oldIndex !== newIndex) {
      const newOrderedClickElements = arrayMove(
        clickElements,
        oldIndex,
        newIndex
      );
      // 只更新 click 元素的 animationIndex
      newOrderedClickElements.forEach((element, index) => {
        setElementInfo(pageActive, element.id, {
          ...element,
          animationIndex: index,
        } as any);
      });
    }
  });

  // 处理删除单个元素的动画
  const handleDeleteElementAnimation = useMemoizedFn((elementId: string) => {
    if (!pageActive) return;
    const element = getElementInfo(pageActive, elementId);
    if (!element) return;

    setElementInfo(pageActive, elementId, {
      ...element,
      animationName: "",
    } as any);

    // 如果删除的是选中的元素，清空选中状态
    if (selectedAnimationElementId === elementId) {
      setSelectedAnimationElementId(null);
    }
  });

  // 处理预览动画
  const handlePreviewAnimation = useMemoizedFn(() => {
    if (!elementActive || !currentElement || !currentElement.animationName) {
      return;
    }

    // 通过事件总线发送预览动画事件，事件名称为 animation-play-元素id
    const eventName = `animation-play-${elementActive}`;
    globalEventBus.emit(eventName);
  });

  const orderContent = useMemo(() => {
    // 在 useMemo 内部重新获取选中元素，确保值正确更新
    const selectedElement =
      pageActive && selectedAnimationElementId
        ? getElementInfo(pageActive, selectedAnimationElementId)
        : null;

    // 获取选中元素的动画属性值
    const animationDuration = selectedElement?.animationDuration || "default";
    const animationDelay = selectedElement?.animationDelay || "0s";
    const animationTrigger = selectedElement?.animationTrigger || "click";

    return (
      <div className="flex flex-col gap-[10px] w-[200px]">
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-chrome-muted mr-[10px]">过渡时间</div>
          <Select
            value={animationDuration}
            options={durationOptions}
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
          <div className="text-[12px] text-chrome-muted mr-[10px]">延迟时间</div>
          <Select
            value={animationDelay}
            options={delayOptions}
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
          <div className="text-[12px] text-chrome-muted mr-[10px]">触发方式</div>
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
            <div className="text-[12px] h-[250px] text-chrome-muted flex items-center justify-center">
              暂无动画
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={clickElements.map((el) => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-[5px] min-h-[250px] max-h-[250px] overflow-y-auto">
                  {/* 渲染 default 元素（不可拖拽） */}
                  {defaultElements.map((element, index) => (
                    <SortableItem
                      key={element.id}
                      element={element}
                      index={index}
                      elementActive={selectedAnimationElementId}
                      getElementTypeName={getElementTypeName}
                      getAnimationDisplayName={getAnimationDisplayName}
                      onSelect={handleSelectAnimationElement}
                      onDelete={handleDeleteElementAnimation}
                      disabled={true}
                    />
                  ))}
                  {/* 渲染 click 元素（可拖拽） */}
                  {clickElements.map((element, index) => (
                    <SortableItem
                      key={element.id}
                      element={element}
                      index={defaultElements.length + index}
                      elementActive={selectedAnimationElementId}
                      getElementTypeName={getElementTypeName}
                      getAnimationDisplayName={getAnimationDisplayName}
                      onSelect={handleSelectAnimationElement}
                      onDelete={handleDeleteElementAnimation}
                      disabled={false}
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
    defaultElements,
    clickElements,
    animatedElements,
    getElementTypeName,
    getAnimationDisplayName,
    handleDragEnd,
    handleDeleteElementAnimation,
    handleSelectAnimationElement,
    sensors,
    getElementInfo,
  ]);

  return (
    <div className="flex gap-[10px] h-[53px]">
      <PanelItemSelect
        displayItems={displayAnimations}
        moreItems={moreAnimations}
        selectedValue={currentAnimationName}
        onSelect={handleAnimationSelect}
        onItemHover={mouseEnterHandle}
        onItemLeave={mouseLeaveHandle}
        hoveredValue={animationName}
      />
      <PanelSplitLine />
      <div className="flex flex-col justify-between mr-[5px]">
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-chrome-muted mr-[5px]">过渡时间</span>
          <PanelSelect
            value={currentAnimationDuration}
            options={durationOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              // 如果选中了动画列表中的元素，更新那个元素；否则更新当前激活的元素
              const targetElementId =
                selectedAnimationElementId || elementActive;
              if (targetElementId) {
                handleAnimationPropertyChange(
                  targetElementId,
                  "animationDuration",
                  value
                );
              }
            }}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-chrome-muted mr-[5px]">延迟时间</span>
          <PanelSelect
            value={currentAnimationDelay}
            options={delayOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              // 如果选中了动画列表中的元素，更新那个元素；否则更新当前激活的元素
              const targetElementId =
                selectedAnimationElementId || elementActive;
              if (targetElementId) {
                handleAnimationPropertyChange(
                  targetElementId,
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
          <span className="text-[12px] text-chrome-muted mr-[5px]">触发方式</span>
          <PanelSelect
            value={currentAnimationTrigger}
            options={animationTriggerOptions}
            size="small"
            style={{ width: 70 }}
            onChange={(value) => {
              // 如果选中了动画列表中的元素，更新那个元素；否则更新当前激活的元素
              const targetElementId =
                selectedAnimationElementId || elementActive;
              if (targetElementId) {
                handleAnimationPropertyChange(
                  targetElementId,
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
          icon={<Play theme="outline" size="14" fill="currentColor" />}
          className="bg-gray-100 text-[12px] hover:!text-[var(--primary-color)]"
          onClick={handlePreviewAnimation}
          disabled={!elementActive || !currentAnimationName}
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
              icon={<CloseOne theme="outline" size="18" fill="var(--icon-color)" />}
            />
          }
          onSelect={handleDeleteAnimation}
          menu={{
            items: [
              {
                key: "deleteItem",
                label: "删除当前对象的动画",
                icon: <DeleteFour theme="outline" size="18" fill="var(--icon-color)" />,
              },
              {
                key: "deleteAll",
                label: "删除当前幻灯片所有对象的动画",
                icon: <DeleteFive theme="outline" size="18" fill="var(--icon-color)" />,
              },
            ],
          }}
        />
        <Popover trigger="hover" content={orderContent}>
          <div>
            <PanelLargeButton
              title="动画排序"
              icon={<SortAmountDown theme="outline" size="18" fill="var(--icon-color)" />}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export const Animation: FC = AnimationComponent;
