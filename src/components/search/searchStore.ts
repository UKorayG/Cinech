'use client';

import { useSyncExternalStore } from 'react';

/**
 * Arama paletinin açık/kapalı durumu. Modül düzeyinde tutulur, ek bağımlılık yok;
 * bileşenler useSyncExternalStore ile abone olur. Sunucuda her zaman kapalı.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openSearch() {
  if (isOpen) return;
  isOpen = true;
  emit();
}

export function closeSearch() {
  if (!isOpen) return;
  isOpen = false;
  emit();
}

export function toggleSearch() {
  isOpen = !isOpen;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => isOpen;
const getServerSnapshot = () => false;

export function useSearchOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
