'use client';

import { useRouter } from 'next/navigation';
import WalletConnect from './WalletConnect';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Cinech
              </span>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#movies"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Movies
              </a>
              <a
                href="#how-it-works"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
