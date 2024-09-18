import { fabric } from 'fabric'

import { getRandomID, initElement } from '@/utils'

import config from './config'

const ICON =
  '<svg t="1726194879189" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2998" width="48" height="48"><path d="M831.792397 82.404802 191.548594 82.404802c-60.676941 0-110.042255 49.364291-110.042255 110.042255l0 640.245849c0 60.677964 49.364291 110.042255 110.042255 110.042255l640.244826 0c60.677964 0 110.042255-49.364291 110.042255-110.042255L941.835675 192.447057C941.834652 131.769093 892.470361 82.404802 831.792397 82.404802zM191.548594 122.420167l640.244826 0c38.612413 0 70.02689 31.414477 70.02689 70.02689l0 134.349871c-144.759965 4.953825-280.06151 63.59234-382.864898 166.396751-48.28061 48.28061-86.814228 103.732549-114.628714 163.962306-80.588433-68.744687-197.638289-73.051783-282.803971-12.938684L121.522728 192.447057C121.521704 153.834644 152.935158 122.420167 191.548594 122.420167zM121.521704 832.691883l0-136.601144c74.040297-72.025407 192.529945-71.925123 266.451538 0.301875-23.496134 62.998823-35.762505 130.383536-35.762505 199.672622 0 2.336208 0.420579 4.569062 1.157359 6.652514L191.548594 902.717749C152.935158 902.718773 121.521704 871.304296 121.521704 832.691883zM831.792397 902.718773 391.068743 902.718773c0.735757-2.084475 1.157359-4.317329 1.157359-6.652514 0-141.581576 55.054897-274.608312 155.023726-374.578164 95.245248-95.245248 220.499973-149.720953 354.570481-154.655336l0 465.860147C901.819287 871.304296 870.40481 902.718773 831.792397 902.718773z"  p-id="2999"></path><path d="M349.471346 477.533001c75.04723 0 136.102794-61.054541 136.102794-136.101771s-61.055564-136.102794-136.102794-136.102794-136.102794 61.055564-136.102794 136.102794S274.424116 477.533001 349.471346 477.533001zM349.471346 245.343801c52.982702 0 96.087429 43.104727 96.087429 96.087429 0 52.982702-43.104727 96.087429-96.087429 96.087429-52.982702 0-96.087429-43.104727-96.087429-96.087429C253.383918 288.448528 296.488645 245.343801 349.471346 245.343801z"  p-id="3000"></path></svg>'

function info() {
  return {
    title: '图片',
    icon: ICON
  }
}

function createElement(
  dataUrl: any,
  width: number,
  height: number,
  option: any = {}
) {
  return new Promise((resolve) => {
    const scale =
      width > 800 || height > 500 ? Math.max(width / 800, height / 500) : 1

    fabric.Image.fromURL(dataUrl, (image: any) => {
      image.set({
        top: 0, // 距离画布上边的距离
        left: 0, // 距离画布左侧的距离，单位是像素
        ...option,
        width: width / scale,
        height: height / scale,
        crossOrigin: 'anonymous', // 跨域
        stroke: 'rgba(0,0,0,0)',
        strokeWidth: 0,
        skewX: false,
        skewY: false,
        property: {
          id: getRandomID(10),
          type: 'image'
        }
      })

      initElement(image)

      resolve(image)
    })
  })
}

export default {
  info,
  createElement,
  config
}