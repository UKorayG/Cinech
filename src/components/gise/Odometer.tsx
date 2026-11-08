'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Props = {
  readonly value: number;
  /** Basamak sayısı; eksikler soluk sıfırla doldurulur */
  readonly digits?: number;
  readonly className?: string;
};

/** Mekanik sayaç: her basamak krem bir tambur, değer değişince yukarıdan aşağı döner. */
export default function Odometer({ value, digits = 5, className = '' }: Props) {
  const reduced = useReducedMotion();
  const raw = String(Math.max(0, Math.floor(value)));
  const text = raw.padStart(digits, '0');
  const padded = text.length - raw.length;

  return (
    <div
      role="img"
      aria-label={raw}
      className={`inline-flex items-stretch gap-1.5 rounded-md border-2 border-cinech-ink bg-cinech-ink-light p-2 shadow-hard-olive ${className}`}
    >
      {text.split('').map((digit, i) => (
        <div key={i} className="relative h-16 w-11 overflow-hidden rounded-sm bg-cinech-cream sm:h-20 sm:w-14">
          <AnimatePresence initial={false}>
            <motion.span
              key={digit}
              initial={reduced ? false : { y: '-100%' }}
              animate={{ y: 0 }}
              exit={reduced ? undefined : { y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26, delay: (digits - 1 - i) * 0.04 }}
              className={`absolute inset-0 flex items-center justify-center font-display text-5xl leading-none sm:text-6xl ${
                i < padded ? 'text-cinech-ink/25' : 'text-cinech-ink'
              }`}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-cinech-ink/25" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cinech-ink/20 via-transparent to-cinech-ink/20" aria-hidden />
        </div>
      ))}
    </div>
  );
}
