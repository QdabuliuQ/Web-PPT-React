import { ContextMenuRef, ContextMenuItem } from '@/components/ContextMenu';
import Icon from '@/components/Icon';
import useStore from '@/stores';
import { getRandomID } from '@/utils';
import { useCallback, useMemo, useRef } from 'react';

export function useContextMenu() {
  const { canvasDelete, activeElementUpdate, activeCanvasUpdate, canvasInsert } = useStore();

  const canvasId = useRef<string>('');
  const contextMenuRef = useRef<ContextMenuRef | null>(null);
  const contextMenuData = useMemo<Array<ContextMenuItem>>(
    () => [
      {
        prefix: <Icon icon="i_copy" style={{ marginRight: '10px' }} />,
        title: '复制幻灯片',
        key: 'copy',
      },
      {
        prefix: <Icon icon="i_delete" style={{ marginRight: '10px' }} />,
        title: '删除幻灯片',
        key: 'delete',
      },
    ],
    []
  );

  const menuClick = useCallback((_: unknown, key: string) => {
    const { activeCanvas, canvas } = useStore.getState();

    if (key === 'copy') {
      for (let i = 0; i < canvas.length; i++) {
        if (canvas[i].id === canvasId.current) {
          const canvasInfo = JSON.parse(JSON.stringify(canvas[i]));
          canvasInfo.id = getRandomID(10);
          canvasInsert(canvasInfo, i);
          break;
        }
      }
    } else if (key === 'delete') {
      // 删除画布
      canvasDelete(canvasId.current);
      activeElementUpdate('');
      if (activeCanvas === canvasId.current) {
        activeCanvasUpdate('');
      }
    }
    canvasId.current = '';
    contextMenuRef.current!.hide();
  }, []);
  const contextMenuEvent = (ev: React.MouseEvent<HTMLDivElement>, id: string) => {
    ev.preventDefault();
    canvasId.current = id;
    contextMenuRef.current!.show(ev.clientX, ev.clientY);
  };

  return {
    menuClick,
    contextMenuRef,
    contextMenuEvent,
    contextMenuData,
  };
}
