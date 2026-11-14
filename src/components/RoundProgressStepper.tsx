import React from 'react';
import { Sparkles, Eye, ShieldCheck, Flame } from 'lucide-react';

interface RoundProgressStepperProps {
  currentRound: 1 | 2;
  round1Type: 'motion' | 'flashlight';
  round2Type: 'motion' | 'flashlight';
  round1Complete: boolean;
  round2Complete: boolean;
}

export const RoundProgressStepper: React.FC<RoundProgressStepperProps> = ({
  currentRound,
  round1Type,
  round2Type,
  round1Complete,
  round2Complete,
}) => {
  const getRoundLabel = (type: 'motion' | 'flashlight') => {
    return type === 'motion' ? 'Kinetic Motion' : 'Darkroom Flashlight';
  };

  const getRoundIcon = (type: 'motion' | 'flashlight') => {
    return type === 'motion' ? <Flame className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />;
  };

  return (
    <div className="w-full space-y-2">
      {/* Top Header bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Dual-Entropy Security Check</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
          <Sparkles className="w-3 h-3" />
          <span>Round {currentRound} of 2</span>
        </div>
      </div>

      {/* Round Stepper Badges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Round 1 Badge */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            round1Complete
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-medium'
              : currentRound === 1
              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10'
              : 'bg-slate-950/50 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                round1Complete
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : currentRound === 1
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <div className="flex items-center gap-1.5">
              {getRoundIcon(round1Type)}
              <span className="truncate">{getRoundLabel(round1Type)}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono">
            {round1Complete ? 'PASSED' : currentRound === 1 ? 'ACTIVE' : 'QUEUED'}
          </span>
        </div>

        {/* Round 2 Badge */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            round2Complete
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-medium'
              : currentRound === 2
              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10'
              : 'bg-slate-950/50 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                round2Complete
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : currentRound === 2
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <div className="flex items-center gap-1.5">
              {getRoundIcon(round2Type)}
              <span className="truncate">{getRoundLabel(round2Type)}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono">
            {round2Complete ? 'PASSED' : currentRound === 2 ? 'ACTIVE' : 'LOCKED'}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{
            width: round2Complete ? '100%' : round1Complete ? '50%' : '15%',
          }}
        />
      </div>
    </div>
  );
};

export default RoundProgressStepper;
