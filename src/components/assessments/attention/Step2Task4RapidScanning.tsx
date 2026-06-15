import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../../components/ui';
import { Task4Metrics } from '../../../types/AttentionAssessmentResult';

interface Props {
  onComplete: (metrics: Task4Metrics) => void;
}

export const Step2Task4RapidScanning: React.FC<Props> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentChar, setCurrentChar] = useState<string>('');
  
  const metricsRef = useRef<Task4Metrics>({
    reactionTimes: [],
    missedTargets: 0,
    falsePositives: 0,
    accuracy: 0
  });
  
  const TARGET_CHAR = 'K';
  const DISTRACTORS = ['M', 'P', 'R', 'T', 'W', 'X', 'Y', 'Z'];
  const TOTAL_STIMULI = 15;
  const STIMULUS_DURATION = 800; // ms
  
  const trialIndexRef = useRef(0);
  const isTargetRef = useRef(false);
  const respondedRef = useRef(false);
  const stimulusTimeRef = useRef(0);
  const correctHitsRef = useRef(0);
  const totalTargetsRef = useRef(0);

  const nextStimulus = useCallback(() => {
    if (trialIndexRef.current >= TOTAL_STIMULI) {
      handleFinish();
      return;
    }

    // Check for missed target from previous trial
    if (trialIndexRef.current > 0 && isTargetRef.current && !respondedRef.current) {
      metricsRef.current.missedTargets++;
    }

    const isTarget = Math.random() < 0.3; // 30% chance of target
    const char = isTarget ? TARGET_CHAR : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
    
    if (isTarget) totalTargetsRef.current++;
    
    isTargetRef.current = isTarget;
    respondedRef.current = false;
    setCurrentChar(char);
    stimulusTimeRef.current = performance.now();
    trialIndexRef.current++;

    setTimeout(() => {
      setCurrentChar('');
      setTimeout(nextStimulus, 300); // 300ms blank interval
    }, STIMULUS_DURATION);
  }, []);

  const handleFinish = () => {
    setFinished(true);
    
    // Check last trial miss
    if (isTargetRef.current && !respondedRef.current) {
      metricsRef.current.missedTargets++;
    }

    const totalPossible = totalTargetsRef.current;
    if (totalPossible > 0) {
      metricsRef.current.accuracy = (correctHitsRef.current / totalPossible) * 100;
    } else {
      metricsRef.current.accuracy = 100; // Edge case if no targets spawned
    }

    onComplete(metricsRef.current);
  };

  useEffect(() => {
    if (!started || finished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (respondedRef.current || !currentChar) return;
        respondedRef.current = true;
        
        if (isTargetRef.current) {
          const rt = performance.now() - stimulusTimeRef.current;
          metricsRef.current.reactionTimes.push(rt);
          correctHitsRef.current++;
        } else {
          metricsRef.current.falsePositives++;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, finished, currentChar]);

  const handleStart = () => {
    setStarted(true);
    setTimeout(nextStimulus, 1000);
  };

  if (!started) {
    return (
      <div className="text-center max-w-2xl mx-auto py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Task 4 of 4 – Rapid Visual Scanning</h3>
        <p className="text-lg text-gray-600 mb-8">
          In this task, letters will flash rapidly on the screen. <strong>Press the SPACEBAR</strong> as quickly as possible <strong>only when the letter '{TARGET_CHAR}' appears</strong>.
        </p>
        <Button onClick={handleStart} size="lg" className="px-8 py-3 rounded-xl text-lg font-bold">
          Start Task 4
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-12">Task 4: Rapid Visual Scanning</h3>
      
      <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl bg-white">
        {!finished && currentChar && (
          <div className="text-9xl font-bold text-gray-900 animate-pulse">{currentChar}</div>
        )}
        {!finished && !currentChar && (
          <div className="text-4xl text-gray-300">+</div>
        )}
        {finished && (
          <p className="text-xl text-gray-600">Task complete! Processing results...</p>
        )}
      </div>
    </div>
  );
};
