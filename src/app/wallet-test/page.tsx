'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Wallet Connection Test</h1>
            <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Test Wallet Connection</h2>
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Click the button in the top-right corner to connect your wallet.
            </p>
            <div className="flex justify-center">
              <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
