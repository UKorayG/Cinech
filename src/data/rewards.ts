import type { JournalEntry } from './journal';

/**
 * CINE puan kuralları. Puanlar yalnızca defterdeki koçanlardan türetilir;
 * ayrıca saklanmaz, zincire yazılmaz.
 */
export const REWARD_RULES = {
  /** Her koçan */
  entry: 10,
  /** Koçanda puan (yıldız) varsa */
  rating: 5,
  /** Koçanda not varsa */
  note: 5,
  /** İlk filmden sonraki her farklı film (sadakat) */
  loyalty: 15,
} as const;

export type RewardLine = {
  readonly entry: JournalEntry;
  readonly base: number;
  readonly rating: number;
  readonly note: number;
  readonly loyalty: number;
  /** Satır toplamı */
  readonly points: number;
};

export type RewardSummary = {
  /** İzleme tarihine göre sıralı satırlar */
  readonly lines: readonly RewardLine[];
  readonly base: number;
  readonly rating: number;
  readonly note: number;
  readonly loyalty: number;
  readonly total: number;
  /** Koçanı olan farklı film sayısı */
  readonly films: number;
  /** Puan verilmiş koçan sayısı */
  readonly rated: number;
  /** Not yazılmış koçan sayısı */
  readonly noted: number;
};

/** Koçanlardan CINE puanlarını hesaplar; sadakat bonusu yeni bir filmin ilk koçanına yazılır. */
export const computeRewards = (entries: readonly JournalEntry[]): RewardSummary => {
  const sorted = [...entries].sort((a, b) => a.watchedAt.localeCompare(b.watchedAt) || a.stubNo - b.stubNo);
  const seen = new Set<string>();
  const lines: RewardLine[] = sorted.map((entry) => {
    const newFilm = !seen.has(entry.filmId);
    const loyalty = newFilm && seen.size > 0 ? REWARD_RULES.loyalty : 0;
    seen.add(entry.filmId);
    const base = REWARD_RULES.entry;
    const rating = entry.rating > 0 ? REWARD_RULES.rating : 0;
    const note = entry.note.trim().length > 0 ? REWARD_RULES.note : 0;
    return { entry, base, rating, note, loyalty, points: base + rating + note + loyalty };
  });
  const sum = (pick: (line: RewardLine) => number) => lines.reduce((s, line) => s + pick(line), 0);
  const base = sum((l) => l.base);
  const rating = sum((l) => l.rating);
  const note = sum((l) => l.note);
  const loyalty = sum((l) => l.loyalty);
  return {
    lines,
    base,
    rating,
    note,
    loyalty,
    total: base + rating + note + loyalty,
    films: seen.size,
    rated: lines.filter((l) => l.rating > 0).length,
    noted: lines.filter((l) => l.note > 0).length,
  };
};
