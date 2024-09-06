import { Controller } from '@/enums';

export default [
  {
    title: '水平翻转',
    type: Controller.switch,
    key: 'flipX',
  },
  {
    title: '垂直翻转',
    type: Controller.switch,
    key: 'flipY',
  },
  {
    title: '边框颜色',
    type: Controller.colorPicker,
    key: 'stroke',
  },
  {
    title: '边框宽度',
    type: Controller.inputNumber,
    key: 'strokeWidth',
  },
  {
    title: '倾斜X',
    type: Controller.inputNumber,
    key: 'skewX',
  },
  {
    title: '倾斜Y',
    type: Controller.inputNumber,
    key: 'skewY',
  },
  {
    title: '透明度',
    type: Controller.slider,
    property: {
      max: 1,
      min: 0,
      step: 0.1,
    },
    key: 'opacity',
  },
];
