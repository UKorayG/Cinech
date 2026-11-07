import type { Film } from './films';
import type { JournalEntry } from './journal';

/** Koçan edisyonu: izleme koşullarından türetilen nadirlik kademesi */
export type Rarity = 'standart' | 'gece' | 'altin' | 'gala';

export type Edition = {
  /** Örn. YNK-G-0007 → seri, nadirlik harfi, koçan numarası */
  readonly code: string;
  readonly series: string;
  readonly rarity: Rarity;
  readonly number: number;
};

export type RarityInfo = {
  readonly letter: string;
  readonly tr: string;
  readonly en: string;
  readonly descTr: string;
  readonly descEn: string;
  /** Sıralama ağırlığı; yüksek = nadir */
  readonly weight: number;
};

export const RARITIES: Readonly<Record<Rarity, RarityInfo>> = {
  standart: { letter: 'S', tr: 'Standart', en: 'Standard', descTr: 'Olağan bir seans koçanı.', descEn: 'An ordinary screening stub.', weight: 0 },
  gece: { letter: 'N', tr: 'Gece Yarısı', en: 'Midnight', descTr: '23:00 ile 04:00 arasındaki seanslar.', descEn: 'Screenings between 23:00 and 04:00.', weight: 1 },
  altin: { letter: 'A', tr: 'Altın Baskı', en: 'Gold Print', descTr: 'Tam puan ve kırk karakteri aşan bir not.', descEn: 'Full marks plus a note over forty characters.', weight: 2 },
  gala: { letter: 'G', tr: 'Gala', en: 'Gala', descTr: 'Gösterim gününde izlenen seans.', descEn: 'Watched on the screening day itself.', weight: 3 },
};

export const RARITY_ORDER: readonly Rarity[] = ['gala', 'altin', 'gece', 'standart'];

/** Filmin koçan serisi: kelime baş harfleri + ilk kelimenin sessizleri, 3 harf (Yankı → YNK) */
export const seriesOf = (film: Film): string => {
  const words = film.slug.replace(/-bolum-\d+$/, '').split('-').filter(Boolean);
  const upper = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');
  const initials = words.map((w) => upper(w)[0] ?? '').join('');
  const extra = upper(words[0] ?? '').slice(1).replace(/[AEIOU]/g, '');
  return (initials + extra + 'XXX').slice(0, 3);
};

const localDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const rarityOf = (entry: JournalEntry, film: Film | undefined): Rarity => {
  const d = new Date(entry.watchedAt);
  if (film?.releaseDate && localDate(d) === film.releaseDate) return 'gala';
  if (entry.rating === 5 && entry.note.trim().length >= 40) return 'altin';
  const h = d.getHours();
  if (h >= 23 || h < 4) return 'gece';
  return 'standart';
};

export const editionOf = (entry: JournalEntry, film: Film | undefined): Edition => {
  const rarity = rarityOf(entry, film);
  const series = film ? seriesOf(film) : 'CNC';
  return {
    code: `${series}-${RARITIES[rarity].letter}-${String(entry.stubNo).padStart(4, '0')}`,
    series,
    rarity,
    number: entry.stubNo,
  };
};

export const editionBreakdown = (entries: readonly JournalEntry[], filmOf: (id: string) => Film | undefined): Record<Rarity, number> => {
  const out: Record<Rarity, number> = { standart: 0, gece: 0, altin: 0, gala: 0 };
  for (const e of entries) out[rarityOf(e, filmOf(e.filmId))] += 1;
  return out;
};

/** ERC-721 uyumlu metadata taslağı; NFT basımı ve dışa aktarım için */
export const editionMetadata = (entry: JournalEntry, film: Film | undefined) => {
  const edition = editionOf(entry, film);
  const info = RARITIES[edition.rarity];
  return {
    name: `Cinech Koçan ${edition.code}`,
    description: film ? `${film.title}${film.episode ? ` · ${film.episode}` : ''} · ${info.tr} edisyonu · ${entry.room} · Koltuk ${entry.seat}` : `Cinech koçanı ${edition.code}`,
    image: film?.image ?? null,
    external_url: film ? `/film/${film.slug}` : null,
    attributes: [
      { trait_type: 'Film', value: film?.title ?? entry.filmId },
      { trait_type: 'Edisyon', value: info.tr },
      { trait_type: 'Seri', value: edition.series },
      { trait_type: 'Koçan No', value: entry.stubNo, display_type: 'number' },
      { trait_type: 'Salon', value: entry.room },
      { trait_type: 'Koltuk', value: entry.seat },
      { trait_type: 'Puan', value: entry.rating, display_type: 'number', max_value: 5 },
      { trait_type: 'İzleme', value: Math.floor(new Date(entry.watchedAt).getTime() / 1000), display_type: 'date' },
    ],
  };
};
