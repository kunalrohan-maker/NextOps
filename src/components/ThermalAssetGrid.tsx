import React, { useState } from 'react';
import { 
  Flame, 
  Gauge, 
  RotateCw, 
  Snowflake, 
  CheckCircle2, 
  AlertTriangle, 
  Zap
} from 'lucide-react';

interface ThermalAssetGridProps {
  devices: any[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  searchQuery: string;
}

export const ThermalAssetGrid: React.FC<ThermalAssetGridProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  searchQuery
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');

  const types = [
    { id: 'ALL', label: 'All 8 Plant Devices' },
    { id: 'FURNACE', label: '🔥 Coal Furnaces' },
    { id: 'BOILER', label: '💨 Steam Boilers' },
    { id: 'TURBINE', label: '⚡ Power Turbines' },
    { id: 'COOLING_TOWER', label: '❄️ Cooling Towers' },
  ];

  const units = [
    { id: 'ALL', label: 'All Units' },
    { id: 'UNIT_1', label: 'Unit 1 (625 MW)' },
    { id: 'UNIT_2', label: 'Unit 2 (625 MW)' },
  ];

  const filteredDevices = devices.filter((d) => {
    const dtype = (d.device_type || '').toUpperCase();
    const dunit = (d.refinery_region || '').toUpperCase();

    if (selectedType !== 'ALL') {
      if (selectedType === 'COOLING_TOWER' && !dtype.includes('COOLING')) return false;
      if (selectedType !== 'COOLING_TOWER' && !dtype.includes(selectedType)) return false;
    }

    if (selectedUnit !== 'ALL' && !dunit.includes(selectedUnit)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = (d.device_id || '').toLowerCase().includes(q);
      const nameMatch = (d.name || '').toLowerCase().includes(q);
      const typeMatch = dtype.toLowerCase().includes(q);
      if (!idMatch && !nameMatch && !typeMatch) return false;
    }

    return true;
  });

  const getDeviceMeta = (type: string, id: string) => {
    const t = type.toUpperCase();
    if (t.includes('FURNACE')) {
      return {
        title: id === 'FURNACE-01' ? 'Primary Coal Furnace 1' : 'Primary Coal Furnace 2',
        role: 'Burns pulverized coal at 1,150°C to heat the boiler water',
        icon: Flame,
        color: 'amber',
        metric1Name: 'Flame Heat',
        metric1Unit: '°C',
        metric2Name: 'Draft Air',
        metric2Unit: 'bar',
        metric3Name: 'Coal Burn Rate',
        metric3Unit: 'T/h',
        highlight: 'Intense Combustion'
      };
    }
    if (t.includes('BOILER')) {
      return {
        title: id === 'BOILER-01' ? 'Main Steam Boiler 1' : 'Main Steam Boiler 2',
        role: 'Converts purified water into high-pressure driving steam',
        icon: Gauge,
        color: 'sky',
        metric1Name: 'Steam Temp',
        metric1Unit: '°C',
        metric2Name: 'Steam Pressure',
        metric2Unit: 'bar',
        metric3Name: 'Steam Flow',
        metric3Unit: 'm³/h',
        highlight: 'High-Pressure Steam'
      };
    }
    if (t.includes('TURBINE')) {
      return {
        title: id === 'TURBINE-01' ? 'Power Turbine 1' : 'Power Turbine 2',
        role: 'Spins electrical generator at 3,000 RPM to produce 625 MW',
        icon: RotateCw,
        color: 'indigo',
        metric1Name: 'Casing Temp',
        metric1Unit: '°C',
        metric2Name: 'Turbine Pressure',
        metric2Unit: 'bar',
        metric3Name: 'Steam Inflow',
        metric3Unit: 'm³/h',
        highlight: 'Generating 625 MW'
      };
    }
    // Cooling tower
    return {
      title: id === 'COOLING-01' ? 'North Cooling Tower 1' : 'South Cooling Tower 2',
      role: 'Chills warm turbine exhaust back into cool water to recycle',
      icon: Snowflake,
      color: 'teal',
      metric1Name: 'Chilled Water',
      metric1Unit: '°C',
      metric2Name: 'Pump Pressure',
      metric2Unit: 'bar',
      metric3Name: 'Water Flow',
      metric3Unit: 'm³/h',
      highlight: 'Continuous Chilling'
    };
  };

  return (
    <div className="space-y-4">
      {/* Filter Chips Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedType === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {units.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUnit(u.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedUnit === u.id
                  ? 'bg-sky-50 text-sky-700 font-bold border border-sky-300'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDevices.map((device) => {
          const meta = getDeviceMeta(device.device_type, device.device_id);
          const Icon = meta.icon;
          const isSelected = selectedDeviceId === device.device_id;
          const isHealthy = device.status === 'healthy' || device.status === 'NORMAL' || (device.health_score ?? 95) > 85;

          return (
            <div
              key={device.device_id}
              onClick={() => onSelectDevice(device.device_id)}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        meta.color === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : meta.color === 'sky'
                          ? 'bg-sky-100 text-sky-700'
                          : meta.color === 'indigo'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {device.device_id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {meta.title}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isHealthy ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {isHealthy ? 'NORMAL' : 'ELEVATED'}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {meta.role}
                </p>
              </div>

              {/* 3 Core Clean Metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">{meta.metric1Name}:</span>
                  <span className="font-bold text-slate-900">
                    {Number(device.temperature).toFixed(1)} {meta.metric1Unit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">{meta.metric2Name}:</span>
                  <span className="font-bold text-slate-900">
                    {Number(device.pressure).toFixed(1)} {meta.metric2Unit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">{meta.metric3Name}:</span>
                  <span className="font-bold text-slate-900">
                    {Math.round(device.flow_rate || 0)} {meta.metric3Unit}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-sky-700 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-sky-600" />
                  {meta.highlight}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {device.refinery_region || 'UNIT 1'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
