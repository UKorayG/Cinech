'use client';

import type { Stamp as StampType } from '@/data/journal';
import { useLanguage } from '@/contexts/LanguageContext';

/** Kauçuk damga: kazanıldıysa kırmızı mürekkep, değilse soluk kesikli daire. */
export default function Stamp({ stamp, index = 0 }: { readonly stamp: StampType; readonly index?: number }) {
  const { language } = useLanguage();
  const earned = Boolean(stamp.earnedAt);
  const tilt = ((index % 3) - 1) * 7;
  const date = stamp.earnedAt
    ? new Date(stamp.earnedAt).toLocaleDateString(language === 'en' ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;
  return (
    <div
      className="flex flex-col items-center gap-2 text-center"
      title={language === 'en' ? stamp.descEn : stamp.descTr}
    >
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] p-3 ${
          earned ? 'border-cinech-olive text-cinech-olive mix-blend-multiply' : 'border-dashed border-cinech-ink/25 text-cinech-ink/35'
        }`}
        style={{ transform: `rotate(${tilt}deg)`, opacity: earned ? 0.9 : 1 }}
      >
        <div className={`absolute inset-1.5 rounded-full border ${earned ? 'border-cinech-olive/70' : 'border-cinech-ink/15'}`} />
        <span className="font-display text-sm uppercase leading-tight tracking-wide">{language === 'en' ? stamp.en : stamp.tr}</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-ink/60">
        {earned ? date : language === 'en' ? 'locked' : 'kilitli'}
      </span>
    </div>
  );
}
