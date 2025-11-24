import { IconPanel, IconPanelKey } from "@/element/Icon";
import { ImagePanel, ImagePanelKey } from "@/element/Image";
import { TablePanel, TablePanelKey } from "@/element/Table";
import { TextPanel, TextPanelKey } from "@/element/Text";
import { Animation } from "./Animation";
import { Insert } from "./Insert";
import { Start } from "./Start";
import { Toggle } from "./Toggle";

export default {
  start: Start,
  insert: Insert,
  toggle: Toggle,
  animation: Animation,
  [TextPanelKey]: TextPanel,
  [TablePanelKey]: TablePanel,
  [IconPanelKey]: IconPanel,
  [ImagePanelKey]: ImagePanel,
};
