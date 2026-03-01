import { z } from 'zod';
import * as authService from './authService.js';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const RefreshSchema = z.object({
  refreshToken: z.string(),
});

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export const authRoutes = async (fastify) => {
  fastify.get('/registration-status', async () => {
    const count = await authService.getUsersCount();
    return { 
      isRegistrationOpen: count === 0,
      hasAdmin: count > 0 
    };
  });

  fastify.post('/register', async (request, reply) => {
    const validated = RegisterSchema.parse(request.body);
    try {
      const user = await authService.register(
        validated.email,
        validated.password
      );
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      if (/** @type {any} */ (err).code === '23505') {
        return reply.status(400).send({ message: 'User already exists' });
      }
      if (/** @type {Error} */ (err).message === 'Registration is disabled') {
        return reply.status(403).send({ message: 'Registration is disabled' });
      }
      throw err;
    }
  });

  fastify.post('/login', async (request, reply) => {
    const validated = LoginSchema.parse(request.body);
    const result = await authService.login(validated.email, validated.password);
    
    if (!result) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const { user, accessToken, refreshToken } = result;
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  });

  fastify.post('/refresh', async (request, reply) => {
    const validated = RefreshSchema.parse(request.body);
    const result = await authService.refreshTokens(validated.refreshToken);

    if (!result) {
      return reply.status(401).send({ message: 'Invalid refresh token' });
    }

    return result;
  });

  fastify.post('/logout', async (request, reply) => {
    const { refresh_token } = /** @type {any} */ (request.body || {});
    if (refresh_token) {
      await authService.revokeRefreshToken(refresh_token);
    }
    return reply.status(200).send({ message: 'Logged out successfully' });
  });
};
