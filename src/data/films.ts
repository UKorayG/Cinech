export type FilmStatus = 'available' | 'coming';
export type PosterStyle = 'monolith' | 'noir' | 'sun' | 'orbit' | 'storm' | 'grid' | 'marquee';
/** Ruh hali etiketleri: katalogdaki "bu akşam ne çekiyor?" filtresi */
export type Mood = 'gerilim' | 'merak' | 'karanlik' | 'huzun' | 'umut' | 'nostalji' | 'enerji';

export type Film = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly episode?: string;
  readonly tagline: string;
  readonly synopsis: string;
  readonly durationMinutes: number;
  readonly year: number;
  readonly genre: string;
  readonly moods: readonly Mood[];
  readonly director: string;
  readonly palette: { readonly bg: string; readonly accent: string; readonly accent2: string };
  /** Kodla üretilen afişin kompozisyon tarzı (görsel yoksa kullanılır) */
  readonly poster: PosterStyle;
  /** Gerçek afiş görseli (public altındaki yol); varsa kodla üretilen kompozisyonun yerine geçer */
  readonly image?: string;
  /** Kırpılırken odakta kalacak nokta (CSS object-position), ör. '50% 30%' */
  readonly imageFocus?: string;
  /** Video kaynağı; render tamamlanınca doldurulur (yerel /videos/… ya da IPFS/CDN adresi) */
  readonly videoUrl: string | null;
  readonly status: FilmStatus;
  /** Gösterim programı için planlanan tarih (ISO) */
  readonly releaseDate?: string;
  readonly featured?: boolean;
};

/**
 * Cinech kataloğu. İlk özgün yapım Yankı; diğerleri arayüzü doldurmak için kurgusal örneklerdir.
 */
export const FILMS: readonly Film[] = [
  {
    id: 'yanki-1',
    slug: 'yanki-bolum-1',
    title: 'Yankı',
    episode: 'Bölüm 1',
    tagline: 'Madde, bir anı taşıyıcısıdır.',
    synopsis:
      "Kuantum fizikçisi Dr. Anja Richter'in 'kuantum arkeolojisi' projesi, maddenin geçmişin yankısını taşıdığını iddia eder. Akademi onu dışlar; iki öğrenci, Aslı ve Toprak, peşine düşer. Bir restoranda parlayan gümüş bir anka broşu ise Profesör Pharas'ın maskesini düşürür.",
    durationMinutes: 20,
    year: 2025,
    genre: 'Bilimkurgu · Gizem',
    moods: ['merak', 'karanlik', 'gerilim'],
    director: 'Kullanıcı & Nolan',
    palette: { bg: '#141b1f', accent: '#8fb3c2', accent2: '#dfe7ea' },
    poster: 'monolith',
    image: '/posters/yanki-bolum-1.jpg',
    imageFocus: '50% 32%',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2026-11-21',
    featured: true,
  },
  {
    id: 'gece-postasi',
    slug: 'gece-postasi',
    title: 'Gece Postası',
    tagline: 'Her zarf bir itiraf.',
    synopsis:
      'Yağmurlu bir liman kentinde gece vardiyasındaki postacı, teslim edemediği mektupları okumaya başlar. Zarflardan biri, kendi ölümünün tarihini taşımaktadır.',
    durationMinutes: 95,
    year: 2024,
    genre: 'Kara film · Gerilim',
    moods: ['gerilim', 'karanlik', 'nostalji'],
    director: 'Selin Aydar',
    palette: { bg: '#0e0b0b', accent: '#e8c170', accent2: '#c4262d' },
    poster: 'noir',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2026-11-28',
  },
  {
    id: 'kizil-ufuk',
    slug: 'kizil-ufuk',
    title: 'Kızıl Ufuk',
    tagline: 'Yol bitmez, benzin biter.',
    synopsis:
      'Çölün ortasında kapanan son benzin istasyonunun sahibi, kasetçalarında tek bir şarkı çalan eski bir arabayla ufka doğru sürer. Radyoda yalnızca 1986 yılının yayınları vardır.',
    durationMinutes: 102,
    year: 2025,
    genre: 'Yol filmi · Bilimkurgu',
    moods: ['enerji', 'umut', 'merak'],
    director: 'Mert Kaya',
    palette: { bg: '#140a1c', accent: '#ff6b35', accent2: '#ffd166' },
    poster: 'sun',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2026-12-05',
  },
  {
    id: 'sessiz-yorunge',
    slug: 'sessiz-yorunge',
    title: 'Sessiz Yörünge',
    tagline: 'Dünya cevap vermiyor.',
    synopsis:
      'Terk edilmiş bir uzay istasyonunda tek başına kalan mühendis, her 92 dakikada bir Dünya ile aynı hizaya gelir ve aynı mesajı gönderir. Yıllar sonra ilk kez bir yanıt alır.',
    durationMinutes: 118,
    year: 2023,
    genre: 'Uzay · Dram',
    moods: ['huzun', 'merak', 'karanlik'],
    director: 'Deniz Ulaş',
    palette: { bg: '#050811', accent: '#7dd3fc', accent2: '#f4e9d6' },
    poster: 'orbit',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2026-12-12',
  },
  {
    id: 'tuz-golu',
    slug: 'tuz-golu',
    title: 'Tuz Gölü',
    tagline: 'Gölge düşmez, iz kalır.',
    synopsis:
      'Kurumuş bir tuz gölünün ortasındaki kasabaya, kasabalıların hiç görmediği bir renkte atla biri gelir. Ne kimdir ne de ne istediğini söyler; yalnızca her gün öğlen aynı yere oturur.',
    durationMinutes: 87,
    year: 2024,
    genre: 'Western · Sürreal',
    moods: ['karanlik', 'nostalji', 'merak'],
    director: 'Ayşe Toprak',
    palette: { bg: '#1a120a', accent: '#f4e9d6', accent2: '#c4262d' },
    poster: 'storm',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2026-12-19',
  },
  {
    id: 'beton-kuslar',
    slug: 'beton-kuslar',
    title: 'Beton Kuşlar',
    tagline: 'Şehir onları unuttu, onlar şehri değil.',
    synopsis:
      'Yıkılmayı bekleyen bir toplu konut bloğunda yaşayan son üç aile ile çatıda yuva yapan güvercinlerin bir yılı. Belgesel ile kurgunun arasında, betonun sesini dinleyen bir film.',
    durationMinutes: 74,
    year: 2025,
    genre: 'Belgesel · Kurgu',
    moods: ['umut', 'huzun', 'nostalji'],
    director: 'Can Yıldırım',
    palette: { bg: '#101214', accent: '#9aa5b1', accent2: '#c4262d' },
    poster: 'grid',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2027-01-09',
  },
  {
    id: 'son-gosterim',
    slug: 'son-gosterim',
    title: 'Son Gösterim',
    tagline: 'Perde kapanmadan önce bir film daha.',
    synopsis:
      'Kapanmasına bir gece kalan tek salonlu bir sinemanın makinisti, salonu dolduracak tek bir seyirci bulmak için şehri dolaşır. Bulduğu kişi, kırk yıl önce aynı salonda unutulmuş bir bilete sahiptir.',
    durationMinutes: 96,
    year: 2022,
    genre: 'Komedi · Dram',
    moods: ['nostalji', 'umut', 'enerji'],
    director: 'Ozan Demirel',
    palette: { bg: '#2a0f12', accent: '#f4e9d6', accent2: '#e3a82b' },
    poster: 'marquee',
    videoUrl: null,
    status: 'coming',
    releaseDate: '2027-01-16',
  },
];

export const featuredFilm = (): Film => FILMS.find((f) => f.featured) ?? FILMS[0];

/** Türler (benzersiz, sıralı) */
export const GENRES: readonly string[] = Array.from(
  new Set(FILMS.flatMap((f) => f.genre.split(' · ').map((g) => g.trim()))),
).sort((a, b) => a.localeCompare(b, 'tr'));

/** Gösterim programı: tarihli filmler, tarihe göre */
export const SCHEDULE: readonly Film[] = [...FILMS]
  .filter((f) => f.releaseDate)
  .sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''));

export const MOODS: readonly { readonly id: Mood; readonly tr: string; readonly en: string }[] = [
  { id: 'gerilim', tr: 'Gerilim', en: 'Tense' },
  { id: 'merak', tr: 'Merak', en: 'Curious' },
  { id: 'karanlik', tr: 'Karanlık', en: 'Dark' },
  { id: 'huzun', tr: 'Hüzün', en: 'Melancholy' },
  { id: 'umut', tr: 'Umut', en: 'Hopeful' },
  { id: 'nostalji', tr: 'Nostalji', en: 'Nostalgic' },
  { id: 'enerji', tr: 'Enerji', en: 'Energetic' },
];

export const filmBySlug = (slug: string): Film | undefined => FILMS.find((f) => f.slug === slug);

/** Tür ve ruh hali örtüşmesine göre benzer filmler */
export const relatedFilms = (film: Film, n = 3): Film[] => {
  const genres = new Set(film.genre.split(' · ').map((g) => g.trim()));
  return FILMS.filter((f) => f.id !== film.id)
    .map((f) => ({
      f,
      score:
        f.genre.split(' · ').filter((g) => genres.has(g.trim())).length * 2 +
        f.moods.filter((m) => film.moods.includes(m)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.f);
};
