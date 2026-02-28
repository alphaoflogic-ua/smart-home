import { query } from '../../db/db.js';
import { publishCommand as mqttPublish } from '../../mqtt/mqttClient.js';

/** @typedef {import('../../types/device.js').Device} Device */
/** @typedef {import('../../types/device.js').DeviceStatus} DeviceStatus */

/**
 * @param {string} homeId
 * @returns {Promise<Device[]>}
 */
export async function getDevices(homeId) {
  const result = await query(
    'SELECT * FROM devices WHERE home_id = $1 ORDER BY name ASC',
    [homeId]
  );
  return result.rows;
}

/**
 * @param {string} deviceId
 * @param {string} homeId
 * @returns {Promise<Device | null>}
 */
export async function getDeviceById(deviceId, homeId) {
  const result = await query(
    'SELECT * FROM devices WHERE id = $1 AND home_id = $2',
    [deviceId, homeId]
  );
  return result.rows[0] || null;
}

/**
 * @param {Partial<Device> & { home_id: string, name: string, type: string }} deviceData
 * @returns {Promise<Device>}
 */
export async function createDevice(deviceData) {
  const { home_id, room_id = null, name, type } = deviceData;
  const result = await query(
    `INSERT INTO devices (home_id, room_id, name, type, status, last_known_state)
     VALUES ($1, $2, $3, $4, 'offline', '{}')
     RETURNING *`,
    [home_id, room_id, name, type]
  );
  return result.rows[0];
}

/**
 * @param {string} deviceId
 * @param {string} homeId
 * @param {Partial<Device>} updateData
 * @returns {Promise<Device | null>}
 */
export async function updateDevice(deviceId, homeId, updateData) {
  const { name, room_id } = updateData;
  const result = await query(
    `UPDATE devices 
     SET name = COALESCE($1, name), 
         room_id = COALESCE($2, room_id),
         updated_at = NOW()
     WHERE id = $3 AND home_id = $4
     RETURNING *`,
    [name, room_id, deviceId, homeId]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} deviceId
 * @param {string} homeId
 * @returns {Promise<boolean>}
 */
export async function deleteDevice(deviceId, homeId) {
  const result = await query(
    'DELETE FROM devices WHERE id = $1 AND home_id = $2',
    [deviceId, homeId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * @param {string} deviceId
 * @param {string} homeId
 * @param {any} command
 * @returns {Promise<void>}
 */
export async function sendCommand(deviceId, homeId, command) {
  // Verify device exists and belongs to the home
  const device = await getDeviceById(deviceId, homeId);
  if (!device) {
    throw new Error('Device not found or access denied');
  }

  mqttPublish(deviceId, command);
}
