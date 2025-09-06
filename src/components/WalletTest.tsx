'use client';

import { useAccount } from 'wagmi';

export default function WalletTest() {
  const { isConnected, address } = useAccount();
  
  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <h2 className="text-lg font-bold mb-2">Wallet Connection Test</h2>
      <div className="space-y-2">
        <p><span className="font-semibold">Connected:</span> {isConnected ? '✅ Yes' : '❌ No'}</p>
        {isConnected && (
          <p className="break-all"><span className="font-semibold">Address:</span> {address}</p>
        )}
      </div>
    </div>
  );
}
