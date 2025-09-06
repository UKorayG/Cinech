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
      <div className="fixed inset-0 -z-10 overflow-hidden pt-16">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            console.error('Video yüklenirken hata oluştu, gradient arka plana geçiliyor...');
            const video = e.target as HTMLVideoElement;
            video.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 animate-gradient';
            video.parentNode?.insertBefore(fallback, video);
          }}
        >
          <source src="/videos/background-video.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      {children}
    </Providers>
  );
}
