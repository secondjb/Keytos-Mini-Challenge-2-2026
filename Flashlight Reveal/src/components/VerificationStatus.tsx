import React, { useEffect } from 'react';
import type { SecurityStatus, SecurityViolation } from '../hooks/useSecurityEngine';
import { ShieldAlert, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerificationStatusProps {
  status: SecurityStatus;
  violation: SecurityViolation | null;
  solveTimeSeconds: number | null;
  onReset: () => void;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  violation,
  solveTimeSeconds,
  onReset,
}) => {
  useEffect(() => {
    if (status === 'verified') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#3b82f6'],
      });
    }
  }, [status]);

  if (status === 'verified') {
    return (
      <div className="mb-3 p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center space-y-2 shadow-lg shadow-emerald-950/50 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-emerald-300 tracking-wide uppercase font-mono">
          Identity Verified
        </h3>
        <p className="text-xs text-emerald-200/80">
          Completed in <span className="font-bold text-emerald-300 font-mono">{solveTimeSeconds ?? 10}s</span>
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100 text-xs font-mono rounded-md border border-emerald-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'bot_detected') {
    return (
      <div className="mb-3 p-4 bg-red-950/60 border border-red-500/70 rounded-xl space-y-3 shadow-lg shadow-red-950/80 animate-shake">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
              <span>Access Denied: Bot Detected</span>
            </h3>
            <p className="text-xs font-semibold text-red-200">
              {violation?.message || 'Automated agent pattern detected.'}
            </p>
            {violation?.details && (
              <p className="text-[11px] font-mono text-red-300/80 bg-red-900/30 p-2 rounded border border-red-800/40">
                {violation.details}
              </p>
            )}
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs font-mono rounded-md border border-red-700/80 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
