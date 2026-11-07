'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { timeLeft, type TimeLeft } from '@/data/contest';

type Props = {
  readonly endsAt: string;
  readonly className?: string;
};

/** Bitişe geri sayım; dakikada bir güncellenir. "12 gün 4 saat kaldı" / "12 days 4 hours left" */
export default function Countdown({ endsAt, className = '' }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setLeft(timeLeft(endsAt, new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (!left) {
    return (
      <span className={`font-display text-4xl leading-none text-cinech-ink ${className}`} aria-live="polite">
        …
      </span>
    );
  }

  if (left.ended) {
    return (
      <span className={`font-display text-3xl uppercase leading-none text-cinech-olive ${className}`} aria-live="polite">
        {en ? 'Voting closed' : 'Oylama kapandı'}
      </span>
    );
  }

  const unit = (n: number, tr: string, one: string, many: string) => (en ? (n === 1 ? one : many) : tr);
  const parts: readonly (readonly [number, string])[] =
    left.days > 0
      ? [
          [left.days, unit(left.days, 'gün', 'day', 'days')],
          [left.hours, unit(left.hours, 'saat', 'hour', 'hours')],
        ]
      : [
          [left.hours, unit(left.hours, 'saat', 'hour', 'hours')],
          [left.minutes, unit(left.minutes, 'dakika', 'minute', 'minutes')],
        ];

  return (
    <span className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`} aria-live="polite">
      {parts.map(([n, label]) => (
        <span key={label} className="flex items-baseline gap-1.5">
          <span className="font-display text-5xl leading-none text-cinech-ink">{n}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">{label}</span>
        </span>
      ))}
      <span className="font-script text-2xl leading-none text-cinech-brown">{en ? 'left' : 'kaldı'}</span>
    </span>
  );
}
