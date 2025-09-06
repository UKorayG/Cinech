import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains';

// Get this from your .env file in a real application
const WALLETCONNECT_PROJECT_ID = 'c4f79b401b6b2e5f3a3f3e3a3f3e3a3f';

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