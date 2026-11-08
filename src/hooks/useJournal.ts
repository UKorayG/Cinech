'use client';

import { useCallback, useEffect, useState } from 'react';
import { GUEST_OWNER, seatFor, storageKey, type Journal, type JournalEntry } from '@/data/journal';

const read = (owner: string): Journal => {
  try {
    const raw = window.localStorage.getItem(storageKey(owner));
    if (raw) return JSON.parse(raw) as Journal;
  } catch {
    /* depolama kapalı */
  }
  return { owner, entries: [], createdAt: new Date().toISOString() };
};

const write = (journal: Journal) => {
  try {
    window.localStorage.setItem(storageKey(journal.owner), JSON.stringify(journal));
  } catch {
    /* yoksay */
  }
};

export type NewEntry = {
  readonly filmId: string;
  readonly watchedAt: string;
  readonly rating: number;
  readonly note: string;
};

/**
 * Film defteri: koçanlar tarayıcıda, sahibine (cüzdan adresi ya da misafir) göre saklanır.
 * Cüzdan bağlanınca misafir koçanları adrese taşınabilir.
 */
export function useJournal(owner: string | undefined) {
  const key = owner ?? GUEST_OWNER;
  const [journal, setJournal] = useState<Journal>({ owner: key, entries: [], createdAt: '' });
  const [guestCount, setGuestCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setJournal(read(key));
    setGuestCount(key === GUEST_OWNER ? 0 : read(GUEST_OWNER).entries.length);
    setReady(true);
  }, [key]);

  const persist = useCallback((next: Journal) => {
    setJournal(next);
    write(next);
  }, []);

  const add = useCallback(
    (input: NewEntry): JournalEntry => {
      const current = read(key);
      const stubNo = current.entries.length + 1;
      const { seat, room } = seatFor(input.filmId, stubNo);
      const entry: JournalEntry = {
        id: `${input.filmId}-${Date.now().toString(36)}`,
        filmId: input.filmId,
        watchedAt: input.watchedAt,
        rating: input.rating,
        note: input.note,
        seat,
        room,
        stubNo,
      };
      persist({ ...current, owner: key, entries: [...current.entries, entry] });
      return entry;
    },
    [key, persist],
  );

  const update = useCallback(
    (id: string, patch: Partial<Pick<JournalEntry, 'rating' | 'note' | 'watchedAt'>>) => {
      const current = read(key);
      persist({ ...current, entries: current.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
    },
    [key, persist],
  );

  const remove = useCallback(
    (id: string) => {
      const current = read(key);
      persist({ ...current, entries: current.entries.filter((e) => e.id !== id) });
    },
    [key, persist],
  );

  /** Misafir defterindeki koçanları bu sahibe taşı (yalnızca cüzdan bağlıyken anlamlı) */
  const importGuest = useCallback(() => {
    if (key === GUEST_OWNER) return;
    const guest = read(GUEST_OWNER);
    if (guest.entries.length === 0) return;
    const current = read(key);
    let stubNo = current.entries.length;
    const moved = guest.entries.map((e) => {
      stubNo += 1;
      const { seat, room } = seatFor(e.filmId, stubNo);
      return { ...e, stubNo, seat, room };
    });
    persist({ ...current, owner: key, entries: [...current.entries, ...moved] });
    write({ owner: GUEST_OWNER, entries: [], createdAt: guest.createdAt });
    setGuestCount(0);
  }, [key, persist]);

  const has = useCallback((filmId: string) => journal.entries.some((e) => e.filmId === filmId), [journal.entries]);

  return { journal, ready, guestCount, add, update, remove, importGuest, has };
}
