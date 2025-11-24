import { makeAutoObservable } from "mobx";
import { elementActiveStore } from "./elementActive";
import { menuActiveStore } from "./menuActive";

export type DisplayStatus = "default" | "grid";

class DisplayStatusStore {
  displayStatus: DisplayStatus = "default";

  constructor() {
    makeAutoObservable(this);
  }

  setDisplayStatus = (status: DisplayStatus) => {
    this.displayStatus = status;
    elementActiveStore.setElementActive("");
    menuActiveStore.setActiveMenu("start");
  };

  getDisplayStatus = () => {
    return this.displayStatus;
  };

  isDefaultMode = () => {
    return this.displayStatus === "default";
  };

  isGridMode = () => {
    return this.displayStatus === "grid";
  };
}

export const displayStatusStore = new DisplayStatusStore();
