import { Controller } from '@/enums';
import { type Config } from '@/types/config';

const config: Array<Config.Item> = [
  {
    type: Controller.colorPicker,
    title: '颜色',
    key: 'flll',
  },
];

export default config;
