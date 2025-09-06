import { Socket } from 'socket.io-client';
import { ChatMessage, SceneOption } from './cinema';

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
  'join room': (roomId: string, username: string) => void;
  'chat message': (msg: string) => void;
  'play': (time: number) => void;
  'pause': (time: number) => void;
  'seek': (time: number) => void;
  'leave room': (roomId: string) => void;
  'start voting': (roomId: string, options: SceneOption[]) => void;
  'submit vote': (optionId: number) => void;
}

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;
