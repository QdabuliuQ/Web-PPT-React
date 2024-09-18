import ButtonItem from "@/components/ButtonItem";
import useStore from "@/stores";
import { memo, useCallback } from "react";

import shape from "./index"

import style from "./index.module.less"

function Main() {
    const { activeCanvas } = useStore()
    
    const clickEvent = useCallback(() => { }, [])

    return (
      <ButtonItem
        disabled={activeCanvas === ''}
        icon={
          <span
            className={style.iconSpan}
            dangerouslySetInnerHTML={{
              __html: shape.info.icon
            }}
          ></span>
        }
        clickEvent={clickEvent}
        title={shape.info.title}
      ></ButtonItem>
    )
}

export default memo(Main);