import { type FC } from "react";
interface ITextPanelProps {
    title: string
};

export const TextPanel: FC<ITextPanelProps> = () => {
    return (
        <div>
            TextPanel
        </div>
    );
}

(TextPanel as unknown as { title: string }).title = "文本";