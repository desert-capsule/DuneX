import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, Translations } from "@/i18n/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("dunex-lang") as Lang) || "en";
  });

  const isRTL = lang === "ar";
  const t = translations[lang];

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("dunex-lang", newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    if (isRTL) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
