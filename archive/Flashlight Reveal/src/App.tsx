import { FlashlightCanvas } from './components/FlashlightCanvas';
import { CaptchaControls } from './components/CaptchaControls';
import { HoneypotTraps } from './components/HoneypotTraps';
import { VerificationStatus } from './components/VerificationStatus';
import { useFlashlightWords } from './hooks/useFlashlightWords';
import { useSecurityEngine } from './hooks/useSecurityEngine';

export function App() {
  const { target, timeLeft, totalTime, decoys, dynamicDomDecoys, cycleWord } = useFlashlightWords();

  const {
    status,
    violation,
    solveTimeSeconds,
    triggerBotDetection,
    recordPointerMove,
    onPointerHoldStart,
    onPointerHoldEnd,
    verifyAnswer,
    resetChallenge,
  } = useSecurityEngine();

  const handleVerify = (input: string) => {
    return verifyAnswer(input, target.word, dynamicDomDecoys);
  };

  const handleReset = () => {
    resetChallenge();
    cycleWord();
  };

  return (
    <div className="potato_orbital_mainframe min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Container with joke / deceptive classes so inspect element is full of nonsense */}
      <div className="waffle_iron_chassis quantum_pancake_box w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6">
        <VerificationStatus
          status={status}
          violation={violation}
          solveTimeSeconds={solveTimeSeconds}
          onReset={handleReset}
        />

        <HoneypotTraps 
          dynamicDecoys={dynamicDomDecoys} 
          onTriggerViolation={triggerBotDetection} 
        />

        <FlashlightCanvas
          target={target}
          decoys={decoys}
          onPointerMove={recordPointerMove}
          onPointerHoldStart={onPointerHoldStart}
          onPointerHoldEnd={onPointerHoldEnd}
          onTriggerViolation={triggerBotDetection}
        />

        <CaptchaControls
          timeLeft={timeLeft}
          totalTime={totalTime}
          onVerify={handleVerify}
          onCycleWord={cycleWord}
          disabled={status !== 'challenging'}
        />
      </div>
    </div>
  );
}

export default App;
