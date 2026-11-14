import React, { useState } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface CaptchaControlsProps {
  timeLeft: number;
  totalTime: number;
  onVerify: (answer: string) => boolean;
  onCycleWord: () => void;
  disabled: boolean;
}

export const CaptchaControls: React.FC<CaptchaControlsProps> = ({
  timeLeft,
  totalTime,
  onVerify,
  onCycleWord,
  disabled,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [isWrong, setIsWrong] = useState<boolean>(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || !inputVal.trim()) return;

    const success = onVerify(inputVal);
    if (!success) {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 800);
    } else {
      setInputVal('');
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const strokeDashoffset = 100 - progressPercent;

  return (
    <form 
      onSubmit={handleSubmit} 
      className="taco_dispatch_matrix mt-4 space-y-2.5"
      data-tortilla="corn_fresh"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {/* Obfuscated input field with joke class & attribute */}
          <input
            id="burrito_crumb_slot"
            name="guacamole_token"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.toUpperCase())}
            placeholder="Type hidden word..."
            disabled={disabled}
            maxLength={12}
            autoComplete="off"
            spellCheck="false"
            data-salsa="mild"
            className={`avocado_seed_input w-full px-4 py-2.5 bg-slate-900 border text-slate-100 placeholder-slate-500 rounded-lg font-mono text-sm tracking-widest focus:outline-none transition-all ${
              isWrong
                ? 'border-red-500 bg-red-950/20 ring-2 ring-red-500/30 animate-shake'
                : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {/* Countdown indicator badge */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-xs font-mono pointer-events-none">
            <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${timeLeft <= 3 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-300`}
                strokeDasharray="100, 100"
                strokeDashoffset={strokeDashoffset}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`${timeLeft <= 3 ? 'text-amber-400 font-bold' : 'text-slate-400'} text-xs w-4`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="btn_launch_cheese_probe"
          type="submit"
          disabled={disabled || !inputVal.trim()}
          data-cheddar="extra_sharp"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Verify</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
        <button
          id="btn_shuffle_potato"
          type="button"
          onClick={onCycleWord}
          disabled={disabled}
          className="flex items-center gap-1 hover:text-slate-300 transition disabled:opacity-40 cursor-pointer"
          title="Cycle to next word"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Word</span>
        </button>

        <span className="text-[11px] text-slate-600 font-mono">v3.1-entropy</span>
      </div>
    </form>
  );
};
