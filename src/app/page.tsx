'use client';

import { useState } from 'react';
import { Play, Users, Coins, X, Film } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

// Çeviri tipleri
type TranslationKey = 'welcome' | 'popular' | 'recent' | 'joinRoom' | 'createRoom' | 'roomName' | 'cancel' | 'create';
type LanguageCode = 'tr' | 'en';
type Translations = {
  [key in TranslationKey]: {
    [lang in LanguageCode]: string;
  };
};

// Çeviriler
const translations: Translations = {
  welcome: {
    tr: 'Hoş Geldiniz',
    en: 'Welcome',
  },
  popular: {
    tr: 'Popüler',
    en: 'Popular',
  },
  recent: {
    tr: 'Yeni Eklenenler',
    en: 'Recently Added',
  },
  joinRoom: {
    tr: 'Odaya Katıl',
    en: 'Join Room',
  },
  createRoom: {
    tr: 'Oda Oluştur',
    en: 'Create Room',
  },
  roomName: {
    tr: 'Oda Adı',
    en: 'Room Name',
  },
  cancel: {
    tr: 'İptal',
    en: 'Cancel',
  },
  create: {
    tr: 'Oluştur',
    en: 'Create',
  },
};

const CinemaRoom = dynamic(() => import('@/components/CinemaRoom'), {
  ssr: false,
});

export default function Home() {
  const { language } = useLanguage();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showWatchingModal, setShowWatchingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TranslationKey>('popular');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [userTokens] = useState(100);

  const rooms = [
    {
      id: '1',
      title: 'Action Movie Night',
      description: 'Join us for an exciting action movie experience!',
      viewers: 24,
      timeLeft: '2h 15m',
      videoUrl: '/videos/12427369_3840_2160_24fps.mp4',
      requiresTicket: false
    },
    {
      id: '2',
      title: '4K Ultra HD Showcase',
      description: 'Experience crystal clear 4K resolution',
      viewers: 42,
      timeLeft: '1h 30m',
      videoUrl: '/videos/12460736_3840_2160_60fps.mp4',
      requiresTicket: true,
      ticketPrice: '0.01'
    },
    {
      id: '3',
      title: 'Cinematic Experience',
      description: 'High-quality cinematic content',
      viewers: 18,
      timeLeft: '3h 45m',
      videoUrl: '/videos/14183053_3840_2160_25fps.mp4',
      requiresTicket: false
    }
  ];
  
  const translate = (key: TranslationKey): string => {
    return translations[key]?.[language as LanguageCode] || key;
  };

  const handleTabChange = (tab: TranslationKey) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Arka Plan */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/12460736_3840_2160_60fps.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
      </div>
      
      {/* Overlay efektleri */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cinech-red/20 via-transparent to-cinech-gold/10"></div>
      
      {/* Header */}
      <header className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center space-x-6">
          <img src="/logo.svg" alt="Cinech Logo" className="h-24 w-auto drop-shadow-lg" />
          <h1 className="text-5xl font-bold text-cinech-red font-cinech drop-shadow-lg">CINECH</h1>
        </div>
        <WalletConnect />
      </header>

      {/* Ana İçerik */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-white mb-6 font-cinech drop-shadow-2xl">
            Decentralized <span className="text-cinech-gold animate-token-glow">Cinema</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto drop-shadow-lg">
            Experience a new era of film. Watch, vote, and earn while supporting independent 
            creators in our community-driven film platform.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button 
              className="bg-cinech-gold hover:bg-cinech-gold-light text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2 shadow-lg cursor-pointer z-10 relative"
              onClick={() => setShowWatchingModal(true)}
            >
              <Play className="h-5 w-5" />
              <span>Start Watching</span>
            </button>
            <button 
              className="border-2 border-cinech-red text-cinech-red hover:bg-cinech-red hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors cursor-pointer z-10 relative"
              onClick={() => setShowRoomModal(true)}
            >
              Create Room
            </button>
          </div>
        </div>

        {/* Özellikler */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center shadow-2xl border border-white/20 hover:border-cinech-gold/50 transition-all duration-300">
            <div className="bg-cinech-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bee-buzz shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-cinech drop-shadow-lg">Earn While You Watch</h3>
            <p className="text-gray-200 drop-shadow-md">
              Watch films to the end and earn CINE tokens.
              Each completed film = 1 token!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center shadow-2xl border border-white/20 hover:border-cinech-gold/50 transition-all duration-300">
            <div className="bg-cinech-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-cinech drop-shadow-lg">Social Viewing</h3>
            <p className="text-gray-200 drop-shadow-md">
              Watch movies together with friends and other users in real-time
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center shadow-2xl border border-white/20 hover:border-cinech-gold/50 transition-all duration-300">
            <div className="bg-cinech-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Film className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-cinech drop-shadow-lg">Premium Content</h3>
            <p className="text-gray-200 drop-shadow-md">
              Access exclusive content and early releases with CINE tokens
            </p>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => handleTabChange('popular')}
            className={`px-6 py-2 rounded-full font-medium ${
              activeTab === 'popular' 
                ? 'bg-cinech-gold text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            } transition-colors`}
          >
            {translate('popular')}
          </button>
          <button
            onClick={() => handleTabChange('recent')}
            className={`px-6 py-2 rounded-full font-medium ${
              activeTab === 'recent'
                ? 'bg-cinech-gold text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            } transition-colors`}
          >
            {translate('recent')}
          </button>
        </div>

        {/* Oda Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id}
              className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-cinech-gold/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => {
                setSelectedRoom(room.id);
                setShowWatchingModal(true);
              }}
            >
              <div className="relative aspect-video bg-black">
                <video
                  src={room.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex justify-between items-center text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{room.viewers} watching</span>
                    </div>
                    {room.requiresTicket && (
                      <div className="flex items-center space-x-1 bg-cinech-gold/20 text-cinech-gold px-2 py-1 rounded-full">
                        <Coins className="h-3 w-3" />
                        <span className="text-xs font-medium">{room.ticketPrice} ETH</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{room.title}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{room.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{room.timeLeft} left</span>
                  <button className="text-cinech-gold hover:text-cinech-gold-light text-sm font-medium flex items-center">
                    {translate('joinRoom')}
                    <Play className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Oda Oluşturma Modalı */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full border border-white/10 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{translate('createRoom')}</h3>
                <button 
                  onClick={() => setShowRoomModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {translate('roomName')}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cinech-gold focus:border-transparent"
                    placeholder={translate('roomName')}
                  />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    {translate('cancel')}
                  </button>
                  <button
                    onClick={() => {
                      // Oda oluşturma işlemleri
                      setShowRoomModal(false);
                    }}
                    className="px-4 py-2 bg-cinech-gold hover:bg-cinech-gold-light text-white rounded-lg text-sm font-medium"
                  >
                    {translate('create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Oynatıcı Modalı */}
      {showWatchingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 bg-black/80 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {rooms.find(r => r.id === selectedRoom)?.title}
              </h3>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setShowWatchingModal(false);
                    setSelectedRoom(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <CinemaRoom 
                roomId={selectedRoom!}
                {...rooms.find(r => r.id === selectedRoom)!}
                onJoin={async () => true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
