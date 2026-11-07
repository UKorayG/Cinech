import type { MetadataRoute } from 'next';

/** PWA bildirimi; Next bunu /manifest.webmanifest adresinde sunar. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cinech',
    short_name: 'Cinech',
    description: 'Bağımsız filmleri izle, CINE token kazan, topluluğun seçtiği yapımlara oy ver. Yankı ile başlıyoruz.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#EAE4D2',
    theme_color: '#3C4A32',
    lang: 'tr',
    dir: 'ltr',
    categories: ['entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: 'Filmler', url: '/#filmler', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'DAO', url: '/dao', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'Defter', url: '/defter', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }] },
    ],
  };
}
