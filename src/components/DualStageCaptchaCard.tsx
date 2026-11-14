import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Volume2, VolumeX, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { MotionCanvas } from './MotionCanvas';
import { FlashlightCanvas } from './FlashlightCanvas';
import { HoneypotTraps } from './HoneypotTraps';
import { RoundProgressStepper } from './RoundProgressStepper';
import { VerificationSuccessCard } from './VerificationSuccessCard';
import { BotDetectedCard } from './BotDetectedCard';
import { useSecurityEngine, type SecurityViolation } from '../hooks/useSecurityEngine';
import { useFlashlightWords } from '../hooks/useFlashlightWords';
import { SHAPES, WORDS } from '../utils/captchaPatterns';
import {
  playFlashlightClick,
  playTick,
  playRoundChime,
  playSuccessSound,
  playAlarmSound,
} from '../utils/audioEffects';

const MOTION_ROTATION_SECONDS = 8;

export function DualStageCaptchaCard() {
  // 1. Randomize round order (50% chance Motion first, 50% chance Flashlight first)
  const [roundTypes, setRoundTypes] = useState<['motion', 'flashlight'] | ['flashlight', 'motion']>(() =>
    Math.random() < 0.5 ? ['motion', 'flashlight'] : ['flashlight', 'motion']
  );

  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [round1Complete, setRound1Complete] = useState<boolean>(false);
  const [round2Complete, setRound2Complete] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Form input and error shake state
  const [userInput, setUserInput] = useState<string>('');
  const [inputError, setInputError] = useState<boolean>(false);

  // Motion stage specific state
  const [motionMode, setMotionMode] = useState<'word' | 'shape'>('word');
  const [motionTargetId, setMotionTargetId] = useState<string>('kinetic');
  const [motionIsHolding, setMotionIsHolding] = useState<boolean>(false);
  const [motionMustRelease, setMotionMustRelease] = useState<boolean>(false);
  const [motionProgress, setMotionProgress] = useState<number>(100);

  const motionIsHoldingRef = useRef(false);
  motionIsHoldingRef.current = motionIsHolding;

  // Active round type
  const activeRoundType = currentRound === 1 ? roundTypes[0] : roundTypes[1];

  // Security Engine
  const {
    status: securityStatus,
    violation,
    solveTimeSeconds,
    triggerBotDetection,
    recordPointerMove,
    onPointerHoldStart,
    onPointerHoldEnd,
    verifyAnswer,
    completeVerification,
    resetChallenge,
    resetRoundMetrics,
  } = useSecurityEngine();

  // Flashlight Stage Words hook
  const {
    target: flashlightTarget,
    timeLeft: flashlightTimeLeft,
    decoys: flashlightDecoys,
    dynamicDomDecoys: flashlightDynamicDecoys,
    cycleWord: cycleFlashlightWord,
  } = useFlashlightWords(activeRoundType === 'flashlight' && securityStatus === 'challenging');

  // Roll new Motion target
  const rollNewMotionTarget = useCallback((selectedMode: 'word' | 'shape') => {
    const list = selectedMode === 'shape' ? SHAPES : WORDS;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    if (randomItem) {
      setMotionTargetId(randomItem.id.toLowerCase());
    }
    setMotionIsHolding(false);
    setUserInput('');
    setInputError(false);
  }, []);

  // Initialize motion target
  useEffect(() => {
    rollNewMotionTarget(motionMode);
  }, [motionMode, rollNewMotionTarget]);

  // Motion 8-second rotation timer loop
  useEffect(() => {
    if (activeRoundType !== 'motion' || securityStatus !== 'challenging' || isTransitioning) return;

    const totalMs = MOTION_ROTATION_SECONDS * 1000;
    const intervalMs = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;
      const remainingPct = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setMotionProgress(remainingPct);

      if (elapsed >= totalMs) {
        elapsed = 0;
        setMotionProgress(100);
        rollNewMotionTarget(motionMode);
        playTick(audioEnabled);

        if (motionIsHoldingRef.current) {
          setMotionIsHolding(false);
          setMotionMustRelease(true);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeRoundType, securityStatus, isTransitioning, motionMode, rollNewMotionTarget, audioEnabled]);

  // Spacebar hold support for accessibility and desktop power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (securityStatus === 'challenging' && !motionMustRelease) {
          if (activeRoundType === 'motion') {
            setMotionIsHolding(true);
            onPointerHoldStart();
            playFlashlightClick(audioEnabled);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (activeRoundType === 'motion') {
          setMotionIsHolding(false);
          setMotionMustRelease(false);
          onPointerHoldEnd();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [securityStatus, motionMustRelease, activeRoundType, onPointerHoldStart, onPointerHoldEnd, audioEnabled]);

  // Motion hold handlers
  const handleStartMotionHold = () => {
    if (securityStatus !== 'challenging' || motionMustRelease) return;
    setMotionIsHolding(true);
    onPointerHoldStart();
    playFlashlightClick(audioEnabled);
  };

  const handleEndMotionHold = () => {
    setMotionIsHolding(false);
    setMotionMustRelease(false);
    onPointerHoldEnd();
  };

  // Submit Answer for active round
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (securityStatus !== 'challenging' || !userInput.trim() || isTransitioning) return;

    if (activeRoundType === 'motion') {
      const isCorrect = verifyAnswer(
        userInput,
        motionTargetId,
        flashlightDynamicDecoys,
        { requireMovement: false, minHoldMs: 400 }
      );

      if (isCorrect) {
        handleRoundPassed();
      } else {
        handleRoundFailed();
      }
    } else {
      // Flashlight Round
      const isCorrect = verifyAnswer(
        userInput,
        flashlightTarget.word,
        flashlightDynamicDecoys,
        { requireMovement: true, minHoldMs: 500 }
      );

      if (isCorrect) {
        handleRoundPassed();
      } else {
        handleRoundFailed();
      }
    }
  };

  // Handlers for round progression
  const handleRoundPassed = () => {
    setUserInput('');
    setInputError(false);

    if (currentRound === 1) {
      // Completed Round 1!
      setRound1Complete(true);
      setIsTransitioning(true);
      playRoundChime(audioEnabled);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981'],
      });

      // Transition to Round 2 after 1.1s
      setTimeout(() => {
        resetRoundMetrics();
        setCurrentRound(2);
        setIsTransitioning(false);
      }, 1100);
    } else {
      // Completed Round 2! Full verification
      setRound2Complete(true);
      completeVerification();
      playSuccessSound(audioEnabled);
    }
  };

  const handleRoundFailed = () => {
    setInputError(true);
    playAlarmSound(audioEnabled);
    setTimeout(() => setInputError(false), 800);
  };

  // Reset entire challenge
  const handleFullReset = () => {
    resetChallenge();
    setRoundTypes(Math.random() < 0.5 ? ['motion', 'flashlight'] : ['flashlight', 'motion']);
    setCurrentRound(1);
    setRound1Complete(false);
    setRound2Complete(false);
    setIsTransitioning(false);
    setUserInput('');
    setInputError(false);
    setMotionMustRelease(false);
    rollNewMotionTarget('word');
    cycleFlashlightWord();
  };

  // Honeypot trap triggered
  const handleTrapTriggered = (
    category: SecurityViolation['category'],
    msg: string,
    detail?: string
  ) => {
    playAlarmSound(audioEnabled);
    triggerBotDetection(category, msg, detail);
  };

  return (
    <div
      id="quantum-containment-unit"
      data-subsystem="dual-stage-biometric-v42"
      className="w-full max-w-[500px] bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
    >
      {/* Invisible prompt injection traps & dynamically rotating joke DOM decoys */}
      <HoneypotTraps
        dynamicDecoys={flashlightDynamicDecoys}
        targetId={activeRoundType === 'motion' ? motionTargetId : flashlightTarget.word}
        onTrapTriggered={handleTrapTriggered}
      />

      {/* Top Header & Stepper */}
      <RoundProgressStepper
        currentRound={currentRound}
        round1Type={roundTypes[0]}
        round2Type={roundTypes[1]}
        round1Complete={round1Complete}
        round2Complete={round2Complete}
      />

      {/* Audio & Refresh Toolbar */}
      <div className="flex items-center justify-between pb-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {activeRoundType === 'motion'
              ? 'Stage: Kinetic Motion Parallax'
              : 'Stage: Darkroom Vector Flashlight'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* New Challenge Button */}
          <button
            type="button"
            onClick={handleFullReset}
            title="Reset & Generate New Challenge"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW: Bot Detected Alert Screen */}
      {securityStatus === 'bot_detected' && (
        <BotDetectedCard violation={violation} onReset={handleFullReset} />
      )}

      {/* VIEW: Verified Screen */}
      {securityStatus === 'verified' && (
        <VerificationSuccessCard
          solveTimeSeconds={solveTimeSeconds}
          round1Type={roundTypes[0]}
          round2Type={roundTypes[1]}
          onReset={handleFullReset}
        />
      )}

      {/* VIEW: Intermediate Round 1 Transition Screen */}
      {isTransitioning && securityStatus === 'challenging' && (
        <div className="p-8 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-center space-y-3 animate-fadeIn">
          <div className="inline-flex p-3 rounded-full bg-cyan-500/20 text-cyan-400 mb-1">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-100 font-mono">
            Round 1 Verified!
          </h4>
          <p className="text-xs text-slate-400">
            Initializing Round 2 challenge ({roundTypes[1] === 'motion' ? 'Kinetic Motion' : 'Darkroom Flashlight'})...
          </p>
          <div className="w-32 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* VIEW: Active Challenge Screen */}
      {securityStatus === 'challenging' && !isTransitioning && (
        <div className="space-y-4">
          {/* Active Canvas Display */}
          {activeRoundType === 'motion' ? (
            <div className="space-y-2">
              {/* Mode toggles for Words vs Shapes */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Hold button or Spacebar to reveal
                </span>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setMotionMode('word');
                      setMotionMustRelease(false);
                    }}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      motionMode === 'word'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Words
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMotionMode('shape');
                      setMotionMustRelease(false);
                    }}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      motionMode === 'shape'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Shapes
                  </button>
                </div>
              </div>

              {/* Kinetic Motion Canvas */}
              <div className="relative">
                <MotionCanvas
                  mode={motionMode}
                  targetId={motionTargetId}
                  isHolding={motionIsHolding}
                  onTriggerViolation={handleTrapTriggered}
                />
                {/* Lifetime rotation countdown bar */}
                <div className="w-full h-1 bg-slate-950 overflow-hidden rounded-b-md">
                  <div
                    className="h-full bg-cyan-500/60 transition-all duration-100 ease-linear"
                    style={{ width: `${motionProgress}%` }}
                  />
                </div>
              </div>

              {/* Motion Hold Trigger Button */}
              <button
                type="button"
                id="motion-hold-trigger-btn"
                onMouseDown={handleStartMotionHold}
                onMouseUp={handleEndMotionHold}
                onMouseLeave={handleEndMotionHold}
                onTouchStart={handleStartMotionHold}
                onTouchEnd={handleEndMotionHold}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer flex items-center justify-center ${
                  motionMustRelease
                    ? 'bg-amber-600 text-amber-100 ring-2 ring-amber-400/50 animate-pulse'
                    : motionIsHolding
                    ? 'bg-cyan-600 text-white shadow-inner scale-[0.99]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.99]'
                }`}
              >
                {motionMustRelease
                  ? 'Key Expired — Release & Hold Again'
                  : motionIsHolding
                  ? 'Revealing Kinetic Velocity Field...'
                  : 'Press & Hold to Reveal Motion'}
              </button>
            </div>
          ) : (
            /* Flashlight Canvas */
            <div className="space-y-2">
              <FlashlightCanvas
                target={flashlightTarget}
                decoys={flashlightDecoys}
                onPointerMove={recordPointerMove}
                onPointerHoldStart={() => {
                  onPointerHoldStart();
                  playFlashlightClick(audioEnabled);
                }}
                onPointerHoldEnd={onPointerHoldEnd}
                onTriggerViolation={handleTrapTriggered}
              />

              {/* Countdown badge & instruction */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>Hold & drag beam across canvas</span>
                <span className={flashlightTimeLeft <= 3 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  Key Rotates in {flashlightTimeLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Form Input Field */}
          <form onSubmit={handleSubmitAnswer} className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <input
                id="human-verification-solution-input"
                name="human_solution"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  activeRoundType === 'motion'
                    ? motionMode === 'word'
                      ? 'Type revealed word...'
                      : 'Type revealed shape (e.g. star, heart)...'
                    : 'Type flashlight word...'
                }
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all ${
                  inputError
                    ? 'border-red-500 bg-red-950/20 ring-2 ring-red-500/30 animate-shake'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!userInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-1.5"
            >
              <span>{currentRound === 1 ? 'Next' : 'Verify'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Error Banner */}
          {inputError && (
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs text-center font-medium animate-fadeIn">
              Incorrect answer. Check the canvas and try again.
            </div>
          )}
        </div>
      )}

      {/* Footer Branding */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>Keytos Mini-Challenge #2</span>
        </span>
        <span>Anti-Bot Biometric Protection</span>
      </div>
    </div>
  );
}

export default DualStageCaptchaCard;
