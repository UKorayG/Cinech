'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FilmPoster from '@/components/FilmPoster';
import type { Film } from '@/data/films';

type Props = {
  readonly films: readonly Film[];
  readonly emptyText: string;
  readonly ctaText: string;
  /** Başlığın altındaki küçük künye satırı */
  readonly meta?: (film: Film) => string;
};

/** Koyu kart içinde film listesi: küçük afiş, başlık, künye. Boşsa kataloğa yönlendirir. */
export default function FilmList({ films, emptyText, ctaText, meta }: Props) {
  if (films.length === 0) {
    return (
      <div>
        <p className="text-sm leading-relaxed text-cinech-cream/65">{emptyText}</p>
        <Link href="/#filmler" className="btn-outline mt-4 !px-3 !py-1.5 !text-[10px] text-cinech-cream">
          {ctaText} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-dashed divide-cinech-cream/15">
      {films.map((film) => (
        <li key={film.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="h-14 w-10 shrink-0 overflow-hidden rounded-sm">
            <FilmPoster film={film} hideText interactive={false} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-lg uppercase leading-none tracking-wide text-cinech-cream">
              {film.title}
              {film.episode ? <span className="text-cinech-cream/55"> · {film.episode}</span> : null}
            </div>
            {meta ? (
              <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/55">{meta(film)}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
