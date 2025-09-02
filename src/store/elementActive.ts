import { makeAutoObservable } from "mobx";

class ElementActiveStore {
  elementActive: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setElementActive = (elementActive: string | null) => {
    this.elementActive = elementActive;
  };

  getElementActive = () => {
    return this.elementActive;
  };

  isElementActive = (elementActive: string) => {
    return this.elementActive === elementActive;
  };

  resetElementActive = () => {
    this.elementActive = null;
  };
}

export const elementActiveStore = new ElementActiveStore();
