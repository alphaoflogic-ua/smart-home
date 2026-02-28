import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { toCamel } from '../utils/caseConverter.js';

/**
 * @typedef {import('../types/index.js').AuthPayload} AuthPayload
 * @typedef {WebSocket & { isAlive: boolean, homeId?: string, user?: AuthPayload }} ExtendedWebSocket
 */

/** @type {Map<string, Set<ExtendedWebSocket>>} */
const rooms = new Map();

/** @type {WebSocketServer} */
let wss;

/**
 * Initialize WebSocket server
 * @param {import('fastify').FastifyInstance<any>} fastify
 */
export function initWebsocketServer(fastify) {
  wss = new WebSocketServer({
    server: fastify.server,
    path: '/ws',
  });

  wss.on('connection', (/** @type {ExtendedWebSocket} */ ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      /** @type {AuthPayload} */
      // @ts-ignore
      const decoded = jwt.verify(token, env.JWT_SECRET);
      ws.user = decoded;
      ws.isAlive = true;

      // For this implementation, we assume homeId might be passed in query or later via message
      // Let's check query first
      const homeId = url.searchParams.get('homeId');
      if (homeId) {
        joinRoom(homeId, ws);
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleMessage(ws, message);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          fastify.log.error({ err }, `WS Message error: ${msg}`);
        }
      });

      ws.on('close', () => {
        if (ws.homeId) {
          leaveRoom(ws.homeId, ws);
        }
      });

      ws.on('error', (err) => {
        fastify.log.error({ err }, 'WS Error');
      });

    } catch (err) {
      ws.close(1008, 'Invalid token');
    }
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    // @ts-ignore
    wss.clients.forEach((/** @type {ExtendedWebSocket} */ ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  fastify.log.info('🚀 WebSocket server initialized on /ws');
}

/**
 * @param {ExtendedWebSocket} ws
 * @param {any} message
 */
function handleMessage(ws, message) {
  if (message.type === 'join') {
    const { homeId } = message;
    if (homeId) {
      joinRoom(homeId, ws);
    }
  }
}

/**
 * @param {string} homeId
 * @param {ExtendedWebSocket} ws
 */
function joinRoom(homeId, ws) {
  if (ws.homeId) {
    leaveRoom(ws.homeId, ws);
  }
  
  ws.homeId = homeId;
  if (!rooms.has(homeId)) {
    rooms.set(homeId, new Set());
  }
  rooms.get(homeId)?.add(ws);
}

/**
 * @param {string} homeId
 * @param {ExtendedWebSocket} ws
 */
function leaveRoom(homeId, ws) {
  const room = rooms.get(homeId);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(homeId);
    }
  }
}

/**
 * Broadcast message to all clients in a room (home)
 * @param {string} homeId
 * @param {any} data
 */
export function broadcastToHome(homeId, data) {
  const clients = rooms.get(homeId);
  if (clients) {
    const payload = JSON.stringify(toCamel(data));
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}
