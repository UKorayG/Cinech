'use client';

import { motion } from 'framer-motion';
import { contestFilm, type ContestEntry } from '@/data/contest';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/components/retro/Reveal';
import { EntryArtwork } from './EntryCard';

type Props = {
  readonly entries: readonly ContestEntry[];
  readonly votesFor: (entry: ContestEntry) => number;
};

const TILTS = [-1.5, 1, -1] as const;

/** İlk üç: krem kartlar, köşede 1. 2. 3. damgası. */
export default function Leaderboard({ entries, votesFor }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <div className="grid gap-8 pt-4 md:grid-cols-3">
      {entries.map((entry, i) => {
        const film = contestFilm(entry);
        return (
          <Reveal key={entry.id} delay={i * 0.08}>
            <motion.div
              className="paper relative flex items-center gap-4 rounded-md p-4 pl-6 text-cinech-ink shadow-hard"
              initial={{ rotate: TILTS[i % TILTS.length] }}
              whileHover={{ rotate: 0, y: -4, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
            >
              <div
                className={`absolute -left-4 -top-4 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-[3px] border-cinech-olive font-display text-2xl leading-none shadow-hard-sm ${
                  i === 0 ? 'bg-cinech-olive text-cinech-cream' : 'bg-cinech-cream text-cinech-olive'
                }`}
                aria-label={`${i + 1}.`}
              >
                {i + 1}.
              </div>
              <div className="w-16 shrink-0 overflow-hidden rounded-sm bg-cinech-ink">
                <EntryArtwork entry={entry} hideText />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl uppercase leading-none tracking-wide">{entry.title}</div>
                <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">
                  {entry.author} · {film?.title ?? '—'}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl leading-none text-cinech-olive">{votesFor(entry)}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'votes' : 'oy'}</span>
                </div>
              </div>
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}
