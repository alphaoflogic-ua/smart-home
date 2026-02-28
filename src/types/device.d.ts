export type DeviceStatus = 'online' | 'offline';

export interface Device {
  id: string;
  home_id: string;
  room_id: string;
  name: string;
  type: string;
  last_known_state: Record<string, any>;
  status: DeviceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DeviceStateUpdate {
  device_id: string;
  state: Record<string, any>;
  timestamp: Date;
}
