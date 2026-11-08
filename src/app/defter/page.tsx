'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { BookOpen, Share2, ArrowRight, Import, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJournal } from '@/hooks/useJournal';
import { GUEST_OWNER, computeStamps, filmById, journalStats, shortAddress } from '@/data/journal';
import { RARITIES, RARITY_ORDER, editionBreakdown, type Rarity } from '@/data/editions';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import Reveal from '@/components/retro/Reveal';
import { Display, Script } from '@/components/retro/Display';
import TicketStub from '@/components/journal/TicketStub';
import Stamp from '@/components/journal/Stamp';

const T = {
  title: { tr: 'Film Defteri', en: 'Film Journal' },
  script: { tr: 'kişisel sinema', en: 'personal cinema' },
  guest: { tr: 'Misafir defteri', en: 'Guest journal' },
  guestHint: {
    tr: 'Koçanlar bu tarayıcıda saklanıyor. Cüzdanını bağlarsan defter adresine bağlanır ve ileride koçanların NFT olarak basılabilir.',
    en: 'Stubs live in this browser. Connect a wallet to bind the journal to your address and mint stubs as NFTs later.',
  },
  walletHint: { tr: 'Defter bu adrese bağlı. NFT basımı bir sonraki aşamada.', en: 'Journal bound to this address. NFT minting comes next.' },
  importGuest: { tr: 'Misafir defterindeki {n} koçanı taşı', en: 'Move {n} stubs from the guest journal' },
  stubs: { tr: 'Koçan', en: 'Stubs' },
  minutes: { tr: 'Dakika', en: 'Minutes' },
  avg: { tr: 'Ortalama puan', en: 'Avg rating' },
  stamps: { tr: 'Damga', en: 'Stamps' },
  stampsTitle: { tr: 'Damgalar', en: 'Stamps' },
  stampsText: { tr: 'İzledikçe kazanılır. Üzerine gelince koşulunu görürsün.', en: 'Earned as you watch. Hover to see the condition.' },
  stubsTitle: { tr: 'Koçanlar', en: 'Stubs' },
  emptyTitle: { tr: 'Defter boş', en: 'Empty journal' },
  emptyText: { tr: 'İlk koçanını almak için bir filmin biletini aç ve "İzledim, deftere ekle" de.', en: 'Open a film ticket and tap "Watched, add to journal" for your first stub.' },
  browse: { tr: 'Filmlere git', en: 'Browse films' },
  share: { tr: 'Paylaş', en: 'Share' },
  copied: { tr: 'Kopyalandı', en: 'Copied' },
  shareText: { tr: 'Cinech film defterim: {c} film, {m} dakika, {s} damga.', en: 'My Cinech film journal: {c} films, {m} minutes, {s} stamps.' },
  editions: { tr: 'Edisyonlar', en: 'Editions' },
  editionsText: { tr: 'Koçanın edisyonu izleme anına göre kendiliğinden belirlenir; NFT basımında metaveriye işlenir.', en: 'A stub’s edition is set automatically from how you watched; it goes into the NFT metadata when minted.' },
} as const;

const EDITION_TILE: Readonly<Record<Rarity, string>> = {
  standart: 'border-cinech-ink/30 text-cinech-ink/70',
  gece: 'border-cinech-ink bg-cinech-ink text-cinech-cream',
  altin: 'border-cinech-brown bg-cinech-brown-light text-cinech-cream',
  gala: 'border-cinech-olive-dark bg-cinech-olive text-cinech-cream',
};

type Key = keyof typeof T;

export default function JournalPage() {
  const { language } = useLanguage();
  const t = (k: Key) => (language === 'en' ? T[k].en : T[k].tr);
  const { address } = useAccount();
  const { journal, ready, guestCount, update, remove, importGuest } = useJournal(address);
  const [copied, setCopied] = useState(false);

  const entries = useMemo(() => [...journal.entries].sort((a, b) => b.watchedAt.localeCompare(a.watchedAt)), [journal.entries]);
  const stats = journalStats(journal.entries);
  const stamps = computeStamps(journal.entries);
  const editions = editionBreakdown(journal.entries, filmById);
  const isGuest = journal.owner === GUEST_OWNER;

  const share = async () => {
    const text = t('shareText')
      .replace('{c}', String(stats.count))
      .replace('{m}', String(stats.minutes))
      .replace('{s}', String(stats.stamps));
    try {
      await navigator.clipboard.writeText(`${text} ${window.location.origin}/defter`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano erişimi yoksa sessiz kal */
    }
  };

  return (
    <div>
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud tl={language === 'en' ? '[Journal]' : '[Defter]'} tr={`[${shortAddress(journal.owner)}]`} bl="PLAY" br={`REC ${String(stats.count).padStart(2, '0')} ${t('stubs')}`} rec />
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-6">
          <Reveal className="relative">
            <Display as="h1" className="text-6xl text-cinech-cream md:text-8xl">
              {t('title')}
            </Display>
            <Script className="pointer-events-none absolute -bottom-4 left-[10%] -rotate-6 whitespace-nowrap text-4xl text-cinech-ink/90 md:text-6xl">
              {t('script')}
            </Script>
          </Reveal>
          <Reveal delay={0.15} className="max-w-md">
            <div className="paper rounded-md p-4 text-cinech-ink shadow-hard">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-cinech-olive" />
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                  {isGuest ? t('guest') : shortAddress(journal.owner)}
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-cinech-ink/70">{isGuest ? t('guestHint') : t('walletHint')}</p>
              {!isGuest && guestCount > 0 ? (
                <button type="button" onClick={importGuest} className="btn-olive mt-3 !px-4 !py-2 !text-xs">
                  <Import className="h-4 w-4" /> {t('importGuest').replace('{n}', String(guestCount))}
                </button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <FilmStrip text={language === 'en' ? 'WATCHED · RATED · STAMPED' : 'İZLENDİ · PUANLANDI · DAMGALANDI'} />

      <section className="paper relative py-14 text-cinech-ink">
        <RetroHud tl={language === 'en' ? '[Summary] 01' : '[Özet] 01'} tone="ink" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t('stubs'), String(stats.count)],
              [t('minutes'), String(stats.minutes)],
              [t('avg'), stats.avg ? stats.avg.toFixed(1) : '–'],
              [t('stamps'), `${stats.stamps}/${stamps.length}`],
            ].map(([label, value], i) => (
              <Reveal key={label} delay={i * 0.06}>
                <div className="rounded-md border-2 border-dashed border-cinech-brown/40 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">{label}</div>
                  <div className="mt-2 font-display text-5xl leading-none text-cinech-ink">{ready ? value : '…'}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-6 rounded-md border-2 border-cinech-ink/15 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">{t('editions')}</div>
              <p className="text-xs text-cinech-ink/60">{t('editionsText')}</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RARITY_ORDER.map((r) => {
                const info = RARITIES[r];
                return (
                  <div key={r} className="flex items-start gap-3">
                    <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 font-display text-lg ${EDITION_TILE[r]}`}>{info.letter}</span>
                    <div>
                      <div className="font-display text-xl uppercase leading-none text-cinech-ink">
                        {language === 'en' ? info.en : info.tr} <span className="text-cinech-olive">· {ready ? editions[r] : '…'}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-cinech-ink/60">{language === 'en' ? info.descEn : info.descTr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={share} className="btn-outline !px-4 !py-2 !text-xs text-cinech-ink">
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? t('copied') : t('share')}
            </button>
          </div>
        </div>
      </section>

      <section className="relative bg-cinech-ink py-16 text-cinech-cream">
        <RetroHud tl={language === 'en' ? '[Stamps] 02' : '[Damgalar] 02'} tr="[Collect]" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-8">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="red">
              {t('stampsTitle')}
            </Display>
            <p className="mt-3 text-sm text-cinech-cream/65">{t('stampsText')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="paper grid grid-cols-2 gap-6 rounded-md p-6 text-cinech-ink shadow-hard sm:grid-cols-4 lg:grid-cols-8">
              {stamps.map((s, i) => (
                <Stamp key={s.id} stamp={s} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={language === 'en' ? '[Stubs] 03' : '[Koçanlar] 03'} tr="[Scroll]" tone="ink" />
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-8">
            <Display className="text-5xl text-cinech-olive md:text-7xl" shadow="ink">
              {t('stubsTitle')}
            </Display>
          </Reveal>
          {ready && entries.length === 0 ? (
            <Reveal>
              <div className="rounded-md border-2 border-dashed border-cinech-brown/50 p-10 text-center">
                <div className="font-display text-3xl uppercase text-cinech-olive">{t('emptyTitle')}</div>
                <p className="mx-auto mt-2 max-w-md text-sm text-cinech-ink/70">{t('emptyText')}</p>
                <Link href="/#filmler" className="btn-olive mt-6 !px-5 !py-2.5 !text-sm">
                  {t('browse')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry, i) => {
                const film = filmById(entry.filmId);
                if (!film) return null;
                return (
                  <Reveal key={entry.id} delay={(i % 4) * 0.05}>
                    <TicketStub
                      entry={entry}
                      film={film}
                      index={i}
                      onUpdate={(patch) => update(entry.id, patch)}
                      onRemove={() => remove(entry.id)}
                    />
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
