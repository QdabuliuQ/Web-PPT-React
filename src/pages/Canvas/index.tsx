import { memo, useEffect, type FC } from "react";
import MockData from "@/mock";
import { observer } from "mobx-react-lite";
import { pageActiveStore, elementActiveStore } from "@/store";
import { useMemoizedFn } from "ahooks";
import { Text } from "@/element/Text";
import { pageInfoStore } from "@/store";

const Component: FC = () => {

  useEffect(() => {
    pageInfoStore.setPages(JSON.parse(JSON.stringify(MockData)).pages);

    const pages = pageInfoStore.getPages();
    console.log(pages, 'pagespages');
    
    if (pages.length > 0) {
      pageActiveStore.setPageActive(pages[0].id);
    }
  }, []);

  // 处理画布点击事件，取消所有元素选中
  const handleCanvasClick = (e: React.MouseEvent) => {
    // 检查点击的是否是画布本身（而不是其中的元素）
    if (e.target === e.currentTarget) {
      elementActiveStore.resetElementActive();
    }
  };

  // 处理元素选中
  const handleElementSelect = (elementId: string) => {
    elementActiveStore.setElementActive(elementId);
  };

  const renderElements = useMemoizedFn(() => {
    const page = pageInfoStore.getPages()
    if (!page.length) return null
    
    const { elements } = page[0];
    const items: React.ReactNode[] = [];
    elements.forEach((element) => {
      if (element.type === "text") {
        items.push(
          <Text 
            key={element.id} 
            {...element} 
            type="text"
            onSelect={() => handleElementSelect(element.id)}
          />
        );
      }
    });
    return items;
  });

  return (
    <div className="w-[100%] h-[100%] flex items-center justify-center">
      <div
        id="canvas-container"
        className="relative w-[1000px] h-[700px] bg-[#fff] overflow-hidden"
        onClick={handleCanvasClick}
      >
        {renderElements()}
      </div>
    </div>
  );
};

export const Canvas: FC = memo(observer(Component));
