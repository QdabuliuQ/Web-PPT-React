export const Border = [
  {
    label: "实线",
    value: "solid",
  },
  {
    label: "虚线",
    value: "dashed",
  },
  {
    label: "点线",
    value: "dotted",
  },
];

export const PlacementMapped = {
  "left-top": "flex-start flex-start",
  "left-center": "center flex-start",
  "left-bottom": "flex-end flex-start",
  "center-top": "flex-start center",
  "center-center": "center center",
  "center-bottom": "flex-end center",
  "right-top": "flex-start flex-end",
  "right-center": "center flex-end",
  "right-bottom": "flex-end flex-end",
};

export const FontSize = Array.from({ length: (50 - 12) / 2 + 1 }, (_, i) => {
  const size = 12 + i * 2;
  return { label: size, value: size };
});
