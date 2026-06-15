import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Button } from '../../../components/ui';
import { Task1Metrics } from '../../../types/AttentionAssessmentResult';

interface Props {
  onComplete: (metrics: Task1Metrics) => void;
}

export const Step2Task1TargetDetection: React.FC<Props> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [grid, setGrid] = useState<string[]>([]);
  const [clickedIndexes, setClickedIndexes] = useState<Set<number>>(new Set());
  
  const metricsRef = useRef<Task1Metrics>({
    reactionTimes: [],
    correctClicks: 0,
    missedTargets: 0,
    falseClicks: 0
  });
  
  const startTimeRef = useRef<number>(0);
  const GRID_SIZE = 30; // 5x6
  const TARGET_CHAR = 'B';
  const DISTRACTOR_CHARS = ['A', 'D', 'P', 'R'];
  
  const [timeLeft, setTimeLeft] = useState(15);

  const generateGrid = () => {
    const newGrid: string[] = [];
    let targetCount = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      if (Math.random() < 0.2 && targetCount < 8) {
        newGrid.push(TARGET_CHAR);
        targetCount++;
      } else {
        const char = DISTRACTOR_CHARS[Math.floor(Math.random() * DISTRACTOR_CHARS.length)];
        newGrid.push(char);
      }
    }
    setGrid(newGrid);
  };

  useEffect(() => {
    generateGrid();
  }, []);

  useEffect(() => {
    if (started && !finished && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && timeLeft === 0 && !finished) {
      handleFinish();
    }
  }, [started, timeLeft, finished]);

  const handleStart = () => {
    setStarted(true);
    startTimeRef.current = performance.now();
  };

  const handleFinish = () => {
    setFinished(true);
    // Calculate missed targets
    const totalTargets = grid.filter(c => c === TARGET_CHAR).length;
    metricsRef.current.missedTargets = totalTargets - metricsRef.current.correctClicks;
    onComplete(metricsRef.current);
  };

  const handleCellClick = (index: number, char: string) => {
    if (!started || finished || clickedIndexes.has(index)) return;
    
    setClickedIndexes(prev => new Set(prev).add(index));
    const clickTime = performance.now();
    
    if (char === TARGET_CHAR) {
      metricsRef.current.correctClicks++;
      metricsRef.current.reactionTimes.push(clickTime - startTimeRef.current);
    } else {
      metricsRef.current.falseClicks++;
    }
  };

  if (!started) {
    return (
      <div className="text-center max-w-2xl mx-auto py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Task 1 of 4 – Target Detection</h3>
        <p className="text-lg text-gray-600 mb-8">
          In this task, you will see a grid of letters. <strong>Click all '{TARGET_CHAR}' characters</strong> as quickly and accurately as possible. You have 15 seconds.
        </p>
        <Button onClick={handleStart} size="lg" className="px-8 py-3 rounded-xl text-lg font-bold">
          Start Task 1
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Task 1: Target Detection</h3>
        <div className="text-lg font-bold text-primary-600">Time Left: {timeLeft}s</div>
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm border-2 border-primary-100 shadow-xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-6 gap-4">
            {grid.map((char, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index, char)}
                disabled={clickedIndexes.has(index) || finished}
                className={`
                  h-16 text-2xl font-bold rounded-xl transition-all
                  ${clickedIndexes.has(index) 
                    ? char === TARGET_CHAR ? 'bg-success-100 text-success-700 border-2 border-success-400' : 'bg-danger-100 text-danger-700 border-2 border-danger-400' 
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 shadow-sm'}
                `}
              >
                {char}
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
