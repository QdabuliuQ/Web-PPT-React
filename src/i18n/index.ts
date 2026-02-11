import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

// 从 localStorage 获取保存的语言设置，默认为中文
const savedLanguage = localStorage.getItem('language') || 'zh-CN';

i18n
  .use(initReactI18next) // 将 i18n 传递给 react-i18next
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
    lng: savedLanguage, // 默认语言
    fallbackLng: 'zh-CN', // 回退语言
    interpolation: {
      escapeValue: false, // React 已经做了转义
    },
  });

export default i18n;
