import {
  PanelItemSelect,
  PanelLargeButton,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import {
  elementActiveStore,
  menuActiveStore,
  useElementActiveStore,
  useElementHoverActiveStore,
  useMenuActiveStore,
  usePPTStore,
  usePageActiveStore,
} from "@/store";
import {
  addPageAndActivate,
  duplicatePageAndActivate,
  resetPageElements,
} from "@/utils/operate";
import { getAllElementPanelInfo } from "@/utils/tool";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Add,
  Clear,
  Copy,
  Delete,
  Drag,
  EditTwo,
  Layers,
  PreviewCloseOne,
  PreviewOpen,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { ColorPicker, Popover, Slider, Tooltip } from "antd";
import React, { useCallback, useMemo, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import { textureItems } from "./texture";

export const Start: FC = () => {
  const { t } = useTranslation();
  // 使用 Zustand hooks 订阅状态变化，确保组件能够响应状态更新
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const pages = usePPTStore((state) => state.pages);
  const setPages = usePPTStore((state) => state.setPages);
  const getActivePage = usePPTStore((state) => state.getActivePage);
  const deletePage = usePPTStore((state) => state.deletePage);
  const togglePageVisible = usePPTStore((state) => state.togglePageVisible);
  const getAllElementInfo = usePPTStore((state) => state.getAllElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);
  const setPageActive = usePageActiveStore((state) => state.setPageActive);
  const setElementActive = useElementActiveStore(
    (state) => state.setElementActive
  );
  const setElementHoverActive = useElementHoverActiveStore(
    (state) => state.setElementHoverActive
  );
  const setActiveMenu = useMenuActiveStore((state) => state.setActiveMenu);

  // 获取当前页面
  const currentPage = pageActive ? getActivePage(pageActive) : null;

  // 获取页面背景属性，设置默认值
  const backgroundType = (currentPage as any)?.backgroundType || "solidColor";
  const background = (currentPage as any)?.background || "#fff";
  const bgColor = (currentPage as any)?.bgColor || "#9C92AC";
  const fgColor = (currentPage as any)?.fgColor || "#9C92AC";
  const bgOpacity = (currentPage as any)?.bgOpacity ?? 0.4;
  const selectedTexture = (currentPage as any)?.selectedTexture || "";

  // 转换为 SelectItem 格式
  const selectItems = textureItems.map((item) => ({
    type: item.type,
    name: item.name,
  }));

  // 显示前6个，其余在更多中
  const displayItems = selectItems.slice(0, 6);
  const moreItems = selectItems.slice(6);

  // 更新页面属性的通用函数
  const updatePageProperty = useMemoizedFn((property: string, value: any) => {
    if (!pageActive) return;
    const page = getActivePage(pageActive);
    if (!page) return;

    const pageIndex = pages.findIndex((p) => p.id === pageActive);
    if (pageIndex === -1) return;

    const newPages = [...pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      [property]: value,
    } as any;
    setPages(newPages);
  });

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖颜色变更函数
  const debouncedColorChange = useCallback(
    (property: string) => (color: any) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updatePageProperty(property, color.toHexString());
      }, 300);
    },
    [updatePageProperty]
  );

  const handleSelect = useMemoizedFn((type: string) => {
    updatePageProperty("selectedTexture", type);
  });

  // 批量修改所有页面的背景属性（使用当前页面的背景属性）
  const handleBatchUpdate = useMemoizedFn(() => {
    const newPages = pages.map((page) => ({
      ...page,
      backgroundType: backgroundType,
      background: background,
      bgColor: bgColor,
      fgColor: fgColor,
      bgOpacity: bgOpacity,
      selectedTexture: selectedTexture,
    }));
    setPages(newPages);
  });

  // 新建画布（在当前页面后添加新页面）
  const handleAddPage = useMemoizedFn(() => {
    if (!pageActive) return;
    addPageAndActivate(pageActive);
    setActiveMenu("start");
  });

  // 复制画布（复制当前页面）
  const handleDuplicatePage = useMemoizedFn(() => {
    if (!pageActive) return;
    duplicatePageAndActivate(pageActive);
  });

  // 删除画布（删除当前页面）
  const handleDeletePage = useMemoizedFn(() => {
    if (!pageActive) return;
    const success = deletePage(pageActive);
    if (success) {
      elementActiveStore.resetElementActive();
      menuActiveStore.resetMenu();
      // 使用最新的 pages 状态
      const remainingPages = usePPTStore.getState().pages;
      if (remainingPages.length > 0) {
        // 切换到第一个页面
        setPageActive(remainingPages[0].id);
      }
    }
  });

  // 隐藏/显示幻灯片（切换当前页面的可见性）
  const handleTogglePageVisible = useMemoizedFn(() => {
    if (!pageActive) return;
    togglePageVisible(pageActive);
  });

  // 重置幻灯片（清空当前页面的所有元素）
  const handleResetPage = useMemoizedFn(() => {
    if (!pageActive) return;
    resetPageElements(pageActive);
  });

  // 获取当前页面的可见性状态
  const isPageVisible = currentPage?.visible !== false;

  // 自定义渲染纹理项
  const renderTextureItem = useMemoizedFn(
    (
      item: { type: string; name: string },
      options: {
        isSelected: boolean;
        inPopover: boolean;
        disabled: boolean;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onClick: () => void;
      }
    ) => {
      const textureItem = textureItems.find((t) => t.type === item.type);
      if (!textureItem) return null;

      const { isSelected, disabled, onMouseEnter, onMouseLeave, onClick } =
        options;

      // 排除 opacity 属性
      const { opacity: _opacity, ...styleWithoutOpacity } = textureItem.style;

      return (
        <div
          className={`h-full w-[80px] relative ${disabled ? "" : "cursor-pointer"} rounded-[6px] overflow-hidden border ${
            isSelected ? "border-primary" : "border-[#dfdfdf]"
          } flex-shrink-0`}
          style={{
            ...styleWithoutOpacity,
            backgroundSize: "contain",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        />
      );
    }
  );

  // 获取所有元素面板信息
  const elementPanelInfoMap = useMemo(() => {
    const panels = getAllElementPanelInfo();
    const map = new Map<
      string,
      { name: string; icon?: React.ComponentType<unknown> }
    >();
    panels.forEach((panel) => {
      map.set(panel.key, { name: panel.name, icon: panel.icon });
    });
    return map;
  }, []);

  // 获取元素类型的中文名称和图标
  const getElementInfo = useMemoizedFn((type: string) => {
    const info = elementPanelInfoMap.get(type);
    return {
      name: info?.name || type,
      icon: info?.icon,
    };
  });

  // 获取当前页面的所有元素，按 z-index 降序排序（高的在前）
  // 使用 useMemo 来响应 pages 和 pageActive 的变化
  const sortedElements = useMemo(() => {
    if (!pageActive) return [];
    const allElements = getAllElementInfo(pageActive);
    // 按 z-index 降序排序（高的在前）
    return [...allElements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageActive, pages]);

  // 配置拖拽传感器
  const sensors = useSensors(useSensor(PointerSensor));

  // 处理拖拽结束事件
  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !pageActive) return;

    const oldIndex = sortedElements.findIndex((el) => el.id === active.id);
    const newIndex = sortedElements.findIndex((el) => el.id === over.id);

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      // 重新排序元素数组
      const newOrderedElements = arrayMove(sortedElements, oldIndex, newIndex);

      // 重新分配 z-index：从高到低（数组前面的 z-index 更高）
      // 使用较大的起始值，避免与现有值冲突
      const baseZIndex = 1000;
      newOrderedElements.forEach((element, index) => {
        const newZIndex = baseZIndex - index;
        if (element.zIndex !== newZIndex) {
          setElementInfo(pageActive, element.id, {
            ...element,
            zIndex: newZIndex,
          } as any);
        }
      });
    }
  });

  // 层级项组件
  const LayerItem: FC<{ element: any; index: number }> = ({
    element,
    index,
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

    // 使用 Zustand hook 订阅 elementActive 状态
    const elementActive = useElementActiveStore((state) => state.elementActive);
    const isSelected = elementActive === element.id;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`flex items-center gap-[8px] text-[12px] text-[#666] hover:bg-white px-[10px] py-[5px] rounded cursor-pointer ${
          isSelected
            ? "border border-primary bg-white"
            : "border border-transparent"
        }`}
        onClick={() => {
          setElementActive(element.id);
        }}
        onMouseEnter={() => {
          setElementHoverActive(element.id);
        }}
        onMouseLeave={() => {
          useElementHoverActiveStore.getState().resetElementHoverActive();
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
        <div className="flex-1 flex items-center gap-[6px] line-clamp-1">
          {(() => {
            const { name, icon: IconComponent } = getElementInfo(element.type);
            const Icon = IconComponent as React.ComponentType<{
              theme?: string;
              size?: string | number;
              fill?: string;
            }>;
            return (
              <>
                {Icon && <Icon theme="outline" size="14" fill="#666" />}
                <span>{(t as (key: string) => string)(name)}</span>
              </>
            );
          })()}
        </div>
      </div>
    );
  };

  const layerContent = (
    <div className="flex flex-col gap-[10px] w-[200px]">
      {sortedElements.length === 0 ? (
        <div className="text-[12px] text-[#999] py-[20px] text-center">
          当前页面没有元素
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedElements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-[5px] min-h-[300px] max-h-[300px] overflow-y-auto bg-gray-50 p-[10px] rounded-sm">
              {sortedElements.map((element, index) => (
                <LayerItem key={element.id} element={element} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );

  return (
    <div className="flex items-center h-[53px] gap-[10px]">
      <Popover content={layerContent} placement="bottomLeft">
        <div className="h-full">
          <PanelLargeButton
            title="层级排列"
            aspectRatio={false}
            icon={<Layers theme="outline" size="18" fill="#333" />}
            onClick={handleBatchUpdate}
          />
        </div>
      </Popover>
      <PanelSplitLine />
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-[4px]">
          <Tooltip title="背景类型">
            <PanelSelect
              style={{ width: "100%" }}
              size="small"
              value={backgroundType}
              options={[
                {
                  label: "纯色",
                  value: "solidColor",
                },
                {
                  label: "纹理",
                  value: "texture",
                },
              ]}
              onChange={(value) => {
                updatePageProperty("backgroundType", value);
              }}
            />
          </Tooltip>
        </div>
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">背景颜色</span>
          <ColorPicker
            trigger="hover"
            size="small"
            value={background}
            disabled={backgroundType === "texture"}
            onChange={debouncedColorChange("background")}
          />
        </div>
      </div>
      <PanelItemSelect
        displayItems={displayItems}
        moreItems={moreItems}
        selectedValue={selectedTexture}
        onSelect={handleSelect}
        renderItem={renderTextureItem}
        disabled={backgroundType === "solidColor"}
      />
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-[10px] h-[28px]">
          <div className="flex items-center gap-[4px]">
            <span className="text-[12px] text-[#666] mr-[5px]">纹理背景色</span>
            <ColorPicker
              size="small"
              trigger="hover"
              value={bgColor}
              disabled={backgroundType === "solidColor"}
              onChange={debouncedColorChange("bgColor")}
            />
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="text-[12px] text-[#666] mr-[5px]">纹理前景色</span>
            <ColorPicker
              size="small"
              trigger="hover"
              value={fgColor}
              disabled={backgroundType === "solidColor"}
              onChange={debouncedColorChange("fgColor")}
            />
          </div>
        </div>
        <div className="w-full text-[12px] flex items-center h-[28px]">
          <span className="mr-[10px] text-[#666]">透明度</span>
          <Slider
            style={{ flex: 1 }}
            className="relative top-[1px]"
            min={0}
            max={1}
            step={0.1}
            value={bgOpacity}
            disabled={backgroundType === "solidColor"}
            onChange={(value) => {
              updatePageProperty("bgOpacity", value);
            }}
          />
        </div>
      </div>
      <PanelLargeButton
        title="批量修改"
        aspectRatio={false}
        icon={<EditTwo theme="outline" size="18" fill="#333" />}
        onClick={handleBatchUpdate}
      />
      <PanelSplitLine />
      <PanelLargeButton
        title="新建画布"
        aspectRatio={false}
        icon={<Add theme="outline" size="18" fill="#333" />}
        onClick={handleAddPage}
      />
      <PanelLargeButton
        title="复制画布"
        aspectRatio={false}
        icon={<Copy theme="outline" size="18" fill="#333" />}
        onClick={handleDuplicatePage}
        disabled={!pageActive}
      />
      <PanelLargeButton
        title={isPageVisible ? "隐藏幻灯片" : "显示幻灯片"}
        aspectRatio={false}
        icon={
          isPageVisible ? (
            <PreviewCloseOne theme="outline" size="18" fill="#333" />
          ) : (
            <PreviewOpen theme="outline" size="18" fill="#333" />
          )
        }
        onClick={handleTogglePageVisible}
        disabled={!pageActive}
      />
      <PanelLargeButton
        title="删除画布"
        aspectRatio={false}
        icon={<Delete theme="outline" size="18" fill="#333" />}
        onClick={handleDeletePage}
        disabled={!pageActive || pages.length <= 1}
      />
      <PanelLargeButton
        title="重置幻灯片"
        aspectRatio={false}
        icon={<Clear theme="outline" size="18" fill="#333" />}
        onClick={handleResetPage}
        disabled={!pageActive}
      />
    </div>
  );
};
