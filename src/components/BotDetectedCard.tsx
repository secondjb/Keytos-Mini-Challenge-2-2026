import React from 'react';
import type { SecurityViolation } from '../hooks/useSecurityEngine';
import { ShieldAlert, RotateCcw, AlertTriangle } from 'lucide-react';

interface BotDetectedCardProps {
  violation: SecurityViolation | null;
  onReset: () => void;
}

export const BotDetectedCard: React.FC<BotDetectedCardProps> = ({
  violation,
  onReset,
}) => {
  return (
    <div className="p-5 sm:p-6 bg-red-950/60 border border-red-500/70 rounded-2xl space-y-4 shadow-2xl shadow-red-950/80 animate-shake">
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-red-300 font-mono tracking-wide uppercase">
              Access Denied: Bot Pattern Detected
            </h3>
          </div>
          <p className="text-xs font-semibold text-red-200">
            {violation?.message || 'Automated agent pattern detected.'}
          </p>
          {violation?.details && (
            <div className="mt-2 text-[11px] font-mono text-red-300/90 bg-red-900/30 p-2.5 rounded-lg border border-red-800/40 break-words">
              <span className="font-bold text-red-400 block mb-0.5">Telemetry Violation:</span>
              {violation.details}
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-950/80 border border-red-900/60 rounded-xl p-3 text-xs text-red-300/80 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span>Physical human interaction required. Synthetic scripts or macros cannot proceed.</span>
      </div>

      <div className="pt-1 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/70 hover:bg-red-800/90 active:scale-95 text-red-100 text-xs font-mono font-semibold rounded-xl border border-red-600 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Challenge</span>
        </button>
      </div>
    </div>
  );
};

export default BotDetectedCard;
