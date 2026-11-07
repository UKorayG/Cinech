'use client';

import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly y?: number;
  readonly rotate?: number;
};

/** Kaydırınca beliren kutu: aşağıdan yukarı, hafif dönüşle; hareket azaltma tercihine saygılı. */
export default function Reveal({ children, className = '', delay = 0, y = 28, rotate = 0 }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
