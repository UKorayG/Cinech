'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RetroHud from '@/components/retro/RetroHud';
import { Display, Script } from '@/components/retro/Display';

/** 404: boş koltuk */
export default function NotFound() {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <section className="relative flex min-h-[70vh] items-center bg-cinech-ink py-20 text-cinech-cream">
      <RetroHud tl="[404]" tr={en ? '[Empty seat]' : '[Boş koltuk]'} bl="STOP" br="REC --:--:--" tone="cream" />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="relative inline-block">
          <Display as="h1" className="text-7xl text-cinech-cream md:text-9xl" shadow="red">
            {en ? 'Empty seat' : 'Boş koltuk'}
          </Display>
          <Script className="pointer-events-none absolute -bottom-6 right-0 -rotate-6 whitespace-nowrap text-4xl text-cinech-brown-light md:text-5xl">
            {en ? 'wrong row' : 'yanlış sıra'}
          </Script>
        </div>
        <p className="mt-10 text-sm text-cinech-cream/70">
          {en ? 'There is no screening at this address. The usher will walk you back to the lobby.' : 'Bu adreste gösterim yok. Yer gösterici seni fuayeye geri götürür.'}
        </p>
        <Link href="/" className="btn-cream mt-8 !px-5 !py-2.5 !text-sm">
          <ArrowLeft className="h-4 w-4" /> {en ? 'Back to the lobby' : 'Fuayeye dön'}
        </Link>
      </div>
    </section>
  );
}
