export * from './user.js';
export * from './device.js';
export * from './automation.js';
export * from './ota.js';

export interface AuthPayload {
  userId: string;
  role: string;
}
