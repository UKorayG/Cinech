'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Bell, Coins, Download, FlaskConical, Heart, Lock, Ticket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJournal } from '@/hooks/useJournal';
import { useLocalList } from '@/hooks/useLocalList';
import { FILMS } from '@/data/films';
import { journalStats, shortAddress } from '@/data/journal';
import { computeRewards, REWARD_RULES } from '@/data/rewards';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import Reveal from '@/components/retro/Reveal';
import { Display, Script } from '@/components/retro/Display';
import WalletCard from '@/components/gise/WalletCard';
import Odometer from '@/components/gise/Odometer';
import RewardReceipt from '@/components/gise/RewardReceipt';
import BoothCard from '@/components/gise/BoothCard';
import FilmList from '@/components/gise/FilmList';
import ExportJournalButton from '@/components/gise/ExportJournalButton';

/** Gişe: cüzdan penceresi, defterden türetilen ödül fişi, yerel listeler ve dışa aktarma. Zincire hiçbir şey yazılmaz. */
export default function BoxOfficePage() {
  const { language } = useLanguage();
  const en = language === 'en';
  const locale = en ? 'en-GB' : 'tr-TR';
  const { address } = useAccount();
  const { journal, ready } = useJournal(address);
  const [favorites] = useLocalList('cinech:favorites');
  const [reminders] = useLocalList('cinech:reminders');

  const rewards = useMemo(() => computeRewards(journal.entries), [journal.entries]);
  const stats = useMemo(() => journalStats(journal.entries), [journal.entries]);
  const favoriteFilms = useMemo(() => FILMS.filter((f) => favorites.includes(f.id)), [favorites]);
  const reminderFilms = useMemo(() => FILMS.filter((f) => reminders.includes(f.id)), [reminders]);

  const count = (n: number) => <span className="font-display text-3xl leading-none text-cinech-cream">{String(n).padStart(2, '0')}</span>;

  return (
    <div>
      {/* 1 · Başlık: zeytin bant */}
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud
          tl={en ? '[Box Office] 06' : '[Gişe] 06'}
          tr={`[${shortAddress(journal.owner)}]`}
          bl="PLAY"
          br={`REC ${String(ready ? rewards.total : 0).padStart(5, '0')} CINE`}
          rec
        />
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-6">
          <Reveal className="relative">
            <Display as="h1" className="text-6xl text-cinech-cream md:text-8xl">
              {en ? 'Box Office' : 'Gişe'}
            </Display>
            <Script className="pointer-events-none absolute -bottom-4 left-[10%] -rotate-6 whitespace-nowrap text-4xl text-cinech-ink/90 md:text-6xl">
              {en ? 'ticket booth' : 'bilet gişesi'}
            </Script>
          </Reveal>
          <Reveal delay={0.15} className="max-w-md">
            <div className="paper rounded-md p-4 text-cinech-ink shadow-hard">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-cinech-olive" />
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                  {en ? 'Testnet · no real money' : 'Testnet · gerçek para yok'}
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-cinech-ink/70">
                {en
                  ? 'This booth runs on the Sepolia test network. Balances are test ETH with no value, CINE points are derived from your journal, and nothing is written on-chain.'
                  : 'Bu gişe Sepolia test ağında çalışır. Bakiyeler değeri olmayan test ETH’dir, CINE puanları defterinden türetilir ve zincire hiçbir şey yazılmaz.'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <FilmStrip text={en ? 'WALLET · REWARDS · LISTS' : 'CÜZDAN · ÖDÜL · LİSTELER'} />

      {/* 2 · Cüzdan: kâğıt bant */}
      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={en ? '[Wallet] 01' : '[Cüzdan] 01'} tr="[Sepolia]" tone="ink" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <Display className="text-5xl text-cinech-olive md:text-7xl">{en ? 'Wallet' : 'Cüzdan'}</Display>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cinech-ink/70">
              {en
                ? 'The booth only talks to the Sepolia test network. Your address and test balance are shown as they are; nothing is signed or sent from this page.'
                : 'Gişe yalnızca Sepolia test ağıyla konuşur. Adresin ve test bakiyen olduğu gibi gösterilir; bu sayfadan hiçbir şey imzalanmaz, gönderilmez.'}
            </p>
            <ul className="mt-6 space-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-cinech-olive">
              <li>· {en ? 'Read-only' : 'Salt okunur'}</li>
              <li>· {en ? 'Testnet ETH only' : 'Yalnızca testnet ETH'}</li>
              <li>· {en ? 'Journal binds to your address' : 'Defter adresine bağlanır'}</li>
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <WalletCard />
          </Reveal>
        </div>
      </section>

      {/* 3 · Ödül defteri: mürekkep bant */}
      <section className="relative bg-cinech-ink py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Reward Ledger] 02' : '[Ödül Defteri] 02'} tr="[CINE]" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-10">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="red">
              {en ? 'Reward Ledger' : 'Ödül Defteri'}
            </Display>
            <p className="mt-3 max-w-xl text-sm text-cinech-cream/65">
              {en
                ? 'CINE points are recomputed from the stubs in your journal every time this page opens. Nothing extra is stored; nothing is on-chain yet.'
                : 'CINE puanları, sayfa her açıldığında defterindeki koçanlardan yeniden hesaplanır. Ayrıca kayıt tutulmaz; henüz zincirde değildir.'}
            </p>
          </Reveal>

          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <Reveal>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/60">{en ? 'Total CINE points' : 'Toplam CINE puanı'}</div>
                <div className="mt-3">
                  <Odometer value={ready ? rewards.total : 0} />
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <dl className="mt-8 grid gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cinech-cream/70">
                  {[
                    [`+${REWARD_RULES.entry}`, en ? 'per stub in the journal' : 'defterdeki her koçan'],
                    [`+${REWARD_RULES.rating}`, en ? 'if the stub is rated' : 'koçanda puan varsa'],
                    [`+${REWARD_RULES.note}`, en ? 'if the stub has a note' : 'koçanda not varsa'],
                    [`+${REWARD_RULES.loyalty}`, en ? 'loyalty · each new film after the first' : 'sadakat · ilkinden sonraki her yeni film'],
                  ].map(([rate, label]) => (
                    <div key={label} className="flex items-baseline gap-4 border-b border-dashed border-cinech-cream/15 pb-2">
                      <dt className="w-12 shrink-0 font-display text-xl leading-none text-cinech-cream">{rate}</dt>
                      <dd>{label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    [en ? 'Films watched' : 'İzlenen film', String(rewards.films)],
                    [en ? 'Stubs' : 'Koçan', String(stats.count)],
                    [
                      en ? 'Avg rating' : 'Ortalama puan',
                      stats.avg ? stats.avg.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '–',
                    ],
                  ].map(([label, value], i) => (
                    <div key={label} className={`rounded-md border-2 border-dashed border-cinech-cream/30 p-4 ${i === 1 ? 'sm:-rotate-1' : i === 2 ? 'sm:rotate-1' : ''}`}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-cream/60">{label}</div>
                      <div className="mt-2 font-display text-4xl leading-none text-cinech-cream">{ready ? value : '…'}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1} rotate={2}>
              <RewardReceipt summary={rewards} owner={journal.owner} ready={ready} />
            </Reveal>
          </div>
        </div>
      </section>

      <FilmStrip tone="cream" text={en ? 'FAVOURITES · REMINDERS · EXPORT' : 'FAVORİLER · HATIRLATMALAR · DIŞA AKTAR'} />

      {/* 4 · Listeler ve dışa aktarma: kâğıt bant */}
      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={en ? '[Lists] 03' : '[Listeler] 03'} tr="[Local]" tone="ink" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-10">
            <Display className="text-5xl text-cinech-olive md:text-7xl">{en ? 'Lists' : 'Listeler'}</Display>
            <p className="mt-3 max-w-xl text-sm text-cinech-ink/70">
              {en
                ? 'Favourites and reminders you marked on the film cards live in this browser. Edit them from the catalogue; here they are counted.'
                : 'Film kartlarında işaretlediğin favoriler ve hatırlatmalar bu tarayıcıda durur. Düzenlemek için kataloğa git; burada sayılır.'}
            </p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <Reveal>
              <BoothCard icon={<Heart className="h-4 w-4" />} label={en ? 'Favourites' : 'Favoriler'} aside={count(favoriteFilms.length)} tilt={-1}>
                <FilmList
                  films={favoriteFilms}
                  emptyText={en ? 'No favourites yet. Tap the heart on a film card.' : 'Henüz favori yok. Bir film kartındaki kalbe dokun.'}
                  ctaText={en ? 'Browse films' : 'Filmlere git'}
                  meta={(f) => `${f.year} · ${f.genre}`}
                />
              </BoothCard>
            </Reveal>
            <Reveal delay={0.06}>
              <BoothCard icon={<Bell className="h-4 w-4" />} label={en ? 'Reminders' : 'Hatırlatmalar'} aside={count(reminderFilms.length)} tilt={1}>
                <FilmList
                  films={reminderFilms}
                  emptyText={en ? 'No reminders yet. Tap the bell on a coming film.' : 'Henüz hatırlatma yok. Yakında gelen bir filmdeki zile dokun.'}
                  ctaText={en ? 'See the programme' : 'Programa git'}
                  meta={(f) =>
                    f.releaseDate
                      ? `${en ? 'Screening' : 'Gösterim'} · ${new Date(f.releaseDate).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}`
                      : en
                        ? 'Date to be announced'
                        : 'Tarih açıklanacak'
                  }
                />
              </BoothCard>
            </Reveal>
            <Reveal delay={0.12} className="md:col-span-2 xl:col-span-1">
              <BoothCard icon={<Download className="h-4 w-4" />} label={en ? 'Export' : 'Dışa aktar'} aside={count(stats.count)} tilt={-0.6}>
                <p className="text-sm leading-relaxed text-cinech-cream/75">
                  {en
                    ? 'Download the stubs in your journal as a JSON file: a backup, or a way to carry them to another device. Nothing is uploaded anywhere.'
                    : 'Defterindeki koçanları JSON dosyası olarak indir: yedek olarak ya da başka bir cihaza taşımak için. Hiçbir yere yüklenmez.'}
                </p>
                <ExportJournalButton journal={journal} className="mt-5" />
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/50">
                  {en ? `${stats.count} stubs · stays on your device` : `${stats.count} koçan · cihazında kalır`}
                </p>
              </BoothCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5 · Yakında: zeytin bant */}
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Soon] 04' : '[Yakında] 04'} tr="[On-chain]" bl="END" br="REC 00:00:00" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-8">
            <Display className="text-5xl text-cinech-cream md:text-7xl">{en ? 'Up Next' : 'Sıradakiler'}</Display>
            <p className="mt-3 max-w-xl text-sm text-cinech-cream/75">
              {en
                ? 'What this booth will hand out once the contracts are live. Until then the labels stay honest.'
                : 'Sözleşmeler yayına girince bu gişenin dağıtacakları. O güne kadar etiketler dürüst kalır.'}
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: <Ticket className="h-4 w-4" />,
                hud: 'NFT',
                title: en ? 'Film Journal NFT' : 'Film Defteri NFT',
                text: en
                  ? 'Stubs will be mintable on Sepolia as a collection, one NFT per stub, bound to the wallet you connect. Today they live only in this browser.'
                  : 'Koçanlar Sepolia’da bir koleksiyon olarak basılabilecek; her koçan bir NFT, bağladığın cüzdana ait. Bugün yalnızca bu tarayıcıda duruyorlar.',
                tilt: -0.8,
              },
              {
                icon: <Coins className="h-4 w-4" />,
                hud: 'TOKEN',
                title: 'CINE Token',
                text: en
                  ? 'The points on the receipt may one day become CINE. Right now they are a derived number: not on-chain, not transferable, not for sale.'
                  : 'Fişteki puanlar bir gün CINE’ye dönüşebilir. Şimdilik türetilmiş bir sayı: zincirde değil, devredilemez, satılamaz.',
                tilt: 0.8,
              },
            ].map((item, i) => (
              <Reveal key={item.hud} delay={i * 0.08} rotate={item.tilt}>
                <div className="paper relative rounded-md p-6 text-cinech-ink shadow-hard">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
                      {item.icon}
                      {item.hud}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-cinech-brown px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-brown">
                      <Lock className="h-3 w-3" /> {en ? 'coming soon' : 'yakında'}
                    </span>
                  </div>
                  <div className="mt-4 font-display text-3xl uppercase leading-none tracking-wide text-cinech-ink">{item.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-cinech-ink/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/70">
            {en ? 'Nothing is written on-chain yet.' : 'Şimdilik zincire hiçbir şey yazılmıyor.'}
          </p>
        </div>
      </section>
    </div>
  );
}
