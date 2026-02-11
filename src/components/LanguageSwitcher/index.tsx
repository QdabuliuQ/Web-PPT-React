import { Translate } from "@icon-park/react";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    // 触发页面重新渲染以更新antd的语言
    window.location.reload();
  };

  const items: MenuProps["items"] = [
    {
      key: "zh-CN",
      label: "简体中文",
      onClick: () => changeLanguage("zh-CN"),
    },
    {
      key: "en-US",
      label: "English",
      onClick: () => changeLanguage("en-US"),
    },
  ];

  const getCurrentLanguageLabel = () => {
    return i18n.language === "zh-CN" ? "简体中文" : "English";
  };

  return (
    <Dropdown
      menu={{ items, selectedKeys: [i18n.language] }}
      placement="bottomRight"
    >
      <Button
        size="small"
        type="text"
        icon={<Translate theme="outline" size="16" />}
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
      >
        {getCurrentLanguageLabel()}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
