import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Bot,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('chief.engineer@nextops.live');
  const [password, setPassword] = useState('Supercritical2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide valid operator credentials');
      return;
    }
    setError('');
    onLogin();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/80 flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-slate-900 selection:bg-sky-500 selection:text-white relative">
      
      {/* Background Industrial Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #0284c7 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Executive Split Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-300/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 my-auto">
        
        {/* =========================================================================
            LEFT COLUMN: Agentic AI Platform Showcase & Plant Intelligence
            ========================================================================= */}
        <div className="lg:col-span-7 bg-linear-to-b from-slate-50/70 via-white to-sky-50/30 p-6 sm:p-8 lg:p-9 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between relative">
          
          <div>
            {/* Logo */}
            <div className="mb-4">
              <img 
                src="/logo.png" 
                alt="NextOps Industrial" 
                className="w-44 sm:w-50 md:w-54 h-auto object-contain drop-shadow-2xs"
              />
            </div>

            {/* Agentic AI Platform Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100/70 border border-sky-200 text-sky-800 text-[11px] font-mono font-bold mb-3">
              <Sparkles className="w-3 h-3 text-sky-600 animate-pulse" />
              <span>AGENTIC AI PLATFORM &bull; THERMAL POWER GENERATION</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Autonomous Multi-Agent Intelligence for Thermal Power Plants
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 max-w-lg font-normal">
              Empowering 660 MW power generation with collaborative AI agents that continuously reason, monitor thermodynamic telemetry, and autonomously optimize plant heat-rate.
            </p>

            {/* Agentic Capabilities Grid */}
            <div className="mt-5 space-y-2.5 max-w-lg">
              
              <div className="p-3 rounded-2xl bg-white/95 border border-slate-200/80 hover:border-sky-300 hover:shadow-xs transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Autonomous Reasoning Agents
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      12 Agents Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Specialized agents orchestrate boiler combustion, steam headers, and 3,000 RPM turbine synchronization.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Predictive Anomaly Resolution
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                      Closed-Loop
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Self-directed multi-variable analysis flags thermal anomalies hours before safety thresholds are exceeded.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Real-Time Digital Twin Mesh
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                      Sub-10ms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Sub-second KKS instrumentation telemetry synchronized across furnace, superheater, and electric generator.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Left Footer: Live Status & DevOps Insiders Branding */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <a
              href="https://devopsinsiders.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-sky-600 transition-colors cursor-pointer group"
              title="Visit DevOps Insiders (devopsinsiders.com)"
            >
              <span className="font-sans font-medium text-slate-500">Made with</span>
              <span className="text-red-500 text-[13px] leading-none animate-pulse">❤️</span>
              <span className="font-sans font-medium text-slate-500">at</span>
              <span className="font-bold text-slate-900 group-hover:text-sky-600 underline-offset-2 hover:underline transition-colors">
                DevOps Insiders
              </span>
            </a>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Unit 1 &bull; 660 MW Live Mesh</span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: Operator Sign-In Console
            ========================================================================= */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
          
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-sky-600 animate-pulse" />
                  Agentic Control Gateway
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Operator Sign-In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Authenticate to interact with autonomous agents and monitor live power plant telemetry.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator Email / ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@nextops.live"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Security Passkey
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    AES-256
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg shadow-sky-600/20 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Authenticate &amp; Enter Console</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

          </div>

          {/* Security Compliance Badges */}
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-center text-[10.5px] font-mono text-slate-400 flex items-center justify-center gap-2">
            <span>TLS 1.3 mTLS</span>
            <span>&bull;</span>
            <span>IEC 62443 Certified</span>
            <span>&bull;</span>
            <span>Zero-Trust Architecture</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
