import { memo, useState, useRef, useEffect, type FC } from "react";
import { MovableWrapper } from "@/components";
import styles from "./index.module.less";
import { observer } from "mobx-react-lite";
import { pageInfoStore, pageActiveStore, elementActiveStore } from "@/store";

export interface ITextProps {
    type: "text"
    id: string
    text: string
    fontSize: number
    fontWeight: number
    fontFamily: string
    color: string
    x: number
    y: number
    width: number
    height: number
    rotate: number
    zIndex: number
    // 元素选中回调
    onSelect?: () => void
}

const Component: FC<ITextProps> = (props) => {
    const { 
        id, 
        text, 
        x, 
        y, 
        width, 
        height, 
        fontSize, 
        fontWeight,
        fontFamily,
        color, 
        rotate, 
        zIndex,
        onSelect
    } = props
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    
    // 从 MobX store 中获取选中状态
    const isSelected = elementActiveStore.isElementActive(id);
    
    // 拖拽开始
    const handleDragStart = () => {
        setIsDragging(true);
    };

    // 拖拽结束
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // 缩放开始
    const handleResizeStart = () => {
        setIsDragging(true);
    };

    // 缩放结束
    const handleResizeEnd = () => {
        setIsDragging(false);
    };

    // 旋转开始
    const handleRotateStart = () => {
        setIsDragging(true);
    };

    // 旋转结束
    const handleRotateEnd = () => {
        setIsDragging(false);
    };

    // 选中元素
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.();
    };

    // 进入编辑模式
    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // 防止在拖拽状态下误触发编辑
        if (isDragging) {
            return;
        }
        
        setIsEditing(true);
    };

    // 保存编辑
    const handleSave = () => {
        if (textRef.current) {
            const newText = textRef.current.textContent || '';
            if (newText !== text) {
                pageInfoStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
                    ...props,
                    text: newText
                })
            }
        }
        setIsEditing(false);
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发拖拽
        
        if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl + Enter 保存
            handleSave();
        } else if (e.key === 'Escape') {
            // Esc 取消编辑，恢复原文本
            if (textRef.current) {
                textRef.current.textContent = text;
            }
            setIsEditing(false);
        }
    };

    // 点击外部保存
    const handleBlur = () => {
        handleSave();
    };

    // 同步文本内容到 contentEditable 元素
    useEffect(() => {
        if (textRef.current && !isEditing) {
            textRef.current.textContent = text;
        }
    }, [text, isEditing]);

    // 自动聚焦和选择文本
    useEffect(() => {
        if (isEditing && textRef.current) {
            // 进入编辑模式时，确保不在拖拽状态
            setIsDragging(false);
            
            // 设置内容
            textRef.current.textContent = text;
            
            // 聚焦
            textRef.current.focus();
            
            // 选择所有文本
            const range = document.createRange();
            range.selectNodeContents(textRef.current);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [isEditing, text]);

    // 添加全局鼠标事件监听，防止拖拽状态卡住
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            // 鼠标释放时重置拖拽状态
            setIsDragging(false);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []);

    // 动态样式（位置、大小、颜色等）
    const dynamicStyle = {
        left: x,
        top: y,
        width: width,
        height: height,
        transform: `rotate(${rotate}deg)`,
        zIndex: zIndex,
        fontSize: fontSize,
        fontWeight: fontWeight,
        fontFamily: fontFamily,
        color: color,
    };

    // 组合CSS类名
    const className = [
        styles.textElement,
        isEditing ? styles.editing : '',
        isDragging ? styles.dragging : '',
        isSelected && !isEditing ? styles.selected : '',
        !text && !isEditing ? styles.empty : ''
    ].filter(Boolean).join(' ');

    return (
        <>
            <div 
                ref={textRef}
                id={id}
                className={className}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                style={dynamicStyle}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onKeyDown={isEditing ? handleKeyDown : undefined}
                onBlur={isEditing ? handleBlur : undefined}
            >
                {text || (isEditing ? '' : '')}
            </div>
            
            {/* 只在非编辑模式下显示拖拽控件 */}
            {!isEditing && (
                <MovableWrapper
                    id={id}
                    active={isSelected} // 根据选中状态控制激活
                    containerSelector="#canvas-container"
                    bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onResizeStart={handleResizeStart}
                    onResizeEnd={handleResizeEnd}
                    onRotateStart={handleRotateStart}
                    onRotateEnd={handleRotateEnd}
                />
            )}
        </>
    );
}

export const Text = memo(observer(Component))
