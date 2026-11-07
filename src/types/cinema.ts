// Types for the Cinema Room component

export interface CinemaRoomProps {
  roomId: string;
  title: string;
  description: string;
  viewers: number;
  timeLeft: string;
  videoUrl: string;
  requiresTicket: boolean;
  ticketPrice?: string;
  onJoin: (roomId: string) => Promise<boolean>;
}

export interface ChatMessage {
  user: string;
  text: string;
  timestamp: number;
}

export interface SceneOption {
  id: number;
  text: string;
  votes: number;
}

// --- Canlı izleme odası protokolü (server/socket.js ile birebir) ---

export interface RoomViewer {
  id: string;
  name: string;
}

export interface RoomPlayback {
  playing: boolean;
  time: number;
  /** Sunucu saatine göre ms; katılan izleyici geçen süreyi buna göre ekler */
  updatedAt: number;
}

export interface RoomChatMessage {
  id: string;
  name: string;
  text: string;
  at: number;
  /** Yalnızca istemcide üretilen bilgi satırları (katıldı, çevrimdışı vb.) */
  system?: boolean;
}

export interface RoomReaction {
  id: string;
  name: string;
  emoji: string;
}

export interface RoomState {
  viewers: RoomViewer[];
  playback: RoomPlayback;
  messages: RoomChatMessage[];
}

export const ROOM_REACTIONS = ['🎬', '👏', '😂', '😱', '❤️', '🍿'] as const;
export type RoomReactionEmoji = (typeof ROOM_REACTIONS)[number];

export interface RoomServerToClientEvents {
  'room:state': (state: RoomState) => void;
  'room:presence': (presence: { viewers: RoomViewer[] }) => void;
  'chat:message': (message: RoomChatMessage) => void;
  'playback:update': (playback: RoomPlayback) => void;
  reaction: (reaction: RoomReaction) => void;
}

export interface RoomClientToServerEvents {
  'room:join': (payload: { roomId: string; name: string }) => void;
  'chat:message': (payload: { text: string }) => void;
  'playback:update': (payload: { playing: boolean; time: number }) => void;
  reaction: (payload: { emoji: RoomReactionEmoji }) => void;
}

export const VOTING_MOMENTS = [30, 90, 180]; // Key moments in seconds where voting is triggered

export const SCENE_OPTIONS: SceneOption[] = [
  { id: 1, text: 'The Killer Escaped', votes: 0 },
  { id: 2, text: 'The Killer Was Caught', votes: 0 },
];
