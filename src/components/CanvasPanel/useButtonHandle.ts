import useStore from "@/stores";
import { Fabric } from "@/types/fabirc";
import { useCallback } from "react";

export default function useButtonHandle() {
  const { canvasFabricOptionUpdate } = useStore()

  const updateAllEvent = useCallback(() => {
    const { activeCanvas, canvas } = useStore.getState()
    for (let i = 0; i < canvas.length; i++) {
      if (canvas[i].id === activeCanvas) {
        const bgRect = canvas[i].fabricOption.objects[0]
        for (let j = 0; j < canvas.length; j++) {
          if (canvas[j].id !== activeCanvas) {
            canvas[j].fabricOption.objects[0].fill = JSON.parse(JSON.stringify(bgRect.fill))
            canvasFabricOptionUpdate(canvas[j].id, JSON.parse(JSON.stringify(canvas[j].fabricOption)))
          }
        }
        break
      }
    }
  }, [])

  const resetAllEvent = useCallback(() => {
    const { canvas } = useStore.getState()
    for (let i = 0; i < canvas.length; i++) {
      canvas[i].fabricOption.objects[0].fill = undefined
      canvasFabricOptionUpdate(canvas[i].id, canvas[i].fabricOption)
    }
  }, [])

  return {
    updateAllEvent,
    resetAllEvent
  }
}