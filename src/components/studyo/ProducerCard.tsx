'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, CalendarDays, Film } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPECIALTIES, producerFilms, type Producer } from '@/data/producers';
import FilmPoster from '@/components/FilmPoster';

type Props = {
  readonly producer: Producer;
  readonly index?: number;
};

const TONE = {
  olive: {
    band: 'bg-cinech-olive text-cinech-cream',
    badge: 'bg-cinech-cream text-cinech-olive',
    chip: 'border-cinech-olive text-cinech-olive',
  },
  brown: {
    band: 'bg-cinech-brown text-cinech-cream',
    badge: 'bg-cinech-cream text-cinech-brown',
    chip: 'border-cinech-brown text-cinech-brown',
  },
  ink: {
    band: 'bg-cinech-ink text-cinech-cream',
    badge: 'bg-cinech-cream text-cinech-ink',
    chip: 'border-cinech-ink text-cinech-ink',
  },
} as const;

/** Yapımcı kimlik kartı: askı deliği, renkli üst bant, monogram rozeti, künye, uzmanlık çipleri ve filmografi. */
export default function ProducerCard({ producer, index = 0 }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const films = producerFilms(producer);
  const tone = TONE[producer.tone];
  const tilt = ((index % 2) * 2 - 1) * 1.1;

  return (
    <motion.article
      className="relative h-full"
      initial={{ rotate: tilt }}
      whileHover={{ rotate: 0, y: -6, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
    >
      {/* Askı deliği */}
      <div
        className="absolute left-1/2 top-3 z-10 h-3 w-10 -translate-x-1/2 rounded-full border-2 border-cinech-ink bg-cinech-cream-dark"
        aria-hidden
      />
      <div className="paper flex h-full flex-col overflow-hidden rounded-md border-2 border-cinech-ink text-cinech-ink shadow-hard">
        <div className={`flex items-center justify-between gap-4 px-5 pb-4 pt-8 ${tone.band}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-80">
            [{en ? 'Producer card' : 'Yapımcı kartı'}] № {String(index + 1).padStart(2, '0')}
          </div>
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-cinech-ink font-display text-2xl leading-none shadow-hard-sm ${tone.badge}`}
            aria-hidden
          >
            {producer.monogram}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 py-5">
          <h3 className="font-display text-3xl uppercase leading-none tracking-wide">{producer.name}</h3>
          <div className="mt-1 font-script text-2xl leading-none text-cinech-brown">{producer.studio}</div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-y-2 border-dashed border-cinech-brown/40 py-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <div>
              <dt className="text-cinech-ink/50">{en ? 'City' : 'Şehir'}</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-cinech-ink">
                <MapPin className="h-3 w-3 text-cinech-olive" aria-hidden /> {producer.city}
              </dd>
            </div>
            <div>
              <dt className="text-cinech-ink/50">{en ? 'Since' : 'Kuruluş'}</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-cinech-ink">
                <CalendarDays className="h-3 w-3 text-cinech-olive" aria-hidden /> {producer.since}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-cinech-ink/75">{en ? producer.bio.en : producer.bio.tr}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {producer.specialties.map((s) => (
              <span
                key={s}
                className={`rounded-full border-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${tone.chip}`}
              >
                {en ? SPECIALTIES[s].en : SPECIALTIES[s].tr}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">
              <Film className="h-3.5 w-3.5" aria-hidden /> {en ? 'Filmography' : 'Filmografi'} · {String(films.length).padStart(2, '0')}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {films.map((film) => (
                <Link key={film.id} href={`/film/${film.slug}`} className="group/poster block" title={film.title}>
                  <div className="relative h-28 w-20 overflow-hidden rounded-sm border-2 border-cinech-ink transition-transform duration-300 group-hover/poster:-translate-y-1 group-hover/poster:rotate-1">
                    <FilmPoster film={film} hideText interactive={false} className="h-full w-full !rounded-none !border-0 !shadow-none" />
                  </div>
                  <div className="mt-1 w-20 truncate text-center font-mono text-[9px] uppercase tracking-[0.15em] text-cinech-ink/70 group-hover/poster:text-cinech-olive">
                    {film.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
