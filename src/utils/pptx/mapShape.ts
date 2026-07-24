import type { IShapeProps } from "@/element/Shape";
import type PptxGenJS from "pptxgenjs";
import {
  mapBorderDash,
  parseColor,
  positionFromElement,
  pxToPt,
  toHexColor,
} from "./helpers";

function mapShapeType(
  shapeType: IShapeProps["shapeType"],
  pptx: PptxGenJS
): PptxGenJS.SHAPE_NAME {
  const st = pptx.ShapeType;
  switch (shapeType) {
    case "rect":
      return st.rect;
    case "roundedRect":
      return st.roundRect;
    case "oval":
      return st.ellipse;
    case "triangle":
      return st.triangle;
    case "rightTriangle":
      return st.rtTriangle;
    case "diamond":
      return st.diamond;
    case "pentagon":
      return st.pentagon;
    case "hexagon":
      return st.hexagon;
    case "star5":
      return st.star5;
    case "arrowRight":
      return st.rightArrow;
    case "heart":
      return st.heart;
    default:
      return st.rect;
  }
}

/**
 * 形状 → PPTX（原生 addShape，矢量可编辑）
 */
export function addShapeElement(
  slide: PptxGenJS.Slide,
  el: IShapeProps,
  pptx: PptxGenJS
): void {
  const pos = positionFromElement(el);
  const shapeName = mapShapeType(el.shapeType, pptx);
  const { hex: fillHex, opacity: fillOpacity } = parseColor(
    el.fill,
    "5B8FF9"
  );

  const transparency = Math.round(
    (1 - (el.opacity ?? 1) * fillOpacity) * 100
  );

  const options: PptxGenJS.ShapeProps = {
    ...pos,
    fill: {
      color: fillHex,
      ...(transparency > 0 ? { transparency } : {}),
    },
  };

  if (el.border) {
    const dashType = mapBorderDash(el.borderStyle);
    options.line = {
      color: toHexColor(el.borderColor, "000000"),
      width: pxToPt(el.borderWidth || 1),
      ...(dashType ? { dashType } : {}),
    };
  } else {
    options.line = { color: fillHex, width: 0 };
  }

  if (el.rotate) {
    options.rotate = el.rotate;
  }

  if (el.shapeType === "roundedRect") {
    const short = Math.min(el.width || 1, el.height || 1);
    const px = el.borderRadius ?? 0;
    // pptxgenjs rectRadius: 0–1，相对短边
    options.rectRadius = Math.max(
      0,
      Math.min(0.5, short > 0 ? px / short : 0)
    );
  }

  slide.addShape(shapeName, options);
}
