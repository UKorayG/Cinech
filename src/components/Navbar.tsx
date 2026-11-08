'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import WalletConnect from './WalletConnect';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import LogoLockup from './brand/LogoLockup';
import { SearchButton } from '@/components/search/SearchPalette';
import InstallPrompt from '@/components/pwa/InstallPrompt';

const LINKS = [
  { href: '/', tr: 'Ana Sayfa', en: 'Home' },
  { href: '/#filmler', tr: 'Filmler', en: 'Films' },
  { href: '/dao', tr: 'DAO', en: 'DAO' },
  { href: '/defter', tr: 'Defter', en: 'Journal' },
  { href: '/gise', tr: 'Gişe', en: 'Box Office' },
  { href: '/afis', tr: 'Afiş', en: 'Posters' },
  { href: '/studyo', tr: 'Stüdyo', en: 'Studio' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const label = (l: { tr: string; en: string }) => (language === 'en' ? l.en : l.tr);

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] border-b-4 border-cinech-ink bg-cinech-olive text-cinech-cream">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Cinech ana sayfa">
          <LogoLockup className="h-12 w-auto text-cinech-cream" idle={false} />
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.filter((l) => l.href !== '/').map((l) => {
            const active = !l.href.includes('#') && pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-2 font-cinech text-[13px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active ? 'bg-cinech-ink text-cinech-cream shadow-hard-sm' : 'text-cinech-cream/85 hover:bg-cinech-ink/20 hover:text-cinech-cream'
                }`}
              >
                {label(l)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchButton className="hidden sm:inline-flex" />
          <InstallPrompt />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <WalletConnect />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-cinech-cream/80 hover:text-cinech-cream lg:hidden"
            aria-label={open ? (language === 'en' ? 'Close menu' : 'Menüyü kapat') : language === 'en' ? 'Open menu' : 'Menüyü aç'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t-2 border-cinech-ink/40 bg-cinech-olive px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 font-cinech text-sm font-bold uppercase tracking-[0.15em] text-cinech-cream/90 hover:bg-cinech-ink/20"
            >
              {label(l)}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-3 pt-2 sm:hidden">
            <SearchButton />
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </nav>
  );
}
