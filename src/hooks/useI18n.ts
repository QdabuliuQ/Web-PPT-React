import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * 自定义国际化 Hook
 * 封装 react-i18next 的 useTranslation，提供更便捷的使用方式
 */
export const useI18n = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * 改变语言
   * @param lang 语言代码 ('zh-CN' | 'en-US')
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // 刷新页面以更新 antd 的语言
    window.location.reload();
  };

  /**
   * 获取当前语言
   */
  const currentLanguage = i18n.language;

  return {
    t,
    i18n,
    currentLanguage,
    changeLanguage,
  };
};
