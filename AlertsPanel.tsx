import { AlertTriangle, Flame, Gauge, Activity, Thermometer } from 'lucide-react';

interface AlertsPanelProps {
  devices: any[];
  onSelectDevice: (deviceId: string) => void;
}

export function AlertsPanel({ devices, onSelectDevice }: AlertsPanelProps) {
  if (!devices || devices.length === 0) {
    return (
      <div className="glass-card p-6 rounded-md animate-fade-up h-full flex flex-col">
        <h3 className="text-xl font-bold text-white tracking-tight mb-4">Thermal Alerts</h3>
        <div className="flex-1 flex items-center justify-center text-slate-500">
          All boiler, furnace, and heat exchanger units optimal
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-md animate-fade-up h-full min-h-[600px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-amber-500 w-5 h-5" />
        <h3 className="text-xl font-bold text-white tracking-tight">Active Thermal Alerts</h3>
      </div>
      
      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
        {devices.map((device, idx) => {
          let reason = '';
          let Icon = AlertTriangle;
          let colorClass = device.status === 'critical' ? 'text-red-500' : 'text-amber-500';
          
          const dtype = (device.device_type || '').toLowerCase();
          const temp = device.temperature || 0;
          const press = device.pressure || 0;
          const flow = device.flow_rate || 0;

          if (device.status === 'critical') {
            if (dtype.includes('boiler') && press > 180) {
              reason = `Overpressure: ${press.toFixed(1)} bar`;
              Icon = Gauge;
            } else if (dtype.includes('boiler') && flow < 350) {
              reason = `Low Feedwater: ${flow.toFixed(1)} m³/h`;
              Icon = Activity;
            } else if (temp > 600 || (dtype.includes('furnace') && temp > 1050)) {
              reason = `Thermal Runaway: ${temp.toFixed(1)}°C`;
              Icon = Thermometer;
            } else {
              reason = `Critical Alert: ${temp.toFixed(1)}°C`;
              Icon = AlertTriangle;
            }
          } else {
            if (press > 165 || (dtype.includes('heat_exchanger') && press > 38)) {
              reason = `High Pressure: ${press.toFixed(1)} bar`;
              Icon = Gauge;
            } else if (dtype.includes('heat_exchanger') && flow < 260) {
              reason = `Tube Fouling: ${flow.toFixed(1)} m³/h`;
              Icon = Activity;
            } else {
              reason = `Elevated Temp: ${temp.toFixed(1)}°C`;
              Icon = Thermometer;
            }
          }

          return (
            <button
              key={device.device_id}
              onClick={() => onSelectDevice(device.device_id)}
              className="w-full text-left bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-500/50 p-3 rounded-sm transition-all flex items-start gap-3 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700 mt-0.5 shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {dtype.includes('boiler') && <Flame className="w-3.5 h-3.5 text-orange-400 opacity-90 shrink-0" />}
                  {dtype.includes('furnace') && <Flame className="w-3.5 h-3.5 text-red-500 opacity-90 shrink-0" />}
                  {dtype.includes('heat_exchanger') && <Activity className="w-3.5 h-3.5 text-cyan-400 opacity-90 shrink-0" />}
                  <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{device.device_id}</h4>
                </div>
                <p className="text-xs text-slate-400 truncate mb-2">{device.refinery_region?.replace('_', ' ')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 ${colorClass} opacity-80 shrink-0`} />
                    <span className={`text-[11px] font-bold ${colorClass} truncate`}>{reason}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">Health: {device.health_score}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
