'use client';

import { motion } from 'framer-motion';
import Pin from './Pin';

type Props = {
  readonly label?: string;
  readonly title?: string;
  readonly tilt?: number;
  readonly pinned?: boolean;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly children?: React.ReactNode;
};

/** Krem bilet kartı: perforasyon çizgisi, raptiye, blok gölge, hafif eğim; üzerine gelince kalkar ve düzelir. */
export default function TicketCard({ label, title, tilt = 0, pinned = true, className = '', onClick, children }: Props) {
  return (
    <motion.div
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      initial={{ rotate: tilt }}
      whileHover={{ rotate: 0, y: -6, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {pinned ? (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <Pin />
        </div>
      ) : null}
      <div className="paper rounded-md text-cinech-ink shadow-hard">
        {label || title ? (
          <div className="border-b-2 border-dashed border-cinech-brown px-6 pb-4 pt-7 text-center">
            {label ? (
              <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-cinech-olive">{label}</div>
            ) : null}
            {title ? (
              <div className="mt-1 font-display text-3xl uppercase leading-none tracking-wide text-cinech-olive">{title}</div>
            ) : null}
          </div>
        ) : null}
        <div className="px-6 py-5">{children}</div>
      </div>
    </motion.div>
  );
}
