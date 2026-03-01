export type Automation = {
  id: string;
  home_id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type AutomationTrigger = 
  | { type: 'device_state'; device_id: string; key: string }
  | { type: 'device_event'; device_id: string; event: string };

export type AutomationCondition =
  | { type: 'state_equals'; device_id: string; key: string; value: any }
  | { type: 'numeric_compare'; device_id: string; key: string; operator: '>' | '<' | '>=' | '<=' | '=='; value: number }
  | { type: 'time_range'; start: string; end: string };

export type AutomationAction =
  | { type: 'mqtt_command'; device_id: string; payload: any };
