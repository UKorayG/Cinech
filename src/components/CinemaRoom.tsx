'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Users, MessageCircle, X, Send, Copy, Check, Coins } from 'lucide-react';
import { useAccount } from 'wagmi';
import { io, Socket } from 'socket.io-client';
import { 
  CinemaRoomProps, 
  ChatMessage,
  VOTING_MOMENTS,
  SCENE_OPTIONS,
  SceneOption
} from '@/types/cinema';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export default function CinemaRoom({ 
  roomId, 
  title,
  description,
  viewers, 
  timeLeft, 
  videoUrl,
  requiresTicket = false,
  ticketPrice = '0',
  onJoin 
}: CinemaRoomProps) {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Room state
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(viewers);
  
  // Voting state
  const [showVoting, setShowVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingOptions, setVotingOptions] = useState<SceneOption[]>(SCENE_OPTIONS);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<SocketType | null>(null);
  
  // User info
  const { address } = useAccount();
  const username = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anonim';
  
  // Initialize socket connection
  useEffect(() => {
    if (!hasJoined) return;
    
    const socket: SocketType = io('http://localhost:3001');
    socketRef.current = socket;
    
    // Join the room
    socket.emit('join room', roomId, username);
    
    // Set up event listeners
    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    
    socket.on('play', (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.play();
        setIsPlaying(true);
      }
    });
    
    socket.on('pause', (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    });
    
    socket.on('seek', (time) => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - time) > 1) {
        videoRef.current.currentTime = time;
      }
    });
    
    socket.on('user joined', (username) => {
      setCurrentViewers(prev => prev + 1);
      setMessages(prev => [...prev, {
        user: 'System',
        text: `${username} joined the room`,
        timestamp: Date.now()
      }]);
    });
    
    socket.on('user left', (username) => {
      setCurrentViewers(prev => Math.max(0, prev - 1));
      setMessages(prev => [...prev, {
        user: 'System',
        text: `${username} left the room`,
        timestamp: Date.now()
      }]);
    });
    
    socket.on('voting started', (options) => {
      setVotingOptions(options);
      setShowVoting(true);
      setHasVoted(false);
    });
    
    socket.on('vote received', (optionId) => {
      setVotingOptions(prev => 
        prev.map(opt => 
          opt.id === optionId 
            ? { ...opt, votes: opt.votes + 1 } 
            : opt
        )
      );
    });
    
    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [hasJoined, roomId, username]);
  
  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Check for voting moments
  useEffect(() => {
    if (!hasJoined) return;
    
    const checkVotingMoment = () => {
      if (!videoRef.current) return;
      
      const currentTime = Math.floor(videoRef.current.currentTime);
      
      // Check if we're at a voting moment and voting isn't already active
      if (VOTING_MOMENTS.includes(currentTime) && !showVoting && !hasVoted) {
        // Start a new voting session
        socketRef.current?.emit('start voting', roomId, SCENE_OPTIONS as SceneOption[]);
        setShowVoting(true);
      }
    };
    
    const interval = setInterval(checkVotingMoment, 1000);
    return () => clearInterval(interval);
  }, [hasJoined, hasVoted, roomId, showVoting]);
  
  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (!hasJoined) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        socketRef.current?.emit('pause', videoRef.current.currentTime);
      } else {
        videoRef.current.play();
        socketRef.current?.emit('play', videoRef.current.currentTime);
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasJoined || !videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    socketRef.current?.emit('seek', newTime);
  };
  
  // Handle sending chat messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = messageInput.trim();
    if (!message || !hasJoined) return;
    
    socketRef.current?.emit('chat message', message);
    setMessageInput('');
  };
  
  // Handle voting
  const handleVote = (optionId: number) => {
    if (!hasJoined || hasVoted) return;
    
    socketRef.current?.emit('submit vote', parseInt(optionId as unknown as string, 10));
    setHasVoted(true);
    
    // Update local state optimistically
    setVotingOptions(prev => 
      prev.map(opt => 
        opt.id === optionId 
          ? { ...opt, votes: opt.votes + 1 } 
          : opt
      )
    );
  };
  
  // Handle joining the room
  const handleJoinRoom = async () => {
    if (requiresTicket) {
      alert('You need to buy a ticket to enter this room!');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await onJoin(roomId);
      
      if (success) {
        setHasJoined(true);
        setMessages(prev => [...prev, {
          user: 'System',
          text: 'You have joined the room!',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('An error occurred while joining the room:', error);
      alert('An error occurred while joining the room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If user hasn't joined yet, show join screen
  if (!hasJoined) {
    return (
      <div className="bg-gray-900 text-white rounded-xl p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-400">
            <Users className="h-5 w-5 mr-2" />
            <span>{currentViewers} watching</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Coins className="h-5 w-5 mr-1 text-yellow-400" />
            <span>100 CINE</span>
          </div>
          <div className="text-gray-400">
            {timeLeft}
          </div>
        </div>
        
        <button
          onClick={handleJoinRoom}
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Join Room'}
        </button>
      </div>
    );
  }
  
  // Main room view
  return (
    <div className="bg-gray-900 text-white rounded-xl overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-center mb-2">
            <button
              onClick={handlePlayPause}
              className="bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? 'Durdur' : 'Oynat'}
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
            className="h-1 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-200"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowChat(!showChat)}
                className="flex items-center text-gray-300 hover:text-white"
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                <span>Sohbet</span>
              </button>
              
              <div className="flex items-center text-gray-300">
                <Users className="h-5 w-5 mr-1" />
                <span>{currentViewers}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-4 right-4 bottom-20 w-80 bg-black/80 rounded-lg flex flex-col">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">Chat</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Sohbeti kapat"
              >
                <X className="h-5 w-5" aria-label="Close" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className="break-words">
                  <span className="font-bold text-yellow-500">
                    {msg.user}:
                  </span>{' '}
                  <span>{msg.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button 
                  type="submit"
                  className="bg-yellow-500 text-black px-4 rounded-r-lg hover:bg-yellow-600 transition-colors"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Voting Panel */}
        {showVoting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg w-80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Vote</h3>
              <button 
                onClick={() => setShowVoting(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Anketi kapat"
              >
                <X className="h-5 w-5" aria-label="Close" />
              </button>
            </div>
            
            <div className="space-y-2">
              {votingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`w-full text-left p-2 rounded ${
                    hasVoted
                      ? option.votes > 0
                        ? 'bg-yellow-500/30 text-yellow-400'
                        : 'bg-gray-700/50 text-gray-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } transition-colors`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option.text}</span>
                    {hasVoted && <span>{option.votes} oy</span>}
                  </div>
                  {hasVoted && (
                    <div className="h-1 bg-gray-600 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{
                          width: `${(option.votes / Math.max(1, votingOptions.reduce((sum, opt) => sum + opt.votes, 0))) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {hasVoted && (
              <div className="mt-3 text-sm text-center text-gray-300">
                Your vote has been recorded!
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Video Info */}
      <div className="p-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-300 mt-1">{description}</p>
        
        <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{currentViewers} watching</span>
            </div>
            <div className="flex items-center">
              <Coins className="h-4 w-4 mr-1 text-yellow-400" />
              <span>100 CINE</span>
            </div>
          </div>
          <div>{timeLeft}</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
