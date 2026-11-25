import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatAppDate } from '../utils/date';

interface LiveTrendProps {
  data: any[];
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
  metric: 'temperature' | 'pressure' | 'flow_rate';
  onMetricChange: (metric: 'temperature' | 'pressure' | 'flow_rate') => void;
  timezone: string;
}

export function LiveTrend({ data, timeRange, onTimeRangeChange, metric, onMetricChange, timezone }: LiveTrendProps) {

  const formatTime = (timeStr: any) => {
    return formatAppDate(timeStr, timezone, true);
  };

  const getMetricColor = () => {
    if (metric === 'temperature') return '#ef4444'; // Red
    if (metric === 'pressure') return '#f59e0b';    // Amber
    return '#3b82f6';                               // Blue
  };

  const getMetricUnit = () => {
    if (metric === 'temperature') return '°C';
    if (metric === 'pressure') return 'bar';
    return 'm³/h';
  };

  const metricLabel = {
    temperature: 'Temperature (°C)',
    pressure: 'Pressure (bar)',
    flow_rate: 'Flow Rate (m³/h)',
  }[metric];

  return (
    <div className="glass-card p-6 rounded-md flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Live Thermal Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monitoring {metricLabel}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-slate-800/50 p-1 rounded-sm border border-slate-700/50">
            {[
              { id: 'temperature', label: 'Temp' },
              { id: 'pressure', label: 'Pressure' },
              { id: 'flow_rate', label: 'Flow' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => onMetricChange(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  metric === m.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-sm border border-slate-700/50">
            {[
              { label: '1H', value: 1 },
              { label: '24H', value: 24 },
              { label: '7D', value: 168 }
            ].map(tr => (
              <button
                key={tr.label}
                onClick={() => onTimeRangeChange(tr.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === tr.value ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Waiting for telemetry data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                stroke="#64748b"
                fontSize={10}
                tickMargin={10}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(val) => Math.round(val).toString()}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155',
                  borderRadius: '0.375rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                itemStyle={{ color: getMetricColor(), fontWeight: 600 }}
                formatter={(value: any) => [`${Number(value).toFixed(2)} ${getMetricUnit()}`, metricLabel]}
                labelFormatter={(label) => formatTime(label)}
              />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={getMetricColor()} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMetric)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
