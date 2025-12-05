import { makeAutoObservable } from "mobx";

class RemarkEditActiveStore {
  remarkEditActive: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setRemarkEditActive = (active: boolean) => {
    this.remarkEditActive = active;
  };

  getRemarkEditActive = () => {
    return this.remarkEditActive;
  };

  toggleRemarkEditActive = () => {
    this.remarkEditActive = !this.remarkEditActive;
  };

  resetRemarkEditActive = () => {
    this.remarkEditActive = false;
  };
}

export const remarkEditActiveStore = new RemarkEditActiveStore();
