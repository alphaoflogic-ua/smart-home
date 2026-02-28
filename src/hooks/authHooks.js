import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** @typedef {import('../types/index.js').AuthPayload} AuthPayload */

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export const verifyToken = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    /** @type {any} */
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // @ts-ignore
    request.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (err) {
    throw reply.status(401).send({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * @param {string[]} roles
 */
export const authorize = (roles) => {
  /**
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   */
  return async (request, reply) => {
    // @ts-ignore
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw reply.status(403).send({ message: 'Forbidden: Insufficient permissions' });
    }
  };
};
