import { IconPanel, IconPanelKey } from "@/element/Icon";
import { ImagePanel, ImagePanelKey } from "@/element/Image";
import { MindMapPanel, MindMapPanelKey } from "@/element/MindMap";
import { TablePanel, TablePanelKey } from "@/element/Table";
import { TextPanel, TextPanelKey } from "@/element/Text";
import { Animation } from "./Animation";
import { Insert } from "./Insert";
import { Start } from "./Start";
import { Toggle } from "./Toggle";
import { View } from "./View";

export default {
  start: Start,
  insert: Insert,
  toggle: Toggle,
  animation: Animation,
  view: View,
  [TextPanelKey]: TextPanel,
  [TablePanelKey]: TablePanel,
  [IconPanelKey]: IconPanel,
  [ImagePanelKey]: ImagePanel,
  [MindMapPanelKey]: MindMapPanel,
};
