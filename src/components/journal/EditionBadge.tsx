'use client';

import { RARITIES, type Edition, type Rarity } from '@/data/editions';
import { useLanguage } from '@/contexts/LanguageContext';

const STYLE: Readonly<Record<Rarity, string>> = {
  standart: 'border-cinech-ink/30 bg-transparent text-cinech-ink/70',
  gece: 'border-cinech-ink bg-cinech-ink text-cinech-cream',
  altin: 'border-cinech-brown bg-cinech-brown-light text-cinech-cream shadow-hard-brown',
  gala: 'border-cinech-olive-dark bg-cinech-olive text-cinech-cream shadow-hard-sm',
};

type Props = {
  readonly edition: Edition;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
  /** Yalnızca kademe adını göster, kodu gizle */
  readonly compact?: boolean;
};

/** Koçanın edisyon etiketi: kademe adı + seri kodu (ör. GALA · YNK-G-0007) */
export default function EditionBadge({ edition, size = 'sm', className = '', compact = false }: Props) {
  const { language } = useLanguage();
  const info = RARITIES[edition.rarity];
  const label = language === 'en' ? info.en : info.tr;
  return (
    <span
      title={language === 'en' ? info.descEn : info.descTr}
      className={`inline-flex items-center gap-2 rounded-sm border-2 font-mono uppercase ${
        size === 'md' ? 'px-3 py-1.5 text-[11px] tracking-[0.25em]' : 'px-2 py-0.5 text-[9px] tracking-[0.2em]'
      } ${STYLE[edition.rarity]} ${className}`}
    >
      <span className="font-bold">{label}</span>
      {compact ? null : <span className="opacity-80">{edition.code}</span>}
    </span>
  );
}
