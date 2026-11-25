import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  Gauge, 
  Info, 
  ShieldCheck, 
  X, 
  Sliders, 
  ChevronRight,
  Filter,
  Download,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { API_ENDPOINTS } from '../config/api';

export interface ComponentMetric {
  label: string;
  value: string;
  unit?: string;
  nominal?: string;
  note?: string;
}

export type PlantCycle = 'ALL' | 'STEAM_LOOP' | 'TURBO_TRAIN' | 'COOLING_LOOP' | 'GRID_YARD';

export interface ComponentData {
  id: string;
  name: string;
  category: string;
  status: 'OPTIMAL' | 'NORMAL' | 'ELEVATED';
  mainValue: string;
  mainLabel: string;
  cycle: PlantCycle[];
  metrics: ComponentMetric[];
  description: string;
  howItWorks: string;
  safetyLimits: string;
  anchor: { x: number; y: number };
}

const COMPONENTS_MAP: Record<string, ComponentData> = {
  'COAL-FEEDER-01': {
    id: 'COAL-FEEDER-01',
    name: 'Coal Handling & Feeder Silo',
    category: 'Fuel Ingestion System',
    status: 'OPTIMAL',
    mainValue: '245.0 T/h',
    mainLabel: 'Continuous Feed Throughput',
    cycle: ['ALL'],
    anchor: { x: 18, y: 35 },
    metrics: [
      { label: 'Feed Rate', value: '245.0', unit: 'T/h', nominal: '220 - 260 T/h', note: 'Nominal base load' },
      { label: 'Bunker Storage', value: '86.5', unit: '%', nominal: '> 40%', note: '28h reserve stock' },
      { label: 'Conveyor Speed', value: '2.4', unit: 'm/s', nominal: '2.0 - 2.8 m/s', note: 'Variable drive synced' },
      { label: 'Coal Moisture', value: '8.2', unit: '%', nominal: '< 12%', note: 'High calorific quality' },
      { label: 'Pulverizer Fineness', value: '78.5', unit: '%', nominal: '> 75% thru 200 mesh', note: 'Optimal ignition grade' },
      { label: 'Motor Bearing Temp', value: '54.2', unit: '°C', nominal: '< 75°C', note: 'Continuous lubrication' }
    ],
    description: 'Bituminous coal from stockpiles is metered onto automated conveyor belts, crushed to micro-powder in pulverizers, and blown into furnace burners.',
    howItWorks: 'Crushed coal is blown into burners using heated primary air, forming an aerosol that ignites instantaneously.',
    safetyLimits: 'Bunker level alarm below 30%; conveyor belt slip trip at > 10% speed differential.'
  },
  'CHIMNEY-01': {
    id: 'CHIMNEY-01',
    name: 'Flue Stack & Wet Scrubber',
    category: 'Environmental Scrubbing & Exhaust',
    status: 'OPTIMAL',
    mainValue: '138 mg/Nm³',
    mainLabel: 'Low-NOx Flue Stack Emissions',
    cycle: ['ALL', 'COOLING_LOOP'],
    anchor: { x: 33, y: 18 },
    metrics: [
      { label: 'Stack Exhaust Temp', value: '125.0', unit: '°C', nominal: '115 - 135 °C', note: 'After economizer' },
      { label: 'NOx Concentration', value: '138.0', unit: 'mg/Nm³', nominal: '< 200 mg/Nm³', note: 'SCR catalyst active' },
      { label: 'SO₂ Desulfurization', value: '172.0', unit: 'mg/Nm³', nominal: '< 250 mg/Nm³', note: '98% wet scrubber eff.' },
      { label: 'Particulate Opacity', value: '4.2', unit: '%', nominal: '< 15%', note: 'Electrostatic filter' },
      { label: 'Flue Flow Velocity', value: '18.4', unit: 'm/s', nominal: '15 - 22 m/s', note: 'Natural chimney draft' },
      { label: 'CO₂ Content', value: '13.1', unit: '%', nominal: '12 - 14%', note: 'Continuous CEMS telemetry' }
    ],
    description: 'Hot flue combustion gases pass through electrostatic dust precipitators and limestone scrubbers before clean, filtered vapor exits the chimney.',
    howItWorks: 'Induced draft fans pull combustion exhaust through cleaning towers, capturing 99.8% of ash before atmospheric release.',
    safetyLimits: 'Continuous opacity warning at > 20%; flue temperature high alarm at > 160°C.'
  },
  'FURNACE-01': {
    id: 'FURNACE-01',
    name: 'Boiler Combustion Furnace',
    category: 'Thermal Combustion Island',
    status: 'OPTIMAL',
    mainValue: '1,180.4 °C',
    mainLabel: 'Fireball Core Temperature',
    cycle: ['ALL', 'STEAM_LOOP'],
    anchor: { x: 45, y: 55 },
    metrics: [
      { label: 'Flame Temperature', value: '1,180.4', unit: '°C', nominal: '1,100 - 1,250 °C', note: 'Vortical fireball' },
      { label: 'Furnace Draft Pressure', value: '-45.2', unit: 'Pa', nominal: '-30 to -60 Pa', note: 'Induced draft balance' },
      { label: 'Combustion Air Flow', value: '3,840', unit: 'm³/h', nominal: '3,500 - 4,200 m³/h', note: 'Forced draft fan' },
      { label: 'Excess Flue O₂', value: '3.4', unit: '%', nominal: '2.5 - 4.0%', note: 'Complete burn efficiency' },
      { label: 'CO Emissions', value: '18.2', unit: 'ppm', nominal: '< 50 ppm', note: 'Ultra-low unburned carbon' },
      { label: 'Wall Heat Flux', value: '285.0', unit: 'kW/m²', nominal: '< 320 kW/m²', note: 'Safe refractory load' }
    ],
    description: 'Tangential coal burners fire directly into the furnace chamber, creating a swirling 1,180°C fireball that radiates thermal energy into surrounding water wall tubes.',
    howItWorks: 'Radiant heat transfers through alloy tubes, heating high-pressure demineralized water until vaporization starts.',
    safetyLimits: 'Positive furnace pressure trip at +100 Pa; flame failure optical sensor MFT trip.'
  },
  'BOILER-01': {
    id: 'BOILER-01',
    name: 'Superheated Steam Boiler',
    category: 'Vapor Generation Core',
    status: 'OPTIMAL',
    mainValue: '175.4 bar',
    mainLabel: 'Main Steam Header Pressure',
    cycle: ['ALL', 'STEAM_LOOP'],
    anchor: { x: 45, y: 25 },
    metrics: [
      { label: 'Steam Temperature', value: '542.0', unit: '°C', nominal: '535 - 565 °C', note: 'Superheated state' },
      { label: 'Steam Pressure', value: '175.4', unit: 'bar', nominal: '170 - 185 bar', note: 'Driving enthalpy' },
      { label: 'Steam Generation', value: '1,850', unit: 'T/h', nominal: '1,750 - 2,000 T/h', note: 'Full power rating' },
      { label: 'Drum Water Level', value: '+12.0', unit: 'mm', nominal: '± 50 mm', note: 'Phase separator balance' },
      { label: 'Feedwater Temp', value: '284.0', unit: '°C', nominal: '275 - 290 °C', note: 'Economizer exit' },
      { label: 'Attemperator Spray', value: '14.2', unit: 'T/h', nominal: '< 30 T/h', note: 'Active temp trimming' }
    ],
    description: 'Serpentine steel boiler tubes wrap inside the furnace walls, heating purified water until it flashes into superheated steam at 542°C under 175.4 bar pressure.',
    howItWorks: 'Water is forced through multiple passes of riser and superheater tubes, leaving no liquid water in the main steam header.',
    safetyLimits: 'Drum level low trip at -150 mm; overpressure safety relief valve lifts at 195 bar.'
  },
  'STEAM-LINE-01': {
    id: 'STEAM-LINE-01',
    name: 'Main Steam Header Pipeline',
    category: 'High-Pressure Steam Conduit',
    status: 'OPTIMAL',
    mainValue: '542.0 °C',
    mainLabel: 'Steam Flow Temperature',
    cycle: ['ALL', 'STEAM_LOOP', 'TURBO_TRAIN'],
    anchor: { x: 55, y: 18 },
    metrics: [
      { label: 'Steam Temperature', value: '542.0', unit: '°C', nominal: '535 - 550 °C', note: 'Supercritical alloy line' },
      { label: 'Header Steam Pressure', value: '175.4', unit: 'bar', nominal: '170 - 180 bar', note: 'Driving enthalpy flow' },
      { label: 'Mass Steam Flow', value: '1,850', unit: 'T/h', nominal: '1,750 - 2,000 T/h', note: 'Turbine throttle mass' },
      { label: 'Flow Velocity', value: '42.5', unit: 'm/s', nominal: '35 - 50 m/s', note: 'Sonic design range' },
      { label: 'Pipeline Pressure Drop', value: '1.8', unit: 'bar', nominal: '< 3.0 bar', note: 'Low friction loss' },
      { label: 'Insulation Surface Temp', value: '38.2', unit: '°C', nominal: '< 50 °C', note: 'Ceramic insulation OK' }
    ],
    description: 'High-alloy chromium-molybdenum pipeline conveys high-pressure superheated steam (542°C, 175.4 bar) from the boiler superheater directly into the turbine inlet nozzle chest.',
    howItWorks: 'High enthalpy steam expands at high velocity, driving the turbine aerodynamic blades.',
    safetyLimits: 'Emergency stop valve (ESV) rapid closure on turbine trip or excessive line vibration.'
  },
  'TURBINE-01': {
    id: 'TURBINE-01',
    name: 'Multi-Stage Steam Turbine',
    category: 'Kinetic Expansion Core',
    status: 'OPTIMAL',
    mainValue: '3,000 RPM',
    mainLabel: 'Rotor Synchronous Rotation Speed',
    cycle: ['ALL', 'STEAM_LOOP', 'TURBO_TRAIN'],
    anchor: { x: 58, y: 38 },
    metrics: [
      { label: 'Rotor Shaft Speed', value: '3,000', unit: 'RPM', nominal: '3,000 RPM', note: '50 Hz locked synchronous' },
      { label: 'Casing Vibration', value: '1.25', unit: 'mm/s', nominal: '< 2.8 mm/s', note: 'ISO Grade A smooth' },
      { label: 'HP Inlet Pressure', value: '170.0', unit: 'bar', nominal: '165 - 175 bar', note: 'Full throttle flow' },
      { label: 'LP Exhaust Temp', value: '42.5', unit: '°C', nominal: '38 - 48 °C', note: 'Deep vacuum expansion' },
      { label: 'Main Bearing Oil Temp', value: '68.2', unit: '°C', nominal: '< 80°C', note: 'Pressurized lube loop' },
      { label: 'Axial Rotor Displacement', value: '+0.12', unit: 'mm', nominal: '± 0.5 mm', note: 'Thrust bearing center' }
    ],
    description: 'Superheated steam expands through successive high-pressure and low-pressure stationary nozzles and rotating aerofoil blades, transforming thermodynamic heat into 3,000 RPM mechanical rotation.',
    howItWorks: 'High-speed steam jets strike angled rotor blades, spinning the central shaft that drives the power generator.',
    safetyLimits: 'Mechanical overspeed trip at 3,300 RPM (110%); excessive bearing vibration trip at > 7.1 mm/s.'
  },
  'GENERATOR-01': {
    id: 'GENERATOR-01',
    name: 'Electric Power Generator',
    category: 'Electromagnetic Generation',
    status: 'OPTIMAL',
    mainValue: '660.0 MW',
    mainLabel: 'Active Grid Power Generation',
    cycle: ['ALL', 'TURBO_TRAIN', 'GRID_YARD'],
    anchor: { x: 68, y: 38 },
    metrics: [
      { label: 'Active Power Output', value: '660.0', unit: 'MW', nominal: '660.0 MW', note: '100% Full rated load' },
      { label: 'Grid Frequency', value: '50.00', unit: 'Hz', nominal: '49.95 - 50.05 Hz', note: 'Grid synchronized' },
      { label: 'Stator Terminal Voltage', value: '24.0', unit: 'kV', nominal: '23.5 - 24.5 kV', note: 'Heavy copper busbars' },
      { label: 'Stator Current', value: '18,520', unit: 'A', nominal: '< 20,000 A', note: 'Balanced 3-phase load' },
      { label: 'Power Factor (cos φ)', value: '0.95', unit: 'lag', nominal: '0.85 - 0.98 lag', note: 'High power quality' },
      { label: 'Hydrogen Coolant Pressure', value: '4.2', unit: 'bar', nominal: '4.0 - 4.5 bar', note: 'Stator core cooling' }
    ],
    description: 'Coupled directly to the spinning turbine shaft, a massive two-pole electromagnetic rotor spins inside a copper stator to generate 660 MW of electricity at 24,000 volts.',
    howItWorks: 'Electromagnetic induction creates a rotating magnetic field that produces balanced three-phase alternating current.',
    safetyLimits: 'Generator reverse power trip; stator ground fault protection; hydrogen gas purity low warning.'
  },
  'TRANSFORMER-01': {
    id: 'TRANSFORMER-01',
    name: 'Step-Up Grid Transformer',
    category: 'Substation Voltage Step-Up',
    status: 'OPTIMAL',
    mainValue: '400.0 kV',
    mainLabel: 'Transmission Grid Stepped Voltage',
    cycle: ['ALL', 'GRID_YARD'],
    anchor: { x: 77, y: 46 },
    metrics: [
      { label: 'Grid Line Voltage', value: '400.0', unit: 'kV', nominal: '395 - 405 kV', note: 'Stepped up from 24 kV' },
      { label: 'Transformer Load', value: '720.0', unit: 'MVA', nominal: '< 800 MVA', note: 'Full unit throughput' },
      { label: 'Transformer Top Oil Temp', value: '64.5', unit: '°C', nominal: '< 85°C', note: 'Forced oil/air cooling' },
      { label: 'Winding Hotspot Temp', value: '78.2', unit: '°C', nominal: '< 105°C', note: 'Thermal margin safe' },
      { label: 'Dielectric Oil Breakdown', value: '72.0', unit: 'kV/2.5mm', nominal: '> 60 kV', note: 'Pure mineral oil' },
      { label: 'Grid Export Feeder', value: 'ONLINE', unit: 'state', nominal: 'ONLINE', note: 'Delivering to National Grid' }
    ],
    description: 'Large substation step-up transformer converts the 24 kV generated voltage up to 400 kV (400,000 Volts) to transmit electricity over long distances with minimal heat dissipation.',
    howItWorks: 'Magnetic core with high secondary turns ratio steps up voltage while stepping down current, minimizing I²R line loss.',
    safetyLimits: 'Buchholz relay gas trip; differential overcurrent protection; oil temperature high trip at 95°C.'
  },
  'TRANSMISSION-01': {
    id: 'TRANSMISSION-01',
    name: '400 kV Transmission Lines',
    category: 'High-Voltage Power Dispatch',
    status: 'OPTIMAL',
    mainValue: '50.00 Hz',
    mainLabel: 'National Grid Synchronized Frequency',
    cycle: ['ALL', 'GRID_YARD'],
    anchor: { x: 86, y: 34 },
    metrics: [
      { label: 'Grid Transmission Voltage', value: '400.0', unit: 'kV', nominal: '395 - 405 kV', note: 'Extra-high voltage (EHV)' },
      { label: 'Active Power Dispatched', value: '660.0', unit: 'MW', nominal: '660.0 MW', note: 'Powering ~1.2M homes' },
      { label: 'System Frequency', value: '50.00', unit: 'Hz', nominal: '49.95 - 50.05 Hz', note: 'Locked grid sync' },
      { label: 'Grid Reactive Power', value: '124.0', unit: 'MVAR', nominal: '< 180 MVAR', note: 'Voltage support' },
      { label: 'Line Thermal Loading', value: '68.5', unit: '%', nominal: '< 85%', note: 'Ample capacity margin' },
      { label: 'Interconnection State', value: 'SYNC LOCKED', unit: 'status', nominal: 'SYNC LOCKED', note: 'National grid bus' }
    ],
    description: 'Heavy overhead high-voltage aluminum transmission lines dispatch 660 MW of electrical energy from the plant substation across long regional distances to the national electrical grid.',
    howItWorks: 'High voltage lowers current, drastically slashing heat resistance losses across transmission lines.',
    safetyLimits: 'Distance relay impedance trip on phase-to-ground faults; under-frequency load shedding protection.'
  },
  'CONDENSER-01': {
    id: 'CONDENSER-01',
    name: 'Surface Steam Condenser',
    category: 'Phase Transition & Vacuum Island',
    status: 'OPTIMAL',
    mainValue: '-94.2 kPa',
    mainLabel: 'Deep Vacuum Exhaust Pressure',
    cycle: ['ALL', 'STEAM_LOOP', 'COOLING_LOOP'],
    anchor: { x: 58, y: 56 },
    metrics: [
      { label: 'Condenser Vacuum', value: '-94.2', unit: 'kPa', nominal: '-90 to -96 kPa', note: '0.058 bar absolute' },
      { label: 'Hotwell Temp', value: '36.5', unit: '°C', nominal: '34 - 40 °C', note: 'Subcooled condensate' },
      { label: 'Condensate Flow to Boiler', value: '1,820', unit: 'T/h', nominal: '1,750 - 1,950 T/h', note: 'Feed pumps active' },
      { label: 'Hotwell Water Level', value: '74.0', unit: '%', nominal: '65 - 80%', note: 'Stable buffer volume' },
      { label: 'Cooling Tube Delta-T', value: '7.8', unit: '°C', nominal: '6 - 9 °C', note: 'Heat exchange normal' },
      { label: 'Dissolved O₂ in Condensate', value: '8.4', unit: 'ppb', nominal: '< 15 ppb', note: 'Deaerator performance' }
    ],
    description: 'Positioned directly underneath the low-pressure turbine exhaust, cold river water circulating inside thousands of titanium tubes rapidly condenses spent steam back into pure water.',
    howItWorks: 'Instant condensation of steam into liquid creates a continuous low vacuum that sucks steam through the turbine blades.',
    safetyLimits: 'Vacuum loss alarm at -80 kPa; hotwell high level trip to prevent turbine water induction.'
  },
  'FEEDWATER-01': {
    id: 'FEEDWATER-01',
    name: 'Boiler Feedwater Return',
    category: 'Closed-Loop Feedwater Circuit',
    status: 'OPTIMAL',
    mainValue: '1,820 T/h',
    mainLabel: 'Mass Feedwater Throughput',
    cycle: ['ALL', 'STEAM_LOOP'],
    anchor: { x: 49, y: 62 },
    metrics: [
      { label: 'Feedwater Flow Rate', value: '1,820', unit: 'T/h', nominal: '1,750 - 1,950 T/h', note: 'Mass balance locked' },
      { label: 'Boiler Feed Pump Pressure', value: '182.0', unit: 'bar', nominal: '175 - 190 bar', note: 'Overcomes boiler head' },
      { label: 'Feedwater Inlet Temp', value: '284.0', unit: '°C', nominal: '275 - 290 °C', note: 'Preheated via HP heaters' },
      { label: 'Dissolved Oxygen', value: '4.2', unit: 'ppb', nominal: '< 7 ppb', note: 'Zero tube corrosion' },
      { label: 'Water Conductivity', value: '0.08', unit: 'µS/cm', nominal: '< 0.15 µS/cm', note: 'Ultra-pure demineralized' },
      { label: 'Feed Pump Motor Load', value: '82.4', unit: '%', nominal: '< 90%', note: 'Variable frequency drive' }
    ],
    description: 'Demineralized condensate water from the condenser hotwell is pumped under massive pressure (182 bar) through preheaters directly back into the boiler tubes to complete the thermodynamic cycle.',
    howItWorks: 'Feedwater pumps drive liquid water back into the boiler coils at high pressure, closing the Rankine cycle loop.',
    safetyLimits: 'Minimum flow recirculation protection; pump suction low NPSH trip.'
  },
  'COOLING-WATER-01': {
    id: 'COOLING-WATER-01',
    name: 'River Cooling Water System',
    category: 'Heat Rejection & Environmental Cycle',
    status: 'OPTIMAL',
    mainValue: '54,000 m³/h',
    mainLabel: 'River Water Pumping Flow Rate',
    cycle: ['ALL', 'COOLING_LOOP'],
    anchor: { x: 26, y: 80 },
    metrics: [
      { label: 'River Intake Temp', value: '21.5', unit: '°C', nominal: '18 - 25 °C', note: 'Fresh cold river supply' },
      { label: 'Discharge Return Temp', value: '29.3', unit: '°C', nominal: '< 32 °C', note: 'Environmental compliant' },
      { label: 'River Water Delta-T Rise', value: '7.8', unit: '°C', nominal: '< 10 °C', note: 'Safe aquatic margin' },
      { label: 'Circulation Flow Rate', value: '54,000', unit: 'm³/h', nominal: '50,000 - 60,000 m³/h', note: 'Dual centrifugal pumps' },
      { label: 'Intake Screen Pressure Drop', value: '12.4', unit: 'kPa', nominal: '< 25 kPa', note: 'Trash racks clean' },
      { label: 'Circulation Pump Current', value: '240.0', unit: 'A', nominal: '< 280 A', note: '6.6 kV high-voltage motor' }
    ],
    description: 'Centrifugal pumps draw cold water from the nearby river, circulate it through condenser tube bundles to absorb heat from steam, and safely return the warmed water downstream.',
    howItWorks: 'River water absorbs reject heat without mixing with the closed demineralized water loop.',
    safetyLimits: 'River return temperature alarm at > 32°C; intake screen differential pressure alarm.'
  }
};

interface InteractivePlantSchematicProps {
  onSelectComponent?: (componentId: string) => void;
  selectedComponentId?: string;
  selectionTrigger?: number;
  liveDevices?: any[];
  onDrawerStateChange?: (isOpen: boolean, width: number) => void;
}

export const InteractivePlantSchematic: React.FC<InteractivePlantSchematicProps> = ({
  onSelectComponent,
  selectedComponentId = '',
  selectionTrigger,
  liveDevices = [],
  onDrawerStateChange
}) => {
  const [activeId, setActiveId] = useState<string>(selectedComponentId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeCycle, setActiveCycle] = useState<PlantCycle>('ALL');
  const [flowSpeed, setFlowSpeed] = useState<0.5 | 1 | 1.5 | 2 | 0>(1);
  const [controlMode, setControlMode] = useState<'AUTO' | 'CASCADE' | 'MANUAL'>('AUTO');
  const [setpointPercent, setSetpointPercent] = useState<number>(100.0);
  const [isTripTestActive, setIsTripTestActive] = useState<boolean>(false);
  const [isAlarmAcknowledged, setIsAlarmAcknowledged] = useState<boolean>(false);
  const [realTrends, setRealTrends] = useState<any[]>([]);

  // Fetch real telemetry time-series points from https://api.nextops.live
  useEffect(() => {
    if (!activeId) {
      setRealTrends([]);
      return;
    }
    let isMounted = true;
    const fetchRealTrends = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.DEVICE_TRENDS(activeId, 1));
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setRealTrends(data);
          }
        }
      } catch (err) {
        console.warn('Real trends error:', err);
      }
    };

    fetchRealTrends();
    const interval = setInterval(fetchRealTrends, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeId]);

  // Dynamic animation duration helper based on flowSpeed
  const animDur = (baseSec: number): string => {
    if (flowSpeed === 0) return '99999s';
    const dur = (baseSec / flowSpeed).toFixed(2);
    return `${dur}s`;
  };
  
  // Draggable Right Panel Width State
  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    const saved = localStorage.getItem('scada_drawer_width');
    return saved ? parseInt(saved, 10) : 420;
  });
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Notify parent of drawer visibility and width changes
  useEffect(() => {
    onDrawerStateChange?.(isDrawerOpen, drawerWidth);
  }, [isDrawerOpen, drawerWidth, onDrawerStateChange]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 320;
      const maxWidth = Math.max(minWidth, Math.floor(window.innerWidth * 0.65));
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('scada_drawer_width', String(drawerWidth));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, drawerWidth]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Flow animation pause/unpause via SMIL API
  useEffect(() => {
    if (!svgRef.current) return;
    try {
      if (flowSpeed === 0) {
        svgRef.current.pauseAnimations();
      } else {
        svgRef.current.unpauseAnimations();
      }
    } catch {
      // Fallback
    }
  }, [flowSpeed]);

  const isFirstMount = useRef(true);

  // Sync external selection from sidebar, copilot chat, or URL route
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (selectedComponentId) {
        setActiveId(selectedComponentId);
        setIsDrawerOpen(true);
      } else {
        setActiveId('');
        setIsDrawerOpen(false);
      }
      return;
    }
    if (selectedComponentId) {
      setActiveId(selectedComponentId);
      setIsDrawerOpen(true);
    } else {
      setActiveId('');
      setIsDrawerOpen(false);
    }
  }, [selectedComponentId, selectionTrigger]);

  const handleComponentClick = (id: string) => {
    setActiveId(id);
    setIsDrawerOpen(true);
    if (onSelectComponent) {
      onSelectComponent(id);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setActiveId('');
    if (onSelectComponent) {
      onSelectComponent('');
    }
  };

  // Client-side SCADA Shift Log CSV Export
  const handleExportShiftLog = () => {
    const timestamp = new Date().toISOString();
    const headers = ['Timestamp', 'Tag_ID', 'Equipment_Name', 'Subsystem', 'Primary_Telemetry', 'Operational_Status', 'Safe_Operating_Envelope'];
    const rows = Object.values(COMPONENTS_MAP).map(comp => {
      const match = liveDevices.find(d => d.device_id === comp.id);
      const val = getComponentPrimaryValue(comp, match);
      return [
        timestamp,
        comp.id,
        `"${comp.name}"`,
        `"${comp.category}"`,
        `"${val}"`,
        comp.status,
        `"${comp.metrics[0]?.nominal || 'Normal'}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NextOps_SCADA_Shift_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const current = COMPONENTS_MAP[activeId] || COMPONENTS_MAP['TURBINE-01'];
  const hoveredComponent = hoveredId ? COMPONENTS_MAP[hoveredId] : null;
  const liveMatch = liveDevices.find(d => d.device_id === activeId);

  // Return the TRUE engineering primary metric for each component (Fixes Coal Feeder 28°C bug)
  const getComponentPrimaryValue = (comp: ComponentData, match: any) => {
    if (!match) return comp.mainValue;
    switch (comp.id) {
      case 'COAL-FEEDER-01':
        return match.flow_rate ? `${Number(match.flow_rate).toFixed(1)} T/h` : comp.mainValue;
      case 'FURNACE-01':
        return match.temperature ? `${Number(match.temperature).toFixed(1)} °C` : comp.mainValue;
      case 'BOILER-01':
        return match.pressure ? `${Number(match.pressure).toFixed(1)} bar` : comp.mainValue;
      case 'STEAM-LINE-01':
        return match.temperature ? `${Number(match.temperature).toFixed(1)} °C` : comp.mainValue;
      case 'TURBINE-01':
        return match.flow_rate ? `${Math.round(match.flow_rate)} RPM` : comp.mainValue;
      case 'GENERATOR-01':
        return match.flow_rate ? `${Number(match.flow_rate).toFixed(1)} MW` : comp.mainValue;
      case 'TRANSFORMER-01':
        return match.pressure ? `${Number(match.pressure).toFixed(1)} kV` : comp.mainValue;
      case 'TRANSMISSION-01':
        return '50.00 Hz';
      case 'CONDENSER-01':
        return match.pressure ? `${(Number(match.pressure) * 101.3 - 100).toFixed(1)} kPa` : comp.mainValue;
      case 'FEEDWATER-01':
        return match.flow_rate ? `${Math.round(match.flow_rate)} T/h` : comp.mainValue;
      case 'COOLING-WATER-01':
        return match.flow_rate ? `${Math.round(match.flow_rate).toLocaleString()} m³/h` : comp.mainValue;
      case 'CHIMNEY-01':
        return match.flow_rate ? `${Math.round(match.flow_rate)} mg/Nm³` : comp.mainValue;
      default:
        return comp.mainValue;
    }
  };

  const currentPrimaryValue = getComponentPrimaryValue(current, liveMatch);

  // Live On-Schematic P&ID Telemetry Badges Derivations
  const coalMatch = liveDevices.find(d => d.device_id === 'COAL-FEEDER-01');
  const coalPIdVal = coalMatch?.flow_rate ? `${Number(coalMatch.flow_rate).toFixed(1)} T/h · 86.5%` : '245.0 T/h · 86.5%';

  const chimneyMatch = liveDevices.find(d => d.device_id === 'CHIMNEY-01');
  const chimneyPIdVal = chimneyMatch?.flow_rate ? `${Math.round(chimneyMatch.flow_rate)} mg/Nm³ Clean` : '138 mg/Nm³ Clean';

  const furnaceMatch = liveDevices.find(d => d.device_id === 'FURNACE-01');
  const boilerPIdVal = `${furnaceMatch?.temperature ? Math.round(furnaceMatch.temperature) : '1,180'}°C · 1,850 T/h`;

  const steamMatch = liveDevices.find(d => d.device_id === 'STEAM-LINE-01');
  const steamPIdVal = `${steamMatch?.temperature ? Number(steamMatch.temperature).toFixed(1) : '542.0'}°C · ${steamMatch?.pressure ? Number(steamMatch.pressure).toFixed(1) : '175.4'} bar`;

  const turbineMatch = liveDevices.find(d => d.device_id === 'TURBINE-01');
  const turbinePIdVal = `${turbineMatch?.flow_rate ? Math.round(turbineMatch.flow_rate).toLocaleString() : '3,000'} RPM · 1.25 mm/s`;

  const genMatch = liveDevices.find(d => d.device_id === 'GENERATOR-01');
  const genPIdVal = `${genMatch?.flow_rate ? Number(genMatch.flow_rate).toFixed(1) : '660.0'} MW · 50.00 Hz`;

  const transMatch = liveDevices.find(d => d.device_id === 'TRANSFORMER-01');
  const transPIdVal = `${transMatch?.pressure ? Number(transMatch.pressure).toFixed(1) : '400.0'} kV · 720 MVA`;

  const transLinesPIdVal = '400 kV · 50.00 Hz Sync';

  const condMatch = liveDevices.find(d => d.device_id === 'CONDENSER-01');
  const condPIdVal = condMatch?.pressure ? `${(Number(condMatch.pressure) * 101.3 - 100).toFixed(1)} kPa Vacuum` : '-94.1 kPa Vacuum';

  const riverMatch = liveDevices.find(d => d.device_id === 'COOLING-WATER-01');
  const riverPIdVal = `${riverMatch?.temperature ? Number(riverMatch.temperature).toFixed(1) : '21.5'}°C · 54,000 m³/h`;

  // Extract real value according to component type
  const getPointValue = (pt: any, compId: string): number => {
    switch (compId) {
      case 'COAL-FEEDER-01':
        return Number(pt.flow_rate) || 245.0;
      case 'FURNACE-01':
        return Number(pt.temperature) || 1180.0;
      case 'BOILER-01':
        return Number(pt.pressure) || 175.4;
      case 'STEAM-LINE-01':
        return Number(pt.temperature) || 542.0;
      case 'TURBINE-01':
        return Number(pt.flow_rate) || 3000.0;
      case 'GENERATOR-01':
        return Number(pt.flow_rate) || 660.0;
      case 'TRANSFORMER-01':
        return Number(pt.pressure) || 400.0;
      case 'TRANSMISSION-01':
        return Number(pt.component_metrics?.system_frequency_hz) || 50.0;
      case 'CONDENSER-01':
        return Number(pt.component_metrics?.vacuum_pressure_kpa) || -94.2;
      case 'FEEDWATER-01':
        return Number(pt.pressure) || 182.0;
      case 'COOLING-WATER-01':
        return Number(pt.temperature) || 21.5;
      case 'CHIMNEY-01':
        return Number(pt.flow_rate) || 138.0;
      default:
        return Number(pt.temperature || pt.pressure || pt.flow_rate || 100);
    }
  };

  // Real-Time Operational Stability Curve from https://api.nextops.live
  // Sample up to 45 points across the 1-hour window so the historical curve remains rock-solid
  const trendPoints = useMemo(() => {
    if (!realTrends || realTrends.length === 0) return [];
    const maxPoints = 45;
    let sampled: any[] = [];
    if (realTrends.length <= maxPoints) {
      sampled = realTrends;
    } else {
      const step = Math.ceil(realTrends.length / maxPoints);
      for (let i = 0; i < realTrends.length - 1; i += step) {
        sampled.push(realTrends[i]);
      }
      sampled.push(realTrends[realTrends.length - 1]);
    }

    return sampled.map((pt: any) => {
      const d = new Date(pt.timestamp?.endsWith('Z') ? pt.timestamp : pt.timestamp + 'Z');
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: Number(getPointValue(pt, activeId).toFixed(1)),
        temperature: Number(Number(pt.temperature).toFixed(1)),
        pressure: Number(Number(pt.pressure).toFixed(2)),
        flow_rate: Number(Number(pt.flow_rate).toFixed(1)),
      };
    });
  }, [realTrends, activeId]);

  // Compute stable Y-axis domain based on equipment nominal baseline
  const yDomain = useMemo((): [number, number] => {
    if (trendPoints.length === 0) return [0, 100];
    const vals = trendPoints.map(p => p.value).filter(v => typeof v === 'number' && !isNaN(v));
    if (vals.length === 0) return [0, 100];

    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const diff = maxVal - minVal;

    switch (activeId) {
      case 'COAL-FEEDER-01': // ~245 T/h
        return [Math.min(220, Math.floor(minVal - 5)), Math.max(270, Math.ceil(maxVal + 5))];
      case 'FURNACE-01': // ~1180°C
        return [Math.min(1150, Math.floor(minVal - 10)), Math.max(1210, Math.ceil(maxVal + 10))];
      case 'BOILER-01': // ~175.4 bar
        return [Math.min(160, Math.floor(minVal - 5)), Math.max(190, Math.ceil(maxVal + 5))];
      case 'STEAM-LINE-01': // ~542°C
        return [Math.min(520, Math.floor(minVal - 5)), Math.max(565, Math.ceil(maxVal + 5))];
      case 'TURBINE-01': // ~3000 RPM
        return [Math.min(2950, Math.floor(minVal - 15)), Math.max(3050, Math.ceil(maxVal + 15))];
      case 'GENERATOR-01': // ~660 MW
        return [Math.min(630, Math.floor(minVal - 10)), Math.max(690, Math.ceil(maxVal + 10))];
      case 'TRANSFORMER-01': // ~400 kV
        return [Math.min(380, Math.floor(minVal - 5)), Math.max(420, Math.ceil(maxVal + 5))];
      case 'TRANSMISSION-01': // ~50.00 Hz
        return [49.5, 50.5];
      case 'CONDENSER-01': // ~ -94 kPa
        return [Math.min(-100, Math.floor(minVal - 2)), Math.max(-85, Math.ceil(maxVal + 2))];
      case 'FEEDWATER-01': // ~182 bar
        return [Math.min(170, Math.floor(minVal - 5)), Math.max(195, Math.ceil(maxVal + 5))];
      case 'COOLING-WATER-01': // ~21.5°C
        return [Math.min(15, Math.floor(minVal - 3)), Math.max(30, Math.ceil(maxVal + 3))];
      case 'CHIMNEY-01': // ~138 mg/Nm³
        return [Math.min(100, Math.floor(minVal - 10)), Math.max(170, Math.ceil(maxVal + 10))];
      default: {
        const pad = Math.max(diff * 0.2, 5);
        return [Math.floor(minVal - pad), Math.ceil(maxVal + pad)];
      }
    }
  }, [trendPoints, activeId]);

  const getMetricUnit = (compId: string): string => {
    switch (compId) {
      case 'COAL-FEEDER-01': return 'T/h';
      case 'FURNACE-01': return '°C';
      case 'BOILER-01': return 'bar';
      case 'STEAM-LINE-01': return '°C';
      case 'TURBINE-01': return 'RPM';
      case 'GENERATOR-01': return 'MW';
      case 'TRANSFORMER-01': return 'kV';
      case 'TRANSMISSION-01': return 'Hz';
      case 'CONDENSER-01': return 'kPa';
      case 'FEEDWATER-01': return 'bar';
      case 'COOLING-WATER-01': return '°C';
      case 'CHIMNEY-01': return 'mg/Nm³';
      default: return '';
    }
  };

  // Dynamically resolve all 6 drawer gauges from live API component_metrics
  const getLiveMetrics = (comp: ComponentData, match: any): ComponentMetric[] => {
    if (!match) return comp.metrics;
    const extra = match.component_metrics || {};

    return comp.metrics.map(m => {
      let liveVal = m.value;
      const l = m.label.toLowerCase();

      if (l.includes('feed rate') && (extra.feed_rate_tph !== undefined || match.flow_rate)) liveVal = String(extra.feed_rate_tph ?? Number(match.flow_rate).toFixed(1));
      else if (l.includes('bunker') && extra.bunker_level_pct !== undefined) liveVal = String(extra.bunker_level_pct);
      else if (l.includes('conveyor') && extra.conveyor_speed_mps !== undefined) liveVal = String(extra.conveyor_speed_mps);
      else if (l.includes('moisture') && extra.moisture_pct !== undefined) liveVal = String(extra.moisture_pct);
      else if (l.includes('flame temp') && (extra.flame_temp_c !== undefined || match.temperature)) liveVal = String(extra.flame_temp_c ?? Number(match.temperature).toFixed(1));
      else if (l.includes('draft') && extra.draft_pressure_pa !== undefined) liveVal = String(extra.draft_pressure_pa);
      else if (l.includes('air flow') && extra.primary_air_flow_m3h !== undefined) liveVal = String(extra.primary_air_flow_m3h);
      else if (l.includes('flue o₂') && extra.o2_flue_pct !== undefined) liveVal = String(extra.o2_flue_pct);
      else if (l.includes('co emissions') && extra.co_emissions_ppm !== undefined) liveVal = String(extra.co_emissions_ppm);
      else if (l.includes('heat flux') && extra.wall_heat_flux_kwm2 !== undefined) liveVal = String(extra.wall_heat_flux_kwm2);
      else if (l.includes('steam temp') && (extra.steam_temp_c !== undefined || match.temperature)) liveVal = String(extra.steam_temp_c ?? Number(match.temperature).toFixed(1));
      else if (l.includes('steam pressure') && (extra.steam_pressure_bar !== undefined || match.pressure)) liveVal = String(extra.steam_pressure_bar ?? Number(match.pressure).toFixed(1));
      else if (l.includes('steam generation') && (extra.steam_mass_flow_tph !== undefined || match.flow_rate)) liveVal = String(extra.steam_mass_flow_tph ?? Math.round(match.flow_rate).toLocaleString());
      else if (l.includes('drum water') && extra.drum_water_level_mm !== undefined) liveVal = (extra.drum_water_level_mm > 0 ? '+' : '') + String(extra.drum_water_level_mm);
      else if (l.includes('feedwater temp') && (extra.feedwater_temp_c !== undefined || extra.feedwater_inlet_temp_c !== undefined)) liveVal = String(extra.feedwater_temp_c ?? extra.feedwater_inlet_temp_c);
      else if (l.includes('attemperator') && extra.attemperator_spray_tph !== undefined) liveVal = String(extra.attemperator_spray_tph);
      else if (l.includes('stack exhaust') && (extra.flue_temp_c !== undefined || match.temperature)) liveVal = String(extra.flue_temp_c ?? Number(match.temperature).toFixed(1));
      else if (l.includes('nox') && (extra.nox_mg_nm3 !== undefined || match.flow_rate)) liveVal = String(extra.nox_mg_nm3 ?? Math.round(match.flow_rate));
      else if (l.includes('so₂') && extra.sox_mg_nm3 !== undefined) liveVal = String(extra.sox_mg_nm3);
      else if (l.includes('opacity') && extra.particulate_opacity_pct !== undefined) liveVal = String(extra.particulate_opacity_pct);
      else if (l.includes('casing vibration') && extra.casing_vibration_mms !== undefined) liveVal = String(extra.casing_vibration_mms);
      else if (l.includes('shaft speed') && (extra.rotation_speed_rpm !== undefined || match.flow_rate)) liveVal = String(extra.rotation_speed_rpm ?? Math.round(match.flow_rate).toLocaleString());
      else if (l.includes('exhaust temp') && extra.lp_exhaust_temp_c !== undefined) liveVal = String(extra.lp_exhaust_temp_c);
      else if (l.includes('active power') && (extra.active_power_mw !== undefined || match.flow_rate)) liveVal = String(extra.active_power_mw ?? Number(match.flow_rate).toFixed(1));
      else if (l.includes('frequency') && (extra.grid_frequency_hz !== undefined || extra.system_frequency_hz !== undefined)) liveVal = String(extra.grid_frequency_hz ?? extra.system_frequency_hz);
      else if (l.includes('vacuum') && extra.vacuum_pressure_kpa !== undefined) liveVal = String(extra.vacuum_pressure_kpa);
      else if (l.includes('hotwell temp') && extra.condensate_temp_c !== undefined) liveVal = String(extra.condensate_temp_c);
      else if (l.includes('river intake') && (extra.river_inlet_temp_c !== undefined || match.temperature)) liveVal = String(extra.river_inlet_temp_c ?? Number(match.temperature).toFixed(1));
      else if (l.includes('river water delta-t') && (extra.delta_t_rise_c !== undefined || extra.delta_t_c !== undefined)) liveVal = String(extra.delta_t_rise_c ?? extra.delta_t_c);

      return { ...m, value: liveVal };
    });
  };

  // Bespoke Component-Specific Small Digital Twin Simulation for ALL 12 Plant Components
  const renderSmallDigitalTwin = (id: string) => {
    switch (id) {
      case 'COAL-FEEDER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Automated Variable Conveyor & Pulverizer
              </span>
              <span className="text-amber-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Hopper Silo */}
              <polygon points="25,10 65,10 55,35 35,35" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
              {/* Conveyor Belt */}
              <line x1="35" y1="42" x2="210" y2="42" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
              <line x1="35" y1="42" x2="210" y2="42" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 8" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.8s" repeatCount="indefinite" />
              </line>
              {/* Pulverizer Roller Wheels */}
              <circle cx="175" cy="42" r="9" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="200" cy="42" r="9" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Chute into Boiler */}
              <line x1="205" y1="42" x2="230" y2="55" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 3">
                <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="0.4s" repeatCount="indefinite" />
              </line>
            </svg>
            <div className="text-[9.5px] font-mono text-amber-400 flex items-center justify-between">
              <span>Bunker Reserve: 86.5%</span>
              <span>Conveyor Speed: 2.4 m/s (Synced)</span>
            </div>
          </div>
        );

      case 'FURNACE-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-950 to-orange-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-orange-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-orange-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                Tangential Vortical Combustion
              </span>
              <span className="text-amber-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              <defs>
                <radialGradient id="miniFireGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="90%" stopColor="#c2410c" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="120" cy="35" rx="70" ry="22" fill="url(#miniFireGlow)">
                <animate attributeName="ry" values="22;26;20;25;22" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="rx" values="70;76;68;74;70" dur="0.8s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="120" cy="35" r="14" fill="#ffffff">
                <animate attributeName="r" values="14;17;13;16;14" dur="0.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="30" r="1.5" fill="#fef08a">
                <animate attributeName="cy" from="35" to="10" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0" dur="0.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="135" cy="28" r="1.5" fill="#fef08a">
                <animate attributeName="cy" from="35" to="8" dur="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0" dur="0.7s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div className="text-[9.5px] font-mono text-orange-300 flex items-center justify-between">
              <span>Furnace Draft: -45.2 Pa</span>
              <span>Excess O₂: 3.4% (Optimal)</span>
            </div>
          </div>
        );

      case 'BOILER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-sky-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-sky-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Supercritical Once-Through Coils
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              <path
                d="M 20 45 L 50 15 Q 60 5 70 15 L 100 45 Q 110 55 120 45 L 150 15 Q 160 5 170 15 L 200 45 Q 210 55 220 45"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 20 45 L 50 15 Q 60 5 70 15 L 100 45 Q 110 55 120 45 L 150 15 Q 160 5 170 15 L 200 45 Q 210 55 220 45"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.7s" repeatCount="indefinite" />
              </path>
            </svg>
            <div className="text-[9.5px] font-mono text-sky-300 flex items-center justify-between">
              <span>Steam Mass: 1,850 T/h</span>
              <span>Attemperator Spray: 14.2 T/h</span>
            </div>
          </div>
        );

      case 'CHIMNEY-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Flue Stack & CEMS Wet Scrubber
              </span>
              <span className="text-emerald-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Chimney Stack Body */}
              <polygon points="50,65 75,65 70,12 55,12" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="56" y="22" width="13" height="4" fill="#ef4444" />
              <rect x="57" y="32" width="11" height="4" fill="#ffffff" />
              
              {/* Scrubber Base Chamber */}
              <rect x="75" y="45" width="28" height="20" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="2" />
              <path d="M 80 50 L 98 50 M 80 56 L 98 56" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

              {/* Rising Clean Vapor Plume */}
              <g opacity="0.85">
                <circle cx="62" cy="10" r="4" fill="#cbd5e1">
                  <animate attributeName="cy" from="12" to="-10" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="cx" from="62" to="110" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="r" from="4" to="18" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="64" cy="8" r="5" fill="#94a3b8">
                  <animate attributeName="cy" from="12" to="-15" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="cx" from="64" to="140" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="r" from="5" to="24" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* CEMS Sensor Badge */}
              <rect x="155" y="20" width="75" height="30" fill="#0f172a" stroke="#0284c7" strokeWidth="1" rx="4" />
              <text x="162" y="33" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">CEMS NOx</text>
              <text x="162" y="44" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">42.1 mg/m³</text>
            </svg>
            <div className="text-[9.5px] font-mono text-emerald-400 flex items-center justify-between">
              <span>SO₂: 18.2 mg/Nm³</span>
              <span>Opacity: 4.8% (EPA Clear)</span>
            </div>
          </div>
        );

      case 'STEAM-LINE-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-sky-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-sky-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Supercritical Main Steam Header Pipe
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* High alloy insulated steam pipe */}
              <rect x="15" y="26" width="210" height="18" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="3" />
              {/* Inner high-speed steam velocity stream */}
              <line x1="20" y1="35" x2="220" y2="35" stroke="#38bdf8" strokeWidth="6" strokeDasharray="14 8" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="0.4s" repeatCount="indefinite" />
              </line>
              {/* Flanges & Pressure sensor */}
              <rect x="60" y="22" width="6" height="26" fill="#64748b" rx="1" />
              <rect x="170" y="22" width="6" height="26" fill="#64748b" rx="1" />
              <line x1="115" y1="26" x2="115" y2="12" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="115" cy="10" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            </svg>
            <div className="text-[9.5px] font-mono text-sky-300 flex items-center justify-between">
              <span>Velocity: 42.5 m/s</span>
              <span>Header Pressure: 175.4 bar</span>
            </div>
          </div>
        );

      case 'TURBINE-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Dual-Cylinder HP/LP Expansion Rotor
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              <line x1="10" y1="35" x2="230" y2="35" stroke="#475569" strokeWidth="4" />
              {/* HP Turbine Rotor (rotating around local 70, 35) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 70 35" to="360 70 35" dur="0.45s" repeatCount="indefinite" />
                <line x1="55" y1="35" x2="85" y2="35" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <line x1="70" y1="20" x2="70" y2="50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="25" x2="80" y2="45" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <line x1="60" y1="45" x2="80" y2="25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="70" cy="35" r="4" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1.5" />
              </g>
              {/* LP Turbine Rotor (rotating around local 170, 35) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 170 35" to="360 170 35" dur="0.38s" repeatCount="indefinite" />
                <line x1="150" y1="35" x2="190" y2="35" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="170" y1="15" x2="170" y2="55" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="156" y1="21" x2="184" y2="49" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="156" y1="49" x2="184" y2="21" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="170" cy="35" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              </g>
              <path d="M 20 15 Q 40 25 60 30" fill="none" stroke="#bae6fd" strokeWidth="2" strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.3s" repeatCount="indefinite" />
              </path>
            </svg>
            <div className="text-[9.5px] font-mono text-emerald-400 flex items-center justify-between">
              <span>Bearing Temp: 68.2°C</span>
              <span>Casing Vibration: 1.25 mm/s (Smooth)</span>
            </div>
          </div>
        );

      case 'GENERATOR-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-amber-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-amber-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Electromagnetic 2-Pole Stator Core
              </span>
              <span className="text-amber-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Stator Shell */}
              <rect x="70" y="8" width="100" height="54" fill="#1e293b" stroke="#78350f" strokeWidth="2" rx="6" />
              {/* Copper Stator Slots */}
              <rect x="76" y="14" width="88" height="42" fill="#451a03" stroke="#b45309" strokeWidth="1" rx="4" />
              
              {/* Rotating 2-pole rotor magnetic flux */}
              <circle cx="120" cy="35" r="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 120 35" to="360 120 35" dur="0.7s" repeatCount="indefinite" />
                <line x1="106" y1="35" x2="134" y2="35" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="120" y1="21" x2="120" y2="49" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="120" cy="35" r="4" fill="#ffffff" />
              </g>

              {/* Electromagnetic flux rings */}
              <circle cx="120" cy="35" r="24" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="4 3" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" from="0 120 35" to="-360 120 35" dur="1.4s" repeatCount="indefinite" />
              </circle>

              {/* Excitation Busbars */}
              <line x1="170" y1="35" x2="220" y2="35" stroke="#d97706" strokeWidth="4" />
              <circle cx="220" cy="35" r="4" fill="#f59e0b" />
            </svg>
            <div className="text-[9.5px] font-mono text-amber-400 flex items-center justify-between">
              <span>Hydrogen Cooling: 4.2 bar</span>
              <span>Power Factor: 0.92 Lagging</span>
            </div>
          </div>
        );

      case 'TRANSFORMER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-indigo-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-indigo-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                3-Phase Step-Up Power Transformer
              </span>
              <span className="text-indigo-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Transformer Core Tank */}
              <rect x="75" y="20" width="90" height="42" fill="#1e293b" stroke="#4338ca" strokeWidth="2" rx="4" />
              {/* Cooling Radiator Fins */}
              <line x1="65" y1="26" x2="75" y2="26" stroke="#6366f1" strokeWidth="2" />
              <line x1="65" y1="34" x2="75" y2="34" stroke="#6366f1" strokeWidth="2" />
              <line x1="65" y1="42" x2="75" y2="42" stroke="#6366f1" strokeWidth="2" />
              <line x1="65" y1="50" x2="75" y2="50" stroke="#6366f1" strokeWidth="2" />

              <line x1="165" y1="26" x2="175" y2="26" stroke="#6366f1" strokeWidth="2" />
              <line x1="165" y1="34" x2="175" y2="34" stroke="#6366f1" strokeWidth="2" />
              <line x1="165" y1="42" x2="175" y2="42" stroke="#6366f1" strokeWidth="2" />
              <line x1="165" y1="50" x2="175" y2="50" stroke="#6366f1" strokeWidth="2" />

              {/* 3 High Voltage Bushings */}
              <polygon points="95,20 101,8 107,20" fill="#a5b4fc" stroke="#6366f1" strokeWidth="1" />
              <polygon points="115,20 121,8 127,20" fill="#a5b4fc" stroke="#6366f1" strokeWidth="1" />
              <polygon points="135,20 141,8 147,20" fill="#a5b4fc" stroke="#6366f1" strokeWidth="1" />

              {/* Magnetic field flux pulses */}
              <ellipse cx="120" cy="41" rx="28" ry="12" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="5 3">
                <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="0.9s" repeatCount="indefinite" />
              </ellipse>

              <text x="100" y="45" fill="#e0e7ff" fontSize="9" fontFamily="monospace" fontWeight="bold">24kV→400kV</text>
            </svg>
            <div className="text-[9.5px] font-mono text-indigo-300 flex items-center justify-between">
              <span>Oil Temp: 64.5°C</span>
              <span>Load: 720 MVA (90.0% Rating)</span>
            </div>
          </div>
        );

      case 'TRANSMISSION-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-sky-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-sky-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                400 kV Extra-High-Voltage Grid Dispatch
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Lattice Transmission Pylon */}
              <polygon points="40,65 55,65 50,15 45,15" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
              <line x1="30" y1="24" x2="65" y2="24" stroke="#94a3b8" strokeWidth="2" />
              <line x1="33" y1="36" x2="62" y2="36" stroke="#94a3b8" strokeWidth="2" />
              <line x1="42" y1="24" x2="53" y2="36" stroke="#64748b" strokeWidth="1" />
              <line x1="53" y1="24" x2="42" y2="36" stroke="#64748b" strokeWidth="1" />

              {/* 3 High-Voltage Catenary Conductors */}
              <path d="M 30 24 Q 130 38 230 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 30 24 Q 130 38 230 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6 12">
                <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="0.45s" repeatCount="indefinite" />
              </path>

              <path d="M 65 24 Q 150 40 230 32" fill="none" stroke="#0284c7" strokeWidth="2" />
              <path d="M 65 24 Q 150 40 230 32" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 12">
                <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="0.45s" repeatCount="indefinite" />
              </path>

              <path d="M 33 36 Q 130 50 230 42" fill="none" stroke="#0369a1" strokeWidth="2" />
              <path d="M 33 36 Q 130 50 230 42" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 12">
                <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="0.45s" repeatCount="indefinite" />
              </path>
            </svg>
            <div className="text-[9.5px] font-mono text-sky-300 flex items-center justify-between">
              <span>Active Power: 660.0 MW</span>
              <span>Reactive Power: 124 MVAR</span>
            </div>
          </div>
        );

      case 'CONDENSER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-cyan-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-cyan-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Surface Steam Condenser & Hotwell
              </span>
              <span className="text-cyan-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Vacuum Shell */}
              <rect x="25" y="10" width="190" height="50" fill="#0f172a" stroke="#0891b2" strokeWidth="2" rx="6" />
              
              {/* Cold river water cooling tube bundle */}
              <line x1="35" y1="24" x2="205" y2="24" stroke="#06b6d4" strokeWidth="2.5" />
              <line x1="35" y1="34" x2="205" y2="34" stroke="#06b6d4" strokeWidth="2.5" />
              
              {/* Condensing water droplets raining into hotwell */}
              <g fill="#38bdf8">
                <circle cx="60" cy="20" r="1.5">
                  <animate attributeName="cy" from="18" to="48" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="18" r="1.5">
                  <animate attributeName="cy" from="18" to="48" dur="0.6s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="22" r="1.5">
                  <animate attributeName="cy" from="18" to="48" dur="0.55s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="19" r="1.5">
                  <animate attributeName="cy" from="18" to="48" dur="0.48s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Hotwell Condensate Reservoir */}
              <rect x="27" y="46" width="186" height="12" fill="#0284c7" opacity="0.8" rx="2" />
              <line x1="30" y1="46" x2="210" y2="46" stroke="#67e8f9" strokeWidth="1.5" />
            </svg>
            <div className="text-[9.5px] font-mono text-cyan-300 flex items-center justify-between">
              <span>Hotwell Level: 74.0%</span>
              <span>Condensate Temp: 36.5°C</span>
            </div>
          </div>
        );

      case 'FEEDWATER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-sky-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-sky-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                High-Pressure Boiler Feed Pump (BFP)
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Pump barrel casing */}
              <circle cx="110" cy="35" r="24" fill="#1e293b" stroke="#0284c7" strokeWidth="2.5" />
              {/* High-speed spinning impeller */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 110 35" to="360 110 35" dur="0.35s" repeatCount="indefinite" />
                <line x1="94" y1="35" x2="126" y2="35" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <line x1="110" y1="19" x2="110" y2="51" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <line x1="99" y1="24" x2="121" y2="46" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <line x1="99" y1="46" x2="121" y2="24" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="110" cy="35" r="5" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1" />
              </g>

              {/* Suction Pipe from Condenser */}
              <line x1="20" y1="35" x2="86" y2="35" stroke="#0369a1" strokeWidth="8" strokeLinecap="round" />
              <line x1="20" y1="35" x2="86" y2="35" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 5">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.5s" repeatCount="indefinite" />
              </line>

              {/* High Pressure Return Pipe to Boiler */}
              <line x1="134" y1="35" x2="220" y2="35" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
              <line x1="134" y1="35" x2="220" y2="35" stroke="#ffffff" strokeWidth="3" strokeDasharray="6 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.3s" repeatCount="indefinite" />
              </line>
            </svg>
            <div className="text-[9.5px] font-mono text-sky-300 flex items-center justify-between">
              <span>Feed Rate: 1,820 T/h</span>
              <span>Discharge Head: 182.0 bar</span>
            </div>
          </div>
        );

      case 'COOLING-WATER-01':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-blue-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-blue-200">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                River Intake & Condenser Cooling Loop
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <svg viewBox="0 0 240 70" className="w-full h-16 my-auto">
              {/* Flowing River water waves */}
              <path d="M 10 20 Q 30 15 50 20 T 90 20 T 130 20 T 170 20 T 210 20 T 240 20" fill="none" stroke="#0284c7" strokeWidth="3" />
              <path d="M 0 32 Q 25 27 50 32 T 100 32 T 150 32 T 200 32 T 240 32" fill="none" stroke="#38bdf8" strokeWidth="3" />
              <path d="M 15 44 Q 40 39 65 44 T 115 44 T 165 44 T 215 44 T 240 44" fill="none" stroke="#0369a1" strokeWidth="3" />
              
              {/* Directional Flow Arrows */}
              <g fill="#7dd3fc" opacity="0.85">
                <polygon points="60,20 54,16 54,24">
                  <animate attributeName="transform" type="translate" from="-20 0" to="140 0" dur="2s" repeatCount="indefinite" />
                </polygon>
                <polygon points="110,32 104,28 104,36">
                  <animate attributeName="transform" type="translate" from="-20 0" to="140 0" dur="1.7s" repeatCount="indefinite" />
                </polygon>
              </g>

              {/* Dual Intake Screen & Centrifugal Pump */}
              <rect x="180" y="15" width="45" height="40" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" rx="4" />
              <circle cx="202" cy="35" r="12" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
              <circle cx="202" cy="35" r="4" fill="#38bdf8" />
            </svg>
            <div className="text-[9.5px] font-mono text-sky-300 flex items-center justify-between">
              <span>Intake Supply: 21.5°C</span>
              <span>Discharge Return: 29.3°C (+7.8°C)</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-36 bg-gradient-to-br from-slate-900 to-sky-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Component Telemetry Loop
              </span>
              <span className="text-sky-300 font-bold">{currentPrimaryValue}</span>
            </div>
            
            <div className="flex items-center justify-center my-auto">
              <Activity className="w-12 h-12 text-sky-400/80 animate-pulse" />
            </div>
            
            <div className="text-[9.5px] font-mono text-slate-400 flex items-center justify-between">
              <span>Tag: {current.id}</span>
              <span>Status: Synchronized 99.8%</span>
            </div>
          </div>
        );
    }
  };

  const isCycleDimmed = (cycleArr: PlantCycle[]) => {
    if (activeCycle === 'ALL') return false;
    return !cycleArr.includes(activeCycle);
  };

  return (
    <div className="h-full w-full flex flex-row items-stretch relative select-none overflow-hidden bg-slate-50/40">
      
      {/* ======================================================== */}
      {/* CENTERPIECE DIGITAL TWIN CANVAS                          */}
      {/* Scales automatically when drawer opens on right          */}
      {/* ======================================================== */}
      <div className="flex-1 h-full min-w-0 flex flex-col justify-between p-2 relative overflow-hidden">
        
        {/* Top SCADA Cycle Filter Tabs */}
        <div className="flex items-center justify-between gap-2 px-2 py-1 shrink-0 z-10">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 uppercase px-2 whitespace-nowrap">
              <Filter className="w-3 h-3 text-sky-600" />
              Cycle:
            </span>
            <button
              onClick={() => setActiveCycle('ALL')}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCycle === 'ALL'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Systems
            </button>
            <button
              onClick={() => setActiveCycle('STEAM_LOOP')}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCycle === 'STEAM_LOOP'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rankine Steam Loop
            </button>
            <button
              onClick={() => setActiveCycle('TURBO_TRAIN')}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCycle === 'TURBO_TRAIN'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Turbogenerator
            </button>
            <button
              onClick={() => setActiveCycle('COOLING_LOOP')}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCycle === 'COOLING_LOOP'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cooling & Water
            </button>
            <button
              onClick={() => setActiveCycle('GRID_YARD')}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCycle === 'GRID_YARD'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Substation Grid
            </button>
          </div>

          {/* Flow Speed & Status Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-xl border border-slate-200/90 text-[10px] font-mono shadow-2xs">
              <span className="text-slate-400 font-bold text-[9px] uppercase whitespace-nowrap">Flow:</span>
              {([0.5, 1, 1.5, 2, 0] as const).map(sp => (
                <button
                  key={sp}
                  onClick={() => setFlowSpeed(sp)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    flowSpeed === sp
                      ? 'bg-sky-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={sp === 0 ? 'Pause flow animation' : `${sp}x speed`}
                >
                  {sp === 0 ? '⏸️' : `${sp}x`}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Unit 1 &bull; 660 MW Supercritical SCADA Active
            </div>
          </div>
        </div>

        {/* Main SVG Vector Blueprint Canvas (viewBox 0 0 1280 480) */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
          <svg
            ref={svgRef}
            key={`svg-canvas-flow-${flowSpeed}`}
            viewBox="0 0 1280 480"
            className="w-full h-full max-h-[calc(100vh-140px)] object-contain"
          >
            <defs>
              {/* Industrial Steel Gradients */}
              <linearGradient id="metalDark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="metalPlate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="40%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              <linearGradient id="buildingConcrete" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Natural River Water Depth Gradient */}
              <linearGradient id="deepRiverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="35%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>

              {/* Volumetric Radiant Fireball */}
              <radialGradient id="volumetricFire" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="20%" stopColor="#fef08a" stopOpacity="0.98" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#ea580c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
              </radialGradient>

              {/* Chrome Steam Header Pipe */}
              <linearGradient id="chromeSteamPipe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="30%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Subterranean Geological Strata Gradient */}
              <linearGradient id="bedrockStrataSoft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="40%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Selection Halo Filter */}
              <filter id="scadaSelectGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.007   0 0 0 0 0.518   0 0 0 0 0.780  0 0 0 0.95 0"
                />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Elevated SCADA Telemetry Pill Drop Shadow */}
              <filter id="scadaPillShadow" x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.10" />
              </filter>
            </defs>

            {/* Surface Foundation Slab */}
            <rect x="0" y="305" width="1280" height="10" fill="#475569" />
            <line x1="0" y1="305" x2="1280" y2="305" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="470" y1="315" x2="1020" y2="315" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="14 10" />

            {/* Subterranean Geological Strata */}
            <rect x="0" y="315" width="1280" height="165" fill="url(#bedrockStrataSoft)" />
            <line x1="0" y1="365" x2="1280" y2="365" stroke="#475569" strokeWidth="1" strokeDasharray="30 15" opacity="0.35" />
            <line x1="0" y1="435" x2="1280" y2="435" stroke="#475569" strokeWidth="1" strokeDasharray="40 20" opacity="0.25" />

            {/* 10. RIVER CHANNEL */}
            <g
              onClick={() => handleComponentClick('COOLING-WATER-01')}
              onMouseEnter={() => setHoveredId('COOLING-WATER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['COOLING-WATER-01'].cycle) ? 0.3 : 1}
            >
              <path
                d="M 0 355 L 430 355 Q 450 355 450 375 L 450 455 L 0 455 Z"
                fill="url(#deepRiverGrad)"
              />
              <path d="M 430 355 Q 450 355 450 375 L 450 455" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.8" />

              <path
                d="M 15 375 Q 85 368 155 375 T 295 375 T 425 375"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="2.5"
                opacity="0.8"
              >
                <animate
                  attributeName="d"
                  dur={animDur(3.2)}
                  repeatCount="indefinite"
                  values="
                    M 15 375 Q 85 368 155 375 T 295 375 T 425 375;
                    M 15 375 Q 85 382 155 375 T 295 375 T 425 375;
                    M 15 375 Q 85 368 155 375 T 295 375 T 425 375
                  "
                />
              </path>

              <g fill="#7dd3fc" opacity="0.5">
                <polygon points="120,430 130,435 120,440" />
                <polygon points="140,430 150,435 140,440" />
                <polygon points="160,430 170,435 160,440" />
              </g>

              <text x="140" y="398" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                River
              </text>

              {/* Live P&ID Telemetry Chip: River */}
              <g className="pointer-events-none">
                <rect x="140" y="406" width="162" height="22" rx="5" fill="rgba(7, 89, 133, 0.88)" stroke="#38bdf8" strokeWidth="1.2" />
                <circle cx="150" cy="417" r="3" fill="#38bdf8">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="158" y="420.5" fill="#f0f9ff" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {riverPIdVal}
                </text>
              </g>

              {activeId === 'COOLING-WATER-01' && (
                <path
                  d="M 2 357 L 428 357 Q 448 357 448 375 L 448 453 L 2 453 Z"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  filter="url(#scadaSelectGlow)"
                />
              )}
            </g>

            {/* CONDENSER COOLING WATER PIPES */}
            <g
              onClick={() => handleComponentClick('COOLING-WATER-01')}
              onMouseEnter={() => setHoveredId('COOLING-WATER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['COOLING-WATER-01'].cycle) ? 0.3 : 1}
            >
              <path d="M 450 375 L 705 375 Q 715 375 715 365 L 715 305" fill="none" stroke="#0369a1" strokeWidth="11" />
              <path d="M 450 375 L 705 375 Q 715 375 715 365 L 715 305" fill="none" stroke="#38bdf8" strokeWidth="5" strokeDasharray="10 8">
                <animate attributeName="stroke-dashoffset" from="0" to="-36" dur={animDur(1)} repeatCount="indefinite" />
              </path>

              <path d="M 450 415 L 775 415 Q 785 415 785 405 L 785 305" fill="none" stroke="#075985" strokeWidth="11" />
              <path d="M 450 415 L 775 415 Q 785 415 785 405 L 785 305" fill="none" stroke="#67e8f9" strokeWidth="5" strokeDasharray="10 8">
                <animate attributeName="stroke-dashoffset" from="0" to="36" dur={animDur(1.2)} repeatCount="indefinite" />
              </path>

              <text x="510" y="440" fill="#f8fafc" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Condenser Cooling Water
              </text>
              <line x1="500" y1="435" x2="475" y2="415" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="475,415 486,417 483,425" fill="#38bdf8" />
            </g>

            {/* CONDENSATE FEEDWATER RETURN PIPE */}
            <g
              onClick={() => handleComponentClick('FEEDWATER-01')}
              onMouseEnter={() => setHoveredId('FEEDWATER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['FEEDWATER-01'].cycle) ? 0.3 : 1}
            >
              <path d="M 690 295 L 645 295 L 635 285 L 565 285" fill="none" stroke="#0284c7" strokeWidth="9" />
              <path d="M 690 295 L 645 295 L 635 285 L 565 285" fill="none" stroke="#bae6fd" strokeWidth="4" strokeDasharray="7 5">
                <animate attributeName="stroke-dashoffset" from="0" to="24" dur={animDur(0.75)} repeatCount="indefinite" />
              </path>

              <circle cx="640" cy="290" r="8" fill="#0369a1" stroke="#ffffff" strokeWidth="2" />
              <polygon points="636,285 645,290 636,295" fill="#ffffff" />

              <text x="570" y="330" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Water
              </text>
              <line x1="600" y1="324" x2="630" y2="295" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="630,295 620,297 623,305" fill="#38bdf8" />
            </g>

            {/* 1. COAL STOCKPILE & CONVEYOR */}
            <g
              onClick={() => handleComponentClick('COAL-FEEDER-01')}
              onMouseEnter={() => setHoveredId('COAL-FEEDER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['COAL-FEEDER-01'].cycle) ? 0.3 : 1}
            >
              <polygon points="15,305 95,215 175,305" fill="#334155" />
              <polygon points="105,305 195,190 285,305" fill="#1e293b" />
              <polygon points="195,305 255,230 315,305" fill="#334155" />

              <rect x="175" y="185" width="48" height="55" fill="url(#metalPlate)" stroke="#1e293b" strokeWidth="2" rx="3" />
              <polygon points="175,185 199,165 223,185" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="178" y1="240" x2="178" y2="305" stroke="#1e293b" strokeWidth="3.5" />
              <line x1="220" y1="240" x2="220" y2="305" stroke="#1e293b" strokeWidth="3.5" />

              <line x1="223" y1="210" x2="480" y2="265" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
              <line x1="223" y1="210" x2="480" y2="265" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <line x1="223" y1="210" x2="480" y2="265" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="6 8" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" from="0" to="-28" dur={animDur(0.8)} repeatCount="indefinite" />
              </line>

              <text x="140" y="125" fill="#0f172a" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                Coal
              </text>

              {/* Live P&ID Telemetry Chip: Coal */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="140" y="133" width="150" height="22" rx="5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.2" />
                <circle cx="150" cy="144" r="3" fill="#f59e0b">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="157" y="147.5" fill="#78350f" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {coalPIdVal}
                </text>
              </g>
              <line x1="215" y1="155" x2="215" y2="185" stroke="#475569" strokeWidth="2" />
              <polygon points="215,185 220,175 210,175" fill="#475569" />

              {activeId === 'COAL-FEEDER-01' && (
                <rect x="20" y="150" width="300" height="160" fill="none" stroke="#0284c7" strokeWidth="3" rx="6" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 4. CHIMNEY STACK */}
            <g
              onClick={() => handleComponentClick('CHIMNEY-01')}
              onMouseEnter={() => setHoveredId('CHIMNEY-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['CHIMNEY-01'].cycle) ? 0.3 : 1}
            >
              <polygon points="390,305 440,305 428,70 402,70" fill="url(#metalDark)" />
              <rect x="398" y="65" width="34" height="6" fill="#94a3b8" rx="1.5" />
              <polygon points="405,95 425,95 426,85 404,85" fill="#ef4444" opacity="0.85" />
              <polygon points="406,115 424,115 425,105 405,105" fill="#ffffff" opacity="0.85" />
              <rect x="430" y="235" width="45" height="40" fill="#334155" stroke="#1e293b" strokeWidth="2" />

              <g opacity="0.85">
                <circle cx="415" cy="52" r="8" fill="#94a3b8">
                  <animate attributeName="cy" from="62" to="10" dur={animDur(2.2)} repeatCount="indefinite" />
                  <animate attributeName="cx" from="415" to="425" dur={animDur(2.2)} repeatCount="indefinite" />
                  <animate attributeName="r" from="7" to="24" dur={animDur(2.2)} repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur={animDur(2.2)} repeatCount="indefinite" />
                </circle>
                <circle cx="420" cy="46" r="10" fill="#cbd5e1">
                  <animate attributeName="cy" from="62" to="0" dur={animDur(2.8)} repeatCount="indefinite" />
                  <animate attributeName="cx" from="420" to="435" dur={animDur(2.8)} repeatCount="indefinite" />
                  <animate attributeName="r" from="9" to="28" dur={animDur(2.8)} repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur={animDur(2.8)} repeatCount="indefinite" />
                </circle>
              </g>

              <text x="320" y="42" fill="#0f172a" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                Chimney
              </text>

              {/* Live P&ID Telemetry Chip: Chimney */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="320" y="50" width="145" height="22" rx="5" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                <circle cx="330" cy="61" r="3" fill="#10b981">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="337" y="64.5" fill="#065f46" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {chimneyPIdVal}
                </text>
              </g>
              <line x1="395" y1="72" x2="405" y2="85" stroke="#475569" strokeWidth="2" />
              <polygon points="405,85 404,74 397,80" fill="#475569" />

              {activeId === 'CHIMNEY-01' && (
                <polygon points="385,307 445,307 433,63 397,63" fill="none" stroke="#0284c7" strokeWidth="3" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 2 & 3. BOILER ISLAND & TURBINE HALL */}
            <g>
              <path
                d="M 475 305 L 475 140 Q 475 130 485 130 L 640 130 Q 650 130 650 140 L 650 185 L 860 185 L 860 305 Z"
                fill="url(#buildingConcrete)"
                stroke="#64748b"
                strokeWidth="2.5"
              />
              <rect x="490" y="150" width="145" height="150" fill="#090d16" rx="4" />

              {/* 2. FURNACE */}
              <g
                onClick={() => handleComponentClick('FURNACE-01')}
                onMouseEnter={() => setHoveredId('FURNACE-01')}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer group"
                opacity={isCycleDimmed(COMPONENTS_MAP['FURNACE-01'].cycle) ? 0.3 : 1}
              >
                <rect x="495" y="235" width="135" height="65" fill="#431407" rx="3" />
                <ellipse cx="562" cy="268" rx="56" ry="26" fill="url(#volumetricFire)">
                  <animate attributeName="ry" values="26;30;24;29;26" dur={animDur(1)} repeatCount="indefinite" />
                  <animate attributeName="rx" values="56;60;54;59;56" dur={animDur(0.9)} repeatCount="indefinite" />
                </ellipse>
                <circle cx="562" cy="268" r="16" fill="#ffffff" />
                <text x="550" y="292" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                  Fire
                </text>

                {activeId === 'FURNACE-01' && (
                  <rect x="493" y="233" width="139" height="69" fill="none" stroke="#ea580c" strokeWidth="3" rx="4" filter="url(#scadaSelectGlow)" />
                )}
              </g>

              {/* 3. BOILER */}
              <g
                onClick={() => handleComponentClick('BOILER-01')}
                onMouseEnter={() => setHoveredId('BOILER-01')}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer group"
                opacity={isCycleDimmed(COMPONENTS_MAP['BOILER-01'].cycle) ? 0.3 : 1}
              >
                <path
                  d="M 515 240 L 515 165 Q 525 155 538 165 L 538 240 Q 550 250 562 240 L 562 165 Q 575 155 588 165 L 588 240 Q 600 250 612 240 L 612 165"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 515 240 L 515 165 Q 525 155 538 165 L 538 240 Q 550 250 562 240 L 562 165 Q 575 155 588 165 L 588 240 Q 600 250 612 240 L 612 165"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeDasharray="8 5"
                  strokeLinecap="round"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-26" dur={animDur(0.8)} repeatCount="indefinite" />
                </path>

                <rect x="607" y="155" width="20" height="85" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" rx="3" />

                <text x="495" y="52" fill="#0f172a" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  Boiler (furnace)
                </text>

                {/* Live P&ID Telemetry Chip: Boiler (furnace) */}
                <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                  <rect x="495" y="60" width="150" height="22" rx="5" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
                  <circle cx="505" cy="71" r="3" fill="#ea580c">
                    <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="512" y="74.5" fill="#9a3412" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                    {boilerPIdVal}
                  </text>
                </g>
                <line x1="550" y1="82" x2="550" y2="152" stroke="#475569" strokeWidth="2" />
                <polygon points="550,152 545,142 555,142" fill="#475569" />

                {activeId === 'BOILER-01' && (
                  <rect x="488" y="145" width="149" height="100" fill="none" stroke="#0284c7" strokeWidth="3" rx="4" filter="url(#scadaSelectGlow)" />
                )}
              </g>
            </g>

            {/* 5. MAIN STEAM PIPELINE */}
            <g
              onClick={() => handleComponentClick('STEAM-LINE-01')}
              onMouseEnter={() => setHoveredId('STEAM-LINE-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['STEAM-LINE-01'].cycle) ? 0.3 : 1}
            >
              <path d="M 617 155 L 617 115 Q 617 105 627 105 L 725 105 Q 735 105 735 115 L 735 190" fill="none" stroke="#334155" strokeWidth="14" />
              <path d="M 617 155 L 617 115 Q 617 105 627 105 L 725 105 Q 735 105 735 115 L 735 190" fill="none" stroke="url(#chromeSteamPipe)" strokeWidth="8" />

              <path d="M 617 155 L 617 115 Q 617 105 627 105 L 725 105 Q 735 105 735 115 L 735 190" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeDasharray="14 10">
                <animate attributeName="stroke-dashoffset" from="0" to="-48" dur={animDur(0.5)} repeatCount="indefinite" />
              </path>

              <ellipse cx="735" cy="192" rx="10" ry="6" fill="#38bdf8" opacity="0.85" />

              <text x="675" y="52" fill="#0f172a" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                Steam Header
              </text>

              {/* Live P&ID Telemetry Chip: Steam */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="675" y="60" width="152" height="22" rx="5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                <circle cx="685" cy="71" r="3" fill="#0284c7">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="692" y="74.5" fill="#0369a1" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {steamPIdVal}
                </text>
              </g>
              <line x1="710" y1="82" x2="710" y2="105" stroke="#475569" strokeWidth="2" />
              <polygon points="710,105 705,95 715,95" fill="#475569" />

              {activeId === 'STEAM-LINE-01' && (
                <path d="M 617 155 L 617 115 Q 617 105 627 105 L 725 105 Q 735 105 735 115 L 735 190" fill="none" stroke="#0284c7" strokeWidth="20" opacity="0.35" />
              )}
            </g>

            {/* 6. STEAM TURBINE */}
            <g
              onClick={() => handleComponentClick('TURBINE-01')}
              onMouseEnter={() => setHoveredId('TURBINE-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['TURBINE-01'].cycle) ? 0.3 : 1}
            >
              <rect x="670" y="190" width="115" height="55" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" rx="4" />
              <line x1="670" y1="217" x2="785" y2="217" stroke="#0f172a" strokeWidth="5" />
              <polygon points="680,200 710,209 710,225 680,235" fill="#94a3b8" />
              <polygon points="740,209 770,200 770,235 740,225" fill="#94a3b8" />

              {/* HP Turbine Rotor (Rotating directly inside HP casing at 697, 217) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 697 217" to="360 697 217" dur={animDur(0.55)} repeatCount="indefinite" />
                <line x1="682" y1="217" x2="712" y2="217" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                <line x1="697" y1="202" x2="697" y2="232" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                <line x1="686" y1="206" x2="708" y2="228" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <line x1="686" y1="228" x2="708" y2="206" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="697" cy="217" r="4.5" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1" />
              </g>

              {/* LP Turbine Rotor (Rotating directly inside LP casing at 753, 217) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 753 217" to="360 753 217" dur={animDur(0.42)} repeatCount="indefinite" />
                <line x1="737" y1="217" x2="769" y2="217" stroke="#0369a1" strokeWidth="3.2" strokeLinecap="round" />
                <line x1="753" y1="201" x2="753" y2="233" stroke="#0369a1" strokeWidth="3.2" strokeLinecap="round" />
                <line x1="742" y1="206" x2="764" y2="228" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="742" y1="228" x2="764" y2="206" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="753" cy="217" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              </g>

              {/* Clean Callout: Turbine */}
              <text x="670" y="140" fill="#0f172a" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Steam Turbine
              </text>

              {/* Live P&ID Telemetry Chip: Turbine */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="670" y="148" width="152" height="22" rx="5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                <circle cx="680" cy="159" r="3" fill="#0284c7">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="687" y="162.5" fill="#0369a1" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {turbinePIdVal}
                </text>
              </g>
              <line x1="725" y1="170" x2="725" y2="190" stroke="#475569" strokeWidth="2" />
              <polygon points="725,190 720,180 730,180" fill="#475569" />

              {activeId === 'TURBINE-01' && (
                <rect x="666" y="186" width="123" height="63" fill="none" stroke="#0284c7" strokeWidth="3" rx="5" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 9. CONDENSER */}
            <g
              onClick={() => handleComponentClick('CONDENSER-01')}
              onMouseEnter={() => setHoveredId('CONDENSER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['CONDENSER-01'].cycle) ? 0.3 : 1}
            >
              <rect x="675" y="250" width="110" height="48" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" rx="4" />
              <line x1="685" y1="262" x2="775" y2="262" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
              <line x1="685" y1="274" x2="775" y2="274" stroke="#ffffff" strokeWidth="2" opacity="0.9" />

              <text x="685" y="325" fill="#f8fafc" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                Surface Condenser
              </text>

              {/* Live P&ID Telemetry Chip: Condenser */}
              <g className="pointer-events-none">
                <rect x="685" y="333" width="142" height="22" rx="5" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.2" />
                <circle cx="695" cy="344" r="3" fill="#38bdf8">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="702" y="347.5" fill="#e0f2fe" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {condPIdVal}
                </text>
              </g>
              <line x1="730" y1="318" x2="730" y2="298" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="730,298 725,307 735,307" fill="#38bdf8" />

              {activeId === 'CONDENSER-01' && (
                <rect x="671" y="246" width="118" height="56" fill="none" stroke="#0284c7" strokeWidth="3" rx="5" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 7. GENERATOR */}
            <g
              onClick={() => handleComponentClick('GENERATOR-01')}
              onMouseEnter={() => setHoveredId('GENERATOR-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['GENERATOR-01'].cycle) ? 0.3 : 1}
            >
              <rect x="785" y="190" width="62" height="55" fill="#78350f" stroke="#451a03" strokeWidth="2.5" rx="4" />
              <rect x="793" y="197" width="46" height="41" fill="#d97706" rx="3" />
              
              <circle cx="816" cy="217" r="14" fill="none" stroke="#fef3c7" strokeWidth="2.5" strokeDasharray="4 3">
                <animateTransform attributeName="transform" type="rotate" from="0 816 217" to="360 816 217" dur={animDur(1)} repeatCount="indefinite" />
              </circle>

              {/* Clean Callout: Generator */}
              <text x="835" y="98" fill="#0f172a" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Generator
              </text>

              {/* Live P&ID Telemetry Chip: Generator */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="835" y="106" width="145" height="22" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1.2" />
                <circle cx="845" cy="117" r="3" fill="#d97706">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="852" y="120.5" fill="#92400e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {genPIdVal}
                </text>
              </g>
              <line x1="840" y1="128" x2="840" y2="188" stroke="#475569" strokeWidth="2" />
              <polygon points="840,188 835,178 845,178" fill="#475569" />

              {activeId === 'GENERATOR-01' && (
                <rect x="781" y="186" width="70" height="63" fill="none" stroke="#0284c7" strokeWidth="3" rx="5" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 8. TRANSFORMER */}
            <g
              onClick={() => handleComponentClick('TRANSFORMER-01')}
              onMouseEnter={() => setHoveredId('TRANSFORMER-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['TRANSFORMER-01'].cycle) ? 0.3 : 1}
            >
              <path d="M 847 230 L 865 230 L 865 265 L 905 265" fill="none" stroke="#eab308" strokeWidth="3.2" />
              <path d="M 847 235 L 869 235 L 869 270 L 905 270" fill="none" stroke="#eab308" strokeWidth="3.2" />
              <path d="M 847 240 L 873 240 L 873 275 L 905 275" fill="none" stroke="#eab308" strokeWidth="3.2" />

              <rect x="900" y="295" width="85" height="10" fill="#475569" stroke="#334155" strokeWidth="1" rx="2" />
              <rect x="905" y="240" width="75" height="56" fill="url(#metalPlate)" stroke="#1e293b" strokeWidth="2.5" rx="4" />
              <line x1="915" y1="248" x2="915" y2="288" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="925" y1="248" x2="925" y2="288" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="935" y1="248" x2="935" y2="288" stroke="#1e293b" strokeWidth="2.5" />

              <polygon points="915,240 925,220 935,240" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
              <polygon points="950,240 960,220 970,240" fill="#64748b" stroke="#334155" strokeWidth="1.5" />

              <text x="915" y="155" fill="#0f172a" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Transformer
              </text>

              {/* Live P&ID Telemetry Chip: Transformer */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="915" y="163" width="142" height="22" rx="5" fill="#ffffff" stroke="#eab308" strokeWidth="1.2" />
                <circle cx="925" cy="174" r="3" fill="#eab308">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="932" y="177.5" fill="#854d0e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {transPIdVal}
                </text>
              </g>
              <line x1="945" y1="185" x2="945" y2="218" stroke="#475569" strokeWidth="2" />
              <polygon points="945,218 940,208 950,208" fill="#475569" />

              {activeId === 'TRANSFORMER-01' && (
                <rect x="901" y="215" width="83" height="85" fill="none" stroke="#0284c7" strokeWidth="3" rx="5" filter="url(#scadaSelectGlow)" />
              )}
            </g>

            {/* 8B. 400 kV TRANSMISSION LINES (Zero Edge Cutoff) */}
            <g
              onClick={() => handleComponentClick('TRANSMISSION-01')}
              onMouseEnter={() => setHoveredId('TRANSMISSION-01')}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
              opacity={isCycleDimmed(COMPONENTS_MAP['TRANSMISSION-01'].cycle) ? 0.3 : 1}
            >
              <line x1="960" y1="220" x2="1240" y2="220" stroke="#eab308" strokeWidth="3.5" />
              <line x1="960" y1="225" x2="1240" y2="225" stroke="#eab308" strokeWidth="3.5" />
              <line x1="960" y1="230" x2="1240" y2="230" stroke="#eab308" strokeWidth="3.5" />
              
              <line x1="960" y1="225" x2="1240" y2="225" stroke="#ffffff" strokeWidth="2.8" strokeDasharray="12 16">
                <animate attributeName="stroke-dashoffset" from="0" to="-56" dur={animDur(0.75)} repeatCount="indefinite" />
              </line>

              {/* Clean Callout: Transmission Lines */}
              <text x="1075" y="125" fill="#0f172a" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                Transmission Lines
              </text>

              {/* Live P&ID Telemetry Chip: Transmission Lines */}
              <g className="pointer-events-none" filter="url(#scadaPillShadow)">
                <rect x="1075" y="133" width="155" height="22" rx="5" fill="#ffffff" stroke="#eab308" strokeWidth="1.2" />
                <circle cx="1085" cy="144" r="3" fill="#eab308">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="1092" y="147.5" fill="#854d0e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {transLinesPIdVal}
                </text>
              </g>
              <line x1="1110" y1="155" x2="1110" y2="215" stroke="#475569" strokeWidth="2" />
              <polygon points="1110,215 1105,205 1115,205" fill="#475569" />

              {activeId === 'TRANSMISSION-01' && (
                <path d="M 960 225 L 1240 225" fill="none" stroke="#38bdf8" strokeWidth="10" opacity="0.4" />
              )}
            </g>

          </svg>

          {/* QUICK HOVER HUD (POPOVER) - ALWAYS ACTIVE ON MOUSEOVER */}
          {hoveredComponent && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-200 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${Math.min(Math.max(hoveredComponent.anchor.x, 15), 75)}%`,
                top: `${hoveredComponent.anchor.y}%`,
              }}
            >
              <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl p-3 border border-slate-700/80 min-w-[220px] space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                  <span className="text-[9.5px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                    {hoveredComponent.category}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE HUD
                  </span>
                </div>

                <div className="text-xs font-black text-white leading-tight">
                  {hoveredComponent.name}
                </div>

                <div className="flex items-baseline justify-between py-0.5">
                  <span className="text-base font-black font-mono text-sky-300">
                    {getComponentPrimaryValue(hoveredComponent, liveDevices.find(d => d.device_id === hoveredComponent.id))}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">
                    ● Synced
                  </span>
                </div>

                {/* 2 Key Sub-metrics in HUD */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80 text-[8.5px] font-mono text-slate-300">
                  <div className="bg-slate-800/60 p-1 rounded">
                    <span className="text-slate-400 block truncate">{hoveredComponent.metrics[0]?.label}</span>
                    <span className="font-bold text-white">{hoveredComponent.metrics[0]?.value} {hoveredComponent.metrics[0]?.unit}</span>
                  </div>
                  <div className="bg-slate-800/60 p-1 rounded">
                    <span className="text-slate-400 block truncate">{hoveredComponent.metrics[1]?.label}</span>
                    <span className="font-bold text-white">{hoveredComponent.metrics[1]?.value} {hoveredComponent.metrics[1]?.unit}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[9px] font-mono text-sky-400">
                  <span>Click node to inspect</span>
                  <ChevronRight className="w-3 h-3 text-sky-400 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* DOCKED SCADA DETAIL INSPECTOR (OPENS ON RIGHT SIDE)      */}
      {/* Sits alongside diagram (Non-occluding, diagram resizes)  */}
      {/* ======================================================== */}
      {isDrawerOpen && (
        <aside
          style={{ width: `${drawerWidth}px` }}
          className={`shrink-0 h-full bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col overflow-hidden relative ${
            isResizing ? 'select-none transition-none' : 'transition-[width] duration-75 animate-in slide-in-from-right'
          }`}
        >
          {/* Draggable Resize Handle on Left Edge */}
          <div
            onMouseDown={startResizing}
            onDoubleClick={() => setDrawerWidth(420)}
            className={`absolute top-0 bottom-0 left-0 w-3 -ml-1.5 cursor-col-resize z-40 flex items-center justify-center transition-colors group ${
              isResizing ? 'bg-sky-500/30' : 'hover:bg-sky-400/20'
            }`}
            title="Drag left/right to resize detail inspector (Double-click to reset 420px)"
          >
            <div className={`w-1 h-12 rounded-full transition-colors ${
              isResizing ? 'bg-sky-600 scale-y-110 shadow-sm' : 'bg-slate-300 group-hover:bg-sky-500'
            }`} />
          </div>
          
          {/* Drawer Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-600 text-white shadow-2xs">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[9.5px] font-mono uppercase font-bold text-sky-700 block tracking-wider">
                  {current.category}
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-snug">
                  {current.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline" title="Current panel width (Drag left handle to resize)">
                {drawerWidth}px
              </span>
              <button
                onClick={handleExportShiftLog}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-sky-700 border border-slate-200 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Download CSV Shift Telemetry Report"
              >
                <Download className="w-3 h-3 text-sky-600" />
                <span>CSV</span>
              </button>
              <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● OPTIMAL
              </span>
              <button
                id="close-inspector-btn"
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close Inspector & Deselect Component"
                aria-label="Close Inspector and Deselect Component"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            
            {/* 1. COMPONENT DIGITAL TWIN SIMULATION */}
            <div>
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
                Component Digital Twin Simulation
              </span>
              {renderSmallDigitalTwin(current.id)}
            </div>

            {/* 2. Primary KPI Hero Card (Accurate Engineering Metric) */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block">
                  {current.mainLabel}
                </span>
                <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {currentPrimaryValue}
                </div>
                <span className="text-[9.5px] text-emerald-400 font-mono mt-0.5 block">
                  &bull; Operating within safe supercritical envelope
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 text-sky-300">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

            {/* 3. 6 High-Precision Telemetry Gauges */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                <h4 className="text-[10.5px] font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  Live Instrumentation Gauges
                </h4>
                <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  6 SENSORS ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {getLiveMetrics(current, liveMatch).map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors flex flex-col justify-between">
                    <span className="text-[8.5px] font-mono uppercase text-slate-400 font-bold block truncate">
                      {m.label}
                    </span>
                    <div className="my-0.5 flex items-baseline gap-1">
                      <span className="text-xs font-black font-mono text-slate-900">
                        {m.value}
                      </span>
                      {m.unit && (
                        <span className="text-[8.5px] font-mono font-bold text-slate-500">
                          {m.unit}
                        </span>
                      )}
                    </div>
                    {m.note && (
                      <span className="text-[8.5px] text-emerald-600 font-semibold font-mono truncate block">
                        &bull; {m.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Real-Time Operational Stability Trend Curve */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  <h4 className="text-[10.5px] font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Operational Stability Curve
                  </h4>
                </div>
                <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  LIVE STREAM
                </span>
              </div>

              <div className="h-28 w-full min-h-[110px] bg-slate-50/50 rounded-xl p-1.5 border border-slate-200/80">
                <ResponsiveContainer width="100%" height={100} minWidth={0} minHeight={100}>
                  <LineChart data={trendPoints} margin={{ top: 6, right: 12, left: -6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94a3b8" 
                      fontSize={8.5} 
                      tickLine={false} 
                      minTickGap={25}
                    />
                    <YAxis 
                      domain={yDomain} 
                      stroke="#94a3b8" 
                      fontSize={8.5} 
                      tickLine={false} 
                      width={38}
                      tickFormatter={(v) => Math.round(v).toString()}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                      }}
                      formatter={(val: any) => [`${val} ${getMetricUnit(activeId)}`, 'Primary Telemetry']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#0284c7' }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Plant Physics & Cycle Function */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[10.5px]">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Thermodynamic Cycle Function:</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                {current.howItWorks}
              </p>
              <div className="pt-1.5 border-t border-slate-200/70 text-[9.5px] font-mono text-slate-600">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline mr-1" />
                <strong>Trip Interlock:</strong> {current.safetyLimits}
              </div>
            </div>

            {/* 6. Operator Control & Setpoint Simulation Widget */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-slate-800 uppercase flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                  Operator Control & Setpoint
                </span>
                {/* Mode selector */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[9px] font-mono">
                  {(['AUTO', 'CASCADE', 'MANUAL'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setControlMode(mode)}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                        controlMode === mode
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setpoint Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-600">
                  <span>Governor / Output Setpoint:</span>
                  <span className="font-bold text-sky-700">{setpointPercent.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="110"
                  step="0.5"
                  value={setpointPercent}
                  disabled={controlMode !== 'MANUAL'}
                  onChange={(e) => setSetpointPercent(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-400">
                  <span>50% Min Load</span>
                  <span>100% Nominal (Base)</span>
                  <span>110% Peak MCR</span>
                </div>
              </div>

              {/* Emergency Trip Test Simulator */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsTripTestActive(!isTripTestActive);
                    setIsAlarmAcknowledged(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isTripTestActive
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {isTripTestActive ? 'Trip Test Active' : 'Simulate Interlock Trip'}
                </button>

                {isTripTestActive && (
                  <button
                    onClick={() => setIsAlarmAcknowledged(true)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      isAlarmAcknowledged
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-red-500 hover:bg-red-600 text-white animate-bounce'
                    }`}
                  >
                    {isAlarmAcknowledged ? 'Alarm Acked' : 'Ack SCADA Alarm'}
                  </button>
                )}
              </div>

              {isTripTestActive && (
                <div className={`p-2 rounded-lg text-[9px] font-mono border transition-all ${
                  isAlarmAcknowledged
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  ⚠️ <strong>INTERLOCK TRIP ACTIVE:</strong> {current.safetyLimits}
                </div>
              )}
            </div>

          </div>

          {/* Drawer Footer Status */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[9.5px] font-mono text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              SCADA Instrumentation Synced
            </span>
            <span className="text-sky-700 font-bold">
              Health Score: 99.8%
            </span>
          </div>

        </aside>
      )}

    </div>
  );
};
