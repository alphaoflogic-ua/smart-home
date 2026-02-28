import { query } from '../../db/db.js';
import { publishCommand } from '../../mqtt/mqttClient.js';

/**
 * @typedef {import('../../types/automation.js').Automation} Automation
 * @typedef {import('../../types/automation.js').AutomationCondition} AutomationCondition
 * @typedef {import('../../types/automation.js').AutomationAction} AutomationAction
 */

/**
 * Evaluate and run automations based on device state update
 * @param {string} deviceId 
 * @param {Record<string, any>} state 
 */
export async function evaluate(deviceId, state) {
  try {
    // 1. Find active automations triggered by this device_id and any updated keys
    const updatedKeys = Object.keys(state);
    
    // In a real system, we'd have a better way to filter by keys.
    // For now, let's find all active automations for this home/device.
    const automationsResult = await query(
      `SELECT * FROM automations 
       WHERE is_active = TRUE 
       AND (trigger->>'device_id' = $1 OR trigger->>'type' = 'any_device')`,
      [deviceId]
    );

    /** @type {Automation[]} */
    const automations = automationsResult.rows;

    for (const automation of automations) {
      const isTriggered = checkTrigger(automation.trigger, deviceId, state);
      if (!isTriggered) continue;

      const conditionsMet = await checkConditions(automation.conditions);
      if (conditionsMet) {
        await executeActions(automation.actions);
      }
    }
  } catch (err) {
    console.error('❌ Automation engine error:', err);
  }
}

/**
 * @param {any} trigger 
 * @param {string} deviceId 
 * @param {Record<string, any>} state 
 * @returns {boolean}
 */
function checkTrigger(trigger, deviceId, state) {
  if (trigger.type === 'device_state') {
    return trigger.device_id === deviceId && (trigger.key in state);
  }
  return false;
}

/**
 * @param {AutomationCondition[]} conditions 
 * @returns {Promise<boolean>}
 */
async function checkConditions(conditions) {
  if (!conditions || conditions.length === 0) return true;

  for (const condition of conditions) {
    const met = await evaluateCondition(condition);
    if (!met) return false;
  }

  return true;
}

/**
 * @param {AutomationCondition} condition 
 * @returns {Promise<boolean>}
 */
async function evaluateCondition(condition) {
  switch (condition.type) {
    case 'state_equals': {
      const current = await getDeviceState(condition.device_id);
      return current[condition.key] === condition.value;
    }
    case 'numeric_compare': {
      const current = await getDeviceState(condition.device_id);
      const val = Number(current[condition.key]);
      if (isNaN(val)) return false;

      switch (condition.operator) {
        case '>': return val > condition.value;
        case '<': return val < condition.value;
        case '>=': return val >= condition.value;
        case '<=': return val <= condition.value;
        case '==': return val === condition.value;
        default: return false;
      }
    }
    case 'time_range': {
      const now = new Date();
      const [sh, sm] = condition.start.split(':').map(Number);
      const [eh, em] = condition.end.split(':').map(Number);
      
      const start = new Date(now);
      start.setHours(sh, sm, 0, 0);
      
      const end = new Date(now);
      end.setHours(eh, em, 0, 0);

      // Handle overnight ranges (e.g., 22:00 to 06:00)
      if (end < start) {
        return now >= start || now <= end;
      }
      return now >= start && now <= end;
    }
    default:
      return false;
  }
}

/**
 * @param {string} deviceId 
 * @returns {Promise<Record<string, any>>}
 */
async function getDeviceState(deviceId) {
  const res = await query('SELECT last_known_state FROM devices WHERE id = $1', [deviceId]);
  return res.rows[0]?.last_known_state || {};
}

/**
 * @param {AutomationAction[]} actions 
 */
async function executeActions(actions) {
  for (const action of actions) {
    if (action.type === 'mqtt_command') {
      try {
        publishCommand(action.device_id, action.payload);
      } catch (err) {
        console.error(`❌ Failed to execute action for device ${action.device_id}:`, err);
      }
    }
  }
}
