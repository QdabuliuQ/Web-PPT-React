/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 等待元素可见
       */
      waitForVisible(selector: string, timeout?: number): Chainable<void>;
      
      /**
       * 点击并等待
       */
      clickAndWait(selector: string): Chainable<void>;
    }
  }
}

export {};

