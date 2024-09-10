import { Controller } from '@/enums'
import type {
  ColorPickerProps,
  InputNumberProps,
  InputProps,
  SelectProps,
  SliderSingleProps,
  SwitchProps
} from 'antd'

export namespace Config {
  export interface Common<T extends keyof typeof Controller> {
    type: T
    title: string
    key: string
  }

  export interface ColorPicker extends Common<'colorPicker'> {
    property?: ColorPickerProps
  }
  export interface InputNumber extends Common<'inputNumber'> {
    property?: InputNumberProps
  }
  export interface Input extends Common<'input'> {
    property?: InputProps
  }
  export interface Select extends Common<'select'> {
    property?: SelectProps
  }
  export interface Switch extends Common<'switch'> {
    property?: SwitchProps
  }
  export interface Slider extends Common<'slider'> {
    property?: SliderSingleProps
  }
  export type Item =
    | ColorPicker
    | InputNumber
    | Input
    | Select
    | Switch
    | Slider
}
