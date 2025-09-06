'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Coins } from 'lucide-react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  
  const { data: ethBalance } = useBalance({
    address: address,
  });

  return (
    <div className="flex items-center gap-3">
      {isConnected && (
        <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-lg">
          <Coins className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">
            {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'} ETH
          </span>
        </div>
      )}
      
      <ConnectButton 
        accountStatus="address"
        chainStatus="none"
        showBalance={false}
        label={isConnected ? 'Connected' : 'Connect Wallet'}
      />
    </div>
  );
}