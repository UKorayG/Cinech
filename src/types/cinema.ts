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

// Socket.io event types
export interface ServerToClientEvents {
  'chat message': (msg: ChatMessage) => void;
  'play': (time: number) => void;
  'pause': (time: number) => void;
  'seek': (time: number) => void;
  'user joined': (username: string) => void;
  'user left': (username: string) => void;
  'voting started': (options: SceneOption[]) => void;
  'vote received': (optionId: number) => void;
}

export interface ClientToServerEvents {
  'chat message': (msg: string) => void;
  'play': (time: number) => void;
  'pause': (time: number) => void;
  'seek': (time: number) => void;
  'join room': (roomId: string, username: string) => void;
  'leave room': (roomId: string) => void;
  'submit vote': (optionId: number) => void;
}

export const VOTING_MOMENTS = [30, 90, 180]; // Key moments in seconds where voting is triggered

export const SCENE_OPTIONS: SceneOption[] = [
  { id: 1, text: 'The Killer Escaped', votes: 0 },
  { id: 2, text: 'The Killer Was Caught', votes: 0 },
];
