'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type BeforeInstallPromptEvent = Event & {
  readonly prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * "Uygulamayı yükle" hap düğmesi. Yalnızca tarayıcı beforeinstallprompt olayını
 * tetiklediğinde görünür; koordinatör istediği yere yerleştirir (burada bağlanmaz).
 */
export default function InstallPrompt({ className = '' }: { readonly className?: string }) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!deferred) return null;

  const install = async () => {
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setDeferred(null);
    } catch {
      setDeferred(null);
    }
  };

  return (
    <button
      type="button"
      onClick={install}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-cinech-cream bg-cinech-ink px-3 py-1.5 font-cinech text-xs font-bold uppercase tracking-[0.15em] text-cinech-cream shadow-hard-sm transition-transform active:translate-x-[1px] active:translate-y-[1px] ${className}`}
    >
      <Download className="h-4 w-4" />
      {en ? 'Install app' : 'Uygulamayı yükle'}
    </button>
  );
}

export { InstallPrompt };
