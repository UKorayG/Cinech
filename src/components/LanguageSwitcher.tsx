'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-full bg-cinech-ink/30 p-0.5 font-mono text-[11px] font-bold">
      {(['tr', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wider transition-colors ${
            language === code ? 'bg-cinech-cream text-cinech-olive' : 'text-cinech-cream/70 hover:text-cinech-cream'
          }`}
          aria-pressed={language === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
