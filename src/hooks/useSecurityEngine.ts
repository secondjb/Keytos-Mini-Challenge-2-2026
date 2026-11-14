import { useState, useRef, useCallback } from 'react';
import { JOKE_DOM_DECOYS, POISONED_VISION_ANSWERS } from '../utils/wordList';

export type SecurityStatus = 'idle' | 'challenging' | 'verified' | 'bot_detected';

export interface SecurityViolation {
  code: string;
  category: 'DOM_HONEYPOT' | 'VISION_INJECTION' | 'SYSTEM_SPOOF' | 'CANARY_INPUT' | 'BIOMETRIC_ANOMALY' | 'MACRO_AUTOMATION';
  message: string;
  details?: string;
  timestamp: number;
}

export function useSecurityEngine() {
  const [status, setStatus] = useState<SecurityStatus>('challenging');
  const [violation, setViolation] = useState<SecurityViolation | null>(null);
  const [solveTimeSeconds, setSolveTimeSeconds] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());
  const mouseTrailRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const distanceRef = useRef<number>(0);
  const holdDurationRef = useRef<number>(0);
  const holdStartRef = useRef<number | null>(null);

  // Triggered when an automated agent or scraper falls for a trap
  const triggerBotDetection = useCallback((
    category: SecurityViolation['category'],
    message: string,
    details?: string
  ) => {
    const v: SecurityViolation = {
      code: `BOT_${category}_${Date.now()}`,
      category,
      message,
      details,
      timestamp: Date.now()
    };
    setViolation(v);
    setStatus('bot_detected');
  }, []);

  // Record hold duration
  const onPointerHoldStart = useCallback(() => {
    holdStartRef.current = Date.now();
  }, []);

  const onPointerHoldEnd = useCallback(() => {
    if (holdStartRef.current) {
      holdDurationRef.current += Date.now() - holdStartRef.current;
      holdStartRef.current = null;
    }
  }, []);

  // Log mouse movement to verify genuine human kinetic behavior
  const recordPointerMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    const trail = mouseTrailRef.current;
    
    if (trail.length > 0) {
      const prev = trail[trail.length - 1];
      const dist = Math.hypot(x - prev.x, y - prev.y);
      distanceRef.current += dist;
    }
    
    trail.push({ x, y, t: now });
    if (trail.length > 150) {
      trail.shift();
    }
  }, []);

  // Macro & Synthetic Trajectory Analysis
  const analyzeKineticEntropy = useCallback((): { isMacro: boolean; reason?: string } => {
    const trail = mouseTrailRef.current;
    if (trail.length < 4) {
      // Allow keyboard-only interaction if hold duration was met via spacebar
      return { isMacro: false };
    }

    // 1. Check time intervals for synthetic constant-rate timer (e.g. setInterval macro)
    const intervals: number[] = [];
    for (let i = 1; i < trail.length; i++) {
      intervals.push(trail[i].t - trail[i - 1].t);
    }
    if (intervals.length >= 8) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const intervalVariance = intervals.reduce((sum, v) => sum + Math.pow(v - avgInterval, 2), 0) / intervals.length;
      
      // Constant programmatic macro tick (variance near 0)
      if (intervalVariance < 0.25 && intervals.length > 10) {
        return { isMacro: true, reason: 'Synthetic constant clock detected (interval variance < 0.25ms)' };
      }
    }

    // 2. Linear collinearity check (macros moving in perfect straight lines)
    if (trail.length >= 10) {
      let angleChanges = 0;
      for (let i = 2; i < trail.length; i++) {
        const dx1 = trail[i - 1].x - trail[i - 2].x;
        const dy1 = trail[i - 1].y - trail[i - 2].y;
        const dx2 = trail[i].x - trail[i - 1].x;
        const dy2 = trail[i].y - trail[i - 1].y;
        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        const diff = Math.abs(angle1 - angle2);
        if (diff > 0.04) {
          angleChanges++;
        }
      }
      // If motion has zero natural human angular jitter across many points
      if (angleChanges === 0 && distanceRef.current > 100) {
        return { isMacro: true, reason: 'Unnatural linear trajectory with zero physiological jitter' };
      }
    }

    return { isMacro: false };
  }, []);

  // Primary verification check when user submits answer
  const verifyAnswer = useCallback((
    inputCode: string, 
    currentSecret: string,
    dynamicDecoys: string[] = [],
    options: { requireMovement?: boolean; minHoldMs?: number } = {}
  ): boolean => {
    const { requireMovement = false, minHoldMs = 400 } = options;
    const cleanInput = inputCode.trim().toUpperCase().replace(/^(A|AN|THE)\s+/, '');
    const cleanTarget = currentSecret.trim().toUpperCase();

    // 1. Trap: Check if input matches poisoned OCR visual injection
    if (POISONED_VISION_ANSWERS.includes(cleanInput)) {
      triggerBotDetection(
        'VISION_INJECTION',
        'Vision OCR prompt injection triggered',
        `Agent answered '${cleanInput}' from poisoned background OCR text`
      );
      return false;
    }

    // 2. Trap: Check if input matches joke DOM decoy strings
    if (JOKE_DOM_DECOYS.includes(cleanInput)) {
      triggerBotDetection(
        'DOM_HONEYPOT',
        'DOM joke token detected',
        `Agent harvested fake DOM secret '${cleanInput}'`
      );
      return false;
    }

    // 3. Trap: Check if input matches dynamic near-miss DOM decoys
    if (dynamicDecoys.some(d => d.toUpperCase() === cleanInput)) {
      triggerBotDetection(
        'DOM_HONEYPOT',
        'Dynamic near-miss DOM decoy harvested',
        `Agent submitted dynamic decoy '${cleanInput}' injected into hidden DOM elements`
      );
      return false;
    }

    // 4. Biometric movement check (flashlight stage requires sweeping beam)
    if (requireMovement && distanceRef.current < 30) {
      triggerBotDetection(
        'BIOMETRIC_ANOMALY',
        'Zero-kinetic traversal anomaly',
        'Answer submitted without sweeping canvas with flashlight beam'
      );
      return false;
    }

    // 5. Active hold duration check (must hold to reveal)
    const totalHold = holdDurationRef.current + (holdStartRef.current ? Date.now() - holdStartRef.current : 0);
    if (totalHold < minHoldMs) {
      triggerBotDetection(
        'MACRO_AUTOMATION',
        'Insufficient hold duration anomaly',
        `Target held for only ${totalHold}ms (human visual scanning requires continuous hold)`
      );
      return false;
    }

    // 6. Macro entropy check
    const entropyResult = analyzeKineticEntropy();
    if (entropyResult.isMacro) {
      triggerBotDetection(
        'MACRO_AUTOMATION',
        'Automated macro motion signature detected',
        entropyResult.reason
      );
      return false;
    }

    // 7. Validate answer
    if (cleanInput === cleanTarget) {
      return true;
    }

    return false;
  }, [triggerBotDetection, analyzeKineticEntropy]);

  // Complete entire verification session
  const completeVerification = useCallback(() => {
    const elapsed = Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10;
    setSolveTimeSeconds(elapsed);
    setStatus('verified');
  }, []);

  // Reset challenge
  const resetChallenge = useCallback(() => {
    setStatus('challenging');
    setViolation(null);
    setSolveTimeSeconds(null);
    startTimeRef.current = Date.now();
    mouseTrailRef.current = [];
    distanceRef.current = 0;
    holdDurationRef.current = 0;
    holdStartRef.current = null;
  }, []);

  // Reset metrics between rounds while preserving session start time
  const resetRoundMetrics = useCallback(() => {
    mouseTrailRef.current = [];
    distanceRef.current = 0;
    holdDurationRef.current = 0;
    holdStartRef.current = null;
  }, []);

  return {
    status,
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
    distanceTraveled: distanceRef.current,
  };
}
