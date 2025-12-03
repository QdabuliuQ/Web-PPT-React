import { makeAutoObservable } from "mobx";

class ElementHoverActiveStore {
  elementHoverActive: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setElementHoverActive = (elementHoverActive: string) => {
    this.elementHoverActive = elementHoverActive;
  };

  getElementHoverActive = () => {
    return this.elementHoverActive;
  };

  isElementHoverActive = (elementHoverActive: string) => {
    return this.elementHoverActive === elementHoverActive;
  };

  resetElementHoverActive = () => {
    this.elementHoverActive = "";
  };
}

export const elementHoverActiveStore = new ElementHoverActiveStore();

