import { Controller } from '@/enums';
import type { ColorPickerProps, InputNumberProps, InputProps } from 'antd';

type EnumValues<T> = T[keyof T];

export namespace Config {
  export interface Item {
    type: EnumValues<typeof Controller>;
    title: string;
    key: string;
    property?: InputNumberProps | InputProps | ColorPickerProps;
  }
}
