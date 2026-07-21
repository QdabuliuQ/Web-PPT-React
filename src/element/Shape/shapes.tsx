import type { FC, SVGProps } from "react";

export const SHAPE_TYPES = [
  "rect",
  "roundedRect",
  "oval",
  "triangle",
  "rightTriangle",
  "diamond",
  "pentagon",
  "hexagon",
  "star5",
  "arrowRight",
  "heart",
] as const;

export type ShapeType = (typeof SHAPE_TYPES)[number];

type ShapePathProps = {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

/** viewBox 0–100，随元素宽高拉伸 */
const svgBaseProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 100 100",
  preserveAspectRatio: "none",
  width: "100%",
  height: "100%",
  overflow: "visible",
};

function strokeAttrs(props: ShapePathProps) {
  const sw = props.strokeWidth ?? 0;
  return {
    fill: props.fill,
    stroke: sw > 0 ? props.stroke || "#000000" : "none",
    strokeWidth: sw > 0 ? sw : 0,
    strokeDasharray: sw > 0 ? props.strokeDasharray : undefined,
    vectorEffect: "non-scaling-stroke" as const,
  };
}

/** 正五角星路径（中心 50,50） */
function star5Path(outer = 48, inner = 20): string {
  const cx = 50;
  const cy = 50;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `M ${points.join(" L ")} Z`;
}

function regularPolygonPath(sides: number, radius = 46): string {
  const cx = 50;
  const cy = 50;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / sides;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return `M ${points.join(" L ")} Z`;
}

export const ShapeSvg: FC<{ shapeType: ShapeType } & ShapePathProps> = ({
  shapeType,
  ...pathProps
}) => {
  const attrs = strokeAttrs(pathProps);

  switch (shapeType) {
    case "rect":
      return (
        <svg {...svgBaseProps}>
          <rect x={2} y={2} width={96} height={96} {...attrs} />
        </svg>
      );
    case "roundedRect":
      return (
        <svg {...svgBaseProps}>
          <rect x={2} y={2} width={96} height={96} rx={14} ry={14} {...attrs} />
        </svg>
      );
    case "oval":
      return (
        <svg {...svgBaseProps}>
          <ellipse cx={50} cy={50} rx={48} ry={48} {...attrs} />
        </svg>
      );
    case "triangle":
      return (
        <svg {...svgBaseProps}>
          <polygon points="50,4 96,96 4,96" {...attrs} />
        </svg>
      );
    case "rightTriangle":
      return (
        <svg {...svgBaseProps}>
          <polygon points="4,4 4,96 96,96" {...attrs} />
        </svg>
      );
    case "diamond":
      return (
        <svg {...svgBaseProps}>
          <polygon points="50,4 96,50 50,96 4,50" {...attrs} />
        </svg>
      );
    case "pentagon":
      return (
        <svg {...svgBaseProps}>
          <path d={regularPolygonPath(5)} {...attrs} />
        </svg>
      );
    case "hexagon":
      return (
        <svg {...svgBaseProps}>
          <path d={regularPolygonPath(6)} {...attrs} />
        </svg>
      );
    case "star5":
      return (
        <svg {...svgBaseProps}>
          <path d={star5Path()} {...attrs} />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...svgBaseProps}>
          <polygon points="4,30 60,30 60,10 96,50 60,90 60,70 4,70" {...attrs} />
        </svg>
      );
    case "heart":
      return (
        <svg {...svgBaseProps}>
          <path
            d="M50 88 C20 65 4 48 4 30 C4 16 14 6 28 6 C38 6 46 12 50 20 C54 12 62 6 72 6 C86 6 96 16 96 30 C96 48 80 65 50 88 Z"
            {...attrs}
          />
        </svg>
      );
    default:
      return (
        <svg {...svgBaseProps}>
          <rect x={2} y={2} width={96} height={96} {...attrs} />
        </svg>
      );
  }
};

export function borderDashArray(
  style: string,
  width: number
): string | undefined {
  if (style === "dashed") return `${width * 3} ${width * 2}`;
  if (style === "dotted") return `${width} ${width * 2}`;
  if (style === "double") return undefined;
  return undefined;
}
