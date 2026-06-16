import React, { useState, useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { PatternLearningMetrics } from '../../../types/LearningBehaviourResult';

interface Props {
  onComplete: (metrics: PatternLearningMetrics) => void;
}

const PATTERNS = [
  { sequence: ['A', 'B', 'C', 'A', 'B'], options: ['C', 'D', 'E'], correct: 'C' },
  { sequence: ['1', '2', '2', '3', '4', '4', '5'], options: ['5', '6', '7'], correct: '6' },
  { sequence: ['▲', '■', '●', '▲', '■'], options: ['▲', '■', '●'], correct: '●' },
  { sequence: ['+', '-', '+', '-', '+'], options: ['+', '-', '='], correct: '-' },
  { sequence: ['X', 'Y', 'Z', 'X', 'Y', 'Z', 'X'], options: ['Y', 'Z', 'X'], correct: 'Y' },
];

export const Task1PatternLearning: React.FC<Props> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  
  const metricsRef = useRef({
    correct: 0,
    times: [] as number[]
  });

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  const handleSelect = (option: string) => {
    const timeTaken = Date.now() - startTime;
    metricsRef.current.times.push(timeTaken);

    if (option === PATTERNS[currentIndex].correct) {
      metricsRef.current.correct++;
    }

    if (currentIndex < PATTERNS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    const { correct, times } = metricsRef.current;
    const accuracy = (correct / PATTERNS.length) * 100;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    // Variance calculation for consistency
    const variance = times.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    // Lower stdDev means higher consistency. Normalize around expected 1000ms stdDev.
    const consistency = Math.max(0, 100 - (stdDev / 20));

    onComplete({
      patternAccuracy: accuracy,
      averageDecisionTimeMs: avgTime,
      consistencyScore: consistency
    });
  };

  const currentPattern = PATTERNS[currentIndex];

  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="text-center mb-12">
        <Target className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pattern Discovery</h3>
        <p className="text-gray-600">Select the next item in the sequence. Move at a comfortable pace.</p>
        <div className="mt-4 text-sm font-medium text-gray-500">
          Pattern {currentIndex + 1} of {PATTERNS.length}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 w-full max-w-2xl text-center">
        <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
          {currentPattern.sequence.map((item, i) => (
            <div key={i} className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-3xl font-bold text-gray-700">
              {item}
            </div>
          ))}
          <div className="w-16 h-16 rounded-xl bg-primary-50 border-2 border-primary-300 border-dashed flex items-center justify-center text-3xl font-bold text-primary-400">
            ?
          </div>
        </div>

        <div className="flex justify-center gap-6">
          {currentPattern.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className="w-20 h-20 rounded-xl bg-white border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50 flex items-center justify-center text-3xl font-bold text-primary-700 transition-all active:scale-95 shadow-sm"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
