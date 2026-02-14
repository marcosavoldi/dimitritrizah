import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Language, type Translation } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
  hasSelectedLanguage: boolean;
  completeSelection: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  const completeSelection = () => setHasSelectedLanguage(true);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t: translations[language],
      hasSelectedLanguage,
      completeSelection
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
