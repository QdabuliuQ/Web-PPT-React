import { memo, useCallback, useMemo, useRef, useState } from 'react'
import {
  Image as AntImage,
  Input,
  message,
  Modal,
  Tabs,
  UploadProps
} from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import { debounce } from 'lodash'

import ButtonItem from '@/components/ButtonItem'
import useStore from '@/stores'
import { getImageSize, validateFile } from '@/utils'

import info from './index'
import image from './index'

import style from './index.module.less'

interface Props {
  finish: (...args: Array<any>) => any
}

export default memo(function Main({ finish }: Props) {
  const { activeCanvas } = useStore()

  const clickEvent = useCallback(() => {
    if (activeCanvas) {
      setVisible(true)
    }
  }, [activeCanvas])

  const width = useRef(0)
  const height = useRef(0)

  const [visible, setVisible] = useState(false)

  const items = useMemo(
    () => [
      {
        key: 'file',
        label: '图片上传'
      },
      {
        key: 'link',
        label: '图片链接'
      }
    ],
    []
  )
  const [messageApi, contextHolder] = message.useMessage()

  const [uploadType, setUploadType] = useState('file')
  const onChange = useCallback((e: string) => {
    setUploadType(e)
    if (e === 'link') {
      setFileList([])
    }
  }, [])
  const [fileList, setFileList] = useState<Array<string>>([])
  const uploadChangeEvent = useCallback((info: any) => {
    const res = validateFile(
      info.file as unknown as File,
      ['image/png', 'image/jpeg', 'image/jpg'],
      2
    )
    if (!res.status)
      return messageApi.open({
        type: 'error',
        content: res.msg
      })

    const reader = new FileReader()
    reader.onloadend = async function callback() {
      // 读取完成后的回调函数
      setFileList([reader.result as string])
      const size: any = await getImageSize(reader.result as string)
      console.log(size)

      width.current = size.width
      height.current = size.height
    }
    console.log(info)

    reader.readAsDataURL(info.file.originFileObj as Blob)
    return null
  }, [])

  const config = useMemo<UploadProps>(
    () => ({
      name: 'file',
      multiply: false,
      maxCount: 1,
      onChange: uploadChangeEvent,
      fileList: [],
      customRequest() {}
    }),
    []
  )

  const inputChange = useCallback(
    debounce(({ target: { value } }: any) => {
      if (
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/.test(
          value
        )
      ) {
        const image = new Image()
        image.src = value
        image.onload = function () {
          setFileList([value])
          width.current = image.width
          height.current = image.height
        }
        image.onerror = function () {
          setFileList([])
          messageApi.error('图片URL无效')
        }
      }
    }, 200),
    []
  )

  const cancelEvent = useCallback(() => {
    setVisible(false)
  }, [])
  const confirmEvent = useCallback(async () => {
    if (!fileList.length) {
      return messageApi.error('请上传或添加图片')
    }
    const element = await info.createElement(
      fileList[0],
      width.current,
      height.current
    )

    finish(element)

    setVisible(false)
    setFileList([])
  }, [fileList])

  return (
    <>
      {contextHolder}
      <Modal
        okText="确定"
        cancelText="取消"
        centered
        title="插入图片"
        open={visible}
        onOk={confirmEvent}
        onCancel={cancelEvent}
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        {uploadType === 'file' ? (
          <>
            <Dragger {...config}>
              <p className="ant-upload-text">点击或者拖拽文件进行上传</p>
              <p className="ant-upload-hint">支持上传的文件大小不超过2MB</p>
            </Dragger>
            {fileList.length ? (
              <AntImage
                className={style.image}
                style={{
                  marginTop: '10px'
                }}
                width={130}
                src={fileList[0]}
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            <Input onChange={inputChange} placeholder="请输入图片地址" />
            {fileList.length ? (
              <AntImage
                className={style.image}
                style={{
                  marginTop: '10px'
                }}
                width={130}
                src={fileList[0]}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </Modal>
      <ButtonItem
        disabled={activeCanvas === ''}
        clickEvent={clickEvent}
        icon={
          <span
            className={style.iconSpan}
            dangerouslySetInnerHTML={{
              __html: image.info().icon
            }}
          ></span>
        }
        title={image.info().title}
      />
    </>
  )
})
