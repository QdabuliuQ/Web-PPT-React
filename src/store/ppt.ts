import { makeAutoObservable } from "mobx";  
import type { ITextProps } from "@/element/Text";

type IPage = Array<{
    id: string
    elements: Array<ITextProps>
}>

interface IPPT {
    pages: IPage
}


class PageInfoStore {
    pptInfo: IPPT = {
        pages: []
    }

    constructor() {
        makeAutoObservable(this);
    }

    setPages = (pages: IPage) => {
        this.pptInfo.pages = pages;
        this.pptInfo = { ...this.pptInfo }
    }
    
    getPages = () => {
        return this.pptInfo.pages;
    }

    resetPages = () => {
        this.pptInfo.pages = []
        this.pptInfo = { ...this.pptInfo }
    }

    setElementInfo(pageId: string, elementId: string, elementInfo: ITextProps) {
        for (let i = 0; i < this.pptInfo.pages.length; i++) {
            if (this.pptInfo.pages[i].id === pageId) {
                for (let j = 0; j < this.pptInfo.pages[i].elements.length; j++) {
                    if (this.pptInfo.pages[i].elements[j].id === elementId) {
                        this.pptInfo.pages[i].elements[j] = { ...elementInfo };
                    }
                }
            }
        }
        this.pptInfo = { ...this.pptInfo }
    }
}

export const pageInfoStore = new PageInfoStore();