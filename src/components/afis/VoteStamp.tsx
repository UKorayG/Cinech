'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  readonly count: number;
  readonly voted: boolean;
  readonly disabled?: boolean;
  readonly onToggle: () => void;
  readonly tilt?: number;
  /** Üzerine basıldığı zemin: koyu bantta krem, kâğıtta mürekkep */
  readonly tone?: 'cream' | 'ink';
};

/** Kauçuk damga biçiminde oy düğmesi: basılı değilken kesikli çember, basılıysa zeytin mürekkep. */
export default function VoteStamp({ count, voted, disabled = false, onToggle, tilt = -6, tone = 'cream' }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const idle =
    tone === 'cream'
      ? 'border-dashed border-cinech-cream/40 text-cinech-cream/80 hover:border-cinech-cream hover:text-cinech-cream'
      : 'border-dashed border-cinech-ink/35 text-cinech-ink/70 hover:border-cinech-olive hover:text-cinech-olive';
  const pressed =
    tone === 'cream'
      ? 'border-cinech-cream bg-cinech-olive text-cinech-cream shadow-hard-cream'
      : 'border-cinech-olive bg-cinech-olive text-cinech-cream shadow-hard-sm';
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? (en ? 'Take your vote back' : 'Oyunu geri al') : en ? 'Vote for this poster' : 'Bu afişe oy ver'}
      title={en ? 'Votes are stored on this device' : 'Oylar bu cihazda saklanır'}
      className={`relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-[3px] leading-none transition-colors ${
        voted ? pressed : idle
      } disabled:cursor-not-allowed disabled:opacity-50`}
      initial={{ rotate: tilt }}
      whileHover={disabled ? undefined : { rotate: 0, scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.9, rotate: tilt - 6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 16 }}
    >
      <span className={`pointer-events-none absolute inset-1.5 rounded-full border ${voted ? 'border-cinech-cream/50' : 'border-current opacity-30'}`} aria-hidden />
      <span className="font-display text-2xl">{count}</span>
      <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em]">{voted ? (en ? 'voted' : 'oyladın') : en ? 'vote' : 'oy ver'}</span>
    </motion.button>
  );
}
