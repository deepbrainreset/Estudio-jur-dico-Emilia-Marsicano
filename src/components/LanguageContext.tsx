import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../i18n/translations";
import { TranslationDict } from "../types";

export interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang && translations[urlLang]) {
        return urlLang;
      }
      const savedLang = localStorage.getItem("preferredLanguage");
      if (savedLang && translations[savedLang]) {
        return savedLang;
      }
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (browserLang && translations[browserLang]) {
        return browserLang;
      }
    }
    return "es";
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang && translations[urlLang]) {
        setLanguage(urlLang);
      } else {
        setLanguage("es");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);
      
      // Update URL query parameter silently without page reload
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.pushState({}, "", url.toString());
    }
  };

  const t = (key: string): string => {
    const parts = key.split(".");
    let current: any = translations[language];
    for (const part of parts) {
      current = current?.[part];
      if (current === undefined) {
        // Fallback to Spanish (es)
        let fallback: any = translations.es;
        for (const p of parts) {
          fallback = fallback?.[p];
        }
        return fallback || key;
      }
    }
    return current || key;
  };

  const languages = Object.keys(translations);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
