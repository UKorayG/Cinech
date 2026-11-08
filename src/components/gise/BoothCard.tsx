'use client';

import { motion } from 'framer-motion';

type Props = {
  readonly icon?: React.ReactNode;
  readonly label: string;
  /** Başlık satırının sağına oturan küçük öğe (sayı, rozet) */
  readonly aside?: React.ReactNode;
  readonly tilt?: number;
  readonly className?: string;
  readonly children?: React.ReactNode;
};

/** Gişe penceresi: mürekkep zemin, kesikli ayraç, zeytin blok gölge; üzerine gelince düzelir ve kalkar. */
export default function BoothCard({ icon, label, aside, tilt = 0, className = '', children }: Props) {
  return (
    <motion.div
      className={`relative h-full ${className}`}
      initial={{ rotate: tilt }}
      whileHover={{ rotate: 0, y: -6, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
    >
      <div className="flex h-full flex-col rounded-md border-2 border-cinech-ink bg-cinech-ink text-cinech-cream shadow-hard-olive">
        <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-cinech-cream/25 px-5 py-3">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/70">
            {icon}
            {label}
          </div>
          {aside}
        </div>
        <div className="flex-1 px-5 py-5">{children}</div>
      </div>
    </motion.div>
  );
}
