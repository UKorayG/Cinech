import { FILMS, type Film } from './films';

/** Bir izleme koçanı: deftere yapıştırılmış bilet */
export type JournalEntry = {
  readonly id: string;
  readonly filmId: string;
  /** İzleme anı (ISO) */
  readonly watchedAt: string;
  /** 1..5 */
  readonly rating: number;
  readonly note: string;
  readonly seat: string;
  readonly room: string;
  /** Deftere özgü sıra numarası */
  readonly stubNo: number;
};

export type Journal = {
  readonly owner: string;
  readonly entries: readonly JournalEntry[];
  readonly createdAt: string;
};

export const GUEST_OWNER = 'misafir';

export const storageKey = (owner: string) => `cinech:defter:${owner.toLowerCase()}`;

const ROWS = 'ABCDEFGHJKLM';

/** Film ve sıra numarasından kararlı koltuk ve salon */
export const seatFor = (filmId: string, stubNo: number) => {
  let h = stubNo * 131;
  for (let i = 0; i < filmId.length; i++) h = (h * 33 + filmId.charCodeAt(i)) % 100003;
  const row = ROWS[h % ROWS.length];
  const seat = (h % 24) + 1;
  const room = (h % 3) + 1;
  return { seat: `${row}${seat}`, room: `SALON ${room}` };
};

export const filmById = (id: string): Film | undefined => FILMS.find((f) => f.id === id);

export type Stamp = {
  readonly id: string;
  readonly tr: string;
  readonly en: string;
  readonly descTr: string;
  readonly descEn: string;
  /** Kazanıldıysa kazanma tarihi (ISO), yoksa null */
  readonly earnedAt: string | null;
};

const hourOf = (iso: string) => new Date(iso).getHours();

/** Damgalar: defterdeki koçanlardan hesaplanır. */
export const computeStamps = (entries: readonly JournalEntry[]): Stamp[] => {
  const sorted = [...entries].sort((a, b) => a.watchedAt.localeCompare(b.watchedAt));
  const first = sorted[0]?.watchedAt ?? null;
  const third = sorted[2]?.watchedAt ?? null;
  const genres = new Set<string>();
  let genreStampAt: string | null = null;
  for (const e of sorted) {
    const f = filmById(e.filmId);
    f?.genre.split(' · ').forEach((g) => genres.add(g.trim()));
    if (!genreStampAt && genres.size >= 3) genreStampAt = e.watchedAt;
  }
  const midnight = sorted.find((e) => hourOf(e.watchedAt) >= 23 || hourOf(e.watchedAt) < 4)?.watchedAt ?? null;
  const yanki = sorted.find((e) => e.filmId === 'yanki-1')?.watchedAt ?? null;
  const premiere =
    sorted.find((e) => {
      const f = filmById(e.filmId);
      return f?.releaseDate && e.watchedAt.slice(0, 10) === f.releaseDate;
    })?.watchedAt ?? null;
  const fiveStar = sorted.find((e) => e.rating === 5)?.watchedAt ?? null;
  const critic = sorted.filter((e) => e.note.trim().length >= 40)[0]?.watchedAt ?? null;

  return [
    { id: 'ilk-seans', tr: 'İlk Seans', en: 'First Screening', descTr: 'Deftere ilk koçanı yapıştırdın.', descEn: 'You pasted your first stub.', earnedAt: first },
    { id: 'mudavim', tr: 'Müdavim', en: 'Regular', descTr: 'Üç film izledin.', descEn: 'Three films watched.', earnedAt: third },
    { id: 'tur-avcisi', tr: 'Tür Avcısı', en: 'Genre Hunter', descTr: 'Üç farklı türden film izledin.', descEn: 'Films from three different genres.', earnedAt: genreStampAt },
    { id: 'gece-yarisi', tr: 'Gece Yarısı Seansı', en: 'Midnight Show', descTr: 'Gece 23:00 ile 04:00 arasında izledin.', descEn: 'Watched between 23:00 and 04:00.', earnedAt: midnight },
    { id: 'yanki', tr: 'Yankı Tanığı', en: 'Witness of Yankı', descTr: 'Cinech’in ilk özgün yapımını izledin.', descEn: 'You watched Cinech’s first original.', earnedAt: yanki },
    { id: 'promiyer', tr: 'Prömiyer', en: 'Premiere', descTr: 'Bir filmi gösterim gününde izledin.', descEn: 'Watched a film on its screening day.', earnedAt: premiere },
    { id: 'bes-yildiz', tr: 'Beş Yıldız', en: 'Five Stars', descTr: 'Bir filme tam puan verdin.', descEn: 'You gave a film full marks.', earnedAt: fiveStar },
    { id: 'elestirmen', tr: 'Eleştirmen', en: 'Critic', descTr: 'Kırk karakterden uzun bir not yazdın.', descEn: 'Wrote a note longer than forty characters.', earnedAt: critic },
  ];
};

export const journalStats = (entries: readonly JournalEntry[]) => {
  const minutes = entries.reduce((sum, e) => sum + (filmById(e.filmId)?.durationMinutes ?? 0), 0);
  const rated = entries.filter((e) => e.rating > 0);
  const avg = rated.length ? rated.reduce((s, e) => s + e.rating, 0) / rated.length : 0;
  const stamps = computeStamps(entries).filter((s) => s.earnedAt).length;
  return { count: entries.length, minutes, avg, stamps };
};

export const shortAddress = (owner: string) =>
  owner === GUEST_OWNER ? owner : `${owner.slice(0, 6)}…${owner.slice(-4)}`;
