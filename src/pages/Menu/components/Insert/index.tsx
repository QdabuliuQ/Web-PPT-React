import { IconButton } from "@/element/Icon";
import { TableButton } from "@/element/Table";
import { TextButton } from "@/element/Text";
import { type FC } from "react";

export const Insert: FC = () => {
  return (
    <div className="flex gap-[10px]">
      <TextButton />
      <TableButton />
      <IconButton />
    </div>
  );
};
