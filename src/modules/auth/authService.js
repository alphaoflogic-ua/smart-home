import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { query } from '../../db/db.js';

/** @typedef {import('../../types/user.js').User} User */

const SALT_ROUNDS = 10;

/**
 * @param {string} email
 * @param {string} password
 * @param {'admin' | 'user'} [role]
 * @returns {Promise<User>}
 */
export const register = async (email, password, role = 'user') => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const result = await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, role]
  );
  
  return result.rows[0];
};

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: User, accessToken: string, refreshToken: string } | null>}
 */
export const login = async (email, password) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) return null;

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return { user, accessToken, refreshToken };
};

/**
 * @param {string} userId
 * @param {string} role
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

/**
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string } | null>}
 */
export const refreshTokens = async (refreshToken) => {
  try {
    /** @type {any} */
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    return generateTokens(decoded.userId, decoded.role);
  } catch (err) {
    return null;
  }
};
