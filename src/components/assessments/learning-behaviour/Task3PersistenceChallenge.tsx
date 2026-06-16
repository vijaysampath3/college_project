import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { PersistenceMetrics } from '../../../types/LearningBehaviourResult';

interface Props {
  onComplete: (metrics: PersistenceMetrics) => void;
}

const PUZZLES = [
  { level: 'easy', text: 'Unscramble: A P L P E', answer: 'APPLE' },
  { level: 'medium', text: 'Unscramble: R B N I A', answer: 'BRAIN' },
  { level: 'hard', text: 'Unscramble: O U E R N N', answer: 'NEURON' }
];

export const Task3PersistenceChallenge: React.FC<Props> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const startTimeRef = useRef(Date.now());
  const itemStartTimeRef = useRef(Date.now());
  
  const metricsRef = useRef({
    completed: 0,
    retries: 0,
    skips: 0,
    hardTimeSpentMs: 0,
    abandoned: false
  });

  useEffect(() => {
    itemStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const isCorrect = inputValue.toUpperCase() === PUZZLES[currentIndex].answer;
    
    if (isCorrect) {
      metricsRef.current.completed++;
      advance();
    } else {
      metricsRef.current.retries++;
      setErrorMsg("Not quite right. Try again, or skip if you're stuck.");
      setInputValue('');
    }
  };

  const handleSkip = () => {
    metricsRef.current.skips++;
    advance();
  };

  const handleAbandon = () => {
    metricsRef.current.abandoned = true;
    finalize();
  };

  const advance = () => {
    setErrorMsg('');
    setInputValue('');
    
    const timeSpent = Date.now() - itemStartTimeRef.current;
    if (PUZZLES[currentIndex].level === 'hard') {
      metricsRef.current.hardTimeSpentMs += timeSpent;
    }

    if (currentIndex < PUZZLES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    const total = PUZZLES.length;
    const { completed, retries, skips, hardTimeSpentMs, abandoned } = metricsRef.current;
    
    const completionRate = (completed / total) * 100;
    const skipRate = (skips / total) * 100;
    // Challenge persistence: time spent on hard items relative to standard (e.g. 10s base) + retries
    const challengePersistence = Math.min(100, (hardTimeSpentMs / 10000) * 50 + (retries * 10));

    onComplete({
      completionRate,
      retryRate: retries,
      skipRate,
      timeSpentOnDifficultItemsMs: hardTimeSpentMs,
      abandonmentRate: abandoned ? 100 : 0,
      challengePersistence
    });
  };

  const currentPuzzle = PUZZLES[currentIndex];

  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="text-center mb-12">
        <Search className="w-12 h-12 text-accent-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Persistence Challenge</h3>
        <p className="text-gray-600">Solve the anagrams. They get harder. Take your time.</p>
        <div className="mt-4 text-sm font-medium text-gray-400">
          Puzzle {currentIndex + 1} of {PUZZLES.length} ({currentPuzzle.level})
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="text-2xl font-mono font-bold text-center text-gray-800 tracking-widest mb-8">
            {currentPuzzle.text}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Type your answer..."
                className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-bold uppercase ${
                  errorMsg ? 'border-danger-300 bg-danger-50 text-danger-700' : 'border-gray-200 focus:border-accent-500'
                } outline-none transition-colors`}
                autoFocus
              />
              {errorMsg && <p className="text-sm text-danger-600 mt-2 text-center font-medium">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95"
            >
              Submit Answer
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center px-2">
          <button
            onClick={handleAbandon}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            I want to stop
          </button>
          
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-accent-600 hover:text-accent-700 bg-accent-50 px-4 py-2 rounded-lg transition-colors"
          >
            Skip this one
          </button>
        </div>
      </div>
    </div>
  );
};
