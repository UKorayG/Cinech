import { FILMS, type Film, type PosterStyle } from './films';

export type Localized = { readonly tr: string; readonly en: string };

export type PosterPalette = { readonly bg: string; readonly accent: string; readonly accent2: string };

/** Yarışmaya asılmış bir afiş: kurgusal tohum girdi ya da bu tarayıcıdan gönderilmiş */
export type ContestEntry = {
  readonly id: string;
  readonly title: string;
  /** Kurgusal kullanıcı adı, ör. "@gecekusu" */
  readonly author: string;
  readonly filmId: string;
  /** Kodla üretilen afişin kompozisyonu (görsel yoksa kullanılır) */
  readonly style: PosterStyle;
  readonly palette: PosterPalette;
  /** Tohum girdilerin başlangıç oyu; bu cihazdaki oylar üstüne eklenir */
  readonly seedVotes: number;
  readonly submittedAt: string;
  /** Kullanıcının yüklediği afiş (JPEG data URL, en fazla 400 KB) */
  readonly image?: string;
  /** Gönderen (küçük harf cüzdan adresi ya da misafir); tohum girdilerde yok */
  readonly owner?: string;
};

export type Contest = {
  readonly id: string;
  readonly title: Localized;
  readonly theme: Localized;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly rules: readonly Localized[];
  readonly prize: Localized;
  readonly entries: readonly ContestEntry[];
};

/** Katılımcı başına gönderim sınırı (kural 04) */
export const MAX_ENTRIES_PER_OWNER = 3;

/**
 * Güncel yarışma. Girdiler ve kullanıcı adları kurgusaldır; paletler Zeytin ailesinin koyu tonlarında kalır.
 */
export const CONTEST: Contest = {
  id: 'afis-2026-11',
  title: { tr: 'Kasım 2026 · Yankı için alternatif afiş', en: 'November 2026 · An alternative poster for Yankı' },
  theme: {
    tr: 'Madde bir anı taşıyıcısıdır. Yankı’nın dünyasını tek karede anlat: kuantum arkeolojisi, gümüş anka broşu, ışığı kesen iki öğrenci.',
    en: 'Matter carries memory. Tell the world of Yankı in a single frame: quantum archaeology, a silver phoenix brooch, two students crossing the light.',
  },
  startsAt: '2026-11-01T00:00:00+03:00',
  endsAt: '2026-11-30T23:59:59+03:00',
  rules: [
    {
      tr: 'Afiş sana ait olmalı; gerçek kişilerin, markaların ya da başka filmlerin görselleri kullanılamaz.',
      en: 'The poster must be your own work; no imagery of real people, brands or other films.',
    },
    {
      tr: 'Ana tema Yankı; katalogdaki diğer filmler için afişler de kabul edilir.',
      en: 'Yankı is the main theme; posters for the other catalogue films are welcome too.',
    },
    {
      tr: 'Dikey oran (2:3 ya da 3:4); görsel tarayıcında 600 piksele küçültülür.',
      en: 'Portrait ratio (2:3 or 3:4); the image is resized to 600 px in your browser.',
    },
    {
      tr: 'Her katılımcı en fazla üç afiş gönderebilir; her afişe bir oy, istersen geri alabilirsin.',
      en: 'Up to three posters per participant; one vote per poster, and you can take it back.',
    },
    {
      tr: 'Oylama 30 Kasım 23:59’da kapanır; kazanan 1 Aralık’ta duyurulur.',
      en: 'Voting closes 30 November at 23:59; the winner is announced on 1 December.',
    },
  ],
  prize: {
    tr: 'Kazanan afiş bir ay boyunca Cinech ana sayfasında, Yankı’nın yanında asılı kalır ve tasarımcısının adıyla anılır.',
    en: 'The winning poster hangs on the Cinech home page next to Yankı for a month, credited to its designer.',
  },
  entries: [
    {
      id: 'seed-anka',
      title: 'Anka',
      author: '@gecekusu',
      filmId: 'yanki-1',
      style: 'noir',
      palette: { bg: '#1C2118', accent: '#9A6333', accent2: '#EAE4D2' },
      seedVotes: 41,
      submittedAt: '2026-11-02T20:14:00+03:00',
    },
    {
      id: 'seed-kazi',
      title: 'Kuantum Kazısı',
      author: '@tozlu_makara',
      filmId: 'yanki-1',
      style: 'orbit',
      palette: { bg: '#121710', accent: '#52653F', accent2: '#DDD4BC' },
      seedVotes: 37,
      submittedAt: '2026-11-03T11:02:00+03:00',
    },
    {
      id: 'seed-bros',
      title: 'Gümüş Broş',
      author: '@perde_arasi',
      filmId: 'yanki-1',
      style: 'monolith',
      palette: { bg: '#241A10', accent: '#7A4A24', accent2: '#E4DCC6' },
      seedVotes: 29,
      submittedAt: '2026-11-04T09:40:00+03:00',
    },
    {
      id: 'seed-ogrenci',
      title: 'İki Öğrenci',
      author: '@sessizkare',
      filmId: 'yanki-1',
      style: 'storm',
      palette: { bg: '#0F120C', accent: '#3C4A32', accent2: '#EAE4D2' },
      seedVotes: 22,
      submittedAt: '2026-11-05T18:25:00+03:00',
    },
    {
      id: 'seed-vardiya',
      title: 'Gece Vardiyası',
      author: '@makinist35',
      filmId: 'gece-postasi',
      style: 'grid',
      palette: { bg: '#1A1F14', accent: '#9A6333', accent2: '#DDD4BC' },
      seedVotes: 18,
      submittedAt: '2026-11-06T22:05:00+03:00',
    },
    {
      id: 'seed-perde',
      title: 'Son Perde',
      author: '@kucuk_salon',
      filmId: 'son-gosterim',
      style: 'marquee',
      palette: { bg: '#2B3624', accent: '#7A4A24', accent2: '#EAE4D2' },
      seedVotes: 15,
      submittedAt: '2026-11-07T13:50:00+03:00',
    },
  ],
};

export const contestFilm = (entry: ContestEntry): Film | undefined => FILMS.find((f) => f.id === entry.filmId);

/** Tohum girdinin afişi: filmin künyesi, girdinin kompozisyonu ve paleti; gerçek görsel devre dışı */
export const posterFor = (entry: ContestEntry, film: Film): Film => ({
  ...film,
  poster: entry.style,
  palette: entry.palette,
  image: undefined,
  imageFocus: undefined,
  featured: false,
});

export const isContestOpen = (now: Date, contest: Contest = CONTEST) =>
  now.getTime() >= new Date(contest.startsAt).getTime() && now.getTime() <= new Date(contest.endsAt).getTime();

export type TimeLeft = { readonly days: number; readonly hours: number; readonly minutes: number; readonly ended: boolean };

/** Bitişe kalan süre, dakika çözünürlüğünde */
export const timeLeft = (endsAt: string, now: Date): TimeLeft => {
  const ms = new Date(endsAt).getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, ended: true };
  const totalMinutes = Math.floor(ms / 60_000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    ended: false,
  };
};

/** "@gecekusu" biçimine getir: boşluklar alt çizgi, başta tek @ */
export const normalizeHandle = (raw: string) => {
  const h = raw.trim().replace(/\s+/g, '_').replace(/^@+/, '');
  return h ? `@${h}` : '@misafir';
};
