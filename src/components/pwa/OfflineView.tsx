'use client';

import Link from 'next/link';
import { Home, RotateCcw, WifiOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RetroHud from '@/components/retro/RetroHud';
import { Display, Script } from '@/components/retro/Display';

/** Çevrimdışı sayfa gövdesi; service worker gezinti başarısız olunca bunu sunar. */
export default function OfflineView() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center bg-cinech-olive py-20 text-cinech-cream">
      <RetroHud tl={en ? '[Offline]' : '[Çevrimdışı]'} tr={en ? '[No signal]' : '[Sinyal yok]'} bl="PAUSE" br="REC 00" rec />
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="relative max-w-3xl">
          <Display as="h1" className="text-5xl text-cinech-cream md:text-7xl">
            {en ? "Can't reach the projection room" : 'Projeksiyon odasına ulaşılamıyor'}
          </Display>
          <Script className="pointer-events-none absolute -bottom-5 left-[8%] -rotate-6 whitespace-nowrap text-4xl text-cinech-ink/90 md:text-5xl">
            {en ? 'no signal' : 'sinyal yok'}
          </Script>
        </div>

        <div className="paper mt-12 max-w-md rounded-md p-5 text-cinech-ink shadow-hard">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-cinech-olive" />
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">{en ? 'Connection lost' : 'Bağlantı koptu'}</div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-cinech-ink/75">
            {en
              ? 'The reel is still on the shelf. Check your connection and try again; the film resumes where the lights went out.'
              : 'Makara hâlâ rafta. Bağlantını kontrol edip tekrar dene; ışıklar söndüğü yerden devam ederiz.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => window.location.reload()} className="btn-olive !px-5 !py-2.5 !text-xs">
              <RotateCcw className="h-4 w-4" /> {en ? 'Retry' : 'Tekrar dene'}
            </button>
            <Link href="/" className="btn-outline !px-5 !py-2.5 !text-xs text-cinech-ink">
              <Home className="h-4 w-4" /> {en ? 'Home' : 'Ana sayfa'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
