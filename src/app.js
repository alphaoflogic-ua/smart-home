import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './modules/auth/authRoutes.js';
import { devicesRoutes } from './modules/devices/devicesRoutes.js';
import { otaRoutes } from './modules/ota/otaRoutes.js';
import logger from './utils/logger.js';
import { toCamel, toSnake } from './utils/caseConverter.js';

/**
 * @param {import('fastify').FastifyHttpOptions<any>} [opts]
 * @returns {import('fastify').FastifyInstance<any>}
 */
export const buildApp = (opts = {}) => {
  const app = Fastify(opts);

  // Case transformation for incoming data (camelCase -> snake_case)
  app.addHook('preValidation', async (request) => {
    if (request.body && typeof request.body === 'object') {
      request.body = toSnake(request.body);
    }
    if (request.query && typeof request.query === 'object') {
      request.query = /** @type {any} */ (toSnake(request.query));
    }
  });

  // Global serializer for outgoing data (snake_case -> camelCase)
  app.setSerializerCompiler(() => {
    return (data) => JSON.stringify(toCamel(data));
  });

  // Security plugins
  app.register(helmet);
  app.register(cors, {
    origin: true, // In production, replace with specific origins
    credentials: true,
  });
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Central error handler
  app.setErrorHandler((error, request, reply) => {
    const err = /** @type {any} */ (error);
    logger.error({
      err: error,
      url: request.url,
      method: request.method,
      body: request.body,
    }, 'Unhandled error');

    if (err.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message,
      });
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode >= 500 ? 'Internal Server Error' : err.message;

    reply.status(statusCode).send({
      statusCode,
      error: err.name || 'Error',
      message,
    });
  });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // Register routes
  app.register(authRoutes, { prefix: '/auth' });
  app.register(devicesRoutes, { prefix: '/devices' });
  app.register(otaRoutes, { prefix: '/ota' });

  return app;
};
