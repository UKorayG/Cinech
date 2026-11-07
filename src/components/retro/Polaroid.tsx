'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Pin from './Pin';

type Props = {
  readonly caption?: string;
  readonly tilt?: number;
  readonly className?: string;
  /** Raptiyeden asılıymış gibi hafifçe sallansın */
  readonly sway?: boolean;
  readonly children: React.ReactNode;
};

/** Krem çerçeveli, raptiyeli, el yazısı alt yazılı polaroid. Üzerine gelince düzelir. */
export default function Polaroid({ caption, tilt = -3, className = '', sway = true, children }: Props) {
  const reduced = useReducedMotion();
  const swinging = sway && !reduced;
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ transformOrigin: '50% 0%' }}
      initial={{ rotate: tilt }}
      animate={swinging ? { rotate: [tilt - 1.2, tilt + 1.2, tilt - 1.2] } : { rotate: tilt }}
      transition={swinging ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <Pin />
      </div>
      <div className="paper rounded-sm p-3 pb-14 shadow-hard">
        <div className="overflow-hidden rounded-sm bg-cinech-ink">{children}</div>
        {caption ? (
          <div className="absolute inset-x-0 bottom-3 text-center font-script text-2xl text-cinech-brown">{caption}</div>
        ) : null}
      </div>
    </motion.div>
  );
}
