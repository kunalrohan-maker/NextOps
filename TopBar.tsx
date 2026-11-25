import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  LogOut, 
  Activity, 
  Share2, 
  Check
} from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
  refreshInterval: number | null;
  onRefreshIntervalChange: (interval: number | null) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  onlineCount: number;
  totalCount: number;
  lastUpdate: string;
  selectedDeviceId?: string;
  onSelectComponent?: (id: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onLogout,
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  isRefreshing,
  lastUpdate,
  selectedDeviceId = '',
  onSelectComponent
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleLogoClick = () => {
    // If a device is currently selected, clicking logo clears the selection to root '/'
    if (selectedDeviceId) {
      onSelectComponent?.('');
    }
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="w-full px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Plant Identifier (Clicking resets to Home '/') */}
          <div 
            id="brand-logo-home"
            onClick={handleLogoClick}
            className="flex items-center gap-3.5 min-w-max cursor-pointer select-none group"
            title="NextOps Home (Digital Twin Overview)"
          >
            <img 
              src="/logo.png" 
              alt="NextOps Industrial" 
              className="h-11 sm:h-13 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3.5 py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-tight font-sans">
                  Thermal Power Generation
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Unit 1 &bull; 660 MW Live
                </span>
              </div>
              <span className="text-[10.5px] font-medium text-slate-500 font-mono tracking-wide mt-0.5">
                AI-Powered Telemetry &bull; High-Fidelity Digital Twin
              </span>
            </div>
          </div>

          {/* Controls: Share Link, Polling Sync, Refresh, Logout */}
          <div className="flex items-center gap-3">
            {/* Share View / URL Deep-Link Button */}
            <button
              id="share-url-btn"
              onClick={handleCopyLink}
              title="Copy shareable link for this exact view (e.g. / or /device/CHIMNEY-01)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>URL Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Share URL</span>
                </>
              )}
            </button>

            {/* Live Polling Status */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>Synced: <strong className="text-slate-800">{lastUpdate}</strong></span>
            </div>

            {/* Refresh Interval Selector */}
            <select
              value={refreshInterval === null ? 'manual' : refreshInterval}
              onChange={(e) => {
                const val = e.target.value;
                onRefreshIntervalChange(val === 'manual' ? null : Number(val));
              }}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer focus:outline-hidden"
            >
              <option value="2000">2s Live</option>
              <option value="5000">5s Live</option>
              <option value="15000">15s</option>
              <option value="manual">Manual</option>
            </select>

            {/* Manual Refresh Button */}
            <button
              onClick={onManualRefresh}
              disabled={isRefreshing}
              title="Refresh Telemetry"
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopBar;
