import { Controller } from '@/enums';
import { type Config } from '@/types/config';
import common from './common';

const config: Array<Config.Item> = [
  ...(common as unknown as Array<Config.Item>),
  {
    type: Controller.colorPicker,
    title: '颜色',
    key: 'fill',
  },
  {
    type: Controller.inputNumber,
    title: '水平圆角半径',
    key: 'rx',
    property: {
      min: 0,
      max: 1000,
    },
  },
  {
    type: Controller.inputNumber,
    title: '垂直圆角半径',
    key: 'ry',
    property: {
      min: 0,
      max: 1000,
    },
  },
];

export default config;
