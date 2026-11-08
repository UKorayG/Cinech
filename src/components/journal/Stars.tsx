'use client';

import { Star } from 'lucide-react';

type Props = {
  readonly value: number;
  readonly onChange?: (value: number) => void;
  readonly size?: 'sm' | 'md';
};

/** Kırmızı yıldızlar; onChange verilirse tıklanabilir. */
export default function Stars({ value, onChange, size = 'sm' }: Props) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : undefined} aria-label="Puan">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform disabled:cursor-default`}
          aria-label={`${n}`}
          aria-pressed={onChange ? n <= value : undefined}
        >
          <Star className={`${dim} ${n <= value ? 'fill-cinech-brown text-cinech-brown' : 'text-cinech-ink/25'}`} />
        </button>
      ))}
    </div>
  );
}
