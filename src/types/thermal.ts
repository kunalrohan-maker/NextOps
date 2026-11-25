export interface ThermalDevice {
  device_id: string;
  device_type: 'BOILER' | 'FURNACE' | 'HEAT_EXCHANGER' | string;
  refinery_region: string;
  temperature: number;
  pressure: number;
  flow_rate: number;
  vibration?: number;
  health_score?: number;
  score?: number;
  status: 'healthy' | 'warning' | 'critical' | 'OPTIMAL' | 'ELEVATED' | string;
  operating_hours?: number;
  last_inspection?: string;
  last_reading_time?: string;
}

export type NavTab = 
  | 'overview' 
  | 'boilers' 
  | 'furnaces' 
  | 'exchangers' 
  | 'trends' 
  | 'alarms' 
  | 'topology' 
  | 'registry';
