import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { InteractivePlantSchematic } from './components/InteractivePlantSchematic';
import { IndustrialCopilot } from './components/IndustrialCopilot';
import { Login } from './components/Login';
import { RefineryLoadingScreen } from './components/RefineryLoadingScreen';
import { API_ENDPOINTS } from './config/api';
import { 
  Zap, 
  Flame, 
  ShieldCheck, 
  TrendingUp 
} from 'lucide-react';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('nextops_auth') === 'true' || localStorage.getItem('axion_auth') === 'true';
  });

  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [devices, setDevices] = useState<any[]>([]);

  // Default to empty string on root "/" so no component is selected
  // If user opens deep link e.g. /device/CHIMNEY-01 directly, read from path
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if ((pathParts[0] === 'device' || pathParts[0] === 'dashboard') && pathParts[1]) {
      return pathParts[1].toUpperCase();
    }
    return '';
  });

  const [selectionTrigger, setSelectionTrigger] = useState<number>(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    return ((pathParts[0] === 'device' || pathParts[0] === 'dashboard') && pathParts[1]) ? 1 : 0;
  });

  const [refreshInterval, setRefreshInterval] = useState<number | null>(5000);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Connecting...');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerWidth, setDrawerWidth] = useState<number>(420);

  // Sync selectedDeviceId with URL path on direct navigation or browser back/forward
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if ((pathParts[0] === 'device' || pathParts[0] === 'dashboard') && pathParts[1]) {
      const urlDeviceId = pathParts[1].toUpperCase();
      setSelectedDeviceId(prev => {
        if (prev !== urlDeviceId) {
          setSelectionTrigger(t => t + 1);
          return urlDeviceId;
        }
        return prev;
      });
    } else if (location.pathname === '/' || location.pathname === '/device' || location.pathname === '/dashboard') {
      setSelectedDeviceId(prev => {
        if (prev !== '') {
          setSelectionTrigger(0);
          return '';
        }
        return prev;
      });
    }
  }, [location.pathname]);

  const handleSelectComponent = useCallback((id: string) => {
    if (!id) {
      setSelectedDeviceId('');
      setSelectionTrigger(0);
      navigate('/');
      return;
    }

    const cleanId = id.toUpperCase();
    setSelectedDeviceId(cleanId);
    setSelectionTrigger(prev => prev + 1);
    navigate(`/device/${cleanId}`);
  }, [navigate]);

  const handleLoginTrigger = () => {
    // Begin the immersive refinery boot sequence
    setIsBooting(true);
  };

  const handleBootComplete = () => {
    localStorage.setItem('nextops_auth', 'true');
    setIsBooting(false);
    setIsLoggedIn(true);
    // After boot, navigate to the main overview with nothing selected
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('nextops_auth');
    localStorage.removeItem('axion_auth');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Live polling from https://api.nextops.live
  const fetchTelemetry = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(API_ENDPOINTS.DEVICES);
      if (res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData) && liveData.length > 0) {
          setDevices(liveData);
        }
      }
      setLastUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch live telemetry from API:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchTelemetry();
    if (refreshInterval !== null) {
      const interval = setInterval(fetchTelemetry, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTelemetry, refreshInterval]);

  // If in the post-login loading sequence, show the Refinery filling up animation
  if (isBooting) {
    return <RefineryLoadingScreen onComplete={handleBootComplete} />;
  }

  // Key primary metrics for top executive SCADA ribbon
  const genDevice = devices.find(d => d.device_id === 'GENERATOR-01');
  const boilerDevice = devices.find(d => d.device_id === 'BOILER-01');
  const genPower = genDevice?.flow_rate ? `${Number(genDevice.flow_rate).toFixed(1)} MW` : '660.0 MW';
  const steamTemp = boilerDevice?.temperature ? `${Number(boilerDevice.temperature).toFixed(1)}°C` : '542.0°C';
  const steamPressure = boilerDevice?.pressure ? `${Number(boilerDevice.pressure).toFixed(1)} bar` : '175.4 bar';

  return (
    <Routes>
      {/* ============================== */}
      {/* LOGIN ROUTE — /login           */}
      {/* ============================== */}
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/" replace />
            : <Login onLogin={handleLoginTrigger} />
        }
      />

      {/* ============================== */}
      {/* ALL PROTECTED APP ROUTES       */}
      {/* ============================== */}
      <Route
        path="/*"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : (
              <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-sky-500 selection:text-white">
                {/* Top Header Navigation with Share Link, Polling Sync & Controls */}
                <TopBar
                  onLogout={handleLogout}
                  refreshInterval={refreshInterval}
                  onRefreshIntervalChange={setRefreshInterval}
                  onManualRefresh={fetchTelemetry}
                  isRefreshing={isRefreshing}
                  onlineCount={devices.length}
                  totalCount={devices.length}
                  lastUpdate={lastUpdate}
                  selectedDeviceId={selectedDeviceId}
                  onSelectComponent={handleSelectComponent}
                />

                {/* Executive SCADA KPI Ribbon (4 High-Density Industrial Cards) */}
                <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 grid grid-cols-2 md:grid-cols-4 gap-2.5 shadow-2xs z-20">
                  
                  {/* KPI 1: Net Generation */}
                  <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-2xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                          Net Generation
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black font-mono text-slate-900">{genPower}</span>
                        <span className="text-[9.5px] font-mono text-emerald-600 font-bold">100% Base Load</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 2: Supercritical Steam */}
                  <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-sky-600 text-white shadow-2xs">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Main Steam Header
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black font-mono text-slate-900">{steamTemp}</span>
                        <span className="text-[9.5px] font-mono text-sky-700 font-bold">&bull; {steamPressure}</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 3: Thermal Cycle Efficiency */}
                  <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-amber-500 text-white shadow-2xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Cycle Efficiency
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black font-mono text-slate-900">41.8%</span>
                        <span className="text-[9.5px] font-mono text-amber-700 font-bold">&bull; 8,140 kJ/kWh</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 4: Unit Health & Stability */}
                  <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Unit Health & Grid Sync
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black font-mono text-slate-900">99.8%</span>
                        <span className="text-[9.5px] font-mono text-indigo-700 font-bold">&bull; 50.00 Hz Sync</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Main Workspace Router: Digital Twin & Device Deep Links */}
                <div className="flex-1 flex overflow-hidden min-h-0 relative">
                  <Routes>
                    {/* Root Home Route: Digital Twin with NOTHING selected */}
                    <Route 
                      path="/" 
                      element={
                        <PlantSchematicView 
                          devices={devices}
                          selectedDeviceId={selectedDeviceId}
                          selectionTrigger={selectionTrigger}
                          onSelectComponent={handleSelectComponent}
                          onDrawerStateChange={(open, width) => {
                            setIsDrawerOpen(open);
                            setDrawerWidth(width);
                          }}
                        />
                      } 
                    />

                    {/* Dedicated Device Deep-Link Route: /device/:deviceId (e.g. /device/CHIMNEY-01) */}
                    <Route 
                      path="/device/:deviceId" 
                      element={
                        <PlantSchematicView 
                          devices={devices}
                          selectedDeviceId={selectedDeviceId}
                          selectionTrigger={selectionTrigger}
                          onSelectComponent={handleSelectComponent}
                          onDrawerStateChange={(open, width) => {
                            setIsDrawerOpen(open);
                            setDrawerWidth(width);
                          }}
                        />
                      } 
                    />

                    {/* /device without parameter redirects to root overview */}
                    <Route path="/device" element={<Navigate to="/" replace />} />

                    {/* Dashboard alias routes (for backward compatibility) */}
                    <Route 
                      path="/dashboard/:deviceId" 
                      element={
                        <PlantSchematicView 
                          devices={devices}
                          selectedDeviceId={selectedDeviceId}
                          selectionTrigger={selectionTrigger}
                          onSelectComponent={handleSelectComponent}
                          onDrawerStateChange={(open, width) => {
                            setIsDrawerOpen(open);
                            setDrawerWidth(width);
                          }}
                        />
                      } 
                    />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />

                    {/* Fallback all other routes to home */}
                    <Route 
                      path="*" 
                      element={<Navigate to="/" replace />} 
                    />
                  </Routes>
                </div>

                {/* NextOps Industrial Copilot AI Assistant */}
                <IndustrialCopilot
                  selectedComponentId={selectedDeviceId}
                  onSelectComponent={handleSelectComponent}
                  liveDevices={devices}
                  isDrawerOpen={isDrawerOpen}
                  drawerWidth={drawerWidth}
                />
              </div>
            )
        }
      />
    </Routes>
  );
}

// Subcomponent: Main Digital Twin Layout with Left Sidebar + Center Schematic
interface PlantSchematicViewProps {
  devices: any[];
  selectedDeviceId: string;
  selectionTrigger: number;
  onSelectComponent: (id: string) => void;
  onDrawerStateChange: (open: boolean, width: number) => void;
}

function PlantSchematicView({
  devices,
  selectedDeviceId,
  selectionTrigger,
  onSelectComponent,
  onDrawerStateChange
}: PlantSchematicViewProps) {

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 relative w-full h-full">
      {/* Left Plant Systems Explorer */}
      <Sidebar
        selectedComponentId={selectedDeviceId}
        onSelectComponent={onSelectComponent}
        liveDevices={devices}
      />

      {/* Centerpiece Digital Twin Canvas */}
      <main className="flex-1 h-full overflow-hidden relative min-w-0">
        <InteractivePlantSchematic
          selectedComponentId={selectedDeviceId}
          selectionTrigger={selectionTrigger}
          onSelectComponent={onSelectComponent}
          liveDevices={devices}
          onDrawerStateChange={onDrawerStateChange}
        />
      </main>
    </div>
  );
}

export default App;
