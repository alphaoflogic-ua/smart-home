import { buildApp } from './app.js';
import { env } from './config/env.js';
import { initWebsocketServer } from './websocket/websocketServer.js';
import * as authService from './modules/auth/authService.js';

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

    // Initial cleanup of expired tokens
    authService.cleanupExpiredTokens()
      .then(count => {
        if (count > 0) {
          server.log.info(`Cleaned up ${count} expired refresh tokens`);
        }
      })
      .catch(err => server.log.error(err, 'Failed to cleanup expired tokens'));

    // Periodic cleanup (every 24 hours)
    setInterval(async () => {
      try {
        const count = await authService.cleanupExpiredTokens();
        if (count > 0) {
          server.log.info(`Cleaned up ${count} expired refresh tokens (periodic)`);
        }
      } catch (err) {
        server.log.error(err, 'Failed to cleanup expired tokens (periodic)');
      }
    }, 24 * 60 * 60 * 1000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
