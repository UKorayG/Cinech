import type { Metadata, Viewport } from 'next';
import { Archivo, Yellowtail } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

// Marka fontları: Archivo (değişken ağırlık + genişlik ekseni) ve Yellowtail (el yazısı)
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: 'variable',
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
});
const yellowtail = Yellowtail({ subsets: ['latin', 'latin-ext'], weight: '400', display: 'swap', variable: '--font-yellowtail' });

export const metadata: Metadata = {
  title: 'Cinech — Decentralized Cinema',
  description:
    'Bağımsız filmleri izle, CINE token kazan, topluluğun seçtiği yapımlara oy ver. Yankı ile başlıyoruz.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Cinech', statusBarStyle: 'default' },
};

export const viewport: Viewport = { themeColor: '#3C4A32' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${archivo.variable} ${yellowtail.variable}`}
    >
      <body className="min-h-screen bg-cinech-ink text-cinech-cream antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
