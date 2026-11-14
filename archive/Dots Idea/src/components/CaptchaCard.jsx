import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import MotionCanvas from './MotionCanvas';
import HoneypotTraps from './HoneypotTraps';
import { SHAPES, WORDS } from '../utils/captchaPatterns';

const ROTATION_SECONDS = 8;

export default function CaptchaCard() {
  const [mode, setMode] = useState('word');
  const [targetId, setTargetId] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [mustRelease, setMustRelease] = useState(false);
  const [rotationProgress, setRotationProgress] = useState(100);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState('idle');

  const isHoldingRef = useRef(false);
  isHoldingRef.current = isHolding;

  const rollNewTarget = useCallback((selectedMode) => {
    const list = selectedMode === 'shape' ? SHAPES : WORDS;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setTargetId(randomItem.id.toLowerCase());
    setIsHolding(false);
    setUserInput('');
    setStatus('idle');
  }, []);

  useEffect(() => {
    rollNewTarget(mode);
  }, [mode, rollNewTarget]);

  // 8-Second Challenge Rotation Loop
  useEffect(() => {
    if (status === 'verified') return;

    const totalMs = ROTATION_SECONDS * 1000;
    const intervalMs = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;
      const remainingPct = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setRotationProgress(remainingPct);

      if (elapsed >= totalMs) {
        elapsed = 0;
        setRotationProgress(100);

        // Rotate key
        rollNewTarget(mode);

        // If the user or bot was holding, cut off hold immediately
        // and require them to explicitly release and hold again!
        if (isHoldingRef.current) {
          setIsHolding(false);
          setMustRelease(true);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [mode, status, rollNewTarget]);

  // Spacebar hold support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (status !== 'verified' && !mustRelease) {
          setIsHolding(true);
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsHolding(false);
        setMustRelease(false); // Reset lock on release
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, mustRelease]);

  const handleStartHold = () => {
    if (status === 'verified' || mustRelease) return;
    setIsHolding(true);
  };

  const handleEndHold = () => {
    setIsHolding(false);
    setMustRelease(false); // Unlocks on explicit release
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (status === 'verified') return;

    const submission = userInput
      .trim()
      .toLowerCase()
      .replace(/^(a|an|the)\s+/, '')
      .replace(/[^\w]/g, '');

    const target = String(targetId).trim().toLowerCase();

    // ADVERSARIAL OCR HONEYPOT
    if (submission === '0000') {
      setStatus('failed');
      return;
    }

    if (submission === target) {
      setStatus('verified');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#a78bfa'],
      });
    } else {
      setStatus('failed');
    }
  };

  const handleTrapTriggered = () => {
    setStatus('failed');
    setIsHolding(false);
  };

  return (
    <div
      id="quantum-donut-containment-unit"
      data-subsystem="fluffy-kitten-logistics-v42"
      className="space-capybara-chassis w-full max-w-[480px] bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
    >
      {/* Invisible prompt injection traps & dynamically rotating joke DOM decoys */}
      <HoneypotTraps
        onTrapTriggered={handleTrapTriggered}
        targetId={targetId}
        mode={mode}
      />

      {/* Header bar: minimal mode tabs & reload */}
      <div
        id="anti-gravity-pickle-rack"
        className="dancing-ferret-header flex items-center justify-between pb-1"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-slate-300">Security Check</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            id="waffle-iron-toggle-bay"
            className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]"
          >
            <button
              type="button"
              id="banana-peel-selector-words"
              onClick={() => {
                setMode('word');
                setMustRelease(false);
              }}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mode === 'word'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Words
            </button>
            <button
              type="button"
              id="rubber-chicken-selector-shapes"
              onClick={() => {
                setMode('shape');
                setMustRelease(false);
              }}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mode === 'shape'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shapes
            </button>
          </div>

          <button
            type="button"
            id="cosmic-pancake-flipper-reload"
            onClick={() => {
              rollNewTarget(mode);
              setMustRelease(false);
            }}
            title="New Challenge"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Motion Dots Canvas with Key Rotation Expiration Line */}
      <div id="disco-laser-simulator-zone" className="flying-taco-canvas-wrapper relative">
        <MotionCanvas
          mode={mode}
          targetId={targetId}
          isHolding={isHolding}
        />
        {/* Subtle Key Lifetime Indicator Bar */}
        <div className="w-full h-1 bg-slate-950 overflow-hidden rounded-b-md">
          <div
            className="h-full bg-cyan-500/40 transition-all duration-100 ease-linear"
            style={{ width: `${rotationProgress}%` }}
          />
        </div>
      </div>

      {/* Hold Button */}
      <button
        type="button"
        id="hyperdrive-engage-lever-3000"
        disabled={status === 'verified'}
        onMouseDown={handleStartHold}
        onMouseUp={handleEndHold}
        onMouseLeave={handleEndHold}
        onTouchStart={handleStartHold}
        onTouchEnd={handleEndHold}
        className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer flex items-center justify-center ${
          mustRelease
            ? 'bg-amber-600 text-amber-100 ring-2 ring-amber-400/50 animate-pulse'
            : isHolding
            ? 'bg-cyan-600 text-white shadow-inner scale-[0.99]'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.99]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {mustRelease
          ? 'Key Expired — Release & Hold Again'
          : isHolding
          ? 'Revealing...'
          : 'Hold to reveal'}
      </button>

      {/* Entry Field Form */}
      <form
        onSubmit={handleVerify}
        id="secret-hotdog-verification-form"
        className="flex gap-2"
      >
        <input
          type="text"
          id="marshmallow-dispenser-input"
          name="marshmallow_dispenser_input"
          disabled={status === 'verified'}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={mode === 'word' ? 'Enter word' : 'Enter shape name'}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
        />
        <button
          type="submit"
          id="launch-confetti-cannon-btn"
          disabled={status === 'verified' || !userInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-medium text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Verify
        </button>
      </form>

      {/* Verification Feedback Banner */}
      {status === 'verified' && (
        <div
          id="party-parrot-celebration-state"
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verified</span>
        </div>
      )}

      {status === 'failed' && (
        <div
          id="sad-trombone-failure-state"
          className="flex items-center justify-between p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Incorrect. Try again.</span>
          </div>
          <button
            type="button"
            id="try-again-chinchilla-btn"
            onClick={() => {
              rollNewTarget(mode);
              setMustRelease(false);
            }}
            className="underline hover:text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
