import { type FC } from "react";

interface RemarkEditProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const RemarkEdit: FC<RemarkEditProps> = ({ value = "", onChange }) => {
  return (
    <div className="h-[30px] py-[5px] px-[10px] border-t-[1px] border-[#e0e0e0]  mr-[20px]">
      <textarea
        className="w-full resize-none bg-transparent h-[20px] text-[12px] outline-none"
        placeholder="请输入备注"
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
      ></textarea>
    </div>
  );
};
