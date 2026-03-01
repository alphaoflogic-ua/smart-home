export * from './user.js';
export * from './device.js';
export * from './automation.js';
export * from './ota.js';

export type AuthPayload = {
  userId: string;
  role: string;
};
