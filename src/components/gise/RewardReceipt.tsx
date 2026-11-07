'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { filmById, shortAddress } from '@/data/journal';
import { REWARD_RULES, type RewardSummary } from '@/data/rewards';

type Props = {
  readonly summary: RewardSummary;
  readonly owner: string;
  readonly ready: boolean;
};

/** Yırtık fiş kenarı: kâğıt renginde, yarım daire delikli şerit; arkadaki zemin deliklerden görünür. */
const edge = (side: 'top' | 'bottom'): React.CSSProperties => ({
  background: `radial-gradient(circle at 50% ${side === 'top' ? '0' : '100%'}, transparent 6px, #EAE4D2 6.5px)`,
  backgroundSize: '16px 12px',
  backgroundRepeat: 'repeat-x',
});

const Dashed = ({ double = false }: { readonly double?: boolean }) => (
  <div className={`my-3 border-t-2 border-dashed border-cinech-ink/35 ${double ? 'border-b-2 py-0.5' : ''}`} aria-hidden />
);

const BARCODE =
  'repeating-linear-gradient(90deg, #1C2118 0 2px, transparent 2px 5px, #1C2118 5px 6px, transparent 6px 9px, #1C2118 9px 12px, transparent 12px 14px, #1C2118 14px 15px, transparent 15px 19px)';

/** Ödül fişi: gişe rulosundan çıkmış gibi; mono yazı, kesikli ayraçlar, delikli kenarlar. */
export default function RewardReceipt({ summary, owner, ready }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const locale = en ? 'en-GB' : 'tr-TR';
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' });
  const now = new Date().toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const empty = ready && summary.lines.length === 0;

  const cols = 'grid grid-cols-[52px_minmax(0,1fr)_40px_48px_44px] items-baseline gap-x-2';

  return (
    <motion.div
      className="mx-auto w-full max-w-md"
      initial={{ rotate: 1 }}
      whileHover={{ rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } }}
    >
      <div className="h-3" style={edge('top')} aria-hidden />
      <div className="paper px-6 py-5 font-mono text-[11px] leading-relaxed text-cinech-ink">
        <div className="text-center">
          <div className="font-display text-2xl leading-none tracking-wide">CINECH {en ? 'BOX OFFICE' : 'GİŞE'}</div>
          <div className="mt-1 uppercase tracking-[0.3em] text-cinech-olive">{en ? 'Reward receipt' : 'Ödül fişi'}</div>
        </div>
        <Dashed />
        <div className="flex justify-between gap-3 uppercase tracking-[0.15em]">
          <span>{en ? 'Holder' : 'Sahip'}</span>
          <span>{shortAddress(owner)}</span>
        </div>
        <div className="flex justify-between gap-3 uppercase tracking-[0.15em]">
          <span>{en ? 'Printed' : 'Basım'}</span>
          <span>{now}</span>
        </div>
        <div className="flex justify-between gap-3 uppercase tracking-[0.15em]">
          <span>{en ? 'Network' : 'Ağ'}</span>
          <span>Sepolia · testnet</span>
        </div>
        <Dashed />

        {!ready ? (
          <div className="py-6 text-center uppercase tracking-[0.3em] text-cinech-ink/50">…</div>
        ) : empty ? (
          <div className="py-4 text-center">
            <div className="font-display text-2xl uppercase leading-none text-cinech-olive">{en ? 'Empty journal' : 'Defter boş'}</div>
            <p className="mx-auto mt-2 max-w-xs text-xs text-cinech-ink/70">
              {en
                ? 'No stubs yet. Paste your first film into the journal and this receipt starts to grow.'
                : 'Henüz koçan yok. İlk filmi deftere yapıştır, bu fiş uzamaya başlar.'}
            </p>
            <Link href="/defter" className="btn-olive mt-4 !px-4 !py-2 !text-xs">
              {en ? 'Go to the journal' : 'Deftere git'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className={`${cols} uppercase tracking-[0.15em] text-cinech-ink/60`}>
              <span>{en ? 'Date' : 'Tarih'}</span>
              <span>Film</span>
              <span>{en ? 'Seat' : 'Koltuk'}</span>
              <span className="text-right">№</span>
              <span className="text-right">{en ? 'Pts' : 'Puan'}</span>
            </div>
            <div className="mt-1 border-t border-dashed border-cinech-ink/25" aria-hidden />
            <ul className="mt-1">
              {summary.lines.map((line) => {
                const film = filmById(line.entry.filmId);
                return (
                  <li key={line.entry.id} className={`${cols} py-1`}>
                    <span className="tabular-nums">{fmtDate(line.entry.watchedAt)}</span>
                    <span className="truncate" title={film?.title ?? line.entry.filmId}>
                      {film?.title ?? line.entry.filmId}
                      {line.loyalty ? <span className="text-cinech-olive"> ★</span> : null}
                    </span>
                    <span className="tabular-nums">{line.entry.seat}</span>
                    <span className="text-right tabular-nums">{String(line.entry.stubNo).padStart(4, '0')}</span>
                    <span className="text-right font-bold tabular-nums">+{line.points}</span>
                  </li>
                );
              })}
            </ul>
            <Dashed />
            <div className="grid gap-1 uppercase tracking-[0.15em]">
              {[
                [en ? `Stubs × ${summary.lines.length}` : `Koçan × ${summary.lines.length}`, `+${REWARD_RULES.entry}`, summary.base],
                [en ? `Rated × ${summary.rated}` : `Puanlı × ${summary.rated}`, `+${REWARD_RULES.rating}`, summary.rating],
                [en ? `Noted × ${summary.noted}` : `Notlu × ${summary.noted}`, `+${REWARD_RULES.note}`, summary.note],
                [
                  en ? `Loyalty ★ × ${Math.max(0, summary.films - 1)}` : `Sadakat ★ × ${Math.max(0, summary.films - 1)}`,
                  `+${REWARD_RULES.loyalty}`,
                  summary.loyalty,
                ],
              ].map(([label, rate, value]) => (
                <div key={String(label)} className="grid grid-cols-[1fr_auto_56px] gap-x-3">
                  <span className="truncate">{label}</span>
                  <span className="text-cinech-ink/50">{rate}</span>
                  <span className="text-right tabular-nums">{value}</span>
                </div>
              ))}
            </div>
            <Dashed double />
            <div className="flex items-baseline justify-between gap-3">
              <span className="uppercase tracking-[0.3em]">{en ? 'Total' : 'Toplam'}</span>
              <span className="font-display text-4xl leading-none tabular-nums">
                {summary.total} <span className="text-lg text-cinech-olive">CINE</span>
              </span>
            </div>
          </>
        )}

        <Dashed />
        <div className="mx-auto h-10 w-[85%] opacity-80" style={{ background: BARCODE }} aria-hidden />
        <div className="mt-3 text-center uppercase tracking-[0.3em] text-cinech-ink/60">
          {en ? 'Thank you · enjoy the show' : 'Teşekkürler · iyi seyirler'}
        </div>
        <div className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-cinech-ink/45">
          {en ? 'Derived from your journal · not on-chain' : 'Defterinden türetildi · zincirde değil'}
        </div>
      </div>
      <div className="h-3" style={edge('bottom')} aria-hidden />
    </motion.div>
  );
}
