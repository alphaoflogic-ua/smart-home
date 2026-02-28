import mqtt from 'mqtt';
import { z } from 'zod';
import { env } from '../config/env.js';
import { query } from '../db/db.js';
import { broadcastToHome } from '../websocket/websocketServer.js';
import { evaluate } from '../modules/automations/automationEngine.js';
import logger from '../utils/logger.js';

/** @typedef {import('../types/device.js').DeviceStateUpdate} DeviceStateUpdate */

const StateSchema = z.object({
  state: z.record(z.any()),
  timestamp: z.string().datetime().optional(),
});

const EventSchema = z.object({
  event: z.string(),
  data: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

const HeartbeatSchema = z.object({
  status: z.enum(['online', 'offline']),
  timestamp: z.string().datetime().optional(),
});

/** @type {import('mqtt').MqttClient} */
let client;

/**
 * @param {string} stationId 
 */
export const connectMqtt = (stationId) => {
  const options = {
    username: env.MQTT_USER,
    password: env.MQTT_PASSWORD,
    clientId: `backend_${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 5000,
  };

  client = mqtt.connect(env.MQTT_URL, options);

  client.on('connect', () => {
    logger.info('✅ Connected to MQTT broker');
    
    const topics = [
      `station/${stationId}/device/+/state`,
      `station/${stationId}/device/+/event`,
      `station/${stationId}/device/+/heartbeat`,
    ];

    client.subscribe(topics, (err) => {
      if (err) {
        logger.error({ err }, '❌ MQTT subscription error');
      } else {
        logger.info(`📡 Subscribed to topics for station: ${stationId}`);
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const topicParts = topic.split('/');
      const deviceId = topicParts[3];
      const type = topicParts[4];
      const payload = JSON.parse(message.toString());

      await handleMqttMessage(deviceId, type, payload);
    } catch (err) {
      logger.error({ err, topic }, '❌ Error processing MQTT message');
    }
  });

  client.on('error', (err) => {
    logger.error({ err }, '❌ MQTT error');
  });

  client.on('close', () => {
    logger.warn('🔌 MQTT connection closed');
  });
};

/**
 * @param {string} deviceId
 * @param {string} type
 * @param {any} payload
 */
async function handleMqttMessage(deviceId, type, payload) {
  let validatedData;

  switch (type) {
    case 'state': {
      validatedData = StateSchema.parse(payload);
      const homeId = await saveDeviceState(deviceId, validatedData.state);
      
      // Trigger automation engine
      evaluate(deviceId, validatedData.state);

      if (homeId) {
        broadcastToHome(homeId, {
          type: 'device_state',
          deviceId,
          state: validatedData.state,
          timestamp: validatedData.timestamp || new Date().toISOString(),
        });
      }
      break;
    }

    case 'event':
      EventSchema.parse(payload);
      // TODO: Log event, trigger specific automations
      break;

    case 'heartbeat':
      validatedData = HeartbeatSchema.parse(payload);
      await updateDeviceStatus(deviceId, validatedData.status);
      break;

    default:
      logger.warn(`⚠️ Unknown message type: ${type}`);
  }
}

/**
 * @param {string} deviceId
 * @param {Record<string, any>} state
 * @returns {Promise<string | null>} home_id
 */
async function saveDeviceState(deviceId, state) {
  try {
    // Save to history
    await query(
      'INSERT INTO device_states (device_id, state) VALUES ($1, $2)',
      [deviceId, JSON.stringify(state)]
    );

    // Update last known state in devices table and return home_id
    const result = await query(
      'UPDATE devices SET last_known_state = $1, updated_at = NOW() WHERE id = $2 RETURNING home_id',
      [JSON.stringify(state), deviceId]
    );

    return result.rows[0]?.home_id || null;
  } catch (err) {
    logger.error({ err, deviceId }, `❌ Failed to save device state`);
    return null;
  }
}

/**
 * @param {string} deviceId
 * @param {'online' | 'offline'} status
 */
async function updateDeviceStatus(deviceId, status) {
  try {
    await query(
      'UPDATE devices SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, deviceId]
    );
  } catch (err) {
    logger.error({ err, deviceId, status }, `❌ Failed to update device status`);
  }
}

/**
 * @param {string} deviceId
 * @param {any} payload
 */
export const publishCommand = (deviceId, payload) => {
  if (!client || !client.connected) {
    throw new Error('MQTT client not connected');
  }

  // Find home_id for this device to construct correct topic if needed
  // For now, using a simplified command topic
  const topic = `device/${deviceId}/command`;
  client.publish(topic, JSON.stringify(payload), { qos: 1 });
};
