import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    home: 'Home',
    scan: 'Scan',
    info: 'Info',
    history: 'History',
    profile: 'My Profile',
    homeScreen: 'Home Screen',
    scanScreen: 'Scan Screen',
    infoScreen: 'Info Screen',
    historyScreen: 'History Screen',
    profileScreen: 'My Profile Screen',
  },
  zh: {
    home: '主页',
    scan: '扫描',
    info: '信息',
    history: '历史记录',
    profile: '我的资料',
    homeScreen: '主页屏幕',
    scanScreen: '扫描屏幕',
    infoScreen: '信息屏幕',
    historyScreen: '历史记录屏幕',
    profileScreen: '我的资料屏幕',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const i18n = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
