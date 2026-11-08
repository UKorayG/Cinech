import { FILMS } from '@/data/films';

export type SearchKind = 'film' | 'page';

export type SearchItem = {
  readonly id: string;
  readonly kind: SearchKind;
  readonly href: string;
  readonly title: { readonly tr: string; readonly en: string };
  /** Sağdaki mono etiket: bölüm · yıl ya da "Sayfa" */
  readonly meta: { readonly tr: string; readonly en: string };
  /** İkinci satır: slogan · tür · yönetmen ya da yol */
  readonly detail: { readonly tr: string; readonly en: string };
  /** Normalize edilmiş başlık (TR + EN) */
  readonly titleN: string;
  /** Normalize edilmiş diğer alanlar */
  readonly restN: string;
};

/**
 * Büyük/küçük harf ve aksan duyarsız karşılaştırma: İ/ı → i, sonra küçük harf,
 * NFD ayrıştırması ve birleşik işaretlerin (ş→s, ğ→g, ö→o, ü→u, ç→c) atılması.
 */
export function normalize(input: string): string {
  return input
    .replace(/[İı]/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

const PAGES = [
  { href: '/', tr: 'Ana Sayfa', en: 'Home', keywords: 'anasayfa başlangıç giriş start' },
  { href: '/#filmler', tr: 'Filmler', en: 'Films', keywords: 'film katalog gösterim program movies catalogue schedule' },
  { href: '/dao', tr: 'DAO', en: 'DAO', keywords: 'oy oylama teklif topluluk yönetişim vote voting proposal governance' },
  { href: '/defter', tr: 'Defter', en: 'Journal', keywords: 'koçan damga izledim film defteri stubs stamps watched' },
  { href: '/gise', tr: 'Gişe', en: 'Box Office', keywords: 'bilet hasılat satış ticket sales' },
  { href: '/afis', tr: 'Afiş Yarışması', en: 'Poster Contest', keywords: 'afiş poster yarışma tasarım design' },
  { href: '/studyo', tr: 'Stüdyo', en: 'Studio', keywords: 'yapım üretim production studio' },
] as const;

export const PAGE_ITEMS: readonly SearchItem[] = PAGES.map((p) => ({
  id: `page:${p.href}`,
  kind: 'page',
  href: p.href,
  title: { tr: p.tr, en: p.en },
  meta: { tr: 'Sayfa', en: 'Page' },
  detail: { tr: p.href, en: p.href },
  titleN: normalize(`${p.tr} ${p.en}`),
  restN: normalize(p.keywords),
}));

export const FILM_ITEMS: readonly SearchItem[] = FILMS.map((f) => {
  const meta = [f.episode, String(f.year)].filter(Boolean).join(' · ');
  const detail = `${f.tagline} · ${f.genre} · ${f.director}`;
  return {
    id: `film:${f.slug}`,
    kind: 'film',
    href: `/film/${f.slug}`,
    title: { tr: f.title, en: f.title },
    meta: { tr: meta, en: meta },
    detail: { tr: detail, en: detail },
    titleN: normalize(f.title),
    restN: normalize([f.episode ?? '', f.tagline, f.genre, f.director, String(f.year)].join(' ')),
  };
});

/** Filmler önce, sayfalar sonra; eşit puanda bu sıra korunur. */
export const SEARCH_ITEMS: readonly SearchItem[] = [...FILM_ITEMS, ...PAGE_ITEMS];

export function findItem(id: string): SearchItem | undefined {
  return SEARCH_ITEMS.find((item) => item.id === id);
}

/**
 * Sıralama: başlık sorguyla başlıyor (0) › başlık içeriyor (1) › tüm kelimeler başlıkta (2)
 * › diğer alanlar içeriyor (3) › tüm kelimeler herhangi bir alanda (4).
 */
export function search(query: string, limit = 8): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of SEARCH_ITEMS) {
    let score: number | null = null;
    if (item.titleN.startsWith(q)) score = 0;
    else if (item.titleN.includes(q)) score = 1;
    else if (tokens.every((t) => item.titleN.includes(t))) score = 2;
    else if (item.restN.includes(q)) score = 3;
    else if (tokens.every((t) => item.titleN.includes(t) || item.restN.includes(t))) score = 4;
    if (score !== null) scored.push({ item, score });
  }

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((s) => s.item);
}
