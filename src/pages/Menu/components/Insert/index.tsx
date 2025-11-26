import { IconButton } from "@/element/Icon";
import { ImageButton } from "@/element/Image";
import { MindMapButton } from "@/element/MindMap";
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
    </div>
  );
};
