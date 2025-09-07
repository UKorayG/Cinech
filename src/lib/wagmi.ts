import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains';

// Get from environment variables with fallback
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default_project_id';

export const config = getDefaultConfig({
  appName: 'Cinech - Watch to Earn',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http('https://rpc.sepolia.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
  ssr: true,
});