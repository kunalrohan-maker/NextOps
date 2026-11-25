import React from 'react';
import { 
  Zap, 
  Flame, 
  Gauge, 
  RotateCw, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

interface KPIStripProps {
  devices: any[];
  onlineCount: number;
}

export const KPIStrip: React.FC<KPIStripProps> = ({ devices }) => {
  const furnaces = devices.filter(d => (d.device_type || '').toUpperCase() === 'FURNACE');
  const boilers = devices.filter(d => (d.device_type || '').toUpperCase() === 'BOILER');

  const furnaceTemp = furnaces.length 
    ? Math.round(furnaces.reduce((acc, d) => acc + (d.temperature || 0), 0) / furnaces.length)
    : 1150;

  const boilerPress = boilers.length 
    ? (boilers.reduce((acc, d) => acc + (d.pressure || 0), 0) / boilers.length).toFixed(1)
    : '175.0';

  const healthyCount = devices.filter(d => d.status === 'healthy' || d.status === 'NORMAL').length;
  const plantHealthPct = devices.length 
    ? Math.round((healthyCount / devices.length) * 100) 
    : 99;

  const kpis = [
    {
      label: 'Total Power Generated',
      value: '1,250 MW',
      subtext: 'Powering 1,200,000 Homes',
      highlight: 'Grid Locked 50.0 Hz',
      icon: Zap,
      color: 'sky',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: 'bg-sky-100 text-sky-600',
    },
    {
      label: 'Coal Furnace Flame',
      value: `${furnaceTemp} °C`,
      subtext: 'Active Coal Combustion',
      highlight: 'Normal Fireball Range',
      icon: Flame,
      color: 'amber',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Boiler Steam Pressure',
      value: `${boilerPress} bar`,
      subtext: 'High-Pressure Steam',
      highlight: 'Optimal Driving Force',
      icon: Gauge,
      color: 'blue',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Power Turbine Speed',
      value: '3,000 RPM',
      subtext: 'Dual Reaction Turbines',
      highlight: '100% Synchronous Speed',
      icon: RotateCw,
      color: 'indigo',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Overall Plant Safety',
      value: `${plantHealthPct}%`,
      subtext: 'All 8 Main Systems',
      highlight: 'Zero Active Trips',
      icon: ShieldCheck,
      color: 'emerald',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl ${kpi.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black font-display text-slate-900 tracking-tight">
                {kpi.value}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {kpi.subtext}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${kpi.badgeBg}`}>
                <CheckCircle2 className="w-3 h-3" />
                {kpi.highlight}
              </span>
              <span className="text-emerald-600 font-mono font-bold text-[10px]">LIVE</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
