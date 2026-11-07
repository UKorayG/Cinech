'use client';

import { useEffect, useState } from 'react';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import GrainOverlay from '@/components/retro/GrainOverlay';
import HtmlLang from '@/components/HtmlLang';
import SearchPalette from '@/components/search/SearchPalette';
import RegisterServiceWorker from '@/components/pwa/RegisterServiceWorker';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Providers>
      <HtmlLang />
      {mounted ? <Navbar /> : <div className="fixed inset-x-0 top-0 z-[1000] h-16 border-b-4 border-cinech-ink bg-cinech-olive" />}
      <main className="min-h-screen pt-16">{children}</main>
      <GrainOverlay />
      <SearchPalette />
      <RegisterServiceWorker />
    </Providers>
  );
}
