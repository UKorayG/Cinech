'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Navbar() {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/30 backdrop-blur-lg border-b border-white/5 shadow-lg transition-all duration-300 hover:bg-black/50">
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
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Home
              </a>
              
              <a
                href="/dao"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                DAO
              </a>
              
              {/* Movies Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span>Movies</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {/* Dropdown Menu */}
                {isHovered && (
                  <div className="absolute left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-md shadow-lg py-1 z-50 border border-white/10">
                    <a
                      href="#trending"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Trending
                    </a>
                    <a
                      href="#new-releases"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      New Releases
                    </a>
                    <a
                      href="#top-rated"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Top Rated
                    </a>
                  </div>
                )}
              </div>
              
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
