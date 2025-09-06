'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-200 z-50 flex items-center gap-2"
      aria-label={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      {language === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}
