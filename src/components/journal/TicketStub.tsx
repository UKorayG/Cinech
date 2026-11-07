'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check } from 'lucide-react';
import type { JournalEntry } from '@/data/journal';
import type { Film } from '@/data/films';
import { editionOf, type Rarity } from '@/data/editions';
import EditionBadge from './EditionBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import Stars from './Stars';

type Props = {
  readonly entry: JournalEntry;
  readonly film: Film;
  readonly index?: number;
  readonly onUpdate?: (patch: Partial<Pick<JournalEntry, 'rating' | 'note'>>) => void;
  readonly onRemove?: () => void;
};

const RAIL: Readonly<Record<Rarity, string>> = {
  standart: 'border-cinech-brown/60',
  gece: 'border-cinech-ink',
  altin: 'border-cinech-brown-light',
  gala: 'border-cinech-olive',
};

/** Deftere yapıştırılmış bilet koçanı: afiş küpürü, künye, edisyon, yıldızlar ve el yazısı not. */
export default function TicketStub({ entry, film, index = 0, onUpdate, onRemove }: Props) {
  const { language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.note);
  const tilt = ((index % 2) * 2 - 1) * 1.2;
  const edition = editionOf(entry, film);
  const date = new Date(entry.watchedAt).toLocaleString(language === 'en' ? 'en-GB' : 'tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.article
      className="paper relative flex gap-4 rounded-md p-4 pl-7 text-cinech-ink shadow-hard"
      initial={{ rotate: tilt }}
      whileHover={{ rotate: 0, y: -4, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
    >
      <div className={`absolute inset-y-3 left-3 border-l-2 border-dashed ${RAIL[edition.rarity]}`} aria-hidden />
      <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-cinech-ink">
        {film.image ? (
          <Image src={film.image} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: film.imageFocus ?? '50% 30%' }} />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(180deg, ${film.palette.accent2}66, ${film.palette.bg}), ${film.palette.bg}` }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center font-display text-[10px] uppercase tracking-wide text-cinech-cream">
          {film.title}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">
            <span>
              № {String(entry.stubNo).padStart(6, '0')} · {entry.room} · {language === 'en' ? 'Seat' : 'Koltuk'} {entry.seat}
            </span>
            <EditionBadge edition={edition} />
          </div>
          <div className="flex items-center gap-1">
            {onUpdate ? (
              <button
                type="button"
                onClick={() => {
                  if (editing) onUpdate({ note: draft });
                  setEditing((v) => !v);
                }}
                className="rounded-full p-1 text-cinech-ink/50 hover:text-cinech-olive"
                aria-label={editing ? (language === 'en' ? 'Save' : 'Kaydet') : language === 'en' ? 'Edit note' : 'Notu düzenle'}
              >
                {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            ) : null}
            {onRemove ? (
              <button type="button" onClick={onRemove} className="rounded-full p-1 text-cinech-ink/40 hover:text-cinech-olive" aria-label={language === 'en' ? 'Remove stub' : 'Koçanı çıkar'}>
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        <h3 className="mt-1 font-display text-2xl uppercase leading-none tracking-wide">
          {film.title} {film.episode ? <span className="text-cinech-olive">· {film.episode}</span> : null}
        </h3>
        <div className="mt-1 text-[11px] text-cinech-ink/60">{date}</div>
        <div className="mt-2">
          <Stars value={entry.rating} onChange={onUpdate ? (v) => onUpdate({ rating: v }) : undefined} />
        </div>
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-sm border-2 border-dashed border-cinech-brown/40 bg-transparent p-2 font-script text-xl leading-tight text-cinech-ink outline-none focus:border-cinech-olive"
          />
        ) : entry.note ? (
          <p className="mt-2 font-script text-xl leading-tight text-cinech-ink/85">“{entry.note}”</p>
        ) : null}
      </div>
    </motion.article>
  );
}
