'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Users, MessageCircle, X, Send, Coins } from 'lucide-react';
import { useAccount } from 'wagmi';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CinemaRoomProps,
  RoomChatMessage,
  RoomPlayback,
  RoomReaction,
  RoomReactionEmoji,
  RoomViewer,
  RoomServerToClientEvents,
  RoomClientToServerEvents,
  ROOM_REACTIONS,
  VOTING_MOMENTS,
  SCENE_OPTIONS,
  SceneOption,
} from '@/types/cinema';
import { useLanguage } from '@/contexts/LanguageContext';

type RoomSocket = Socket<RoomServerToClientEvents, RoomClientToServerEvents>;

/** local: NEXT_PUBLIC_SOCKET_URL tanımsız, oda yalnızca bu tarayıcıda çalışır */
type Connection = 'local' | 'connecting' | 'connected' | 'offline';

type FloatingReaction = {
  key: string;
  emoji: string;
  name: string;
  /** Video alanının yüzdesi olarak yatay konum */
  left: number;
  /** Yükselirken yatay sapma (px) */
  drift: number;
};

const NAME_STORAGE_KEY = 'cinech:room:name';
const MESSAGE_LIMIT = 280;
const MESSAGE_HISTORY = 200;
/** Bu eşiğin altındaki zaman farkında uzaktan gelen güncelleme için seek yapılmaz */
const SYNC_TOLERANCE_S = 1.5;
const PLAYBACK_DEBOUNCE_MS = 300;
/** Uzaktan gelen güncelleme uygulanırken yerel play/pause/seek olayları bu süre boyunca yayılmaz */
const REMOTE_APPLY_GUARD_MS = 400;
const CHAT_COOLDOWN_MS = 700;
const REACTION_COOLDOWN_MS = 300;
const REACTION_LIFETIME_MS = 2600;

function localId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomGuestName(): string {
  return `Misafir-${1000 + Math.floor(Math.random() * 9000)}`;
}

/** 0x1234…ab */
function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-2)}`;
}

export default function CinemaRoom({
  roomId,
  title,
  description,
  viewers,
  timeLeft,
  videoUrl,
  requiresTicket = false,
  ticketPrice = '0',
  onJoin,
}: CinemaRoomProps) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const liveEnabled = Boolean(socketUrl);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [chatCooldown, setChatCooldown] = useState(false);

  // Room state
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<Connection>(liveEnabled ? 'connecting' : 'local');
  const [roomViewers, setRoomViewers] = useState<RoomViewer[]>([]);
  const [guestName, setGuestName] = useState('');
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  // Voting state (yerel: sunucuyla senkronlanmaz)
  const [showVoting, setShowVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingOptions, setVotingOptions] = useState<SceneOption[]>(SCENE_OPTIONS);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<RoomSocket | null>(null);
  const applyingRemoteRef = useRef(false);
  const remoteGuardTimerRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const lastReactionAtRef = useRef(0);
  const enRef = useRef(false);

  // User info
  const { address } = useAccount();
  const { language } = useLanguage();
  const en = language === 'en';
  const displayName = address ? shortAddress(address) : guestName;

  useEffect(() => {
    enRef.current = en;
  }, [en]);

  // Misafir adı: localStorage'da saklanır, sunucu tarafında render edilmez
  useEffect(() => {
    let name = '';
    try {
      name = window.localStorage.getItem(NAME_STORAGE_KEY) ?? '';
      if (!name) {
        name = randomGuestName();
        window.localStorage.setItem(NAME_STORAGE_KEY, name);
      }
    } catch {
      name = name || randomGuestName();
    }
    setGuestName(name);
  }, []);

  const pushSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev.slice(-(MESSAGE_HISTORY - 1)),
      { id: localId(), name: enRef.current ? 'System' : 'Sistem', text, at: Date.now(), system: true },
    ]);
  }, []);

  const spawnReaction = useCallback((reaction: RoomReaction) => {
    const item: FloatingReaction = {
      key: reaction.id,
      emoji: reaction.emoji,
      name: reaction.name,
      left: 8 + Math.random() * 84,
      drift: (Math.random() - 0.5) * 60,
    };
    setFloating((prev) => [...prev.slice(-29), item]);
    window.setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.key !== item.key));
    }, REACTION_LIFETIME_MS);
  }, []);

  // Uzaktan gelen oynatma durumunu yerel videoya uygula; bu sırada yerel olaylar yayılmaz (yankı döngüsü yok)
  const applyRemotePlayback = useCallback((playback: RoomPlayback) => {
    const video = videoRef.current;
    if (!video) return;

    const elapsed = playback.playing ? Math.max(0, (Date.now() - playback.updatedAt) / 1000) : 0;
    let target = playback.time + elapsed;
    if (Number.isFinite(video.duration) && target > video.duration) target = video.duration;

    applyingRemoteRef.current = true;
    if (remoteGuardTimerRef.current) window.clearTimeout(remoteGuardTimerRef.current);
    remoteGuardTimerRef.current = window.setTimeout(() => {
      applyingRemoteRef.current = false;
    }, REMOTE_APPLY_GUARD_MS);

    if (Math.abs(video.currentTime - target) >= SYNC_TOLERANCE_S) {
      video.currentTime = target;
    }
    if (playback.playing && video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else if (!playback.playing && !video.paused) {
      video.pause();
    }
    setIsPlaying(playback.playing);
  }, []);

  // Yerel play/pause/seek → ~300 ms debounce ile sunucuya
  const schedulePlaybackEmit = useCallback(() => {
    if (!socketRef.current || applyingRemoteRef.current) return;
    if (playbackTimerRef.current) window.clearTimeout(playbackTimerRef.current);
    playbackTimerRef.current = window.setTimeout(() => {
      playbackTimerRef.current = null;
      const video = videoRef.current;
      const socket = socketRef.current;
      if (!video || !socket || applyingRemoteRef.current) return;
      socket.emit('playback:update', { playing: !video.paused && !video.ended, time: video.currentTime });
    }, PLAYBACK_DEBOUNCE_MS);
  }, []);

  // Socket bağlantısı (yalnızca NEXT_PUBLIC_SOCKET_URL tanımlıysa)
  useEffect(() => {
    if (!hasJoined || !socketUrl || !displayName) return;

    const socket: RoomSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 6000,
      timeout: 8000,
    });
    socketRef.current = socket;
    setConnection('connecting');

    const onReconnectAttempt = () => setConnection('connecting');
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    socket.on('connect', () => {
      setConnection('connected');
      socket.emit('room:join', { roomId, name: displayName });
    });
    socket.on('disconnect', () => setConnection('offline'));
    socket.on('connect_error', () => setConnection('offline'));

    socket.on('room:state', (state) => {
      setRoomViewers(state.viewers);
      setMessages(state.messages.slice(-MESSAGE_HISTORY));
      pushSystemMessage(
        enRef.current
          ? `Connected · ${state.viewers.length} watching`
          : `Bağlandı · ${state.viewers.length} izleyici`,
      );
      applyRemotePlayback(state.playback);
    });
    socket.on('room:presence', ({ viewers: list }) => setRoomViewers(list));
    socket.on('chat:message', (message) => {
      setMessages((prev) => [...prev.slice(-(MESSAGE_HISTORY - 1)), message]);
    });
    socket.on('playback:update', (playback) => applyRemotePlayback(playback));
    socket.on('reaction', (reaction) => spawnReaction(reaction));

    return () => {
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setRoomViewers([]);
      setConnection('connecting');
    };
  }, [hasJoined, socketUrl, roomId, displayName, applyRemotePlayback, spawnReaction, pushSystemMessage]);

  // Zamanlayıcıları temizle
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) window.clearTimeout(playbackTimerRef.current);
      if (remoteGuardTimerRef.current) window.clearTimeout(remoteGuardTimerRef.current);
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for voting moments
  useEffect(() => {
    if (!hasJoined) return;

    const checkVotingMoment = () => {
      if (!videoRef.current) return;
      const second = Math.floor(videoRef.current.currentTime);
      if (VOTING_MOMENTS.includes(second) && !showVoting && !hasVoted) {
        setShowVoting(true);
      }
    };

    const interval = setInterval(checkVotingMoment, 1000);
    return () => clearInterval(interval);
  }, [hasJoined, hasVoted, showVoting]);

  // Video element events
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    schedulePlaybackEmit();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    schedulePlaybackEmit();
  };

  const handleVideoSeeked = () => {
    schedulePlaybackEmit();
  };

  // Handle play/pause toggle (durum ve yayın video olaylarından gelir)
  const handlePlayPause = () => {
    if (!hasJoined) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasJoined || !videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
  };

  // Handle sending chat messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const text = messageInput.trim().slice(0, MESSAGE_LIMIT);
    if (!text || !hasJoined || chatCooldown) return;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('chat:message', { text });
    } else if (!liveEnabled) {
      setMessages((prev) => [
        ...prev.slice(-(MESSAGE_HISTORY - 1)),
        { id: localId(), name: displayName || 'Misafir', text, at: Date.now() },
      ]);
    } else {
      pushSystemMessage(en ? 'Offline: message not sent.' : 'Çevrimdışı: mesaj gönderilmedi.');
      return;
    }

    setMessageInput('');
    setChatCooldown(true);
    window.setTimeout(() => setChatCooldown(false), CHAT_COOLDOWN_MS);
  };

  // Reactions
  const sendReaction = (emoji: RoomReactionEmoji) => {
    if (!hasJoined) return;
    const now = Date.now();
    if (now - lastReactionAtRef.current < REACTION_COOLDOWN_MS) return;
    lastReactionAtRef.current = now;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('reaction', { emoji });
    } else {
      spawnReaction({ id: localId(), name: displayName || 'Misafir', emoji });
    }
  };

  // Handle voting (yerel iyimser güncelleme)
  const handleVote = (optionId: number) => {
    if (!hasJoined || hasVoted) return;
    setHasVoted(true);
    setVotingOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)),
    );
  };

  // Handle joining the room
  const handleJoinRoom = async () => {
    if (requiresTicket) {
      alert(en ? 'You need to buy a ticket to enter this room!' : 'Bu odaya girmek için bilet alman gerekiyor.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await onJoin(roomId);

      if (success) {
        setHasJoined(true);
        pushSystemMessage(en ? 'You have joined the room!' : 'Odaya katıldın!');
        if (!liveEnabled) {
          pushSystemMessage(
            en
              ? 'Local mode: chat and reactions stay in this browser.'
              : 'Yerel mod: sohbet ve tepkiler yalnızca bu tarayıcıda.',
          );
        }
      }
    } catch (error) {
      console.error('An error occurred while joining the room:', error);
      alert(en ? 'An error occurred while joining the room. Please try again.' : 'Odaya katılırken bir hata oluştu. Lütfen tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  };

  // Derived room info
  const viewerList: RoomViewer[] = liveEnabled
    ? roomViewers
    : [{ id: 'me', name: displayName || 'Misafir' }];
  const viewerCount = liveEnabled ? roomViewers.length : viewers + 1;

  const statusLabel: Record<Connection, string> = {
    local: en ? 'Local mode' : 'Yerel mod',
    connecting: en ? 'Connecting' : 'Bağlanıyor',
    connected: en ? 'Connected' : 'Bağlı',
    offline: en ? 'Offline' : 'Çevrimdışı',
  };
  const statusDot: Record<Connection, string> = {
    local: 'bg-cinech-cream/70',
    connecting: 'bg-cinech-brown-light animate-rec-blink',
    connected: 'bg-cinech-olive-light animate-rec-blink',
    offline: 'bg-cinech-cream/40',
  };
  const priceLabel = requiresTicket ? `${ticketPrice} CINE` : en ? 'Free entry' : 'Ücretsiz giriş';

  // If user hasn't joined yet, show join screen
  if (!hasJoined) {
    return (
      <div className="bg-cinech-ink-light text-cinech-cream rounded-xl p-6 max-w-md mx-auto">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/60">
          <span className={`h-2 w-2 rounded-full ${liveEnabled ? 'bg-cinech-olive-light animate-rec-blink' : 'bg-cinech-cream/70'}`} aria-hidden />
          <span>{liveEnabled ? (en ? 'Live room' : 'Canlı oda') : statusLabel.local}</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-cinech-cream/70 mb-6">{description}</p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-cinech-cream/60">
            <Users className="h-5 w-5 mr-2" />
            <span>{viewers} {en ? 'watching' : 'izliyor'}</span>
          </div>
          <div className="flex items-center text-cinech-cream/60">
            <Coins className="h-5 w-5 mr-1 text-cinech-brown-light" />
            <span>{priceLabel}</span>
          </div>
          <div className="text-cinech-cream/60">
            {timeLeft}
          </div>
        </div>

        <button
          type="button"
          onClick={handleJoinRoom}
          disabled={isLoading}
          className="btn-brown w-full disabled:opacity-50"
        >
          {isLoading ? (en ? 'Loading...' : 'Yükleniyor...') : en ? 'Join Room' : 'Odaya katıl'}
        </button>
      </div>
    );
  }

  // Main room view
  return (
    <div className="bg-cinech-ink-light text-cinech-cream rounded-xl overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onSeeked={handleVideoSeeked}
        />

        {/* Durum çipi (HUD) */}
        <div
          className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 border-2 border-cinech-cream/70 bg-cinech-ink/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream shadow-hard-sm"
          role="status"
        >
          <span className={`h-2 w-2 rounded-full ${statusDot[connection]}`} aria-hidden />
          <span>{statusLabel[connection]}</span>
          <span className="text-cinech-cream/50" aria-hidden>·</span>
          <span>{viewerCount} {en ? 'watching' : 'izliyor'}</span>
        </div>

        {/* Uçuşan tepkiler */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <AnimatePresence>
            {floating.map((f) => (
              <motion.span
                key={f.key}
                className="absolute bottom-24 flex flex-col items-center"
                style={{ left: `${f.left}%` }}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: -220, x: f.drift, scale: 1.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: REACTION_LIFETIME_MS / 1000, ease: 'easeOut' }}
              >
                <span className="text-3xl">{f.emoji}</span>
                <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/80">
                  {f.name}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-center mb-2">
            <button
              type="button"
              onClick={handlePlayPause}
              className="bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? (en ? 'Pause' : 'Durdur') : en ? 'Play' : 'Oynat'}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="h-1 bg-cinech-cream/20 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-cinech-brown rounded-full transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-cinech-cream/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center text-cinech-cream/80 hover:text-cinech-cream"
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                <span>{en ? 'Chat' : 'Sohbet'}</span>
              </button>

              <div className="flex items-center text-cinech-cream/80">
                <Users className="h-5 w-5 mr-1" />
                <span>{viewerCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute right-4 top-4 bottom-24 flex w-80 max-w-[calc(100%-2rem)] flex-col border-2 border-cinech-cream/70 bg-cinech-ink/90 shadow-hard-sm">
            <div className="flex items-center justify-between border-b-2 border-cinech-cream/30 p-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.3em]">
                {en ? 'Chat' : 'Sohbet'} · {viewerCount}
              </h3>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="text-cinech-cream/60 hover:text-cinech-cream"
                aria-label={en ? 'Close chat' : 'Sohbeti kapat'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
              {messages.map((msg) =>
                msg.system ? (
                  <div key={msg.id} className="font-mono text-[11px] uppercase tracking-[0.2em] text-cinech-cream/50">
                    ▸ {msg.text}
                  </div>
                ) : (
                  <div key={msg.id} className="break-words">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                        msg.name === displayName ? 'text-cinech-brown-light' : 'text-cinech-cream/70'
                      }`}
                    >
                      {msg.name}
                    </span>{' '}
                    <span>{msg.text}</span>
                  </div>
                ),
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t-2 border-cinech-cream/30 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  maxLength={MESSAGE_LIMIT}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={en ? 'Type a message...' : 'Mesaj yaz...'}
                  className="min-w-0 flex-1 border-2 border-cinech-cream/40 bg-cinech-ink px-3 py-2 text-sm text-cinech-cream placeholder:text-cinech-cream/40 focus:border-cinech-olive-light focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={chatCooldown || !messageInput.trim()}
                  className="flex items-center justify-center border-2 border-cinech-cream/70 bg-cinech-brown px-3 text-cinech-cream shadow-hard-sm transition-transform active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
                  aria-label={en ? 'Send' : 'Gönder'}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Voting Panel */}
        {showVoting && (
          <div className="absolute top-4 left-1/2 w-80 max-w-[calc(100%-2rem)] -translate-x-1/2 transform border-2 border-cinech-cream/70 bg-cinech-ink/90 p-4 shadow-hard-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.3em]">{en ? 'Vote' : 'Oyla'}</h3>
              <button
                type="button"
                onClick={() => setShowVoting(false)}
                className="text-cinech-cream/60 hover:text-cinech-cream"
                aria-label={en ? 'Close poll' : 'Anketi kapat'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {votingOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`w-full text-left p-2 border-2 ${
                    hasVoted
                      ? option.votes > 0
                        ? 'border-cinech-brown-light bg-cinech-brown/30 text-cinech-brown-light'
                        : 'border-cinech-cream/20 bg-cinech-ink-lighter/50 text-cinech-cream/50'
                      : 'border-cinech-cream/40 bg-cinech-ink-lighter hover:bg-cinech-olive'
                  } transition-colors`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option.text}</span>
                    {hasVoted && <span>{option.votes} {en ? 'votes' : 'oy'}</span>}
                  </div>
                  {hasVoted && (
                    <div className="h-1 bg-cinech-cream/20 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-cinech-brown transition-all duration-500"
                        style={{
                          width: `${(option.votes / Math.max(1, votingOptions.reduce((sum, opt) => sum + opt.votes, 0))) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {hasVoted && (
              <div className="mt-3 text-sm text-center text-cinech-cream/70">
                {en ? 'Your vote has been recorded!' : 'Oyun kaydedildi!'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-cinech-cream/70 mt-1">{description}</p>

        {/* Tepki çubuğu */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/60">
            {en ? 'React' : 'Tepki'}
          </span>
          {ROOM_REACTIONS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="h-10 w-10 border-2 border-cinech-cream/70 bg-cinech-ink-lighter text-lg shadow-hard-sm transition-transform hover:bg-cinech-olive active:translate-x-[1px] active:translate-y-[1px]"
              aria-label={en ? `React with ${emoji}` : `Tepki ver: ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* İzleyiciler */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/60">
            <Users className="mr-1 h-3.5 w-3.5" />
            {viewerCount} {en ? 'watching' : 'izliyor'}
          </span>
          {viewerList.map((viewer) => (
            <span
              key={viewer.id}
              className={`border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.2em] ${
                viewer.name === displayName
                  ? 'border-cinech-brown-light text-cinech-brown-light'
                  : 'border-cinech-cream/40 text-cinech-cream/80'
              }`}
            >
              {viewer.name}
            </span>
          ))}
          {liveEnabled && viewerList.length === 0 ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-cinech-cream/40">
              {connection === 'offline' ? (en ? 'Connection lost' : 'Bağlantı kesildi') : en ? 'Waiting for the room…' : 'Oda bekleniyor…'}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-cinech-cream/60">
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-1 text-cinech-brown-light" />
            <span>{priceLabel}</span>
          </div>
          <div>{timeLeft}</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
