'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Film, Hash, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { closeSearch, openSearch, toggleSearch, useSearchOpen } from './searchStore';
import { FILM_ITEMS, findItem, search, type SearchItem } from './searchIndex';

const RECENT_KEY = 'cinech:search:recent';
const RECENT_MAX = 6;

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(ids: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, RECENT_MAX)));
  } catch {
    /* depolama kapalıysa sessiz kal */
  }
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Kısayol etiketi: sunucuda ⌘K; istemcide Mac değilse Ctrl K. */
function useShortcutLabel(): string {
  const [label, setLabel] = useState('⌘K');
  useEffect(() => {
    if (!/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)) setLabel('Ctrl K');
  }, []);
  return label;
}

type Section = { readonly key: string; readonly label: string; readonly items: readonly SearchItem[]; readonly start: number };

/**
 * Komut paleti. ⌘K / Ctrl+K ile açılıp kapanır; odak bir giriş alanında değilken "/" de açar.
 * ClientLayout'tan bir kez bağlanır, böylece her sayfada vardır.
 */
export default function SearchPalette() {
  const open = useSearchOpen();
  const pathname = usePathname();
  const { language } = useLanguage();
  const en = language === 'en';
  const shortcut = useShortcutLabel();

  // Genel kısayollar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Rota değişince kapat
  useEffect(() => {
    closeSearch();
  }, [pathname]);

  // Açıkken sayfa kaydırmasını kilitle
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return <AnimatePresence>{open ? <PaletteDialog en={en} shortcut={shortcut} /> : null}</AnimatePresence>;
}

function PaletteDialog({ en, shortcut }: { readonly en: boolean; readonly shortcut: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<SearchItem[]>([]);

  // Son aramaları yalnızca istemcide, açılışta oku; odağı girişe ver
  useEffect(() => {
    setRecent(readRecent().map((id) => findItem(id)).filter((item): item is SearchItem => Boolean(item)));
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();

  const sections = useMemo<Section[]>(() => {
    const groups: { key: string; label: string; items: readonly SearchItem[] }[] = [];
    if (trimmed) {
      groups.push({ key: 'results', label: en ? 'Results' : 'Sonuçlar', items: search(trimmed) });
    } else {
      if (recent.length) groups.push({ key: 'recent', label: en ? 'Recent' : 'Son aramalar', items: recent });
      const recentIds = new Set(recent.map((r) => r.id));
      groups.push({ key: 'films', label: en ? 'Films' : 'Filmler', items: FILM_ITEMS.filter((f) => !recentIds.has(f.id)).slice(0, 3) });
    }
    let offset = 0;
    return groups
      .filter((g) => g.items.length > 0)
      .map((g) => {
        const start = offset;
        offset += g.items.length;
        return { ...g, start };
      });
  }, [trimmed, recent, en]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => {
    setActive(0);
  }, [trimmed]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const select = useCallback(
    (item: SearchItem) => {
      writeRecent([item.id, ...readRecent().filter((id) => id !== item.id)]);
      closeSearch();
      router.push(item.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flat.length) setActive((i) => (i + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flat.length) setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[active];
      if (item) select(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1300] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'Search' : 'Ara'}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-cinech-ink/80 backdrop-blur-sm" onClick={closeSearch} />

      <motion.div
        className="relative w-full max-w-xl rounded-md border-2 border-cinech-cream bg-cinech-ink text-cinech-cream shadow-hard-cream"
        initial={{ y: -16, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -10, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {/* HUD şeridi */}
        <div className="flex items-center justify-between border-b-2 border-cinech-cream/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/70">
          <span>
            {en ? '[Search]' : '[Ara]'} <span className="normal-case">{shortcut}</span>
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-2 animate-rec-blink rounded-full bg-cinech-cream" />
            {`REC ${String(flat.length).padStart(2, '0')}`}
          </span>
        </div>

        {/* Giriş */}
        <div className="p-3">
          <div className="flex items-center gap-3 border-2 border-cinech-cream bg-cinech-cream px-3 text-cinech-ink shadow-hard-sm">
            <Search className="h-5 w-5 shrink-0 text-cinech-olive" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={en ? 'Search films, pages, directors…' : 'Film, sayfa, yönetmen ara…'}
              aria-label={en ? 'Search' : 'Ara'}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full bg-transparent font-cinech text-base text-cinech-ink outline-none placeholder:text-cinech-ink/45"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={en ? 'Clear' : 'Temizle'}
                className="rounded-full border-2 border-cinech-ink/20 p-1 text-cinech-ink/60 transition-colors hover:border-cinech-olive hover:text-cinech-olive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Sonuçlar */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto px-3 pb-3">
          {flat.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="font-display text-3xl uppercase text-cinech-cream text-hard-olive">{en ? 'No results' : 'Sonuç yok'}</div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/50">
                {en ? 'Try a title, director or genre' : 'Başlık, yönetmen ya da tür dene'}
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.key}>
                <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-cream/50">[{section.label}]</div>
                {section.items.map((item, i) => {
                  const index = section.start + i;
                  const isActive = index === active;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      data-index={index}
                      onMouseMove={() => setActive(index)}
                      onClick={() => select(item)}
                      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-cinech-cream text-cinech-ink shadow-hard-sm' : 'text-cinech-cream/85'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 ${
                          isActive ? 'border-cinech-ink text-cinech-olive' : 'border-cinech-cream/30 text-cinech-cream/60'
                        }`}
                      >
                        {item.kind === 'film' ? <Film className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-cinech text-sm font-bold">{en ? item.title.en : item.title.tr}</span>
                          <span
                            className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] ${
                              isActive ? 'text-cinech-ink/60' : 'text-cinech-cream/45'
                            }`}
                          >
                            {en ? item.meta.en : item.meta.tr}
                          </span>
                        </span>
                        <span className={`block truncate text-xs ${isActive ? 'text-cinech-ink/70' : 'text-cinech-cream/55'}`}>
                          {en ? item.detail.en : item.detail.tr}
                        </span>
                      </span>
                      {isActive ? <CornerDownLeft className="h-4 w-4 shrink-0 text-cinech-olive" /> : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Alt bilgi */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-cinech-cream/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/50">
          <Hint keys="↑↓" label={en ? 'navigate' : 'gezin'} />
          <Hint keys="Enter" label={en ? 'open' : 'aç'} />
          <Hint keys="Esc" label={en ? 'close' : 'kapat'} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hint({ keys, label }: { readonly keys: string; readonly label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded-sm border border-cinech-cream/40 px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-cinech-cream/80">
        {keys}
      </kbd>
      {label}
    </span>
  );
}

/** Navbar için kompakt arama düğmesi: ikon + "Ara"/"Search" + ⌘K. Koordinatör Navbar'a yerleştirir. */
export function SearchButton({ className = '' }: { readonly className?: string }) {
  const { language } = useLanguage();
  const en = language === 'en';
  const shortcut = useShortcutLabel();
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label={en ? 'Search' : 'Ara'}
      aria-keyshortcuts="Meta+K Control+K"
      className={`flex items-center gap-2 rounded-full border-2 border-cinech-cream/40 px-3 py-1.5 font-cinech text-xs font-bold uppercase tracking-[0.15em] text-cinech-cream/85 transition-colors hover:border-cinech-cream hover:text-cinech-cream ${className}`}
    >
      <Search className="h-4 w-4" />
      <span className="hidden lg:inline">{en ? 'Search' : 'Ara'}</span>
      <kbd className="hidden rounded-sm bg-cinech-cream px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-wider text-cinech-olive md:inline">
        {shortcut}
      </kbd>
    </button>
  );
}
