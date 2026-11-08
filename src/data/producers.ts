import { FILMS, type Film } from './films';

export type ProducerTone = 'olive' | 'brown' | 'ink';

/** Uzmanlık etiketleri; kartlarda çip olarak görünür, iki dilde yazılır. */
export type SpecialtyId =
  | 'remotion'
  | 'blender'
  | 'animasyon'
  | 'ses-tasarimi'
  | 'senaryo'
  | 'canli-cekim'
  | 'belgesel'
  | 'renk'
  | 'kurgu';

export const SPECIALTIES: Record<SpecialtyId, { readonly tr: string; readonly en: string }> = {
  remotion: { tr: 'Remotion', en: 'Remotion' },
  blender: { tr: 'Blender', en: 'Blender' },
  animasyon: { tr: 'Animasyon', en: 'Animation' },
  'ses-tasarimi': { tr: 'Ses tasarımı', en: 'Sound design' },
  senaryo: { tr: 'Senaryo', en: 'Screenwriting' },
  'canli-cekim': { tr: 'Canlı çekim', en: 'Live action' },
  belgesel: { tr: 'Belgesel', en: 'Documentary' },
  renk: { tr: 'Renk düzeni', en: 'Colour grading' },
  kurgu: { tr: 'Kurgu', en: 'Editing' },
};

export type Producer = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly studio: string;
  readonly city: string;
  /** Stüdyonun kuruluş yılı */
  readonly since: number;
  readonly bio: { readonly tr: string; readonly en: string };
  readonly specialties: readonly SpecialtyId[];
  /** src/data/films.ts içindeki film kimlikleri */
  readonly filmIds: readonly string[];
  /** Kimlik kartındaki iki harfli rozet */
  readonly monogram: string;
  readonly tone: ProducerTone;
};

/**
 * Stüdyo yapımcıları. Yankı Stüdyo gerçek ve asgari bilgiyle yazıldı; diğer dördü kurgusal
 * filmlerin kurgusal sahipleridir (yönetmen adları films.ts ile aynıdır).
 */
export const PRODUCERS: readonly Producer[] = [
  {
    id: 'yanki-studyo',
    slug: 'yanki-studyo',
    name: 'Koray G.',
    studio: 'Yankı Stüdyo',
    city: 'İstanbul',
    since: 2025,
    bio: {
      tr: 'Yankı dizisini Remotion ile, kodla üretilen animasyon olarak yapıyor. Cinech kataloğunun ilk özgün yapımı bu stüdyodan çıktı.',
      en: 'Makes the Yankı series as code-driven animation with Remotion. The first original in the Cinech catalogue came out of this studio.',
    },
    specialties: ['remotion', 'animasyon', 'senaryo'],
    filmIds: ['yanki-1'],
    monogram: 'YS',
    tone: 'olive',
  },
  {
    id: 'liman-yapim',
    slug: 'liman-yapim',
    name: 'Selin Aydar',
    studio: 'Liman Yapım',
    city: 'İzmir',
    since: 2019,
    bio: {
      tr: 'Liman kentlerinin gece vardiyasını anlatan kara filmler yapıyor. Ses tasarımını kurgudan önce bitiren nadir ekiplerden biri.',
      en: 'Makes noir films about the night shifts of port cities. One of the rare teams that finishes the sound design before the edit.',
    },
    specialties: ['canli-cekim', 'ses-tasarimi', 'senaryo'],
    filmIds: ['gece-postasi', 'son-gosterim'],
    monogram: 'LY',
    tone: 'ink',
  },
  {
    id: 'ufuk-atolyesi',
    slug: 'ufuk-atolyesi',
    name: 'Mert Kaya',
    studio: 'Ufuk Atölyesi',
    city: 'Ankara',
    since: 2021,
    bio: {
      tr: "Çöl ve tuz manzaralarını Blender'da kuruyor, ritmi Remotion zaman çizelgesinde buluyor. Her filminin kendi radyo frekansı var.",
      en: 'Builds desert and salt-flat landscapes in Blender and finds the rhythm on a Remotion timeline. Every film has its own radio frequency.',
    },
    specialties: ['blender', 'remotion', 'renk'],
    filmIds: ['kizil-ufuk', 'tuz-golu'],
    monogram: 'UA',
    tone: 'brown',
  },
  {
    id: 'yorunge-studyo',
    slug: 'yorunge-studyo',
    name: 'Deniz Ulaş',
    studio: 'Yörünge Stüdyo',
    city: 'İstanbul',
    since: 2020,
    bio: {
      tr: 'Tek karakterli uzay dramları yapan, yörünge mekaniğini bir kez olsun yanlış göstermemeye ant içmiş bir ekip. Sessizliği ses tasarımının parçası sayıyor.',
      en: 'A team making single-character space dramas, sworn never to get orbital mechanics wrong. Treats silence as part of the sound design.',
    },
    specialties: ['blender', 'ses-tasarimi', 'kurgu'],
    filmIds: ['sessiz-yorunge'],
    monogram: 'YÖ',
    tone: 'olive',
  },
  {
    id: 'beton-kolektifi',
    slug: 'beton-kolektifi',
    name: 'Can Yıldırım',
    studio: 'Beton Kolektifi',
    city: 'Eskişehir',
    since: 2022,
    bio: {
      tr: 'Yıkım bekleyen mahallelerde belgesel ile kurgu arasında dolaşan bir kolektif. Kamerayı güvercinlerin göz hizasına koymayı seviyor.',
      en: 'A collective working between documentary and fiction in neighbourhoods awaiting demolition. Likes to set the camera at pigeon eye level.',
    },
    specialties: ['belgesel', 'canli-cekim', 'senaryo'],
    filmIds: ['beton-kuslar'],
    monogram: 'BK',
    tone: 'brown',
  },
];

/** Yapımcının filmografisi; kataloğa girmemiş kimlikler atlanır. */
export const producerFilms = (producer: Producer): Film[] =>
  producer.filmIds
    .map((id) => FILMS.find((f) => f.id === id))
    .filter((f): f is Film => Boolean(f));

export const producerBySlug = (slug: string): Producer | undefined => PRODUCERS.find((p) => p.slug === slug);
