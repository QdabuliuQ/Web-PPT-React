import {
  copyElementStore,
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { cloneDeep, getRandomId } from "@/utils";

/**
 * 新建页面（插入到指定页面之后），并切换到新页面。
 */
export function addPageAndActivate(
  afterPageId?: string | null,
  onSuccess?: (newPageId: string) => void
) {
  const newPageId = pptStore.addPage(afterPageId || undefined);
  if (!newPageId) return null;
  elementActiveStore.resetElementActive();
  menuActiveStore.resetMenu();
  pageActiveStore.setPageActive(newPageId);
  onSuccess?.(newPageId);
  return newPageId;
}

/**
 * 复制指定页面，并切换到新页面。
 */
export function duplicatePageAndActivate(
  pageId: string | null | undefined,
  onSuccess?: (newPageId: string) => void
) {
  if (!pageId) return null;
  const newPageId = pptStore.duplicatePage(pageId);
  if (!newPageId) return null;

  elementActiveStore.resetElementActive();
  menuActiveStore.resetMenu();
  pageActiveStore.setPageActive(newPageId);
  onSuccess?.(newPageId);
  return newPageId;
}

/**
 * 删除指定页面；成功后清空选中元素、重置菜单，并切到剩余页面中的第一个。
 */
export function deletePageAndFallback(pageId: string | null | undefined) {
  if (!pageId) return;
  const success = pptStore.deletePage(pageId);
  if (!success) return;

  elementActiveStore.resetElementActive();
  menuActiveStore.resetMenu();

  const remainingPages = pptStore.getPages();
  if (remainingPages.length > 0) {
    pageActiveStore.setPageActive(remainingPages[0].id);
  }
}

/**
 * 重置（清空元素）指定页面；成功后清空选中元素、重置菜单。
 */
export function resetPageElements(pageId: string | null | undefined) {
  if (!pageId) return;
  const pageIndex = pptStore.getPages().findIndex((p) => p.id === pageId);
  if (pageIndex === -1) return;

  const pages = [...pptStore.getPages()];
  pages[pageIndex] = {
    ...pages[pageIndex],
    elements: [],
  };
  pptStore.setPages(pages);
  elementActiveStore.resetElementActive();
  menuActiveStore.resetMenu();
}

/**
 * 复制当前选中元素
 */
export function copyActiveElement() {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();
  if (!pageActive || !elementActive) return;
  const element = pptStore.getElementInfo(pageActive, elementActive);
  if (!element) return;
  copyElementStore.setCopiedElement(element);
}

/**
 * 剪切当前选中元素
 */
export function cutActiveElement() {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();
  if (!pageActive || !elementActive) return;
  const element = pptStore.getElementInfo(pageActive, elementActive);
  if (!element) return;
  copyElementStore.setCopiedElement(element);
  menuActiveStore.resetMenu();
  pptStore.removeElementInfo(pageActive, elementActive);
  elementActiveStore.resetElementActive();
}

/**
 * 删除当前选中元素
 */
export function deleteActiveElement() {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();
  if (!pageActive || !elementActive) return;
  const element = pptStore.getElementInfo(pageActive, elementActive);
  if (!element) return;
  menuActiveStore.resetMenu();
  pptStore.removeElementInfo(pageActive, elementActive);
  elementActiveStore.resetElementActive();
}

/**
 * 粘贴已复制的元素（使用当前页面或指定页面）
 */
export function pasteCopiedElement(pageId?: string | null) {
  const targetPageId = pageId || pageActiveStore.getPageActive();
  if (!targetPageId) return;

  const copied = copyElementStore.getCopiedElement();
  if (!copied) return;

  const newElement = cloneDeep(copied);
  newElement.id = `${newElement.id.split("_")[0]}_${getRandomId()}`;
  return pptStore.addElementInfo(targetPageId, newElement as any);
}
