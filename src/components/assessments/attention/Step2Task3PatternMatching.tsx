import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, Button } from '../../../components/ui';
import { Task3Metrics } from '../../../types/AttentionAssessmentResult';

interface Props {
  onComplete: (metrics: Task3Metrics) => void;
}

const PATTERNS = [
  ['▲', '●', '■'],
  ['☆', '★', '☆'],
  ['◆', '◇', '◆', '◇'],
  ['△', '▲', '△', '▲', '●'],
  ['■', '□', '■', '□', '■']
];

export const Step2Task3PatternMatching: React.FC<Props> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [trial, setTrial] = useState(0);
  const [phase, setPhase] = useState<'initial' | 'hidden' | 'compare'>('initial');
  const [currentPattern, setCurrentPattern] = useState<string[]>([]);
  const [comparePattern, setComparePattern] = useState<string[]>([]);
  const [isSame, setIsSame] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const metricsRef = useRef<Task3Metrics>({
    decisionAccuracy: 0,
    responseTimes: []
  });
  
  const correctDecisionsRef = useRef(0);
  const TOTAL_TRIALS = 5;

  const startTrial = useCallback((trialIndex: number) => {
    if (trialIndex >= TOTAL_TRIALS) {
      metricsRef.current.decisionAccuracy = (correctDecisionsRef.current / TOTAL_TRIALS) * 100;
      onComplete(metricsRef.current);
      return;
    }

    const basePattern = PATTERNS[trialIndex];
    setCurrentPattern(basePattern);
    
    // 50% chance to be different
    const shouldBeSame = Math.random() > 0.5;
    setIsSame(shouldBeSame);
    
    if (shouldBeSame) {
      setComparePattern([...basePattern]);
    } else {
      const diffPattern = [...basePattern];
      // modify one element
      const changeIdx = Math.floor(Math.random() * diffPattern.length);
      const possibleChars = ['▲', '●', '■', '☆', '★', '◆', '◇', '△', '□'];
      let newChar = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      while (newChar === diffPattern[changeIdx]) {
        newChar = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      }
      diffPattern[changeIdx] = newChar;
      setComparePattern(diffPattern);
    }

    setPhase('initial');
    
    // Show initial pattern for 2 seconds
    setTimeout(() => {
      setPhase('hidden');
      // Hide for 1 second
      setTimeout(() => {
        setPhase('compare');
        startTimeRef.current = performance.now();
      }, 1000);
    }, 2000);
  }, [onComplete]);

  const handleStart = () => {
    setStarted(true);
    startTrial(0);
  };

  const handleAnswer = (userSaidSame: boolean) => {
    if (phase !== 'compare') return;
    
    const rt = performance.now() - startTimeRef.current;
    metricsRef.current.responseTimes.push(rt);
    
    if (userSaidSame === isSame) {
      correctDecisionsRef.current++;
    }
    
    setPhase('hidden'); // brief transition
    setTimeout(() => {
      setTrial(prev => {
        const next = prev + 1;
        startTrial(next);
        return next;
      });
    }, 500);
  };

  if (!started) {
    return (
      <div className="text-center max-w-2xl mx-auto py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Task 3 of 4 – Pattern Matching</h3>
        <p className="text-lg text-gray-600 mb-8">
          In this task, a sequence of shapes will appear briefly and then disappear. 
          A second sequence will then appear. You must decide if the second sequence is exactly the <strong>Same</strong> or <strong>Different</strong>.
        </p>
        <Button onClick={handleStart} size="lg" className="px-8 py-3 rounded-xl text-lg font-bold">
          Start Task 3
        </Button>
      </div>
    );
  }

  if (trial >= TOTAL_TRIALS) {
    return (
      <div className="text-center max-w-2xl mx-auto py-12">
        <p className="text-lg text-gray-600">Task complete! Moving to the next task...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Task 3: Pattern Matching (Trial {trial + 1}/{TOTAL_TRIALS})</h3>
      
      <div className="h-64 flex flex-col items-center justify-center">
        {phase === 'initial' && (
          <div className="flex gap-4 animate-fade-in">
            {currentPattern.map((char, i) => (
              <div key={i} className="text-6xl text-primary-600">{char}</div>
            ))}
          </div>
        )}
        
        {phase === 'hidden' && (
          <div className="text-2xl text-gray-400">...</div>
        )}
        
        {phase === 'compare' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="flex gap-4 mb-12">
              {comparePattern.map((char, i) => (
                <div key={i} className="text-6xl text-secondary-600">{char}</div>
              ))}
            </div>
            
            <div className="flex gap-6">
              <Button onClick={() => handleAnswer(true)} size="lg" className="px-12 py-4 text-xl">Same</Button>
              <Button onClick={() => handleAnswer(false)} size="lg" variant="outline" className="px-12 py-4 text-xl">Different</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
