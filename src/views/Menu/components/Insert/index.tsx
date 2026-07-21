import { ChartButton } from "@/element/Chart";
import { IconButton } from "@/element/Icon";
import { ImageButton } from "@/element/Image";
import { MindMapButton } from "@/element/MindMap";
import { ShapeButton } from "@/element/Shape";
import { TableButton } from "@/element/Table";
import { TextButton } from "@/element/Text";
import { type FC } from "react";

export const Insert: FC = () => {
  return (
    <div className="flex gap-[10px]">
      <TextButton />
      <TableButton />
      <IconButton />
      <ImageButton />
      <MindMapButton />
      <ChartButton />
      <ShapeButton />
    </div>
  );
};
