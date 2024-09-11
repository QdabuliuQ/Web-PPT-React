import { memo } from 'react'

import style from './index.module.less'
import ButtonGroup from 'antd/es/button/button-group'
import { Button, Tooltip } from 'antd'
import Icon from '@/components/Icon'

export default memo(function PositionButton() {
  return (
    <div className={style.positionButton}>
      <ButtonGroup className={style.buttonGroup}>
        <Tooltip placement="top" title="水平左对齐">
          <Button icon={<Icon icon="i_align_left" />} />
        </Tooltip>
        <Tooltip placement="top" title="水平居中对齐">
          <Button icon={<Icon icon="i_align_hcenter" />} />
        </Tooltip>
        <Tooltip placement="top" title="水平右对齐">
          <Button icon={<Icon icon="i_align_right" />} />
        </Tooltip>
        <Tooltip placement="top" title="水平垂直对齐">
          <Button icon={<Icon icon="i_align_center" />} />
        </Tooltip>
        <Tooltip placement="top" title="垂直顶对齐">
          <Button icon={<Icon icon="i_align_top" />} />
        </Tooltip>
        <Tooltip placement="top" title="垂直居中对齐">
          <Button icon={<Icon icon="i_align_vcenter" />} />
        </Tooltip>
        <Tooltip placement="top" title="垂直底对齐">
          <Button icon={<Icon icon="i_align_bottom" />} />
        </Tooltip>
      </ButtonGroup>
    </div>
  )
})
