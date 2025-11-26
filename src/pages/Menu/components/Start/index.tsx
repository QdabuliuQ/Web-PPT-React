import {
  PanelItemSelect,
  PanelLargeButton,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import {
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import {
  Add,
  Clear,
  Copy,
  Delete,
  EditTwo,
  PreviewCloseOne,
  PreviewOpen,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { ColorPicker, Slider, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useRef, type FC } from "react";
import { textureItems } from "./texture";

export const Start: FC = observer(() => {
  // 获取当前页面
  const pageActive = pageActiveStore.getPageActive();
  const currentPage = pageActive ? pptStore.getActivePage(pageActive) : null;

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
    const page = pptStore.getActivePage(pageActive);
    if (!page) return;

    const pageIndex = pptStore.getPages().findIndex((p) => p.id === pageActive);
    if (pageIndex === -1) return;

    const newPages = [...pptStore.getPages()];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      [property]: value,
    } as any;
    pptStore.setPages(newPages);
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
    const pages = pptStore.getPages();
    const newPages = pages.map((page) => ({
      ...page,
      backgroundType: backgroundType,
      background: background,
      bgColor: bgColor,
      fgColor: fgColor,
      bgOpacity: bgOpacity,
      selectedTexture: selectedTexture,
    }));
    pptStore.setPages(newPages);
  });

  // 新建画布（在当前页面后添加新页面）
  const handleAddPage = useMemoizedFn(() => {
    if (!pageActive) return;
    const newPageId = pptStore.addPage(pageActive);
    elementActiveStore.resetElementActive();
    menuActiveStore.resetMenu();
    pageActiveStore.setPageActive(newPageId);
  });

  // 复制画布（复制当前页面）
  const handleDuplicatePage = useMemoizedFn(() => {
    if (!pageActive) return;
    const newPageId = pptStore.duplicatePage(pageActive);
    if (newPageId) {
      elementActiveStore.resetElementActive();
      menuActiveStore.resetMenu();
      pageActiveStore.setPageActive(newPageId);
    }
  });

  // 删除画布（删除当前页面）
  const handleDeletePage = useMemoizedFn(() => {
    if (!pageActive) return;
    const success = pptStore.deletePage(pageActive);
    if (success) {
      elementActiveStore.resetElementActive();
      menuActiveStore.resetMenu();
      const remainingPages = pptStore.getPages();
      if (remainingPages.length > 0) {
        // 切换到第一个页面
        pageActiveStore.setPageActive(remainingPages[0].id);
      }
    }
  });

  // 隐藏/显示幻灯片（切换当前页面的可见性）
  const handleTogglePageVisible = useMemoizedFn(() => {
    if (!pageActive) return;
    pptStore.togglePageVisible(pageActive);
  });

  // 重置幻灯片（清空当前页面的所有元素）
  const handleResetPage = useMemoizedFn(() => {
    if (!pageActive) return;
    const pageIndex = pptStore.getPages().findIndex((p) => p.id === pageActive);
    if (pageIndex !== -1) {
      const pages = [...pptStore.getPages()];
      pages[pageIndex] = {
        ...pages[pageIndex],
        elements: [],
      };
      pptStore.setPages(pages);
      elementActiveStore.resetElementActive();
      menuActiveStore.resetMenu();
    }
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

  return (
    <div className="flex items-center h-[53px] gap-[10px]">
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
        disabled={!pageActive || pptStore.getPages().length <= 1}
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
});
