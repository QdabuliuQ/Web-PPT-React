import { createContext } from 'react'

import { ContextMenuRef } from '@/components/ContextMenu2'

interface ContextMenuProviderInf {
  contextMenuRef: null | ContextMenuRef
}

const ContextMenuProvider = createContext<ContextMenuProviderInf>({
  contextMenuRef: null
})

export default ContextMenuProvider
