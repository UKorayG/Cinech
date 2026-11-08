'use client';

import { Trash2 } from 'lucide-react';
import { contestFilm, posterFor, type ContestEntry } from '@/data/contest';
import { useLanguage } from '@/contexts/LanguageContext';
import FilmPoster from '@/components/FilmPoster';
import Polaroid from '@/components/retro/Polaroid';
import VoteStamp from './VoteStamp';

/** Girdinin görseli: gönderilmiş afişte yüklenen görsel, tohum girdide kodla üretilen afiş. */
export function EntryArtwork({ entry, hideText = false }: { readonly entry: ContestEntry; readonly hideText?: boolean }) {
  if (entry.image) {
    return (
      <div className="aspect-[3/4] w-full bg-cinech-ink">
        {/* eslint-disable-next-line @next/next/no-img-element -- yerel data URL; next/image optimizasyonu uygulanamaz */}
        <img src={entry.image} alt={entry.title} className="h-full w-full object-cover" draggable={false} />
      </div>
    );
  }
  const film = contestFilm(entry);
  if (!film) return <div className="aspect-[3/4] w-full bg-cinech-ink" />;
  return <FilmPoster film={posterFor(entry, film)} className="aspect-[3/4] rounded-none border-0 shadow-none" interactive={false} hideText={hideText} />;
}

type Props = {
  readonly entry: ContestEntry;
  readonly index?: number;
  readonly votes: number;
  readonly voted: boolean;
  readonly closed?: boolean;
  readonly mine?: boolean;
  readonly onToggleVote: () => void;
  readonly onRemove?: () => void;
};

const TILTS = [-3, 2, -1.5, 2.5, -2, 1.5] as const;

/** Duvara raptiyelenmiş polaroid afiş; altında künye ve oy damgası. */
export default function EntryCard({ entry, index = 0, votes, voted, closed = false, mine = false, onToggleVote, onRemove }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const film = contestFilm(entry);
  const date = new Date(entry.submittedAt).toLocaleDateString(en ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'short' });

  return (
    <article className="flex flex-col gap-5">
      <Polaroid caption={entry.author} tilt={TILTS[index % TILTS.length]} sway={index % 2 === 0}>
        <EntryArtwork entry={entry} />
      </Polaroid>
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-cream/55">
            {film?.title ?? '—'} · {date}
            {mine ? <span className="text-cinech-cream/85"> · {en ? 'yours' : 'senin'}</span> : null}
          </div>
          <h3 className="mt-1.5 truncate font-display text-2xl uppercase leading-none tracking-wide text-cinech-cream">{entry.title}</h3>
          {mine && onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-cream/50 transition-colors hover:text-cinech-cream"
            >
              <Trash2 className="h-3.5 w-3.5" /> {en ? 'Take down' : 'Afişi kaldır'}
            </button>
          ) : null}
        </div>
        <VoteStamp count={votes} voted={voted} disabled={closed} onToggle={onToggleVote} tilt={index % 2 ? 6 : -6} tone="cream" />
      </div>
    </article>
  );
}
