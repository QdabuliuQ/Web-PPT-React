// 组件测试的支持文件
import { mount } from "cypress/react18";
import "./commands";

// 可以在这里添加全局的组件测试配置
// 例如：导入全局样式、Provider 等

// 导入全局样式
import "../../src/index.css";

// 如果需要 MobX Provider，可以在这里添加
// import { Provider } from "mobx-react-lite";

// Cypress.Commands.add("mount", (component, options) => {
//   return mount(
//     <Provider store={store}>
//       {component}
//     </Provider>,
//     options
//   );
// });

// 导出 mount 供组件测试使用
export { mount };

