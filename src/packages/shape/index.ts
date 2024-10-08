import { fabric } from 'fabric'

import { getRandomID, initElement } from '@/utils'

import config from './config'

const ICON =
  '<svg t="1726811097352" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4887" width="200" height="200"><path d="M523.264 38.2976c5.888 2.7136 10.624 7.424 13.312 13.312l121.088 264.192c3.9424 8.576 12.0832 14.4896 21.4528 15.5904l288.6656 33.5104a27.0336 27.0336 0 0 1 15.1808 46.7712l-213.8112 196.7616c-6.9632 6.4-10.0608 15.9744-8.192 25.2416l57.3184 284.9024a27.0336 27.0336 0 0 1-39.7824 28.8768l-253.2352-142.5408a27.0336 27.0336 0 0 0-26.5216 0L245.504 947.456a27.0336 27.0336 0 0 1-39.7824-28.8768l57.344-284.9024a27.0336 27.0336 0 0 0-8.192-25.2416l-213.8368-196.7616a27.0336 27.0336 0 0 1 15.1808-46.7712l288.6656-33.536c9.3696-1.0752 17.5104-6.9888 21.4528-15.5648l121.088-264.192c6.2208-13.568 22.272-19.5328 35.84-13.312zM512 192.6912l-71.9104 156.9024a108.16 108.16 0 0 1-85.8624 62.3872l-171.4432 19.8912 127.0016 116.8896a108.1856 108.1856 0 0 1 33.8688 94.72l-1.0752 6.1952-34.048 169.1648 150.4-84.6336a108.1856 108.1856 0 0 1 100.2496-3.072l5.888 3.072 150.3744 84.6336-34.048-169.1648a108.1856 108.1856 0 0 1 28.3136-96.5376l4.5056-4.3776 126.976-116.8896-171.4176-19.8912a108.1856 108.1856 0 0 1-83.2512-57.0624l-2.6112-5.3248L512 192.6912z" p-id="4888"></path></svg>'
const info = {
  title: '图形',
  icon: ICON
}

function createElement(path: string, viewBox: [number, number]) {
  return new Promise((resolve) => {
    fabric.loadSVGFromString(path, (object: fabric.Object[], options: any) => {
      const svg = fabric.util.groupSVGElements(object, options)
      svg.set({
        top: 0,
        left: 0,
        scaleX: viewBox[0] > 1000 ? 100 / viewBox[0] : 0.3,
        scaleY: viewBox[1] > 1000 ? 100 / viewBox[1] : 0.3,
        strokeWidth: viewBox[1] > 1000 ? 50 : 10,
        stroke: '#000',
        property: {
          id: getRandomID(10),
          type: 'shape'
        }
      } as any)
      initElement(svg)
      resolve(svg)
    })
  })
}

export default {
  info,
  createElement,
  config
}
