import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { RuleApplicationMetrics } from '../../../types/LearningBehaviourResult';

interface Props {
  onComplete: (metrics: RuleApplicationMetrics) => void;
}

const ROUNDS = [
  { rule: 'Select BLUE shapes', targetColor: 'blue', items: 8 },
  { rule: 'Select RED shapes', targetColor: 'red', items: 8 },
  { rule: 'Select SQUARE shapes', targetShape: 'square', items: 8 }
];

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SHAPES = ['circle', 'square', 'triangle'];

export const Task2RuleApplication: React.FC<Props> = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [currentItem, setCurrentItem] = useState({ color: 'blue', shape: 'circle' });
  const [showRule, setShowRule] = useState(true);
  
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef({
    correct: 0,
    total: 0,
    times: [] as number[],
    ruleSwitchTimes: [] as number[], // time taken on the first item after a rule change
    errorsAfterSwitch: 0
  });

  useEffect(() => {
    if (showRule) {
      const timer = setTimeout(() => {
        setShowRule(false);
        generateNextItem();
        startTimeRef.current = Date.now();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRule, round]);

  const generateNextItem = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    
    // Ensure we have a mix of targets and non-targets
    const currentRule = ROUNDS[round];
    if (Math.random() > 0.5) {
      setCurrentItem({
        color: currentRule.targetColor || randomColor,
        shape: currentRule.targetShape || randomShape
      });
    } else {
      setCurrentItem({ color: randomColor, shape: randomShape });
    }
  };

  const isTarget = () => {
    const currentRule = ROUNDS[round];
    if (currentRule.targetColor) return currentItem.color === currentRule.targetColor;
    if (currentRule.targetShape) return currentItem.shape === currentRule.targetShape;
    return false;
  };

  const handleAction = (selectedTarget: boolean) => {
    const timeTaken = Date.now() - startTimeRef.current;
    metricsRef.current.total++;
    
    const wasCorrect = selectedTarget === isTarget();
    if (wasCorrect) metricsRef.current.correct++;

    if (itemCount === 0) {
      metricsRef.current.ruleSwitchTimes.push(timeTaken);
      if (!wasCorrect) metricsRef.current.errorsAfterSwitch++;
    } else {
      metricsRef.current.times.push(timeTaken);
    }

    if (itemCount < ROUNDS[round].items - 1) {
      setItemCount(prev => prev + 1);
      generateNextItem();
      startTimeRef.current = Date.now();
    } else if (round < ROUNDS.length - 1) {
      setRound(prev => prev + 1);
      setItemCount(0);
      setShowRule(true);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    const { correct, total, times, ruleSwitchTimes, errorsAfterSwitch } = metricsRef.current;
    
    const accuracy = (correct / total) * 100;
    const avgTime = times.reduce((a, b) => a + b, 0) / Math.max(1, times.length);
    const avgSwitchTime = ruleSwitchTimes.reduce((a, b) => a + b, 0) / Math.max(1, ruleSwitchTimes.length);
    
    // Rule Switch Recovery: Higher is better (fewer errors right after a rule change)
    const switchRecovery = Math.max(0, 100 - (errorsAfterSwitch * 33));

    onComplete({
      ruleRetention: accuracy,
      adaptationSpeedMs: avgTime,
      ruleSwitchRecovery: switchRecovery,
      instructionAccuracy: accuracy
    });
  };

  if (showRule) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 animate-fade-in">
        <Shield className="w-16 h-16 text-secondary-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">New Rule</h2>
        <div className="bg-secondary-50 border-2 border-secondary-200 text-secondary-800 text-2xl font-bold py-6 px-12 rounded-2xl">
          {ROUNDS[round].rule}
        </div>
        <p className="mt-8 text-gray-500 animate-pulse">Memorize this rule. Starting in a few seconds...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="text-center mb-12">
        <h3 className="text-xl font-semibold text-gray-700">Does this match the rule?</h3>
        <p className="text-sm text-gray-400 mt-2">Round {round + 1} of {ROUNDS.length}</p>
      </div>

      <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 mb-12">
        <div 
          className="mx-auto transition-all"
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: currentItem.color,
            borderRadius: currentItem.shape === 'circle' ? '50%' : currentItem.shape === 'square' ? '16px' : '0',
            clipPath: currentItem.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
          }}
        />
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => handleAction(false)}
          className="px-10 py-4 bg-white border-2 border-danger-200 text-danger-600 rounded-xl font-bold text-xl hover:bg-danger-50 hover:border-danger-400 transition-colors active:scale-95"
        >
          No Match
        </button>
        <button
          onClick={() => handleAction(true)}
          className="px-10 py-4 bg-white border-2 border-success-200 text-success-600 rounded-xl font-bold text-xl hover:bg-success-50 hover:border-success-400 transition-colors active:scale-95"
        >
          Match
        </button>
      </div>
    </div>
  );
};
