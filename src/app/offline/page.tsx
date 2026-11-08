import type { Metadata } from 'next';
import OfflineView from '@/components/pwa/OfflineView';

export const metadata: Metadata = {
  title: 'Çevrimdışı — Cinech',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';

/** Service worker'ın gezinti başarısız olduğunda sunduğu çevrimdışı sayfa. */
export default function OfflinePage() {
  return <OfflineView />;
}
