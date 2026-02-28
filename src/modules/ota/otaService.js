import { query } from '../../db/db.js';
import logger from '../../utils/logger.js';

/**
 * @typedef {import('../../types/ota.js').Firmware} Firmware
 * @typedef {import('../../types/ota.js').OtaLog} OtaLog
 */

/**
 * Get latest firmware for device type
 * @param {string} deviceType
 * @returns {Promise<Firmware | null>}
 */
export async function getLatestFirmware(deviceType) {
  const result = await query(
    'SELECT * FROM firmwares WHERE device_type = $1 ORDER BY created_at DESC LIMIT 1',
    [deviceType]
  );
  return result.rows[0] || null;
}

/**
 * Log OTA update attempt
 * @param {string} deviceId
 * @param {string} fromVersion
 * @param {string} toVersion
 * @param {'pending' | 'success' | 'failed'} status
 * @param {string} [errorMessage]
 */
export async function logOtaAttempt(deviceId, fromVersion, toVersion, status, errorMessage) {
  try {
    await query(
      'INSERT INTO ota_logs (device_id, from_version, to_version, status, error_message) VALUES ($1, $2, $3, $4, $5)',
      [deviceId, fromVersion, toVersion, status, errorMessage]
    );
  } catch (err) {
    logger.error({ err, deviceId }, 'Failed to log OTA attempt');
  }
}

/**
 * @param {string} id
 * @returns {Promise<Firmware | null>}
 */
export async function getFirmwareById(id) {
  const result = await query('SELECT * FROM firmwares WHERE id = $1', [id]);
  return result.rows[0] || null;
}
