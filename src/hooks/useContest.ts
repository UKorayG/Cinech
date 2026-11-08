'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONTEST, MAX_ENTRIES_PER_OWNER, isContestOpen, normalizeHandle, type ContestEntry } from '@/data/contest';
import { FILMS } from '@/data/films';
import { GUEST_OWNER } from '@/data/journal';

/** Bu tarayıcıdan gönderilen afişler */
export const ENTRIES_KEY = 'cinech:afis:entries';
const VOTES_PREFIX = 'cinech:afis:votes:';
/** Sahibe (cüzdan adresi ya da misafir) göre oy listesi */
export const votesKey = (owner: string) => `${VOTES_PREFIX}${owner.toLowerCase()}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* depolama kapalı ya da bozuk kayıt */
  }
  return fallback;
}

function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Bu cihazdaki tüm sahiplerin oyları: girdi kimliği → oy sayısı */
function readDeviceVotes(): Record<string, number> {
  const counts: Record<string, number> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(VOTES_PREFIX)) continue;
      for (const id of readJson<string[]>(key, [])) counts[id] = (counts[id] ?? 0) + 1;
    }
  } catch {
    /* depolama kapalı */
  }
  return counts;
}

export type SubmitInput = {
  readonly title: string;
  readonly author: string;
  readonly filmId: string;
  /** Küçültülmüş JPEG data URL */
  readonly image: string;
};

export type SubmitResult = { readonly ok: true; readonly entry: ContestEntry } | { readonly ok: false; readonly reason: 'closed' | 'limit' | 'storage' | 'film' };

/**
 * Afiş yarışması: tohum girdiler koddan, gönderimler ve oylar bu cihazdan gelir.
 * Oy sayısı = tohum oyu + cihazdaki sahiplerin oyları; her sahip her afişe bir kez oy verir, geri alabilir.
 */
export function useContest(address: string | undefined) {
  const owner = address ? address.toLowerCase() : GUEST_OWNER;
  const [local, setLocal] = useState<ContestEntry[]>([]);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [deviceVotes, setDeviceVotes] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocal(readJson<ContestEntry[]>(ENTRIES_KEY, []));
    setMyVotes(readJson<string[]>(votesKey(owner), []));
    setDeviceVotes(readDeviceVotes());
    setReady(true);
  }, [owner]);

  const entries = useMemo(() => [...CONTEST.entries, ...local], [local]);

  const votesFor = useCallback((entry: ContestEntry) => entry.seedVotes + (deviceVotes[entry.id] ?? 0), [deviceVotes]);
  const hasVoted = useCallback((id: string) => myVotes.includes(id), [myVotes]);
  const mine = useCallback((entry: ContestEntry) => entry.owner === owner, [owner]);

  const toggleVote = useCallback(
    (id: string) => {
      const current = readJson<string[]>(votesKey(owner), []);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      writeJson(votesKey(owner), next);
      setMyVotes(next);
      setDeviceVotes(readDeviceVotes());
    },
    [owner],
  );

  const submit = useCallback(
    (input: SubmitInput): SubmitResult => {
      const now = new Date();
      if (!isContestOpen(now)) return { ok: false, reason: 'closed' };
      const film = FILMS.find((f) => f.id === input.filmId);
      if (!film) return { ok: false, reason: 'film' };
      const current = readJson<ContestEntry[]>(ENTRIES_KEY, []);
      if (current.filter((e) => e.owner === owner).length >= MAX_ENTRIES_PER_OWNER) return { ok: false, reason: 'limit' };
      const entry: ContestEntry = {
        id: `afis-${Date.now().toString(36)}`,
        title: input.title.trim(),
        author: normalizeHandle(input.author),
        filmId: film.id,
        style: film.poster,
        palette: film.palette,
        seedVotes: 0,
        submittedAt: now.toISOString(),
        image: input.image,
        owner,
      };
      const next = [...current, entry];
      if (!writeJson(ENTRIES_KEY, next)) return { ok: false, reason: 'storage' };
      setLocal(next);
      return { ok: true, entry };
    },
    [owner],
  );

  /** Yalnızca sahibi silebilir */
  const remove = useCallback(
    (id: string) => {
      const current = readJson<ContestEntry[]>(ENTRIES_KEY, []);
      const target = current.find((e) => e.id === id);
      if (!target || target.owner !== owner) return;
      const next = current.filter((e) => e.id !== id);
      writeJson(ENTRIES_KEY, next);
      setLocal(next);
    },
    [owner],
  );

  const leaderboard = useMemo(
    () => [...entries].sort((a, b) => votesFor(b) - votesFor(a) || a.submittedAt.localeCompare(b.submittedAt)).slice(0, 3),
    [entries, votesFor],
  );

  const mineCount = useMemo(() => local.filter((e) => e.owner === owner).length, [local, owner]);

  return { owner, entries, ready, votesFor, hasVoted, toggleVote, submit, remove, mine, leaderboard, mineCount };
}
