'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

type Language = 'tr' | 'en';

type Translations = {
  [key: string]: {
    tr: string;
    en: string;
  };
};

const translations: Translations = {
  welcome: {
    tr: 'Hoş Geldiniz',
    en: 'Welcome',
  },
  home: {
    tr: 'Ana Sayfa',
    en: 'Home',
  },
  movies: {
    tr: 'Filmler',
    en: 'Movies',
  },
  howItWorks: {
    tr: 'Nasıl Çalışır?',
    en: 'How It Works',
  },
  connectWallet: {
    tr: 'Cüzdan Bağla',
    en: 'Connect Wallet',
  },
  // Daha fazla çeviri buraya eklenecek
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
