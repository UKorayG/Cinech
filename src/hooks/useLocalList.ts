'use client';

import { useCallback, useEffect, useState } from 'react';

/** Tarayıcıda saklanan kimlik listesi (favoriler, hatırlatmalar). */
export function useLocalList(key: string): [readonly string[], (id: string) => void] {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setList(JSON.parse(raw) as string[]);
    } catch {
      /* depolama kapalıysa sessizce boş liste */
    }
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setList((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* yoksay */
        }
        return next;
      });
    },
    [key],
  );

  return [list, toggle];
}
