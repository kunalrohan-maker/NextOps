import React, { useState } from 'react';
import { 
  Flame, 
  Gauge, 
  RotateCw, 
  Snowflake, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Droplets
} from 'lucide-react';

interface CycleStage {
  id: string;
  stepNumber: string;
  name: string;
  subtitle: string;
  temperature: string;
  pressure: string;
  outputOrFlow: string;
  story: string;
  icon: any;
  color: string;
}

const STAGES: CycleStage[] = [
  {
    id: 'furnace',
    stepNumber: '01',
    name: 'Coal Furnaces',
    subtitle: 'Primary Heat Source',
    temperature: '1,150 °C',
    pressure: '1.02 bar',
    outputOrFlow: '320 T/h Coal Burned',
    story: 'High-grade pulverized coal is fed into the furnace chambers, creating a continuous 1,150°C fireball that provides the intense heat required to boil water.',
    icon: Flame,
    color: 'amber'
  },
  {
    id: 'boiler',
    stepNumber: '02',
    name: 'Steam Boilers',
    subtitle: 'Superheated Vapor Generation',
    temperature: '542 °C',
    pressure: '175.0 bar',
    outputOrFlow: '460 m³/h Steam Flow',
    story: 'Pure water flows through thousands of boiler tubes directly around the furnace flame, rapidly transforming into high-pressure superheated steam at 175 bar.',
    icon: Gauge,
    color: 'sky'
  },
  {
    id: 'turbine',
    stepNumber: '03',
    name: 'Power Turbines & Generator',
    subtitle: 'Electricity Generation',
    temperature: '112 °C (Exhaust)',
    pressure: '18.0 bar',
    outputOrFlow: '1,250 MW (1.2M Homes)',
    story: 'The extreme steam pressure expands through precision turbine blades spinning at 3,000 RPM. This drives massive electromagnetic generators delivering 1,250 MW to the electrical grid.',
    icon: RotateCw,
    color: 'indigo'
  },
  {
    id: 'cooling',
    stepNumber: '04',
    name: 'Cooling Towers',
    subtitle: 'Water Condenser & Recycler',
    temperature: '28.5 °C',
    pressure: '4.2 bar',
    outputOrFlow: '2,400 m³/h Recirculation',
    story: 'After spinning the turbines, the spent steam enters cooling towers where it is condensed back into pure water at 28°C and pumped back to the boiler in a continuous closed loop.',
    icon: Snowflake,
    color: 'teal'
  }
];

export const PlantSchematic: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('turbine');

  const current = STAGES.find(s => s.id === activeStageId) || STAGES[2];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            How The Power Station Works
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Closed-Loop Thermal Steam Cycle
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coal is burned in Furnaces &rarr; Boils water into Steam &rarr; Spins Turbines to generate Electricity &rarr; Cooling Towers recycle water.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <Zap className="w-4 h-4 text-sky-600" />
          <span>Delivering 1,250 MW to Grid</span>
        </div>
      </div>

      {/* 4-Step Interactive Visual Flow */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = activeStageId === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      STEP {stage.stepNumber}
                    </span>
                    <div
                      className={`p-2 rounded-xl ${
                        stage.color === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : stage.color === 'sky'
                          ? 'bg-sky-100 text-sky-700'
                          : stage.color === 'indigo'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{stage.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{stage.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Temp:</span>
                    <span className="font-bold text-slate-900">{stage.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Pressure:</span>
                    <span className="font-bold text-slate-900">{stage.pressure}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Story Connection Bar */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 font-bold text-amber-700">
            <Flame className="w-4 h-4" /> 1. Heat Created
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <span className="flex items-center gap-1.5 font-bold text-sky-700">
            <Gauge className="w-4 h-4" /> 2. Steam Pressurized
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <span className="flex items-center gap-1.5 font-bold text-indigo-700">
            <Zap className="w-4 h-4" /> 3. Electricity Generated
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <span className="flex items-center gap-1.5 font-bold text-teal-700">
            <Droplets className="w-4 h-4" /> 4. Water Recycled
          </span>
        </div>
      </div>

      {/* Selected Step Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-sky-600">
                Step {current.stepNumber} In Detail
              </span>
              <h3 className="text-lg font-bold text-slate-900">{current.name}</h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Key Performance Output</span>
            <span className="text-base font-bold font-mono text-slate-900">{current.outputOrFlow}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
          {current.story}
        </p>

        {/* 3 Metric Pills */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Operating Temperature</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{current.temperature}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Working Pressure</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{current.pressure}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Output Delivery</span>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">{current.outputOrFlow}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
