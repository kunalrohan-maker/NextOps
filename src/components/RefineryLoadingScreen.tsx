import React, { useState, useEffect } from 'react';

interface RefineryLoadingScreenProps {
  onComplete: () => void;
  targetPath?: string;
}

const STEPS = [
  { pct: 25, label: 'Connecting to plant telemetry gateway...' },
  { pct: 60, label: 'Synchronizing digital twin instrumentation...' },
  { pct: 90, label: 'Verifying plant interlocks & live bus...' },
  { pct: 100, label: 'Ready. Entering control console...' }
];

export const RefineryLoadingScreen: React.FC<RefineryLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('Connecting to plant telemetry gateway...');

  useEffect(() => {
    // Fast, responsive 1.8 second initialization
    const totalDuration = 1800;
    const intervalTime = 30;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + increment, 100);

        // Update status label smoothly
        if (next < 30) {
          setStepLabel(STEPS[0].label);
        } else if (next < 65) {
          setStepLabel(STEPS[1].label);
        } else if (next < 92) {
          setStepLabel(STEPS[2].label);
        } else {
          setStepLabel(STEPS[3].label);
        }

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 250);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-900 selection:bg-sky-500 selection:text-white relative">
      
      {/* Background industrial grid accent */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #0284c7 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-lg relative z-10 flex flex-col items-center">
        
        {/* 1. OUTSIDE THE BOX: Refined Logo & Tagline */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="NextOps Industrial" 
            className="w-52 sm:w-60 h-auto object-contain mb-3 animate-pulse"
          />
          <h1 className="text-base sm:text-lg font-bold text-slate-800 max-w-md text-center leading-snug tracking-tight">
            Thermal Power Plant Monitoring with AI
          </h1>
          <p className="text-xs sm:text-[13px] font-mono font-medium text-slate-500 max-w-sm text-center leading-normal mt-1.5">
            Synchronizing plant telemetry mesh &amp; real-time instrumentation...
          </p>
        </div>

        {/* 2. THE LOADING CARD */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-7 sm:p-8">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Plant System Boot
            </span>
            <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Minimal Progress Bar */}
          <div className="w-full mb-4">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 rounded-full transition-all duration-75 ease-out shadow-xs"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
          </div>

          {/* Status text */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="truncate pr-2">{stepLabel}</span>
            <button
              onClick={onComplete}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-700 underline transition-colors cursor-pointer shrink-0 ml-2"
            >
              Skip
            </button>
          </div>

        </div>

        {/* 3. OUTSIDE THE BOX: Clean Footer Branding */}
        <div className="mt-8 text-center flex flex-col items-center gap-2 text-[11px] text-slate-500">
          <a
            href="https://devopsinsiders.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-pointer group"
            title="Visit DevOps Insiders (devopsinsiders.com)"
          >
            <span className="font-sans font-medium text-slate-500">Made with</span>
            <span className="text-red-500 text-[12px] leading-none animate-pulse">❤️</span>
            <span className="font-sans font-medium text-slate-500">at</span>
            <span className="font-bold text-slate-800 group-hover:text-sky-600 underline-offset-2 hover:underline transition-colors">
              DevOps Insiders
            </span>
          </a>
        </div>

      </div>

    </div>
  );
};

export default RefineryLoadingScreen;
