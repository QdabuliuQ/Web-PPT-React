import { copyElementStore, pptStore } from "@/store";
import { getRandomId } from "@/utils";
import { useMemoizedFn } from "ahooks";

export default function useOperationElement(
  pageActive: string,
  elementActive: string
) {
  const element = pptStore.getElementInfo(pageActive, elementActive);

  const copyHandle = useMemoizedFn(() => {
    if (!element) return;
    copyElementStore.setCopiedElement(element);
  });

  const cutHandle = useMemoizedFn(() => {
    if (!element) return;
    copyElementStore.setCopiedElement(element);
    pptStore.removeElementInfo(pageActive, elementActive);
  });

  const deleteHandle = useMemoizedFn(() => {
    if (!element) return;
    pptStore.removeElementInfo(pageActive, elementActive);
  });

  const pasteHandle = useMemoizedFn(() => {
    const copied = copyElementStore.getCopiedElement();
    if (!copied) return;

    const newElement = JSON.parse(JSON.stringify(copied));
    newElement.id = `${newElement.id.split("_")[0]}_${getRandomId()}`;
    pptStore.addElementInfo(pageActive, newElement as any);
  });

  return {
    copyHandle,
    cutHandle,
    deleteHandle,
    pasteHandle,
  };
}
