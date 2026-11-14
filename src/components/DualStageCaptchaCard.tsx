import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { MotionCanvas } from './MotionCanvas';
import { FlashlightCanvas } from './FlashlightCanvas';
import { HoneypotTraps } from './HoneypotTraps';
import { VerificationSuccessCard, type StageType } from './VerificationSuccessCard';
import { BotDetectedCard } from './BotDetectedCard';
import { useSecurityEngine, type SecurityViolation } from '../hooks/useSecurityEngine';
import { useFlashlightWords } from '../hooks/useFlashlightWords';
import { SHAPES, WORDS } from '../utils/captchaPatterns';

const MOTION_ROTATION_SECONDS = 8;

// Fisher-Yates shuffle for true uniform randomness across 3 stages
function generateRandomStages(): StageType[] {
  const stages: StageType[] = ['motion-word', 'motion-shape', 'flashlight'];
  for (let i = stages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = stages[i]!;
    stages[i] = stages[j]!;
    stages[j] = temp;
  }
  return stages;
}

export function DualStageCaptchaCard() {
  // 1. Randomized 3-stage sequence
  const [stages, setStages] = useState<StageType[]>(generateRandomStages);
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Form input and error shake state
  const [userInput, setUserInput] = useState<string>('');
  const [inputError, setInputError] = useState<boolean>(false);

  // Active stage
  const activeStage: StageType = stages[currentRound - 1] ?? 'motion-word';
  const isMotion = activeStage === 'motion-word' || activeStage === 'motion-shape';
  const motionMode: 'word' | 'shape' = activeStage === 'motion-shape' ? 'shape' : 'word';

  // Motion stage specific state
  const [motionTargetId, setMotionTargetId] = useState<string>('kinetic');
  const [motionIsHolding, setMotionIsHolding] = useState<boolean>(false);
  const [motionMustRelease, setMotionMustRelease] = useState<boolean>(false);
  const [motionProgress, setMotionProgress] = useState<number>(100);

  const motionIsHoldingRef = useRef(false);
  motionIsHoldingRef.current = motionIsHolding;

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
  } = useFlashlightWords(activeStage === 'flashlight' && securityStatus === 'challenging');

  // Roll new Motion target based on active stage (word or shape)
  const rollNewMotionTarget = useCallback((mode: 'word' | 'shape') => {
    const list = mode === 'shape' ? SHAPES : WORDS;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    if (randomItem) {
      setMotionTargetId(randomItem.id.toLowerCase());
    }
    setMotionIsHolding(false);
    setUserInput('');
    setInputError(false);
  }, []);

  // Initialize or re-roll target when stage changes
  useEffect(() => {
    if (isMotion) {
      rollNewMotionTarget(motionMode);
    }
  }, [isMotion, motionMode, rollNewMotionTarget]);

  // Motion 8-second rotation timer loop
  useEffect(() => {
    if (!isMotion || securityStatus !== 'challenging' || isTransitioning) return;

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

        if (motionIsHoldingRef.current) {
          setMotionIsHolding(false);
          setMotionMustRelease(true);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isMotion, securityStatus, isTransitioning, motionMode, rollNewMotionTarget]);

  // Spacebar hold support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (securityStatus === 'challenging' && !motionMustRelease) {
          if (isMotion) {
            setMotionIsHolding(true);
            onPointerHoldStart();
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (isMotion) {
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
  }, [securityStatus, motionMustRelease, isMotion, onPointerHoldStart, onPointerHoldEnd]);

  // Motion hold handlers
  const handleStartMotionHold = () => {
    if (securityStatus !== 'challenging' || motionMustRelease) return;
    setMotionIsHolding(true);
    onPointerHoldStart();
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

    if (isMotion) {
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

  // Handlers for round progression across 3 rounds
  const handleRoundPassed = () => {
    setUserInput('');
    setInputError(false);

    if (currentRound < 3) {
      // Completed Round 1 or 2
      setIsTransitioning(true);

      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981'],
      });

      const nextRound = (currentRound + 1) as 2 | 3;

      setTimeout(() => {
        resetRoundMetrics();
        setCurrentRound(nextRound);
        setIsTransitioning(false);
      }, 1000);
    } else {
      // Completed all 3 Rounds! Full verification
      completeVerification();
    }
  };

  const handleRoundFailed = () => {
    setInputError(true);
    setTimeout(() => setInputError(false), 800);
  };

  // Reset entire challenge
  const handleFullReset = () => {
    resetChallenge();
    setStages(generateRandomStages());
    setCurrentRound(1);
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
    triggerBotDetection(category, msg, detail);
  };

  // Dynamic placeholder text
  const getInputPlaceholder = () => {
    if (activeStage === 'motion-shape') {
      return 'Type revealed shape (e.g. star, heart)...';
    }
    if (activeStage === 'motion-word') {
      return 'Type revealed word...';
    }
    return 'Type flashlight word...';
  };

  // Dynamic hold button text
  const getMotionButtonText = () => {
    if (motionMustRelease) {
      return 'Key Expired — Release & Hold Again';
    }
    if (motionIsHolding) {
      return activeStage === 'motion-shape' ? 'Revealing Motion Shape...' : 'Revealing Motion Word...';
    }
    return activeStage === 'motion-shape' ? 'Press & Hold to Reveal Shape' : 'Press & Hold to Reveal Word';
  };

  return (
    <div
      id="quantum-containment-unit"
      data-subsystem="triple-stage-biometric-v42"
      className="w-full max-w-[480px] bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
    >
      {/* Invisible prompt injection traps & dynamically rotating joke DOM decoys */}
      <HoneypotTraps
        dynamicDecoys={flashlightDynamicDecoys}
        targetId={isMotion ? motionTargetId : flashlightTarget.word}
        onTrapTriggered={handleTrapTriggered}
      />

      {/* Clean minimal Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-slate-300">Security Check</span>
          <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
            Round {currentRound} of 3
          </span>
        </div>

        <button
          type="button"
          onClick={handleFullReset}
          title="New Challenge"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* VIEW: Bot Detected Alert Screen */}
      {securityStatus === 'bot_detected' && (
        <BotDetectedCard violation={violation} onReset={handleFullReset} />
      )}

      {/* VIEW: Verified Screen */}
      {securityStatus === 'verified' && (
        <VerificationSuccessCard
          solveTimeSeconds={solveTimeSeconds}
          stages={stages}
          onReset={handleFullReset}
        />
      )}

      {/* VIEW: Intermediate Round Transition Screen */}
      {isTransitioning && securityStatus === 'challenging' && (
        <div className="p-8 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-center space-y-3 animate-fadeIn">
          <div className="inline-flex p-3 rounded-full bg-cyan-500/20 text-cyan-400 mb-1">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-100 font-mono">
            Round {currentRound} Verified!
          </h4>
          <p className="text-xs text-slate-400">
            Initializing Round {currentRound + 1}...
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
          {isMotion ? (
            <div className="space-y-2">
              {/* Instruction banner without manual mode selector */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
                <span>Hold button or Spacebar to reveal</span>
                <span className="text-slate-400">
                  Target: {activeStage === 'motion-shape' ? 'Shape' : 'Word'}
                </span>
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
                {getMotionButtonText()}
              </button>
            </div>
          ) : (
            /* Flashlight Canvas */
            <div className="space-y-2">
              <FlashlightCanvas
                target={flashlightTarget}
                decoys={flashlightDecoys}
                onPointerMove={recordPointerMove}
                onPointerHoldStart={onPointerHoldStart}
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
                placeholder={getInputPlaceholder()}
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
              <span>{currentRound < 3 ? 'Next' : 'Verify'}</span>
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

      {/* Minimal Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>Keytos Security</span>
        </span>
      </div>
    </div>
  );
}

export default DualStageCaptchaCard;
