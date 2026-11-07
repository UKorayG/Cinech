import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// WalletConnect proje kimliği: https://cloud.walletconnect.com üzerinden ücretsiz alınır.
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default_project_id';

/**
 * Test aşaması: uygulama yalnızca Sepolia test ağını kabul eder. Cüzdan başka bir ağdaysa
 * RainbowKit "Yanlış ağ" uyarısı gösterir ve tek tıkla Sepolia'ya geçirir.
 * Ana ağa çıkışta `chains` listesine mainnet eklenir ve sözleşme adresleri güncellenir.
 */
export const config = getDefaultConfig({
  appName: 'Cinech - Watch to Earn',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
  ssr: true,
});

export const ACTIVE_CHAIN = sepolia;
