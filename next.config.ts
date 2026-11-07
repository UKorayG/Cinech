import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ana klasördeki başıboş package-lock.json yüzünden yanlış kök seçilmesin.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  webpack: (config) => {
    // WalletConnect'in isteğe bağlı bağımlılıkları; tarayıcı paketinde gerekmiyor.
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
