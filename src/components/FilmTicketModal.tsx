'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Play, Heart, Bell, BellRing, Vote, BookOpen, Check, CalendarPlus, ExternalLink } from 'lucide-react';
import type { Film } from '@/data/films';
import { useLanguage } from '@/contexts/LanguageContext';
import FilmPoster from './FilmPoster';
import FilmFrame from './retro/FilmFrame';
import Pin from './retro/Pin';
import AddToJournalForm from './journal/AddToJournalForm';
import type { NewEntry } from '@/hooks/useJournal';
import type { JournalEntry } from '@/data/journal';
import { editionOf, type Edition } from '@/data/editions';
import { buildIcs, downloadIcs } from '@/lib/ics';
import EditionBadge from './journal/EditionBadge';

type Props = {
  readonly film: Film | null;
  readonly favorites: readonly string[];
  readonly reminders: readonly string[];
  readonly onClose: () => void;
  readonly onWatch: (film: Film) => void;
  readonly onToggleFavorite: (id: string) => void;
  readonly onToggleReminder: (id: string) => void;
  /** Film defterde mi */
  readonly inJournal?: boolean;
  /** Verilirse "İzledim, deftere ekle" düğmesi görünür */
  readonly onAddToJournal?: (entry: NewEntry) => JournalEntry | void;
};

const T = {
  ticket: { tr: 'Sinema bileti', en: 'Cinema ticket' },
  admitOne: { tr: 'Tek kişilik', en: 'Admit one' },
  director: { tr: 'Yönetmen', en: 'Director' },
  runtime: { tr: 'Süre', en: 'Runtime' },
  screening: { tr: 'Gösterim', en: 'Screening' },
  minutes: { tr: 'dk', en: 'min' },
  watch: { tr: 'Şimdi izle', en: 'Watch now' },
  coming: { tr: 'Yakında', en: 'Coming soon' },
  remind: { tr: 'Hatırlat', en: 'Remind me' },
  reminded: { tr: 'Hatırlatılacak', en: 'Reminder set' },
  fav: { tr: 'Favori', en: 'Favourite' },
  faved: { tr: 'Favoride', en: 'Favourited' },
  back: { tr: "DAO'da destekle", en: 'Back it in the DAO' },
  close: { tr: 'Kapat', en: 'Close' },
  tbd: { tr: 'Tarih açıklanacak', en: 'Date to be announced' },
  addJournal: { tr: 'İzledim, deftere ekle', en: 'Watched, add to journal' },
  inJournal: { tr: 'Defterde', en: 'In journal' },
  pasted: { tr: 'Koçan deftere yapıştırıldı.', en: 'Stub pasted into your journal.' },
  openJournal: { tr: 'Defteri aç', en: 'Open journal' },
  ics: { tr: 'Takvime ekle', en: 'Add to calendar' },
  filmPage: { tr: 'Film sayfası', en: 'Film page' },
} as const;

const ticketNumber = (id: string) => {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000000;
  return String(h).padStart(6, '0');
};

export const formatScreening = (iso: string | undefined, language: string, long = true) => {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(language === 'en' ? 'en-GB' : 'tr-TR', long ? { day: '2-digit', month: 'long', year: 'numeric' } : { day: '2-digit', month: 'short' });
};

/** Bilet biçiminde film detayı: afiş, künye, özet, favori ve hatırlatma. */
export default function FilmTicketModal({
  film,
  favorites,
  reminders,
  onClose,
  onWatch,
  onToggleFavorite,
  onToggleReminder,
  inJournal = false,
  onAddToJournal,
}: Props) {
  const { language } = useLanguage();
  const t = (k: keyof typeof T) => (language === 'en' ? T[k].en : T[k].tr);
  const [adding, setAdding] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [lastEdition, setLastEdition] = useState<Edition | null>(null);

  useEffect(() => {
    setAdding(false);
    setPasted(false);
    setLastEdition(null);
  }, [film?.id]);

  useEffect(() => {
    if (!film) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [film, onClose]);

  return (
    <AnimatePresence>
      {film ? (
        <motion.div
          key={film.id}
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-cinech-ink/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={film.title}
            className="relative w-full max-w-4xl"
            initial={{ y: 48, rotate: -2, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: 30, rotate: 1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          >
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
              <Pin />
            </div>
            <div className="paper grid max-h-[85vh] overflow-y-auto rounded-md text-cinech-ink shadow-hard md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="border-b-2 border-dashed border-cinech-brown p-4 md:border-b-0 md:border-r-2">
                <FilmFrame>
                  <FilmPoster film={film} className="aspect-[3/4] rounded-none border-0 shadow-none" interactive={false} />
                </FilmFrame>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">
                  <span>{t('admitOne')}</span>
                  <span>№ {ticketNumber(film.id)}</span>
                </div>
              </div>

              <div className="relative p-6 md:p-8">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('close')}
                  className="absolute right-4 top-4 rounded-full border-2 border-cinech-ink/20 p-1.5 text-cinech-ink/60 transition-colors hover:border-cinech-olive hover:text-cinech-olive"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap items-center justify-between gap-2 pr-10 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                  <span>
                    [{t('ticket')}] · {film.genre}
                  </span>
                  <Link href={`/film/${film.slug}`} onClick={onClose} className="inline-flex items-center gap-1 text-cinech-brown transition-colors hover:text-cinech-olive">
                    {t('filmPage')} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <h2 className="mt-3 font-display text-5xl uppercase leading-[0.9] tracking-wide text-cinech-olive md:text-6xl">
                  {film.title}
                  {film.episode ? <span className="block text-3xl text-cinech-ink md:text-4xl">{film.episode}</span> : null}
                </h2>
                <p className="mt-2 font-script text-2xl text-cinech-ink/80">{film.tagline}</p>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-y-2 border-dashed border-cinech-ink/20 py-4 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <div>
                    <dt className="text-cinech-ink/50">{t('director')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">{film.director}</dd>
                  </div>
                  <div>
                    <dt className="text-cinech-ink/50">{t('runtime')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">
                      {film.durationMinutes} {t('minutes')} · {film.year}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-cinech-ink/50">{t('screening')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">
                      {formatScreening(film.releaseDate, language) ?? t('tbd')}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 text-sm leading-relaxed text-cinech-ink/80">{film.synopsis}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {film.status === 'available' && film.videoUrl ? (
                    <button type="button" onClick={() => onWatch(film)} className="btn-olive !px-5 !py-2.5 !text-sm">
                      <Play className="h-4 w-4" /> {t('watch')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleReminder(film.id)}
                      className={`${reminders.includes(film.id) ? 'btn-ink' : 'btn-olive'} !px-5 !py-2.5 !text-sm`}
                    >
                      {reminders.includes(film.id) ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {reminders.includes(film.id) ? t('reminded') : t('remind')}
                    </button>
                  )}
                  {film.releaseDate ? (
                    <button
                      type="button"
                      onClick={() => downloadIcs(`cinech-${film.slug}.ics`, buildIcs([film], { lang: language, origin: window.location.origin }))}
                      className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-ink"
                    >
                      <CalendarPlus className="h-4 w-4" /> {t('ics')}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(film.id)}
                    className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-ink"
                    aria-pressed={favorites.includes(film.id)}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(film.id) ? 'fill-cinech-brown text-cinech-brown' : ''}`} />
                    {favorites.includes(film.id) ? t('faved') : t('fav')}
                  </button>
                  <Link href="/dao" className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-ink/70">
                    <Vote className="h-4 w-4" /> {t('back')}
                  </Link>
                  {onAddToJournal ? (
                    inJournal || pasted ? (
                      <Link href="/defter" className="btn-ink !px-5 !py-2.5 !text-sm">
                        <Check className="h-4 w-4" /> {t('inJournal')} · {t('openJournal')}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => setAdding((v) => !v)} className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-olive">
                        <BookOpen className="h-4 w-4" /> {t('addJournal')}
                      </button>
                    )
                  ) : null}
                </div>
                {adding && onAddToJournal && !pasted ? (
                  <AddToJournalForm
                    film={film}
                    onSubmit={(entry) => {
                      const created = onAddToJournal(entry);
                      if (created) setLastEdition(editionOf(created, film));
                      setAdding(false);
                      setPasted(true);
                    }}
                    onCancel={() => setAdding(false)}
                  />
                ) : null}
                {pasted ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <p className="font-script text-2xl text-cinech-brown">{t('pasted')}</p>
                    {lastEdition ? <EditionBadge edition={lastEdition} size="md" /> : null}
                  </div>
                ) : null}

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div
                    className="h-10 w-44 opacity-80"
                    style={{
                      background:
                        'repeating-linear-gradient(90deg, #1C2118 0 2px, transparent 2px 5px, #1C2118 5px 6px, transparent 6px 9px, #1C2118 9px 12px, transparent 12px 15px)',
                    }}
                  />
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                    <span className="h-2 w-2 animate-rec-blink rounded-full bg-cinech-brown" />
                    {film.status === 'available' ? t('watch') : t('coming')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
