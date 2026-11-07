'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Play, Heart, Bell, BellRing, Vote, BookOpen, Check, CalendarPlus, Share2, X, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { MOODS, relatedFilms, type Film } from '@/data/films';
import { editionOf, seriesOf, type Edition } from '@/data/editions';
import { buildIcs, downloadIcs, googleCalendarUrl } from '@/lib/ics';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalList } from '@/hooks/useLocalList';
import { useJournal } from '@/hooks/useJournal';
import FilmPoster from '@/components/FilmPoster';
import FilmFrame from '@/components/retro/FilmFrame';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import Reveal from '@/components/retro/Reveal';
import TicketCard from '@/components/retro/TicketCard';
import { Display, Script } from '@/components/retro/Display';
import AddToJournalForm from '@/components/journal/AddToJournalForm';
import TicketStub from '@/components/journal/TicketStub';
import EditionBadge from '@/components/journal/EditionBadge';
import { formatScreening } from '@/components/FilmTicketModal';

const CinemaRoom = dynamic(() => import('@/components/CinemaRoom'), { ssr: false });

const T = {
  catalogue: { tr: 'Kataloğa dön', en: 'Back to catalogue' },
  director: { tr: 'Yönetmen', en: 'Director' },
  runtime: { tr: 'Süre', en: 'Runtime' },
  screening: { tr: 'Gösterim', en: 'Screening' },
  status: { tr: 'Durum', en: 'Status' },
  genre: { tr: 'Tür', en: 'Genre' },
  year: { tr: 'Yıl', en: 'Year' },
  minutes: { tr: 'dk', en: 'min' },
  available: { tr: 'Vizyonda', en: 'Now showing' },
  coming: { tr: 'Yakında', en: 'Coming soon' },
  tbd: { tr: 'Tarih açıklanacak', en: 'Date to be announced' },
  watch: { tr: 'Şimdi izle', en: 'Watch now' },
  remind: { tr: 'Hatırlat', en: 'Remind me' },
  reminded: { tr: 'Hatırlatılacak', en: 'Reminder set' },
  fav: { tr: 'Favori', en: 'Favourite' },
  faved: { tr: 'Favoride', en: 'Favourited' },
  back: { tr: "DAO'da destekle", en: 'Back it in the DAO' },
  share: { tr: 'Paylaş', en: 'Share' },
  copied: { tr: 'Bağlantı kopyalandı', en: 'Link copied' },
  ics: { tr: 'Takvime ekle (.ics)', en: 'Add to calendar (.ics)' },
  gcal: { tr: 'Google Takvim', en: 'Google Calendar' },
  mood: { tr: 'Ruh hali', en: 'Mood' },
  synopsis: { tr: 'Özet', en: 'Synopsis' },
  credits: { tr: 'Künye', en: 'Credits' },
  series: { tr: 'Koçan serisi', en: 'Stub series' },
  seriesHint: {
    tr: 'Bu filmin koçanları bu seri koduyla numaralanır. Gala, Altın Baskı ve Gece Yarısı edisyonları izleme koşuluna göre kendiliğinden verilir.',
    en: 'Stubs for this film are numbered under this series code. Gala, Gold Print and Midnight editions are granted automatically from how you watched.',
  },
  calendarTitle: { tr: 'Takvimine işle', en: 'Put it in your calendar' },
  calendarText: { tr: 'Gösterim gününden bir gün önce hatırlatma içeren tüm gün etkinlik.', en: 'An all-day event with a reminder the day before the screening.' },
  stubsTitle: { tr: 'Bu filmin koçanları', en: 'Your stubs for this film' },
  stubsScript: { tr: 'defterinden', en: 'from your journal' },
  noStubs: { tr: 'Henüz koçan yok', en: 'No stubs yet' },
  noStubsText: { tr: 'İzlediysen deftere ekle; koçanın edisyonu izleme anına göre belirlenir.', en: 'Watched it? Add it to your journal; the stub edition is set by when you watched.' },
  addJournal: { tr: 'İzledim, deftere ekle', en: 'Watched, add to journal' },
  openJournal: { tr: 'Defteri aç', en: 'Open journal' },
  pasted: { tr: 'Koçan deftere yapıştırıldı.', en: 'Stub pasted into your journal.' },
  related: { tr: 'Benzer filmler', en: 'Related films' },
  relatedScript: { tr: 'sıradaki seans', en: 'next screening' },
  close: { tr: 'Kapat', en: 'Close' },
  hudSynopsis: { tr: '[Özet] 01', en: '[Synopsis] 01' },
  hudStubs: { tr: '[Koçanlar] 02', en: '[Stubs] 02' },
  hudRelated: { tr: '[Benzer] 03', en: '[Related] 03' },
  strip: { tr: 'ÖZET · KÜNYE · TAKVİM', en: 'SYNOPSIS · CREDITS · CALENDAR' },
} as const;

type Key = keyof typeof T;

/** Film sayfası: afiş, künye, takvim, kişinin koçanları ve benzer filmler. */
export default function FilmDetail({ film }: { readonly film: Film }) {
  const { language } = useLanguage();
  const en = language === 'en';
  const t = (k: Key) => (en ? T[k].en : T[k].tr);
  const [favorites, toggleFavorite] = useLocalList('cinech:favorites');
  const [reminders, toggleReminder] = useLocalList('cinech:reminders');
  const { address } = useAccount();
  const journal = useJournal(address);
  const [adding, setAdding] = useState(false);
  const [lastEdition, setLastEdition] = useState<Edition | null>(null);
  const [watching, setWatching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const myStubs = useMemo(
    () => journal.journal.entries.filter((e) => e.filmId === film.id).sort((a, b) => b.watchedAt.localeCompare(a.watchedAt)),
    [journal.journal.entries, film.id],
  );
  const related = useMemo(() => relatedFilms(film, 3), [film]);
  const moods = useMemo(() => MOODS.filter((m) => film.moods.includes(m.id)), [film.moods]);
  const isFav = favorites.includes(film.id);
  const isReminded = reminders.includes(film.id);
  const screening = formatScreening(film.releaseDate, language);
  const canWatch = film.status === 'available' && Boolean(film.videoUrl);
  const gcal = origin ? googleCalendarUrl(film, { lang: language, origin }) : null;

  const share = async () => {
    const url = `${window.location.origin}/film/${film.slug}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: film.title, text: film.tagline, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* kullanıcı vazgeçti ya da izin yok */
    }
  };

  const addToCalendar = () => downloadIcs(`cinech-${film.slug}.ics`, buildIcs([film], { lang: language, origin: window.location.origin }));

  const facts: readonly (readonly [string, string])[] = [
    [t('director'), film.director],
    [t('runtime'), `${film.durationMinutes} ${t('minutes')} · ${film.year}`],
    [t('screening'), screening ?? t('tbd')],
    [t('status'), canWatch ? t('available') : t('coming')],
  ];

  return (
    <div>
      {/* AFİŞ + KÜNYE — mürekkep */}
      <section className="relative overflow-hidden bg-cinech-ink py-14 text-cinech-cream md:py-20">
        <RetroHud tl={`[Film] ${seriesOf(film)}`} tr={`[${film.genre}]`} bl="PLAY" br={`REC ${String(Math.floor(film.durationMinutes / 60)).padStart(2, '0')}:${String(film.durationMinutes % 60).padStart(2, '0')}:00`} rec tone="cream" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Reveal rotate={-3} className="mx-auto w-full max-w-sm">
            <motion.div whileHover={{ rotate: 0, y: -6 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="-rotate-2">
              <FilmFrame>
                <FilmPoster film={film} className="aspect-[3/4] rounded-none border-0 shadow-none" interactive={false} />
              </FilmFrame>
            </motion.div>
          </Reveal>

          <div>
            <Link href="/#filmler" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/60 transition-colors hover:text-cinech-cream">
              <ArrowLeft className="h-3.5 w-3.5" /> {t('catalogue')}
            </Link>
            <Reveal className="relative mt-5">
              <Display as="h1" className="text-6xl text-cinech-cream md:text-8xl" shadow="red">
                {film.title}
              </Display>
              {film.episode ? <div className="mt-2 font-display text-3xl uppercase tracking-wide text-cinech-olive-light md:text-4xl">{film.episode}</div> : null}
              <Script className="mt-4 block text-3xl text-cinech-brown-light md:text-4xl">{film.tagline}</Script>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-y-2 border-dashed border-cinech-cream/20 py-4 font-mono text-[11px] uppercase tracking-[0.2em] sm:grid-cols-4">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-cinech-cream/50">{label}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-cream">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
              {canWatch ? (
                <button type="button" onClick={() => setWatching(true)} className="btn-cream !px-5 !py-2.5 !text-sm">
                  <Play className="h-4 w-4" /> {t('watch')}
                </button>
              ) : (
                <button type="button" onClick={() => toggleReminder(film.id)} className={`${isReminded ? 'btn-olive' : 'btn-cream'} !px-5 !py-2.5 !text-sm`}>
                  {isReminded ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />} {isReminded ? t('reminded') : t('remind')}
                </button>
              )}
              <button type="button" onClick={() => toggleFavorite(film.id)} aria-pressed={isFav} className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-cream">
                <Heart className={`h-4 w-4 ${isFav ? 'fill-cinech-brown-light text-cinech-brown-light' : ''}`} /> {isFav ? t('faved') : t('fav')}
              </button>
              {film.releaseDate ? (
                <button type="button" onClick={addToCalendar} className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-cream">
                  <CalendarPlus className="h-4 w-4" /> {t('ics')}
                </button>
              ) : null}
              <Link href="/dao" className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-cream/70">
                <Vote className="h-4 w-4" /> {t('back')}
              </Link>
              <button type="button" onClick={share} className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-cream/70">
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? t('copied') : t('share')}
              </button>
            </Reveal>

            {moods.length ? (
              <Reveal delay={0.2} className="mt-6 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-cream/50">{t('mood')}:</span>
                {moods.map((m) => (
                  <Link
                    key={m.id}
                    href={`/?ruh=${m.id}#filmler`}
                    className="rounded-full border-2 border-cinech-cream/25 px-3 py-1 font-script text-lg leading-none text-cinech-cream/85 transition-colors hover:border-cinech-cream/60"
                  >
                    {en ? m.en : m.tr}
                  </Link>
                ))}
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      <FilmStrip tone="cream" text={t('strip')} />

      {/* ÖZET + KÜNYE + TAKVİM — kâğıt */}
      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={t('hudSynopsis')} tone="ink" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Reveal>
            <Display className="text-5xl text-cinech-olive md:text-7xl" shadow="ink">
              {t('synopsis')}
            </Display>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cinech-ink/85 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-cinech-olive">
              {film.synopsis}
            </p>
          </Reveal>
          <div className="grid gap-6">
            <Reveal delay={0.1}>
              <TicketCard label={t('credits')} title={film.title} tilt={1.5}>
                <dl className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-ink/60">
                  <div>
                    <dt>{t('director')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">{film.director}</dd>
                  </div>
                  <div>
                    <dt>{t('genre')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">{film.genre}</dd>
                  </div>
                  <div>
                    <dt>{t('year')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">{film.year}</dd>
                  </div>
                  <div>
                    <dt>{t('runtime')}</dt>
                    <dd className="mt-1 font-sans text-sm normal-case tracking-normal text-cinech-ink">
                      {film.durationMinutes} {t('minutes')}
                    </dd>
                  </div>
                  <div className="col-span-2 border-t-2 border-dashed border-cinech-brown/40 pt-3">
                    <dt>{t('series')}</dt>
                    <dd className="mt-1 font-display text-2xl tracking-wide text-cinech-olive">{seriesOf(film)}-•-0000</dd>
                    <p className="mt-1 text-[11px] normal-case tracking-normal text-cinech-ink/60">{t('seriesHint')}</p>
                  </div>
                </dl>
              </TicketCard>
            </Reveal>
            {film.releaseDate ? (
              <Reveal delay={0.15}>
                <TicketCard label={t('screening')} title={screening ?? ''} tilt={-1.5} pinned={false}>
                  <div className="font-display text-lg uppercase text-cinech-ink">{t('calendarTitle')}</div>
                  <p className="mt-1 text-sm text-cinech-ink/70">{t('calendarText')}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={addToCalendar} className="btn-olive !px-4 !py-2 !text-xs">
                      <CalendarPlus className="h-4 w-4" /> {t('ics')}
                    </button>
                    {gcal ? (
                      <a href={gcal} target="_blank" rel="noreferrer noopener" className="btn-outline !px-4 !py-2 !text-xs text-cinech-ink">
                        <ExternalLink className="h-4 w-4" /> {t('gcal')}
                      </a>
                    ) : null}
                  </div>
                </TicketCard>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* KOÇANLAR — zeytin */}
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud tl={t('hudStubs')} tr={`[${String(myStubs.length).padStart(2, '0')}]`} />
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="relative mb-8">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="ink">
              {t('stubsTitle')}
            </Display>
            <Script className="pointer-events-none absolute -bottom-3 left-[45%] -rotate-3 whitespace-nowrap text-3xl text-cinech-ink/90 md:text-5xl">{t('stubsScript')}</Script>
          </Reveal>
          <div className="grid gap-6">
            {myStubs.map((entry, i) => (
              <Reveal key={entry.id} delay={(i % 3) * 0.05}>
                <TicketStub entry={entry} film={film} index={i} onUpdate={(patch) => journal.update(entry.id, patch)} onRemove={() => journal.remove(entry.id)} />
              </Reveal>
            ))}
            {journal.ready && myStubs.length === 0 && !adding && !lastEdition ? (
              <Reveal>
                <div className="rounded-md border-2 border-dashed border-cinech-cream/40 p-8 text-center">
                  <div className="font-display text-3xl uppercase">{t('noStubs')}</div>
                  <p className="mx-auto mt-2 max-w-md text-sm text-cinech-cream/75">{t('noStubsText')}</p>
                </div>
              </Reveal>
            ) : null}
            <Reveal delay={0.05}>
              <div className="paper rounded-md p-5 text-cinech-ink shadow-hard">
                {lastEdition ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-script text-2xl text-cinech-brown">{t('pasted')}</span>
                    <EditionBadge edition={lastEdition} size="md" />
                    <Link href="/defter" className="btn-ink !px-4 !py-2 !text-xs">
                      {t('openJournal')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : adding ? (
                  <div className="-mt-5">
                    <AddToJournalForm
                      film={film}
                      onSubmit={(input) => {
                        const entry = journal.add(input);
                        setLastEdition(editionOf(entry, film));
                        setAdding(false);
                      }}
                      onCancel={() => setAdding(false)}
                    />
                  </div>
                ) : (
                  <button type="button" onClick={() => setAdding(true)} className="btn-olive !px-5 !py-2.5 !text-sm">
                    <BookOpen className="h-4 w-4" /> {t('addJournal')}
                  </button>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENZER FİLMLER — mürekkep */}
      <section className="relative bg-cinech-ink py-16 text-cinech-cream">
        <RetroHud tl={t('hudRelated')} tr="[Scroll]" tone="cream" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="relative mb-8 inline-block">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="red">
              {t('related')}
            </Display>
            <Script className="pointer-events-none absolute -right-8 -top-4 rotate-[-6deg] whitespace-nowrap text-3xl text-cinech-brown-light md:text-4xl">{t('relatedScript')}</Script>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.08} y={30}>
                <Link href={`/film/${f.slug}`} className="group block">
                  <motion.div whileHover={{ y: -8, rotate: i % 2 === 0 ? -0.6 : 0.6 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                    <FilmFrame className="transition-shadow duration-300 group-hover:shadow-hard-olive">
                      <FilmPoster film={f} className="aspect-video rounded-none border-0 shadow-none" interactive={false} />
                    </FilmFrame>
                    <div className="paper mt-4 rounded-md p-4 text-cinech-ink shadow-hard">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">
                        <span>{f.genre}</span>
                        <span>{f.year}</span>
                      </div>
                      <h3 className="mt-2 font-display text-2xl uppercase leading-none tracking-wide">
                        {f.title}
                        {f.episode ? <span className="text-cinech-olive"> · {f.episode}</span> : null}
                      </h3>
                      <p className="mt-2 font-script text-xl text-cinech-ink/75">{f.tagline}</p>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* İZLEME ODASI */}
      {watching && film.videoUrl ? (
        <div className="fixed inset-0 z-[1100] bg-cinech-ink">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b-4 border-cinech-olive bg-cinech-ink p-4">
              <h3 className="font-display text-2xl uppercase tracking-wide text-cinech-cream">
                {film.title} {film.episode ? `· ${film.episode}` : ''}
              </h3>
              <button type="button" onClick={() => setWatching(false)} className="text-cinech-cream/60 hover:text-cinech-cream" aria-label={t('close')}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto p-4">
              <CinemaRoom
                roomId={film.id}
                title={film.title}
                description={film.synopsis}
                viewers={0}
                timeLeft={`${film.durationMinutes} ${t('minutes')}`}
                videoUrl={film.videoUrl}
                requiresTicket={false}
                onJoin={async () => true}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
