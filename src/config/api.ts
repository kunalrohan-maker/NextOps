/**
 * NextOps Industrial - Central API Configuration
 * Production API Gateway for SCADA Telemetry & Plant Analytics
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nextops.live';
export const COPILOT_API_BASE_URL = import.meta.env.VITE_COPILOT_API_BASE_URL || 'https://ai.nextops.live';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  DEVICES: `${API_BASE_URL}/devices`,
  DEVICE_LATEST: (id: string) => `${API_BASE_URL}/devices/${id}/latest`,
  DEVICE_TRENDS: (id: string, hours: number = 1) => `${API_BASE_URL}/devices/${id}/trends?hours=${hours}`,
  TOP_ANOMALOUS: `${API_BASE_URL}/devices/top-anomalous`,
  SUMMARY: `${API_BASE_URL}/dashboard/summary`,
  THROUGHPUT: `${API_BASE_URL}/dashboard/throughput`,
  REGIONS: `${API_BASE_URL}/dashboard/regions`,
  ALARMS: `${API_BASE_URL}/alarms`,
  COPILOT_CHAT: `${COPILOT_API_BASE_URL}/chat`,
  COPILOT_CHAT_STREAM: `${COPILOT_API_BASE_URL}/chat/stream`,
  COPILOT_HEALTH: `${COPILOT_API_BASE_URL}/health`,
} as const;
