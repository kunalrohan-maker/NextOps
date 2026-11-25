import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Flame, 
  Gauge, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

interface AssetRegistryTableProps {
  devices: any[];
}

export const AssetRegistryTable: React.FC<AssetRegistryTableProps> = ({ devices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BOILER' | 'FURNACE' | 'HEAT_EXCHANGER'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'device_id' | 'temperature' | 'pressure' | 'health_score'>('device_id');
  const [sortAsc, setSortAsc] = useState(true);

  const normalizedDevices = useMemo(() => {
    return devices.map((d: any) => ({
      device_id: d.device_id || 'UNKNOWN',
      device_type: (d.device_type || 'BOILER').toUpperCase(),
      refinery_region: d.refinery_region || 'UNIT_1_SUPERCRITICAL',
      temperature: typeof d.temperature === 'number' ? d.temperature : 540.0,
      pressure: typeof d.pressure === 'number' ? d.pressure : 180.0,
      flow_rate: typeof d.flow_rate === 'number' ? d.flow_rate : 2050.0,
      vibration: typeof d.vibration === 'number' ? d.vibration : 1.45,
      health_score: typeof (d.health_score ?? d.score) === 'number' ? (d.health_score ?? d.score) : 94,
      status: (d.status || 'healthy').toLowerCase()
    }));
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return normalizedDevices.filter(item => {
      if (typeFilter !== 'ALL' && item.device_type !== typeFilter) return false;
      if (regionFilter !== 'ALL' && item.refinery_region !== regionFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          item.device_id.toLowerCase().includes(query) ||
          item.refinery_region.toLowerCase().includes(query) ||
          item.device_type.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const valA: any = a[sortBy];
      const valB: any = b[sortBy];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [normalizedDevices, searchTerm, typeFilter, regionFilter, sortBy, sortAsc]);

  const handleExportCSV = () => {
    const headers = ['Device ID', 'Type', 'Region', 'Temperature (C)', 'Pressure (bar)', 'Flow Rate (m3/h)', 'Vibration (mm/s)', 'Health Score', 'Status'];
    const rows = filteredDevices.map(a => [
      a.device_id,
      a.device_type,
      `"${a.refinery_region}"`,
      a.temperature.toFixed(1),
      a.pressure.toFixed(1),
      a.flow_rate.toFixed(1),
      a.vibration.toFixed(2),
      a.health_score,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NextOps_Industrial_Fleet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (col: 'device_id' | 'temperature' | 'pressure' | 'health_score') => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Thermal Plant Equipment Registry
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {filteredDevices.length} of {devices.length} Units Listed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized asset catalog for all supercritical boilers, pulverized coal furnaces, and regenerative heat exchangers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Fleet CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Device ID, Region, or Type..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Region Filter Dropdown & Type Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="ALL">All Units & Regions</option>
            <option value="UNIT_1_SUPERCRITICAL">Unit 1 Supercritical</option>
            <option value="UNIT_2_SUBCRITICAL">Unit 2 Subcritical</option>
            <option value="BOILER_ISLAND_EAST">Boiler Island East</option>
            <option value="TURBINE_CONDENSER_WEST">Turbine Condenser West</option>
            <option value="HEAT_RECOVERY_STATION">Heat Recovery Station</option>
          </select>

          <div className="flex items-center gap-1">
            {(['ALL', 'BOILER', 'FURNACE', 'HEAT_EXCHANGER'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === 'HEAT_EXCHANGER' ? 'HEX' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('device_id')}>
                  <div className="flex items-center gap-1">
                    <span>Device ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Location / Region</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('temperature')}>
                  <div className="flex items-center gap-1">
                    <span>Temp (°C)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('pressure')}>
                  <div className="flex items-center gap-1">
                    <span>Pressure</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Flow Rate</th>
                <th className="py-3 px-4">Vibration</th>
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('health_score')}>
                  <div className="flex items-center gap-1">
                    <span>Health</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No equipment matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map(asset => {
                  const isWarn = asset.status === 'warning' || asset.health_score < 80;
                  const isFurnace = asset.device_type === 'FURNACE';
                  const isBoiler = asset.device_type === 'BOILER';

                  return (
                    <tr key={asset.device_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{asset.device_id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{asset.refinery_region.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isFurnace
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : isBoiler
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {isFurnace ? <Flame className="w-3 h-3" /> : isBoiler ? <Gauge className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3" />}
                          {asset.device_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {asset.temperature.toFixed(1)} °C
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {asset.pressure.toFixed(1)} bar
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {asset.flow_rate.toFixed(1)} m³/h
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {asset.vibration.toFixed(2)} mm/s
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{asset.health_score}%</span>
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                asset.health_score > 90
                                  ? 'bg-emerald-500'
                                  : asset.health_score > 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${asset.health_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWarn
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isWarn ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {asset.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
