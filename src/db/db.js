import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const poolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * @param {string} text
 * @param {any[]} [params]
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * @returns {Promise<import('pg').PoolClient>}
 */
export const getClient = () => pool.connect();

export const closePool = () => pool.end();

/**
 * @param {number} retries 
 * @param {number} delay 
 */
export const connectWithRetry = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('✅ Successfully connected to PostgreSQL');
      client.release();
      return;
    } catch (err) {
      retries -= 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Failed to connect to PostgreSQL. Retries left: ${retries}`, message);
      if (retries === 0) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};
