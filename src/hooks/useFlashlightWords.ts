import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchChallengeRuneFromServer, generateNearMissAnswers } from '../utils/wordList';

export interface SecretTarget {
  word: string;
  xPercent: number;
  yPercent: number;
  rotationAngle: number;
  id: number;
  serverHash: string;
}

export interface DecoyParticle {
  text: string;
  xPercent: number;
  yPercent: number;
  opacity: number;
  size: number;
}

const ROTATION_INTERVAL_SEC = 8; // Rotates every 8 seconds

export function useFlashlightWords(isActive = true) {
  const [target, setTarget] = useState<SecretTarget>(() => {
    const payload = fetchChallengeRuneFromServer();
    return {
      word: payload.rune,
      xPercent: 0.25 + Math.random() * 0.5,
      yPercent: 0.25 + Math.random() * 0.5,
      rotationAngle: (Math.random() - 0.5) * 12,
      id: 1,
      serverHash: payload.hash,
    };
  });

  const [timeLeft, setTimeLeft] = useState<number>(ROTATION_INTERVAL_SEC);
  const [decoys, setDecoys] = useState<DecoyParticle[]>([]);
  const [dynamicDomDecoys, setDynamicDomDecoys] = useState<string[]>(() => 
    generateNearMissAnswers(target.word)
  );
  
  const targetIndexRef = useRef<number>(1);

  // Distraction glyphs in darkroom
  const generateDecoys = useCallback(() => {
    const symbols = ["// 0x9F", "NULL", "404", "ERR", ":::", "VOID", "#FF00", "0101", "SEEK", "---"];
    const items: DecoyParticle[] = [];
    for (let i = 0; i < 10; i++) {
      items.push({
        text: symbols[Math.floor(Math.random() * symbols.length)] as string,
        xPercent: 0.1 + Math.random() * 0.8,
        yPercent: 0.15 + Math.random() * 0.7,
        opacity: 0.15 + Math.random() * 0.2,
        size: 10 + Math.random() * 6,
      });
    }
    setDecoys(items);
  }, []);

  // Fetch next server challenge rune
  const cycleWord = useCallback(() => {
    targetIndexRef.current += 1;
    let payload = fetchChallengeRuneFromServer();
    setTarget(prev => {
      while (payload.rune === prev.word) {
        payload = fetchChallengeRuneFromServer();
      }
      setDynamicDomDecoys(generateNearMissAnswers(payload.rune));
      return {
        word: payload.rune,
        xPercent: 0.2 + Math.random() * 0.6,
        yPercent: 0.25 + Math.random() * 0.5,
        rotationAngle: (Math.random() - 0.5) * 12,
        id: targetIndexRef.current,
        serverHash: payload.hash,
      };
    });
    setTimeLeft(ROTATION_INTERVAL_SEC);
    generateDecoys();
  }, [generateDecoys]);

  useEffect(() => {
    if (isActive) {
      generateDecoys();
    }
  }, [isActive, generateDecoys]);

  // Dynamic decoy rotation timer (mutates near-miss answers every 4 seconds)
  useEffect(() => {
    if (!isActive) return;
    const decoyInterval = setInterval(() => {
      setDynamicDomDecoys(generateNearMissAnswers(target.word));
    }, 4000);

    return () => clearInterval(decoyInterval);
  }, [isActive, target.word]);

  // Main rotation timer loop (every 8 seconds)
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          cycleWord();
          return ROTATION_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, cycleWord]);

  return {
    target,
    timeLeft,
    totalTime: ROTATION_INTERVAL_SEC,
    decoys,
    dynamicDomDecoys,
    cycleWord,
  };
}
