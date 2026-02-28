import { buildApp } from './app.js';
import { env } from './config/env.js';
import { initWebsocketServer } from './websocket/websocketServer.js';

const server = buildApp({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    initWebsocketServer(server);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
