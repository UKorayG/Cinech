#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/**
 * Cinech canlı izleme odası sunucusu (Socket.io).
 *
 * Odalar bellekte tutulur: sunucu yeniden başlarsa sohbet geçmişi sıfırlanır,
 * son izleyici çıkınca oda silinir.
 *
 * Ortam değişkenleri:
 *   SOCKET_PORT          dinlenecek port (varsayılan 3101)
 *   SOCKET_CORS_ORIGINS  virgülle ayrılmış izinli kaynaklar
 *                        (varsayılan http://localhost:3100,http://localhost:3000)
 *
 * Olaylar (istemci → sunucu):
 *   room:join        { roomId, name }
 *   chat:message     { text }                 280 karakter, 700 ms'de 1 mesaj
 *   playback:update  { playing, time }        odadaki diğerlerine yayılır
 *   reaction         { emoji }                izinli liste: 🎬 👏 😂 😱 ❤️ 🍿
 *
 * Olaylar (sunucu → istemci):
 *   room:state       { viewers, playback, messages }   katılan sokete
 *   room:presence    { viewers }                       odaya
 *   chat:message     { id, name, text, at }            odaya (gönderen dahil)
 *   playback:update  { playing, time, updatedAt }      odadaki diğerlerine
 *   reaction         { id, name, emoji }               odaya (gönderen dahil)
 *
 * GET /health → { ok, rooms, viewers, uptime }
 */

const http = require('http');
const { randomUUID } = require('crypto');
const { Server } = require('socket.io');

const PORT = Number.parseInt(process.env.SOCKET_PORT || '', 10) || 3101;
const CORS_ORIGINS = (process.env.SOCKET_CORS_ORIGINS || 'http://localhost:3100,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const LIMITS = Object.freeze({
  message: 280,
  name: 32,
  roomId: 64,
  history: 50,
  chatIntervalMs: 700,
  reactionIntervalMs: 250,
});

const REACTIONS = new Set(['🎬', '👏', '😂', '😱', '❤️', '🍿']);
const DEFAULT_NAME = 'Misafir';

/**
 * @typedef {{ playing: boolean, time: number, updatedAt: number }} Playback
 * @typedef {{ id: string, name: string, text: string, at: number }} Message
 * @typedef {{ viewers: Map<string, string>, playback: Playback, messages: Message[] }} Room
 */

/** @type {Map<string, Room>} */
const rooms = new Map();

function log(...parts) {
  console.log(`[${new Date().toISOString()}]`, ...parts);
}

// Kontrol karakterleri (C0/C1), sıfır genişlikli ve yön değiştiren görünmez karakterler atılır;
// satır sonları ve sekmeler tek boşluğa çevrilir. HTML kaçışı yapılmaz: React metni güvenli basar.
const INVISIBLE_RE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]/g;

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/[\t\r\n]+/g, ' ').replace(INVISIBLE_RE, '').trim();
  // Emoji gibi çift kod birimli karakterleri bölmemek için kod noktasına göre kes.
  return Array.from(cleaned).slice(0, max).join('');
}

/** @returns {Room} */
function getRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      viewers: new Map(),
      playback: { playing: false, time: 0, updatedAt: Date.now() },
      messages: [],
    };
    rooms.set(roomId, room);
    log(`oda açıldı: ${roomId}`);
  }
  return room;
}

/** @param {Room} room */
function viewersOf(room) {
  return Array.from(room.viewers, ([id, name]) => ({ id, name }));
}

function totalViewers() {
  let count = 0;
  for (const room of rooms.values()) count += room.viewers.size;
  return count;
}

const httpServer = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];
  if (req.method === 'GET' && path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(
      JSON.stringify({
        ok: true,
        service: 'cinech-socket',
        rooms: rooms.size,
        viewers: totalViewers(),
        uptime: Math.round(process.uptime()),
        now: Date.now(),
      }),
    );
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: false, error: 'not_found' }));
});

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 16 * 1024,
  serveClient: false,
});

io.on('connection', (socket) => {
  /** @type {string | null} */
  let roomId = null;
  let name = DEFAULT_NAME;
  let lastChatAt = 0;
  let lastReactionAt = 0;

  log(`bağlandı: ${socket.id}`);

  function leaveRoom() {
    if (!roomId) return;
    const leavingRoom = roomId;
    const room = rooms.get(leavingRoom);
    roomId = null;
    socket.leave(leavingRoom);
    log(`ayrıldı: ${name} (${socket.id}) ← ${leavingRoom}`);
    if (!room) return;
    room.viewers.delete(socket.id);
    if (room.viewers.size === 0) {
      rooms.delete(leavingRoom);
      log(`oda kapandı: ${leavingRoom}`);
    } else {
      io.to(leavingRoom).emit('room:presence', { viewers: viewersOf(room) });
    }
  }

  socket.on('room:join', (payload) => {
    const data = payload && typeof payload === 'object' ? payload : {};
    const nextRoomId = cleanText(data.roomId, LIMITS.roomId);
    if (!nextRoomId) return;

    if (roomId && roomId !== nextRoomId) leaveRoom();
    roomId = nextRoomId;
    name = cleanText(data.name, LIMITS.name) || DEFAULT_NAME;

    const room = getRoom(roomId);
    room.viewers.set(socket.id, name);
    socket.join(roomId);

    const viewers = viewersOf(room);
    socket.emit('room:state', {
      viewers,
      playback: room.playback,
      messages: room.messages.slice(-LIMITS.history),
    });
    io.to(roomId).emit('room:presence', { viewers });
    log(`katıldı: ${name} (${socket.id}) → ${roomId} · ${viewers.length} izleyici`);
  });

  socket.on('chat:message', (payload) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const text = cleanText(payload && payload.text, LIMITS.message);
    if (!text) return;

    const now = Date.now();
    if (now - lastChatAt < LIMITS.chatIntervalMs) return;
    lastChatAt = now;

    const message = { id: randomUUID(), name, text, at: now };
    room.messages.push(message);
    if (room.messages.length > LIMITS.history) {
      room.messages.splice(0, room.messages.length - LIMITS.history);
    }
    io.to(roomId).emit('chat:message', message);
  });

  socket.on('playback:update', (payload) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const time = Number(payload && payload.time);
    if (!Number.isFinite(time) || time < 0) return;

    room.playback = { playing: Boolean(payload && payload.playing), time, updatedAt: Date.now() };
    // Gönderen hariç: istemci kendi oynatıcısını zaten güncelledi.
    socket.to(roomId).emit('playback:update', room.playback);
  });

  socket.on('reaction', (payload) => {
    if (!roomId) return;
    const emoji = payload && payload.emoji;
    if (typeof emoji !== 'string' || !REACTIONS.has(emoji)) return;

    const now = Date.now();
    if (now - lastReactionAt < LIMITS.reactionIntervalMs) return;
    lastReactionAt = now;

    io.to(roomId).emit('reaction', { id: randomUUID(), name, emoji });
  });

  socket.on('disconnect', (reason) => {
    leaveRoom();
    log(`koptu: ${socket.id} (${reason})`);
  });
});

httpServer.on('error', (error) => {
  log(`sunucu hatası: ${error.message}`);
  process.exit(1);
});

httpServer.listen(PORT, () => {
  log(`Cinech socket sunucusu http://localhost:${PORT} adresinde · CORS: ${CORS_ORIGINS.join(', ')}`);
});

function shutdown(signal) {
  log(`${signal} alındı, kapatılıyor…`);
  io.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
