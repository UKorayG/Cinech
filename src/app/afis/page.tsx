'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { CalendarDays, Trophy, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContest } from '@/hooks/useContest';
import { CONTEST, MAX_ENTRIES_PER_OWNER, isContestOpen } from '@/data/contest';
import { GUEST_OWNER, shortAddress } from '@/data/journal';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import Reveal from '@/components/retro/Reveal';
import TicketCard from '@/components/retro/TicketCard';
import { Display, Script } from '@/components/retro/Display';
import Countdown from '@/components/afis/Countdown';
import EntryCard from '@/components/afis/EntryCard';
import Leaderboard from '@/components/afis/Leaderboard';
import SubmitForm from '@/components/afis/SubmitForm';

export default function PosterContestPage() {
  const { language } = useLanguage();
  const en = language === 'en';
  const lang = en ? 'en' : 'tr';
  const { address } = useAccount();
  const { owner, entries, ready, votesFor, hasVoted, toggleVote, submit, remove, mine, leaderboard, mineCount } = useContest(address);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const check = () => setClosed(!isContestOpen(new Date()));
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const gallery = useMemo(() => [...entries].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)), [entries]);
  const isGuest = owner === GUEST_OWNER;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(en ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const endDate = fmt(CONTEST.endsAt);
  const startDate = fmt(CONTEST.startsAt);

  return (
    <div>
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud
          tl={en ? '[Poster Contest] 08' : '[Afiş Yarışması] 08'}
          tr={`[${shortAddress(owner)}]`}
          bl="PLAY"
          br={`REC ${String(entries.length).padStart(2, '0')} ${en ? 'POSTERS' : 'AFİŞ'}`}
          rec
        />
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-10 px-6">
          <Reveal className="relative">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/70">{CONTEST.title[lang]}</div>
            <Display as="h1" className="mt-3 text-6xl text-cinech-cream md:text-8xl">
              {en ? 'Poster Contest' : 'Afiş Yarışması'}
            </Display>
            <Script className="pointer-events-none absolute -bottom-4 left-[14%] -rotate-6 whitespace-nowrap text-4xl text-cinech-ink/90 md:text-6xl">
              {en ? 'draw, pin, vote' : 'çiz, as, oyla'}
            </Script>
            <div className="mt-12 flex flex-wrap gap-3">
              <a href="#gonder" className="btn-cream !px-5 !py-2.5 !text-sm">
                <Upload className="h-4 w-4" /> {en ? 'Submit your poster' : 'Afişini gönder'}
              </a>
              <a href="#galeri" className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-cream">
                {en ? 'See the wall' : 'Duvara bak'}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="w-full max-w-md">
            <div className="paper rounded-md p-5 text-cinech-ink shadow-hard">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-cinech-olive" />
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                  {en ? 'Voting closes' : 'Oylama kapanışı'} · {endDate}
                </div>
              </div>
              <div className="mt-4">
                <Countdown endsAt={CONTEST.endsAt} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-cinech-ink/70">{CONTEST.theme[lang]}</p>
              <div className="mt-4 border-t-2 border-dashed border-cinech-brown/40 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">
                {en ? 'Votes are stored on this device' : 'Oylar bu cihazda saklanır'} · {isGuest ? (en ? 'guest' : 'misafir') : shortAddress(owner)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FilmStrip text={en ? 'DRAW · SUBMIT · VOTE' : 'ÇİZ · GÖNDER · OYLA'} />

      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={en ? '[Rules] 01' : '[Kurallar] 01'} tr="[Read&Draw]" tone="ink" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-4 md:grid-cols-[3fr_2fr]">
          <Reveal rotate={-1}>
            <TicketCard label={en ? 'Contest rules' : 'Yarışma kuralları'} title={en ? 'Rules' : 'Kurallar'} tilt={-1.5}>
              <ol className="space-y-3">
                {CONTEST.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="shrink-0 pt-1 font-mono text-[11px] tracking-[0.2em] text-cinech-olive">{String(i + 1).padStart(2, '0')}</span>
                    <span>{rule[lang]}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t-2 border-dashed border-cinech-brown/40 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">
                <span>
                  {en ? 'Opens' : 'Başlangıç'} · {startDate}
                </span>
                <span>
                  {en ? 'Closes' : 'Bitiş'} · {endDate}
                </span>
              </div>
            </TicketCard>
          </Reveal>
          <Reveal delay={0.1} rotate={1}>
            <TicketCard label={en ? 'Prize' : 'Ödül'} title={en ? 'Front page' : 'Ana sayfa'} tilt={2}>
              <div className="flex items-start gap-3">
                <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-cinech-olive" />
                <p className="text-sm leading-relaxed">{CONTEST.prize[lang]}</p>
              </div>
              <div className="mt-5 rounded-sm border-2 border-cinech-ink/15 bg-cinech-cream-dark px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">
                {en ? 'No cash prize · the wall is the prize' : 'Para ödülü yok · ödül duvarın kendisi'}
              </div>
              <Script className="mt-4 block -rotate-2 text-3xl text-cinech-brown">{en ? 'one month, next to Yankı' : 'bir ay, Yankı’nın yanında'}</Script>
            </TicketCard>
          </Reveal>
        </div>
      </section>

      <section id="galeri" className="relative bg-cinech-ink py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Gallery] 02' : '[Galeri] 02'} tr={`[${entries.length} ${en ? 'posters' : 'afiş'}]`} />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="red">
              {en ? 'The Wall' : 'Duvar'}
            </Display>
            <p className="max-w-sm text-sm leading-relaxed text-cinech-cream/65">
              {en
                ? 'One vote per poster. Press the stamp to vote, press again to take it back. Votes are stored on this device.'
                : 'Her afişe bir oy. Damgaya bas, oy ver; yeniden bas, geri al. Oylar bu cihazda saklanır.'}
            </p>
          </Reveal>
          <div className="grid gap-x-8 gap-y-16 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((entry, i) => (
              <Reveal key={entry.id} delay={(i % 3) * 0.08}>
                <EntryCard
                  entry={entry}
                  index={i}
                  votes={votesFor(entry)}
                  voted={ready && hasVoted(entry.id)}
                  closed={closed}
                  mine={mine(entry)}
                  onToggleVote={() => toggleVote(entry.id)}
                  onRemove={() => remove(entry.id)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Leaderboard] 03' : '[Sıralama] 03'} tr="[Top 3]" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-6">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="ink">
              {en ? 'Top Three' : 'İlk Üç'}
            </Display>
            <p className="max-w-sm text-sm leading-relaxed text-cinech-cream/70">
              {en ? 'Seed votes plus the votes cast on this device. The order updates as you stamp.' : 'Başlangıç oyları ile bu cihazda verilen oyların toplamı. Sıra, damgaladıkça değişir.'}
            </p>
          </Reveal>
          <Leaderboard entries={leaderboard} votesFor={votesFor} />
        </div>
      </section>

      <section id="gonder" className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={en ? '[Submit] 04' : '[Katıl] 04'} tr="[Upload]" tone="ink" />
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-8">
            <Display className="text-5xl text-cinech-olive md:text-7xl" shadow="ink">
              {en ? 'Submit your poster' : 'Afişini gönder'}
            </Display>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cinech-ink/70">
              {en
                ? `Up to ${MAX_ENTRIES_PER_OWNER} posters per participant. Your poster is pinned to the wall in this browser; connect a wallet to sign it with your address.`
                : `Katılımcı başına en fazla ${MAX_ENTRIES_PER_OWNER} afiş. Afişin bu tarayıcıda duvara asılır; adresinle imzalamak için cüzdanını bağla.`}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <SubmitForm onSubmit={submit} closed={closed} remaining={Math.max(0, MAX_ENTRIES_PER_OWNER - mineCount)} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
