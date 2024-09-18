import { memo, useCallback, useRef, useState } from 'react'
import { Form, Input, Modal } from 'antd'

import ButtonItem from '@/components/ButtonItem'
import useStore from '@/stores'

import link from './index'

import style from './index.module.less'

interface Props {
  finish: (option: any) => void
}

function Main(props: Props) {
  const { activeCanvas } = useStore()

  const clickEvent = useCallback(() => {
    if (activeCanvas) {
      setVisible(true)
    }
  }, [activeCanvas])

  const [visible, setVisible] = useState(false)

  const [form] = Form.useForm()
  const formRef = useRef<any>()
  const onOk = useCallback(() => {
    formRef.current.validateFields(['text', 'url']).then(() => {
      props.finish(
        link.createElement(
          form.getFieldValue('text'),
          form.getFieldValue('url')
        )
      )
      setVisible(false)
    })
  }, [])
  const onCancel = useCallback(() => {
    setVisible(false)
    formRef.current.resetFields(['text', 'url'])
  }, [])

  return (
    <>
      <Modal
        title="插入超链接"
        centered
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form
          ref={formRef}
          style={{ marginTop: '15px' }}
          layout="vertical"
          form={form}
        >
          <Form.Item
            rules={[{ required: true, message: '${label}不能为空' }]}
            required
            name="text"
            label="文本内容"
          >
            <Input placeholder="请输入文本内容" />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: '${label}不能为空' }]}
            required
            name="url"
            label="超链接"
          >
            <Input placeholder="请输入跳转链接" />
          </Form.Item>
        </Form>
      </Modal>
      <ButtonItem
        disabled={activeCanvas === ''}
        clickEvent={clickEvent}
        icon={
          <span
            className={style.iconSpan}
            dangerouslySetInnerHTML={{
              __html: link.info.icon
            }}
          ></span>
        }
        title={link.info.title}
      />
    </>
  )
}

export default memo(Main)
