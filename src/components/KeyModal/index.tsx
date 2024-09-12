import { memo, useMemo } from 'react'
import { Modal } from 'antd'

import { getAssetsFile } from '@/utils'

import style from './index.module.less'

interface Props {
  open: boolean
  onOk: () => void
  onCancel: () => void
}

const iconMap = new Map<string, string>()
export default memo(function KeyModal({ open, onCancel, onOk }: Props) {
  const keys = useMemo(
    () => [
      {
        groupTitle: '元素快捷键',
        keys: [
          {
            title: '复制',
            keys: ['ctrl', 'c']
          },
          {
            title: '锁定/解锁',
            keys: ['ctrl', 'l']
          },
          {
            title: '删除',
            keys: ['ctrl', 'd']
          },
          {
            title: '上移一层',
            keys: ['shift', '1']
          },
          {
            title: '下移一层',
            keys: ['shift', '2']
          },
          {
            title: '置于顶层',
            keys: ['shift', '3']
          },
          {
            title: '置于底层',
            keys: ['shift', '4']
          },
          {
            title: '水平左对齐',
            keys: ['ctrl', '1']
          },
          {
            title: '水平居中对齐',
            keys: ['ctrl', '2']
          },
          {
            title: '水平右对齐',
            keys: ['ctrl', '3']
          },
          {
            title: '水平垂直对齐',
            keys: ['ctrl', '4']
          },
          {
            title: '垂直顶对齐',
            keys: ['ctrl', '5']
          },
          {
            title: '垂直居中对齐',
            keys: ['ctrl', '6']
          },
          {
            title: '垂直底对齐',
            keys: ['ctrl', '7']
          }
        ]
      },
      {
        groupTitle: '幻灯片快捷键',
        keys: [
          {
            title: '新建',
            keys: ['shift', 'n']
          },
          {
            title: '复制',
            keys: ['shift', 'c']
          },
          {
            title: '删除',
            keys: ['shift', 'd']
          },
          {
            title: '清空',
            keys: ['shift', 'r']
          },
          {
            title: '显示/隐藏',
            keys: ['shift', 'v']
          }
        ]
      }
    ],
    []
  )

  const getIcon = (icon: string) => {
    if (iconMap.has(icon)) {
      return iconMap.get(icon)
    }
    const url = getAssetsFile(`image/${icon}.png`)
    iconMap.set(icon, url)
    return url
  }

  return (
    <Modal
      width={590}
      centered
      title="快捷键"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
    >
      <div className={style.keyContainer}>
        {keys.map((item) => (
          <div key={item.groupTitle} className={style.groupItem}>
            <div className={style.groupTitle}>{item.groupTitle}</div>
            <div className={style.keys}>
              {item.keys.map((kitem) => (
                <div key={kitem.title} className={style.keyItem}>
                  <div className={style.keyIcon}>
                    {kitem.keys.map((kIcon, index) => (
                      <span key={kIcon}>
                        <img src={getIcon(kIcon)} />{' '}
                        {index !== kitem.keys.length - 1 ? <span>+</span> : ''}
                      </span>
                    ))}
                  </div>
                  {kitem.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
})
