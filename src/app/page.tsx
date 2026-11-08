'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Users, Coins, X, Clapperboard, Vote, ArrowRight, Heart, Bell, BellRing, CalendarPlus } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJournal } from '@/hooks/useJournal';
import { FILMS, GENRES, MOODS, SCHEDULE, featuredFilm, type Film, type Mood } from '@/data/films';
import { buildIcs, downloadIcs } from '@/lib/ics';
import { useLocalList } from '@/hooks/useLocalList';
import FilmPoster from '@/components/FilmPoster';
import FilmTicketModal, { formatScreening } from '@/components/FilmTicketModal';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import TicketCard from '@/components/retro/TicketCard';
import Polaroid from '@/components/retro/Polaroid';
import FilmFrame from '@/components/retro/FilmFrame';
import Reveal from '@/components/retro/Reveal';
import { Display, Script } from '@/components/retro/Display';
import LogoLockup from '@/components/brand/LogoLockup';

const CinemaRoom = dynamic(() => import('@/components/CinemaRoom'), { ssr: false });

const T = {
  kicker: { tr: 'Merkeziyetsiz sinema', en: 'Decentralized cinema' },
  heroScript: { tr: 'izledikçe kazan', en: 'watch & earn' },
  heroText: {
    tr: 'Bağımsız yapımları birlikte izle, filmi sonuna kadar izleyince CINE token kazan, hangi hikâyenin çekileceğine toplulukla karar ver.',
    en: 'Watch independent films together, earn CINE tokens when you finish a film, and decide with the community which stories get made.',
  },
  watchNow: { tr: 'Şimdi izle', en: 'Watch now' },
  comingSoon: { tr: 'Yakında', en: 'Coming soon' },
  details: { tr: 'Bileti aç', en: 'Open ticket' },
  joinDao: { tr: "DAO'ya katıl", en: 'Join the DAO' },
  firstOriginal: { tr: 'ilk özgün yapım', en: 'first original' },
  strip: { tr: 'İZLE · OY VER · KAZAN', en: 'WATCH · VOTE · EARN' },
  films: { tr: 'Filmler', en: 'Films' },
  filmsScript: { tr: 'vizyonda', en: 'now showing' },
  filmsText: { tr: 'Katalog toplulukla büyüyor. Sıradaki yapıma DAO karar veriyor.', en: 'The catalogue grows with the community. The DAO decides what comes next.' },
  all: { tr: 'Tümü', en: 'All' },
  minutes: { tr: 'dk', en: 'min' },
  proposeFilm: { tr: 'Film öner', en: 'Propose a film' },
  emptyTitle: { tr: 'Boş koltuk', en: 'Empty seat' },
  emptyText: { tr: 'Bir yapımın kataloğa girmesini istiyorsan DAO üzerinden teklif aç.', en: 'Want a film in the catalogue? Open a proposal in the DAO.' },
  noMatch: { tr: 'Bu seçime uyan film yok (henüz).', en: 'No films match this pick (yet).' },
  moodKicker: { tr: 'Bu akşam ne çekiyor?', en: 'What are you in the mood for?' },
  anyMood: { tr: 'fark etmez', en: 'anything' },
  exportIcs: { tr: 'Takvime aktar (.ics)', en: 'Export to calendar (.ics)' },
  exportReminders: { tr: '{n} hatırlatma', en: '{n} reminders' },
  exportAll: { tr: 'tüm program', en: 'full schedule' },
  schedule: { tr: 'Gösterim programı', en: 'Screening schedule' },
  scheduleScript: { tr: 'perde açılıyor', en: 'curtain up' },
  scheduleText: { tr: 'Her hafta yeni bir gösterim. Hatırlatma kur, perde açılınca haberin olsun.', en: 'A new screening every week. Set a reminder and be there when the curtain rises.' },
  remind: { tr: 'Hatırlat', en: 'Remind me' },
  reminded: { tr: 'Hatırlatılacak', en: 'Reminder set' },
  howTitle: { tr: 'Nasıl çalışır', en: 'How it works' },
  howScript: { tr: 'üç adımda', en: 'in three steps' },
  ticket: { tr: 'Bilet', en: 'Ticket' },
  step1: { tr: 'Cüzdanını bağla', en: 'Connect your wallet' },
  step1Text: { tr: 'MetaMask ya da WalletConnect ile tek tıkla. Hesap yok, şifre yok.', en: 'One click with MetaMask or WalletConnect. No account, no password.' },
  step2: { tr: 'Bir odaya katıl', en: 'Join a room' },
  step2Text: { tr: 'Filmi tek başına ya da arkadaşlarınla eş zamanlı izle, sohbet et.', en: 'Watch alone or in sync with friends, and chat.' },
  step3: { tr: 'Kazan ve oy ver', en: 'Earn and vote' },
  step3Text: { tr: "Tamamladığın her film 1 CINE. Token'ını DAO kararlarında kullan.", en: 'Every finished film is 1 CINE. Spend it on DAO decisions.' },
  daoTitle: { tr: 'Sıradaki filmi sen seç', en: 'You pick the next film' },
  daoScript: { tr: 'topluluk karar verir', en: 'the community decides' },
  daoText: {
    tr: "Teklif aç, oy ver, bağımsız yapımcıları destekle. Fonlanan projeler Stüdyo'da üretilir ve kataloğa düşer.",
    en: 'Open proposals, vote, back independent creators. Funded projects are produced in the Studio and land in the catalogue.',
  },
  studio: { tr: 'Stüdyoya git', en: 'Go to the Studio' },
  watched: { tr: 'İzlendi', en: 'Watched' },
  addFav: { tr: 'Favoriye ekle', en: 'Add to favourites' },
  removeFav: { tr: 'Favoriden çıkar', en: 'Remove from favourites' },
  close: { tr: 'Kapat', en: 'Close' },
  hudCatalogue: { tr: '[Katalog] 02', en: '[Catalogue] 02' },
  hudProgram: { tr: '[Program] 03', en: '[Schedule] 03' },
  hudGuide: { tr: '[Rehber] 04', en: '[Guide] 04' },
} as const;

type Key = keyof typeof T;

export default function Home() {
  const { language } = useLanguage();
  const t = (key: Key) => (language === 'en' ? T[key].en : T[key].tr);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const [detail, setDetail] = useState<Film | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [favorites, toggleFavorite] = useLocalList('cinech:favorites');
  const [reminders, toggleReminder] = useLocalList('cinech:reminders');
  const { address } = useAccount();
  const journal = useJournal(address);
  const featured = featuredFilm();

  const visibleFilms = useMemo(
    () => FILMS.filter((f) => (!genre || f.genre.split(' · ').includes(genre)) && (!mood || f.moods.includes(mood))),
    [genre, mood],
  );
  const remindedFilms = useMemo(() => SCHEDULE.filter((f) => reminders.includes(f.id)), [reminders]);

  /* Film sayfalarından gelen ?tur= ve ?ruh= seçimlerini uygula */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ruh = params.get('ruh');
    if (ruh && MOODS.some((m) => m.id === ruh)) setMood(ruh as Mood);
    const tur = params.get('tur');
    if (tur && GENRES.includes(tur)) setGenre(tur);
  }, []);

  const exportCalendar = () => {
    const films = remindedFilms.length ? remindedFilms : SCHEDULE;
    downloadIcs(remindedFilms.length ? 'cinech-hatirlatmalar.ics' : 'cinech-program.ics', buildIcs(films, { lang: language, origin: window.location.origin }));
  };

  const openFilm = useCallback((film: Film) => {
    if (film.status === 'available' && film.videoUrl) {
      setDetail(null);
      setActiveFilm(film);
    }
  }, []);
  const closeDetail = useCallback(() => setDetail(null), []);

  return (
    <div className="relative">
      {/* HERO — kırmızı perde */}
      <section className="relative overflow-hidden bg-cinech-olive text-cinech-cream">
        <RetroHud tl="[CINECH]" tr={`[${t('kicker')}] 01`} bl="PLAY" br="REC 00:20:00" rec />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-28 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:pt-28">
          <div className="relative">
            <div className="relative inline-block">
              <h1 className="m-0">
                <LogoLockup className="w-[82vw] max-w-[640px] text-cinech-cream drop-shadow-[6px_6px_0_rgba(28,33,24,0.9)]" />
              </h1>
              <motion.div
                className="pointer-events-none absolute -bottom-8 right-[-4%] sm:-bottom-10"
                initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 16 }}
              >
                <Script className="whitespace-nowrap text-4xl text-cinech-ink/90 sm:text-5xl lg:text-6xl">{t('heroScript')}</Script>
              </motion.div>
            </div>
            <Reveal delay={0.5}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-cinech-cream/85">{t('heroText')}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" onClick={() => setDetail(featured)} className="btn-cream">
                  <Play className="h-5 w-5" />
                  {featured.status === 'available' ? t('watchNow') : `${featured.title} · ${t('details')}`}
                </button>
                <Link href="/dao" className="btn-ink">
                  <Vote className="h-5 w-5" />
                  {t('joinDao')}
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.3} y={40} rotate={6} className="relative mx-auto w-full max-w-sm pt-6 lg:max-w-md">
            <Polaroid caption={`${featured.title} · ${featured.episode ?? ''} — ${t('comingSoon').toLowerCase()}`} tilt={4}>
              <button type="button" onClick={() => setDetail(featured)} className="block w-full text-left" aria-label={featured.title}>
                <FilmPoster film={featured} className="aspect-[4/5] rounded-none border-0 shadow-none" interactive={false} />
              </button>
            </Polaroid>
            <motion.span
              className="absolute -left-4 top-12 -rotate-12 rounded-sm bg-cinech-ink px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream shadow-hard-cream"
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: -12 }}
              transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 14 }}
            >
              {t('firstOriginal')}
            </motion.span>
          </Reveal>
        </div>
        <div className="absolute inset-x-[-5%] bottom-6">
          <FilmStrip tilt={-2} text={t('strip')} />
        </div>
      </section>

      {/* FİLMLER — koyu salon */}
      <section id="filmler" className="relative scroll-mt-20 bg-cinech-ink py-20 text-cinech-cream">
        <RetroHud tl={t('hudCatalogue')} tr="[Scroll&Watch]" tone="cream" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div className="relative">
              <Display className="text-6xl text-cinech-cream md:text-8xl" shadow="red">
                {t('films')}
              </Display>
              <Script className="pointer-events-none absolute -right-10 -top-4 rotate-[-8deg] text-4xl text-cinech-brown md:text-5xl">
                {t('filmsScript')}
              </Script>
              <p className="mt-4 max-w-xl text-sm text-cinech-cream/65">{t('filmsText')}</p>
            </div>
            <Link href="/dao" className="btn-outline text-cinech-cream">
              {t('proposeFilm')} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="mb-10 flex flex-wrap gap-2">
            {[null, ...GENRES].map((g) => {
              const active = genre === g;
              return (
                <button
                  key={g ?? 'all'}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`rounded-full border-2 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors ${
                    active
                      ? 'border-cinech-cream bg-cinech-cream text-cinech-ink shadow-hard-sm'
                      : 'border-cinech-cream/25 text-cinech-cream/70 hover:border-cinech-cream/60 hover:text-cinech-cream'
                  }`}
                  aria-pressed={active}
                >
                  {g ?? t('all')}
                </button>
              );
            })}
          </Reveal>

          <Reveal delay={0.15} className="-mt-5 mb-10 flex flex-wrap items-center gap-2">
            <Script className="mr-1 text-2xl text-cinech-brown-light">{t('moodKicker')}</Script>
            {[null, ...MOODS.map((m) => m.id)].map((id) => {
              const active = mood === id;
              const m = MOODS.find((x) => x.id === id);
              return (
                <button
                  key={id ?? 'any'}
                  type="button"
                  onClick={() => setMood(id)}
                  aria-pressed={active}
                  className={`rounded-full border-2 px-3 py-1 font-script text-lg leading-none transition-colors ${
                    active
                      ? 'border-cinech-brown-light bg-cinech-brown-light text-cinech-cream shadow-hard-sm'
                      : 'border-cinech-cream/20 text-cinech-cream/65 hover:border-cinech-cream/50 hover:text-cinech-cream'
                  }`}
                >
                  {m ? (language === 'en' ? m.en : m.tr) : t('anyMood')}
                </button>
              );
            })}
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFilms.map((film, i) => (
              <Reveal key={film.id} delay={(i % 3) * 0.08} y={36}>
                <motion.article
                  className="group flex h-full flex-col"
                  whileHover={{ y: -8, rotate: i % 2 === 0 ? -0.6 : 0.6 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <button type="button" onClick={() => setDetail(film)} className="relative text-left" aria-label={film.title}>
                    <FilmFrame className="transition-shadow duration-300 group-hover:shadow-hard-olive">
                      <FilmPoster film={film} className="aspect-video rounded-none border-0 shadow-none" interactive={false} />
                    </FilmFrame>
                    {journal.has(film.id) ? (
                      <span className="pointer-events-none absolute right-4 top-8 flex h-20 w-20 -rotate-12 items-center justify-center rounded-full border-[3px] border-cinech-olive bg-cinech-cream/85 font-display text-sm uppercase tracking-wide text-cinech-olive shadow-hard-sm">
                        {t('watched')}
                      </span>
                    ) : null}
                  </button>
                  <div className="paper mt-4 flex flex-1 flex-col rounded-md p-5 text-cinech-ink shadow-hard">
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-cinech-olive">
                      <span>{film.genre}</span>
                      <span>
                        {film.durationMinutes} {t('minutes')} · {film.year}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-3xl uppercase leading-none tracking-wide text-cinech-ink">
                      <Link href={`/film/${film.slug}`} className="transition-colors hover:text-cinech-olive">
                        {film.title} {film.episode ? <span className="text-cinech-olive">· {film.episode}</span> : null}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-cinech-ink/75">{film.synopsis}</p>
                    <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-cinech-brown/50 pt-4">
                      <button type="button" onClick={() => setDetail(film)} className="btn-olive !px-4 !py-2 !text-xs">
                        <Play className="h-4 w-4" /> {film.status === 'available' ? t('watchNow') : t('details')}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReminder(film.id)}
                          aria-label={t('remind')}
                          className={`rounded-full border-2 p-2 transition-colors ${
                            reminders.includes(film.id) ? 'border-cinech-olive bg-cinech-olive text-cinech-cream' : 'border-cinech-ink/20 text-cinech-ink/60 hover:border-cinech-olive hover:text-cinech-olive'
                          }`}
                        >
                          {reminders.includes(film.id) ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(film.id)}
                          aria-label={favorites.includes(film.id) ? t('removeFav') : t('addFav')}
                          className={`rounded-full border-2 p-2 transition-colors ${
                            favorites.includes(film.id) ? 'border-cinech-olive text-cinech-olive' : 'border-cinech-ink/20 text-cinech-ink/60 hover:border-cinech-olive hover:text-cinech-olive'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(film.id) ? 'fill-cinech-brown' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            ))}

            {visibleFilms.length === 0 ? (
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-cinech-cream/60 sm:col-span-2 lg:col-span-3">{t('noMatch')}</p>
            ) : null}

            <Reveal delay={0.2} className="flex flex-col justify-end">
              <TicketCard label={t('emptyTitle')} title="DAO" tilt={2} className="mt-6">
                <p className="text-sm text-cinech-ink/80">{t('emptyText')}</p>
                <Link href="/dao" className="mt-4 inline-flex items-center gap-1 font-cinech text-sm font-bold uppercase tracking-wider text-cinech-olive">
                  {t('joinDao')} <ArrowRight className="h-4 w-4" />
                </Link>
              </TicketCard>
            </Reveal>
          </div>
        </div>
      </section>

      <FilmStrip tone="cream" text={t('strip')} />

      {/* GÖSTERİM PROGRAMI — krem */}
      <section id="program" className="paper relative py-20 text-cinech-ink">
        <RetroHud tl={t('hudProgram')} tr="[Weekly]" tone="ink" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="relative mb-10">
            <Display className="text-6xl text-cinech-olive md:text-8xl" shadow="ink">
              {t('schedule')}
            </Display>
            <Script className="pointer-events-none absolute left-[55%] top-[55%] -rotate-3 text-4xl text-cinech-ink md:text-6xl">
              {t('scheduleScript')}
            </Script>
            <p className="mt-4 max-w-xl text-sm text-cinech-ink/70">{t('scheduleText')}</p>
            <button type="button" onClick={exportCalendar} className="btn-olive mt-5 !px-4 !py-2 !text-xs">
              <CalendarPlus className="h-4 w-4" /> {t('exportIcs')} ·{' '}
              {remindedFilms.length ? t('exportReminders').replace('{n}', String(remindedFilms.length)) : t('exportAll')}
            </button>
          </Reveal>
          <div className="-mx-6 flex snap-x gap-6 overflow-x-auto px-6 pb-8 pt-6">
            {SCHEDULE.map((film, i) => {
              const d = new Date(`${film.releaseDate}T12:00:00`);
              const day = String(d.getDate()).padStart(2, '0');
              const month = d.toLocaleDateString(language === 'en' ? 'en-GB' : 'tr-TR', { month: 'short' }).toUpperCase();
              return (
                <Reveal key={film.id} delay={i * 0.06} className="w-64 shrink-0 snap-start">
                  <TicketCard tilt={i % 2 === 0 ? -2 : 2} pinned={false} onClick={() => setDetail(film)}>
                    <div className="flex items-start gap-4">
                      <div className="text-center">
                        <div className="font-display text-5xl leading-none text-cinech-olive">{day}</div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-ink/60">{month}</div>
                      </div>
                      <div className="min-w-0 flex-1 border-l-2 border-dashed border-cinech-brown/40 pl-4">
                        <div className="font-display text-2xl uppercase leading-none text-cinech-ink">{film.title}</div>
                        <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-ink/60">
                          {film.episode ?? film.genre}
                        </div>
                        <div className="mt-3 text-[11px] text-cinech-ink/60">{formatScreening(film.releaseDate, language)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReminder(film.id);
                      }}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
                        reminders.includes(film.id) ? 'border-cinech-olive bg-cinech-olive text-cinech-cream' : 'border-cinech-ink/20 text-cinech-ink/70 hover:border-cinech-olive hover:text-cinech-olive'
                      }`}
                    >
                      {reminders.includes(film.id) ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                      {reminders.includes(film.id) ? t('reminded') : t('remind')}
                    </button>
                  </TicketCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR — kırmızı, bilet kartları */}
      <section id="how-it-works" className="relative bg-cinech-olive py-24 text-cinech-cream">
        <RetroHud tl={t('hudGuide')} tr="[Play&Scroll]" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="relative mb-16 text-center">
            <Display className="text-6xl text-cinech-cream md:text-8xl">{t('howTitle')}</Display>
            <Script className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -rotate-3 text-5xl text-cinech-ink/90 md:text-7xl">
              {t('howScript')}
            </Script>
          </Reveal>
          <ol className="grid gap-10 md:grid-cols-3">
            {[
              { title: t('step1'), text: t('step1Text'), Icon: Coins },
              { title: t('step2'), text: t('step2Text'), Icon: Users },
              { title: t('step3'), text: t('step3Text'), Icon: Vote },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12} y={40}>
                <li className="relative pt-10">
                  <motion.span
                    className="pointer-events-none absolute -top-2 left-2 font-display text-8xl leading-none text-cinech-cream text-hard"
                    initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 + i * 0.12 }}
                  >
                    0{i + 1}
                  </motion.span>
                  <TicketCard label={`${t('ticket')} 0${i + 1}`} title={step.title} tilt={i === 1 ? 2 : -2}>
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinech-olive text-cinech-cream">
                        <step.Icon className="h-5 w-5" />
                      </span>
                      <p className="text-sm leading-relaxed text-cinech-ink/80">{step.text}</p>
                    </div>
                  </TicketCard>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* DAO ÇAĞRISI — koyu */}
      <section className="relative bg-cinech-ink-light py-24 text-cinech-cream">
        <RetroHud tl="[DAO] 05" tr="[Vote&Fund]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_auto]">
          <Reveal className="relative">
            <Display className="text-6xl text-cinech-cream md:text-8xl" shadow="red">
              {t('daoTitle')}
            </Display>
            <Script className="pointer-events-none absolute right-0 top-[60%] -rotate-3 text-4xl text-cinech-brown md:text-6xl">
              {t('daoScript')}
            </Script>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-cinech-cream/75">{t('daoText')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dao" className="btn-olive">
                <Vote className="h-5 w-5" /> {t('joinDao')}
              </Link>
              <Link href="/studyo" className="btn-outline text-cinech-cream">
                <Clapperboard className="h-5 w-5" /> {t('studio')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2} rotate={8} className="hidden lg:block">
            <Polaroid caption="CINE · token" tilt={5} className="w-64">
              <div className="flex aspect-square items-center justify-center bg-cinech-olive">
                <Coins className="h-24 w-24 text-cinech-cream" />
              </div>
            </Polaroid>
          </Reveal>
        </div>
      </section>

      <footer className="relative bg-cinech-ink py-12 text-center text-cinech-cream">
        <RetroHud tl="[CINECH]" tr={`[${new Date().getFullYear()}]`} bl="END" br="REC 00:00:00" />
        <Image src="/brand/cinech-dikey-krem.svg" alt="Cinech" width={160} height={160} unoptimized className="mx-auto h-40 w-auto" />
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/50">decentralized cinema</div>
      </footer>

      <FilmTicketModal
        film={detail}
        favorites={favorites}
        reminders={reminders}
        onClose={closeDetail}
        onWatch={openFilm}
        onToggleFavorite={toggleFavorite}
        onToggleReminder={toggleReminder}
        inJournal={detail ? journal.has(detail.id) : false}
        onAddToJournal={(entry) => journal.add(entry)}
      />

      {/* İZLEME ODASI */}
      {activeFilm && activeFilm.videoUrl ? (
        <div className="fixed inset-0 z-[1100] bg-cinech-ink">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b-4 border-cinech-olive bg-cinech-ink p-4">
              <h3 className="font-display text-2xl uppercase tracking-wide text-cinech-cream">
                {activeFilm.title} {activeFilm.episode ? `· ${activeFilm.episode}` : ''}
              </h3>
              <button type="button" onClick={() => setActiveFilm(null)} className="text-cinech-cream/60 hover:text-cinech-cream" aria-label={t('close')}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto p-4">
              <CinemaRoom
                roomId={activeFilm.id}
                title={activeFilm.title}
                description={activeFilm.synopsis}
                viewers={0}
                timeLeft={`${activeFilm.durationMinutes} ${t('minutes')}`}
                videoUrl={activeFilm.videoUrl}
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
