import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Clock, 
  VolumeX
} from 'lucide-react';

export interface AlarmItem {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  assetId: string;
  assetType: 'BOILER' | 'FURNACE' | 'HEAT_EXCHANGER';
  unit: string;
  metric: string;
  currentValue: string;
  threshold: string;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED';
}

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'ALM-1049',
    timestamp: 'Just now',
    severity: 'CRITICAL',
    assetId: 'BOILER_03',
    assetType: 'BOILER',
    unit: 'UNIT_1_SUPERCRITICAL',
    metric: 'Main Steam Temp',
    currentValue: '582.4 °C',
    threshold: '> 575.0 °C',
    message: 'Superheater outlet metal temperature approaching metallurgical creep limit.',
    status: 'ACTIVE'
  },
  {
    id: 'ALM-1048',
    timestamp: '3m ago',
    severity: 'CRITICAL',
    assetId: 'FURNACE_02',
    assetType: 'FURNACE',
    unit: 'UNIT_1_SUPERCRITICAL',
    metric: 'Furnace Draft',
    currentValue: '+18 Pa',
    threshold: '> +10 Pa (Normal: -50 Pa)',
    message: 'Positive furnace pressure detected. Induced Draft (ID) fan stall risk.',
    status: 'ACTIVE'
  },
  {
    id: 'ALM-1045',
    timestamp: '14m ago',
    severity: 'WARNING',
    assetId: 'HEX_CONDENSER_01',
    assetType: 'HEAT_EXCHANGER',
    unit: 'TURBINE_CONDENSER_WEST',
    metric: 'Condenser Vacuum',
    currentValue: '-86.2 kPa',
    threshold: '< -92.0 kPa',
    message: 'Condenser backpressure rising. Cooling water tube fouling suspected.',
    status: 'ACTIVE'
  },
  {
    id: 'ALM-1039',
    timestamp: '28m ago',
    severity: 'WARNING',
    assetId: 'BOILER_07',
    assetType: 'BOILER',
    unit: 'UNIT_2_SUBCRITICAL',
    metric: 'Attemperator Spray Flow',
    currentValue: '185 m³/h',
    threshold: '> 160 m³/h',
    message: 'Excessive desuperheating spray water demand across secondary superheater.',
    status: 'ACKNOWLEDGED'
  },
  {
    id: 'ALM-1032',
    timestamp: '1h 12m ago',
    severity: 'ADVISORY',
    assetId: 'FURNACE_05',
    assetType: 'FURNACE',
    unit: 'HEAT_RECOVERY_STATION',
    metric: 'Flue Gas O₂',
    currentValue: '4.8 %',
    threshold: '2.5% - 3.8%',
    message: 'Excess air in combustion chamber. Thermal efficiency degraded by 0.6%.',
    status: 'ACKNOWLEDGED'
  },
  {
    id: 'ALM-1028',
    timestamp: '2h 05m ago',
    severity: 'ADVISORY',
    assetId: 'HEX_FEEDWATER_03',
    assetType: 'HEAT_EXCHANGER',
    unit: 'BOILER_ISLAND_EAST',
    metric: 'Feedwater Inlet Temp',
    currentValue: '268 °C',
    threshold: '> 280 °C design',
    message: 'High Pressure Heater 3 extraction steam check valve throttle notice.',
    status: 'ACKNOWLEDGED'
  }
];

export const AlarmsPanel: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ADVISORY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ALL');
  const [buzzerSilenced, setBuzzerSilenced] = useState(false);

  const handleAcknowledge = (id: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    setAlarms(prev => prev.map(a => ({ ...a, status: 'ACKNOWLEDGED' })));
  };

  const filteredAlarms = alarms.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const activeCount = alarms.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl ${activeCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Thermal Safety Limits & Trip Interlocks
              {criticalCount > 0 && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                  {criticalCount} Critical Trips
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous SIL-3 interlock telemetry monitoring for steam headers, combustion furnace draft, and boiler metallurgy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBuzzerSilenced(!buzzerSilenced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              buzzerSilenced
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{buzzerSilenced ? 'Buzzer Muted' : 'Mute Annunciator'}</span>
          </button>

          <button
            onClick={handleAcknowledgeAll}
            disabled={activeCount === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeCount > 0
                ? 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700 shadow-xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acknowledge All</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Unacknowledged</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${activeCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {activeCount}
            </span>
            <span className="text-xs text-slate-400">Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Critical Priority</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">{criticalCount}</span>
            <span className="text-xs text-slate-400">High Risk</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trip Interlock Status</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">ARMED</span>
            <span className="text-xs text-slate-400">SIL-3 Ready</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Resolution Time</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-800">4.2 min</span>
            <span className="text-xs text-emerald-600 font-semibold">-18% vs avg</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Strip */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Severity:</span>
            {(['ALL', 'CRITICAL', 'WARNING', 'ADVISORY'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            {(['ALL', 'ACTIVE', 'ACKNOWLEDGED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Alarms List */}
        <div className="divide-y divide-slate-100">
          {filteredAlarms.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No matching alarms found</p>
              <p className="text-xs text-slate-400 mt-0.5">All monitored parameters are within safe operational parameters.</p>
            </div>
          ) : (
            filteredAlarms.map(item => {
              const isCrit = item.severity === 'CRITICAL';
              const isWarn = item.severity === 'WARNING';
              const isActive = item.status === 'ACTIVE';

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isActive ? (isCrit ? 'bg-rose-50/30' : isWarn ? 'bg-amber-50/20' : 'bg-white') : 'bg-white opacity-70'
                  } hover:bg-slate-50`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                        isCrit
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isWarn
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isCrit ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isWarn ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCrit
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isWarn
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.assetId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">({item.unit})</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800">{item.message}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>
                          Metric: <strong className="text-slate-700">{item.metric}</strong>
                        </span>
                        <span>
                          Reading: <strong className={isCrit ? 'text-rose-600' : 'text-slate-800'}>{item.currentValue}</strong>
                        </span>
                        <span>
                          Limit: <strong className="text-slate-700">{item.threshold}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center">
                    {isActive ? (
                      <button
                        onClick={() => handleAcknowledge(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-xs cursor-pointer transition-all"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
