'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// RainbowKit teması: marka kırmızısı
const cinechTheme = darkTheme({
  accentColor: '#EAE4D2',
  accentColorForeground: '#1C2118',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={cinechTheme} modalSize="compact">
          <LanguageProvider>{children}</LanguageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
