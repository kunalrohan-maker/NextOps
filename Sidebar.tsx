import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Gauge, 
  RotateCw, 
  Zap, 
  Droplets, 
  Wind, 
  Layers, 
  Waves,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers as LayersIcon,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  selectedComponentId?: string;
  onSelectComponent?: (id: string) => void;
  liveDevices?: any[];
}

interface SubsystemGroup {
  name: string;
  components: {
    id: string;
    kksTag: string;
    label: string;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultMetric: string;
  }[];
}

const PLANT_SUBSYSTEMS: SubsystemGroup[] = [
  {
    name: '1. Fuel & Combustion',
    components: [
      { id: 'COAL-FEEDER-01', kksTag: '10HFC01', label: 'Coal Feeder & Silo', subtext: 'Stockpile & Pulverizer', icon: Layers, defaultMetric: '245 T/h' },
      { id: 'FURNACE-01', kksTag: '10HAH01', label: 'Combustion Furnace', subtext: '1,180°C Fireball Core', icon: Flame, defaultMetric: '1,180 °C' },
      { id: 'CHIMNEY-01', kksTag: '10HNA01', label: 'Flue Stack & Scrubber', subtext: 'Low-NOx CEMS Clean', icon: Wind, defaultMetric: '138 mg/Nm³' }
    ]
  },
  {
    name: '2. Steam Generation',
    components: [
      { id: 'BOILER-01', kksTag: '10HAC01', label: 'Superheated Boiler', subtext: 'Once-Through Coils', icon: Gauge, defaultMetric: '175.4 bar' },
      { id: 'STEAM-LINE-01', kksTag: '10LBA01', label: 'Main Steam Header', subtext: '542°C High-Pressure', icon: Gauge, defaultMetric: '542.0 °C' }
    ]
  },
  {
    name: '3. Turbogenerator',
    components: [
      { id: 'TURBINE-01', kksTag: '10MAA01', label: 'Steam Turbine (HP/LP)', subtext: '3,000 RPM 50Hz Sync', icon: RotateCw, defaultMetric: '3,000 RPM' },
      { id: 'GENERATOR-01', kksTag: '10MKA01', label: 'Electric Generator', subtext: '660 MW Active Power', icon: Zap, defaultMetric: '660.0 MW' }
    ]
  },
  {
    name: '4. Substation & Grid',
    components: [
      { id: 'TRANSFORMER-01', kksTag: '10BAT01', label: 'Step-Up Transformer', subtext: '400 kV Transmission', icon: Zap, defaultMetric: '400.0 kV' },
      { id: 'TRANSMISSION-01', kksTag: '400KV-G1', label: '400 kV Grid Lines', subtext: 'National Grid Bus', icon: Zap, defaultMetric: '50.00 Hz' }
    ]
  },
  {
    name: '5. Cooling & Water Loop',
    components: [
      { id: 'CONDENSER-01', kksTag: '10MAG01', label: 'Surface Condenser', subtext: '-94.2 kPa Deep Vacuum', icon: Droplets, defaultMetric: '-94.2 kPa' },
      { id: 'FEEDWATER-01', kksTag: '10LAC01', label: 'Feedwater Return', subtext: '182 bar High-Pressure', icon: Droplets, defaultMetric: '1,820 T/h' },
      { id: 'COOLING-WATER-01', kksTag: '10PAC01', label: 'River Water Intake', subtext: '54,000 m³/h Pumping', icon: Waves, defaultMetric: '54,000 m³/h' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedComponentId = '',
  onSelectComponent,
  liveDevices = []
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Auto-expand group when a component is selected anywhere on the schematic
  useEffect(() => {
    if (!selectedComponentId) return;
    const parentGroup = PLANT_SUBSYSTEMS.find(g =>
      g.components.some(c => c.id === selectedComponentId)
    );
    if (parentGroup && collapsedGroups[parentGroup.name]) {
      setCollapsedGroups(prev => ({ ...prev, [parentGroup.name]: false }));
    }
  }, [selectedComponentId, collapsedGroups]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleAll = () => {
    const allCollapsed = PLANT_SUBSYSTEMS.every(g => !!collapsedGroups[g.name]);
    const newState: Record<string, boolean> = {};
    PLANT_SUBSYSTEMS.forEach(g => {
      newState[g.name] = !allCollapsed;
    });
    setCollapsedGroups(newState);
  };

  const getLiveMetric = (id: string, fallback: string) => {
    const match = liveDevices.find(d => d.device_id === id);
    if (!match) return fallback;
    if (id === 'FURNACE-01' || id === 'BOILER-01' || id === 'STEAM-LINE-01') {
      return match.temperature ? `${Number(match.temperature).toFixed(1)}°C` : fallback;
    }
    if (id === 'TURBINE-01') {
      return match.flow_rate ? `${Math.round(match.flow_rate)} RPM` : fallback;
    }
    if (id === 'GENERATOR-01') {
      return match.flow_rate ? `${Number(match.flow_rate).toFixed(1)} MW` : fallback;
    }
    return fallback;
  };

  // Filter components by search query
  const query = searchQuery.trim().toLowerCase();
  const filteredSubsystems = PLANT_SUBSYSTEMS.map(group => {
    const matchingComponents = group.components.filter(c => {
      if (!query) return true;
      return (
        c.label.toLowerCase().includes(query) ||
        c.subtext.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.kksTag.toLowerCase().includes(query) ||
        group.name.toLowerCase().includes(query)
      );
    });
    return {
      ...group,
      components: matchingComponents
    };
  }).filter(group => group.components.length > 0);

  const totalVisibleNodes = filteredSubsystems.reduce((acc, g) => acc + g.components.length, 0);

  // ==========================================
  // COLLAPSED COMPACT ICON RAIL VIEW (w-14)
  // ==========================================
  if (isSidebarCollapsed) {
    return (
      <aside className="w-14 bg-white border-r border-slate-200 flex flex-col justify-between items-center shrink-0 shadow-2xs h-full z-10 select-none py-2 transition-all duration-200">
        {/* Expand Trigger Button */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-2xs transition-all cursor-pointer group"
            title="Expand Plant Systems Explorer (Show all 12 nodes)"
          >
            <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="w-6 h-px bg-slate-200 my-0.5" />

          {/* Subsystems Icon Stack */}
          <div className="flex flex-col gap-2 w-full items-center">
            {PLANT_SUBSYSTEMS.map((group) => {
              const FirstIcon = group.components[0].icon;
              const hasSelected = group.components.some(c => c.id === selectedComponentId);
              return (
                <button
                  key={group.name}
                  onClick={() => {
                    setIsSidebarCollapsed(false);
                    setCollapsedGroups(prev => ({ ...prev, [group.name]: false }));
                    if (onSelectComponent) {
                      onSelectComponent(group.components[0].id);
                    }
                  }}
                  className={`p-2.5 rounded-xl relative transition-all cursor-pointer group ${
                    hasSelected
                      ? 'bg-sky-500 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  title={`${group.name} - Click to expand`}
                >
                  <FirstIcon className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white animate-pulse" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Synchronized Icon */}
        <div className="p-2 text-emerald-600" title="SCADA Synced 99.8%">
          <Activity className="w-4 h-4 animate-pulse" />
        </div>
      </aside>
    );
  }

  // ==========================================
  // EXPANDED PLANT SYSTEMS EXPLORER (w-72 lg:w-80)
  // ==========================================
  return (
    <aside className="w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-2xs h-full z-10 select-none overflow-hidden transition-all duration-200">
      
      {/* Header & Quick Search Bar */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LayersIcon className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px] font-black text-slate-900 tracking-tight uppercase font-mono">
              Plant Systems Explorer
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedComponentId && (
              <button
                onClick={() => onSelectComponent && onSelectComponent('')}
                className="text-[9px] font-mono text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Deselect device (return to plant overview)"
              >
                <X className="w-2.5 h-2.5" />
                <span>Overview</span>
              </button>
            )}
            <button
              onClick={toggleAll}
              className="text-[9px] font-mono text-slate-500 hover:text-sky-700 bg-white hover:bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
              title="Expand or Collapse All"
            >
              Toggle
            </button>
            <span className="text-[9.5px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-200">
              {totalVisibleNodes} Nodes
            </span>
            {/* Collapse Sidebar Button */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-0.5"
              title="Collapse sidebar to icon rail"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time SCADA Tag / Node Search Input */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags, KKS, subsystems..."
            className="w-full pl-6.5 pr-6 py-1 bg-white border border-slate-200/90 rounded-md text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Subsystems List with Status LEDs & KKS Tags */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1.5">
        {filteredSubsystems.map((group) => {
          const isCollapsed = !query && !!collapsedGroups[group.name];
          return (
            <div key={group.name} className="space-y-0.5">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500/80" />
                  {group.name}
                </span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.components.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedComponentId === item.id;
                    const liveVal = getLiveMetric(item.id, item.defaultMetric);

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (selectedComponentId === item.id) {
                            onSelectComponent && onSelectComponent('');
                          } else {
                            onSelectComponent && onSelectComponent(item.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-2xs font-semibold'
                            : 'hover:bg-slate-100/90 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`p-1 rounded-md shrink-0 relative ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700'
                          }`}>
                            <Icon className="w-3 h-3" />
                            {/* Live Status LED Dot */}
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white animate-pulse" />
                          </span>
                          <div className="min-w-0 leading-tight">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-bold block truncate ${
                                isSelected ? 'text-white' : 'text-slate-900 group-hover:text-sky-700'
                              }`}>
                                {item.label}
                              </span>
                              <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded ${
                                isSelected
                                  ? 'bg-white/20 text-sky-100'
                                  : 'bg-slate-100 text-slate-500 group-hover:text-sky-700'
                              }`}>
                                {item.kksTag}
                              </span>
                            </div>
                            <span className={`text-[9.5px] block truncate font-mono ${
                              isSelected ? 'text-sky-100' : 'text-slate-400'
                            }`}>
                              {item.subtext}
                            </span>
                          </div>
                        </div>

                        {/* Live Telemetry Metric Badge */}
                        <div className="shrink-0 pl-1 text-right">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded block whitespace-nowrap ${
                            isSelected
                              ? 'bg-white/25 text-white border border-white/30'
                              : 'bg-slate-50 text-slate-800 border border-slate-200 group-hover:border-sky-300'
                          }`}>
                            {liveVal}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <a 
          href="https://devopsinsiders.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-pointer group"
          title="Visit DevOps Insiders (devopsinsiders.com)"
        >
          <span className="text-slate-400 font-sans flex items-center gap-1">
            Made with <span className="text-red-500 text-[11px] leading-none animate-pulse">❤️</span> at
          </span>
          <span className="font-bold text-slate-800 group-hover:text-sky-600 underline-offset-2 hover:underline transition-colors">
            DevOps Insiders
          </span>
        </a>
        <span className="flex items-center gap-1 text-emerald-600 font-bold">
          <Activity className="w-3 h-3 animate-pulse" />
          Synchronized
        </span>
      </div>

    </aside>
  );
};
