'use client';

import { useEffect, useState } from 'react';
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Providers>
        <div className="absolute inset-0 -z-10 bg-gray-900">
          <div className="absolute inset-0 bg-black/50" />
        </div>
        {children}
      </Providers>
    );
  }

  return (
    <Providers>
      <Navbar />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={(e) => {
              console.error('Error loading video, falling back to gradient background...');
              const video = e.target as HTMLVideoElement;
              video.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 animate-gradient';
              video.parentNode?.insertBefore(fallback, video);
            }}
          >
            <source src="/videos/background-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <main className="min-h-screen pt-20 md:pt-24">
        {children}
      </main>
    </Providers>
  );
}
