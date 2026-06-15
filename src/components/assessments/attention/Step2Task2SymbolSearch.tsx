import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Button } from '../../../components/ui';
import { Task2Metrics } from '../../../types/AttentionAssessmentResult';

interface Props {
  onComplete: (metrics: Task2Metrics) => void;
}

export const Step2Task2SymbolSearch: React.FC<Props> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [grid, setGrid] = useState<string[]>([]);
  const [clickedIndexes, setClickedIndexes] = useState<Set<number>>(new Set());
  
  const startTimeRef = useRef<number>(0);
  const correctClicksRef = useRef(0);
  const distractorClicksRef = useRef(0);
  
  const GRID_SIZE = 40; // 5x8
  const TARGET_SYMBOL = '★';
  const DISTRACTOR_SYMBOLS = ['☆', '▲', '△', '●', '○', '■', '□'];
  const TARGET_COUNT = 5;

  const generateGrid = () => {
    const newGrid: string[] = [];
    for (let i = 0; i < GRID_SIZE - TARGET_COUNT; i++) {
      newGrid.push(DISTRACTOR_SYMBOLS[Math.floor(Math.random() * DISTRACTOR_SYMBOLS.length)]);
    }
    for (let i = 0; i < TARGET_COUNT; i++) {
      newGrid.push(TARGET_SYMBOL);
    }
    // Shuffle
    for (let i = newGrid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newGrid[i], newGrid[j]] = [newGrid[j], newGrid[i]];
    }
    setGrid(newGrid);
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const handleStart = () => {
    setStarted(true);
    startTimeRef.current = performance.now();
  };

  const handleFinish = () => {
    if (finished) return;
    setFinished(true);
    
    const searchSpeed = performance.now() - startTimeRef.current;
    const accuracy = Math.min(100, (correctClicksRef.current / Math.max(1, correctClicksRef.current + distractorClicksRef.current)) * 100);
    
    onComplete({
      searchSpeed,
      accuracy,
      distractorClicks: distractorClicksRef.current
    });
  };

  const handleCellClick = (index: number, symbol: string) => {
    if (!started || finished || clickedIndexes.has(index)) return;
    
    setClickedIndexes(prev => new Set(prev).add(index));
    
    if (symbol === TARGET_SYMBOL) {
      correctClicksRef.current++;
      if (correctClicksRef.current >= TARGET_COUNT) {
        handleFinish();
      }
    } else {
      distractorClicksRef.current++;
    }
  };

  if (!started) {
    return (
      <div className="text-center max-w-2xl mx-auto py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Task 2 of 4 – Symbol Search</h3>
        <p className="text-lg text-gray-600 mb-8">
          In this task, you will see a grid of various symbols. <strong>Find and click all {TARGET_COUNT} '{TARGET_SYMBOL}' symbols</strong> as fast as you can. The task ends when you find all of them.
        </p>
        <Button onClick={handleStart} size="lg" className="px-8 py-3 rounded-xl text-lg font-bold">
          Start Task 2
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Task 2: Symbol Search</h3>
        <div className="text-lg font-bold text-primary-600">
          Targets Found: {correctClicksRef.current} / {TARGET_COUNT}
        </div>
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm border-2 border-primary-100 shadow-xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-8 gap-3">
            {grid.map((symbol, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index, symbol)}
                disabled={clickedIndexes.has(index) || finished}
                className={`
                  h-14 text-2xl flex items-center justify-center rounded-xl transition-all
                  ${clickedIndexes.has(index) 
                    ? symbol === TARGET_SYMBOL ? 'bg-success-100 text-success-700 border-2 border-success-400' : 'bg-danger-100 text-danger-700 border-2 border-danger-400' 
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 shadow-sm'}
                `}
              >
                {symbol}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {finished && (
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600 mb-4">Task complete! Moving to the next task...</p>
        </div>
      )}
    </div>
  );
};
