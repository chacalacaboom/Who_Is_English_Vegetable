import React, { createContext, useState, useContext } from 'react';

// 1. 建立字典
const translations = {
  zh: {
    title: "誰是菜英文",
    quiz: "單字測驗",
    news: "時事新聞",
    cards: "製作單字卡",
    switch: "切換成英文",
    welcome: "提升你的英語戰鬥力"
  },
  en: {
    title: "English Noob No More",
    quiz: "Vocabulary Quiz",
    news: "Current News",
    cards: "Flashcards",
    switch: "Switch to Chinese",
    welcome: "Level up your English skills"
  }
};

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh');

  const toggleLang = () => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  // 將字典內容和切換函數都傳下去
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 建立一個方便使用的 Hook
export const useLanguage = () => useContext(LanguageContext);