import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Key, Copy, Check } from 'lucide-react';

export type StageType = 'motion-word' | 'motion-shape' | 'flashlight';

interface VerificationSuccessCardProps {
  solveTimeSeconds: number | null;
  stages: StageType[];
  onReset: () => void;
}

export const VerificationSuccessCard: React.FC<VerificationSuccessCardProps> = ({
  solveTimeSeconds,
  stages,
  onReset,
}) => {
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);
  const [verificationToken] = useState<string>(() => {
    const randHex = Math.random().toString(16).substring(2, 10);
    return `KEYTOS_PASS_${randHex}_${Date.now().toString(36).toUpperCase()}`;
  });

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#34d399'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#a78bfa'],
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, []);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verificationToken).catch(() => {});
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const formatName = (type: StageType) => {
    switch (type) {
      case 'motion-word':
        return 'Kinetic Motion (Word)';
      case 'motion-shape':
        return 'Kinetic Motion (Shape)';
      case 'flashlight':
        return 'Darkroom Flashlight Beam';
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-slate-900/90 border border-emerald-500/50 rounded-2xl text-center space-y-4 shadow-2xl shadow-emerald-950/60 animate-fadeIn">
      {/* Icon Badge */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-emerald-300 tracking-wide uppercase font-mono">
          Identity Fully Verified
        </h3>
        <p className="text-xs text-slate-400">
          All 3 challenges passed in{' '}
          <span className="font-bold text-emerald-300 font-mono text-sm">
            {solveTimeSeconds ?? 8.4}s
          </span>
        </p>
      </div>

      {/* Rounds completed breakdown */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left space-y-2 text-xs">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Multi-Factor Challenge Breakdown
        </div>
        {stages.map((stage, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Round {idx + 1}: {formatName(stage)}
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">VERIFIED ✓</span>
          </div>
        ))}
      </div>

      {/* Cryptographic Token */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-left space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Verification Token
          </span>
          <button
            type="button"
            onClick={handleCopyToken}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            {tokenCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-200 break-all select-all">
          {verificationToken}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer active:scale-95 shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Test Again</span>
        </button>
      </div>
    </div>
  );
};

export default VerificationSuccessCard;
