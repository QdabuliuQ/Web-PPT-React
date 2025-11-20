import { IconPanel, IconPanelKey } from "@/element/Icon";
import { ImagePanel, ImagePanelKey } from "@/element/Image";
import { TablePanel, TablePanelKey } from "@/element/Table";
import { TextPanel, TextPanelKey } from "@/element/Text";
import { Insert } from "./Insert";
import { Start } from "./Start";

export default {
  start: Start,
  insert: Insert,
  [TextPanelKey]: TextPanel,
  [TablePanelKey]: TablePanel,
  [IconPanelKey]: IconPanel,
  [ImagePanelKey]: ImagePanel,
};
