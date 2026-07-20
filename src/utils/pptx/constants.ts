import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/constants/canvas";

/** 自定义 PPT 布局：与画布同比例 16:9（1000×562.5 → 10"×5.625"） */
export const PPTX_LAYOUT_NAME = "LAYOUT_WEBPPT";
export const PPTX_WIDTH_IN = 10;
export const PPTX_HEIGHT_IN = (CANVAS_HEIGHT / CANVAS_WIDTH) * PPTX_WIDTH_IN;
export const PX_PER_INCH = CANVAS_WIDTH / PPTX_WIDTH_IN;

export { CANVAS_WIDTH, CANVAS_HEIGHT };
