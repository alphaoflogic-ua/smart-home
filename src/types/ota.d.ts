export type Firmware = {
  id: string;
  device_type: string;
  version: string;
  file_path: string;
  checksum: string;
  created_at: Date;
};

export type OtaLog = {
  id: string;
  device_id: string;
  from_version: string;
  to_version: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  timestamp: Date;
};
