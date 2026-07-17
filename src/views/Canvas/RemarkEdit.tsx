import { type FC } from "react";

interface RemarkEditProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const RemarkEdit: FC<RemarkEditProps> = ({ value = "", onChange }) => {
  return (
    <div className="h-[32px] py-[6px] px-[12px] border-t border-[#e8e8e8] mr-[20px] bg-[#fafafa]">
      <textarea
        className="w-full resize-none bg-transparent h-[20px] text-[12px] leading-[20px] text-[#595959] outline-none placeholder:text-[#bfbfbf]"
        placeholder="请输入备注"
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
      ></textarea>
    </div>
  );
};
