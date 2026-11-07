'use client';

import { useCallback, useEffect, useState } from 'react';
import { GUEST_OWNER } from '@/data/journal';

export type ApplicationFormat = 'kisa' | 'dizi' | 'uzun';
export type ApplicationPipeline = 'remotion' | 'blender' | 'karma' | 'canli';
/** Başvuru durumu; bu aşamada tek durum var: alındı. */
export type ApplicationStatus = 'alındı';

export type StudioApplication = {
  /** STD-0001 biçiminde başvuru numarası */
  readonly id: string;
  readonly no: number;
  readonly title: string;
  readonly logline: string;
  readonly format: ApplicationFormat;
  readonly durationMinutes: number;
  readonly pipeline: ApplicationPipeline;
  /** Hedef gösterim ayı, YYYY-AA */
  readonly targetRelease: string;
  readonly contact: string;
  readonly rulesAccepted: boolean;
  readonly createdAt: string;
  readonly status: ApplicationStatus;
};

export type NewApplication = Omit<StudioApplication, 'id' | 'no' | 'createdAt' | 'status'>;

export const applicationsKey = (owner: string) => `cinech:studyo:basvurular:${owner.toLowerCase()}`;

export const applicationNumber = (no: number) => `STD-${String(no).padStart(4, '0')}`;

const read = (owner: string): StudioApplication[] => {
  try {
    const raw = window.localStorage.getItem(applicationsKey(owner));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as StudioApplication[];
    }
  } catch {
    /* depolama kapalı */
  }
  return [];
};

const write = (owner: string, list: readonly StudioApplication[]) => {
  try {
    window.localStorage.setItem(applicationsKey(owner), JSON.stringify(list));
  } catch {
    /* yoksay */
  }
};

/**
 * Stüdyo başvuruları: tarayıcıda, sahibine (cüzdan adresi ya da misafir) göre saklanır.
 * Numaralar sahibin listesinde tektir; silme yeniden numaralandırmaz.
 */
export function useStudioApplications(address: string | undefined) {
  const owner = (address ?? GUEST_OWNER).toLowerCase();
  const [applications, setApplications] = useState<StudioApplication[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setApplications(read(owner));
    setReady(true);
  }, [owner]);

  const add = useCallback(
    (input: NewApplication): StudioApplication => {
      const current = read(owner);
      const no = current.reduce((max, a) => Math.max(max, a.no), 0) + 1;
      const application: StudioApplication = {
        ...input,
        id: applicationNumber(no),
        no,
        createdAt: new Date().toISOString(),
        status: 'alındı',
      };
      const next = [...current, application];
      write(owner, next);
      setApplications(next);
      return application;
    },
    [owner],
  );

  const remove = useCallback(
    (id: string) => {
      const next = read(owner).filter((a) => a.id !== id);
      write(owner, next);
      setApplications(next);
    },
    [owner],
  );

  return { owner, applications, ready, add, remove };
}
