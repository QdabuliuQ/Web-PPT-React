import { Controller } from '@/enums';

type EnumValues<T> = T[keyof T];

export namespace Config {
  export interface Item {
    type: EnumValues<typeof Controller>;
    title: string;
    key: string;
  }
}
