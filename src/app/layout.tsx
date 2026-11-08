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

/** Sosyal paylaşım görsellerinin tam adresi: önce elle verilen alan adı, sonra Vercel'in verdiği adresler. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  'http://localhost:3100';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Cinech — Decentralized Cinema',
  description:
    'Bağımsız filmleri izle, CINE token kazan, topluluğun seçtiği yapımlara oy ver. Yankı ile başlıyoruz.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Cinech', statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    siteName: 'Cinech',
    locale: 'tr_TR',
    images: [{ url: '/posters/yanki-bolum-1.jpg', width: 768, height: 1376, alt: 'Yankı · Bölüm 1' }],
  },
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
