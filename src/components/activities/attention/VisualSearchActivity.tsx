import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface VisualSearchActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

const SETTINGS = {
  Easy: { target: 'P', distractors: ['Q'], gridSize: 16, timeLimit: 30, maxRounds: 5 },
  Medium: { target: 'b', distractors: ['d'], gridSize: 25, timeLimit: 45, maxRounds: 8 },
  Hard: { target: 'p', distractors: ['q', 'b', 'd'], gridSize: 36, timeLimit: 60, maxRounds: 10 }
};

export const VisualSearchActivity: React.FC<VisualSearchActivityProps> = ({ activity, onComplete }) => {
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const config = SETTINGS[difficulty];

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [grid, setGrid] = useState<{ id: number; char: string; isTarget: boolean }[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const generateGrid = useCallback(() => {
    const newGrid = [];
    const targetIndex = Math.floor(Math.random() * config.gridSize);
    for (let i = 0; i < config.gridSize; i++) {
      if (i === targetIndex) {
        newGrid.push({ id: i, char: config.target, isTarget: true });
      } else {
        const randomDistractor = config.distractors[Math.floor(Math.random() * config.distractors.length)];
        newGrid.push({ id: i, char: randomDistractor, isTarget: false });
      }
    }
    setGrid(newGrid);
    setRoundStartTime(Date.now());
  }, [config]);

  const startGame = () => {
    setPhase('playing');
    generateGrid();
  };

  useEffect(() => {
    let timer: any;
    if (phase === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (phase === 'playing' && timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const endGame = useCallback(() => {
    setPhase('done');
    const totalAttempts = score + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    const avgReaction = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
    
    // Final score out of 100
    const finalScore = Math.min(100, Math.round(((score * 10) / config.maxRounds) * (accuracy / 100)));

    onComplete({
      score: finalScore,
      accuracy_percentage: accuracy,
      time_spent_seconds: config.timeLimit - timeLeft,
      metrics: {
        reaction_time_ms: avgReaction,
        mistake_count: mistakes,
        rounds_completed: round - 1
      }
    });
  }, [score, mistakes, reactionTimes, round, config, timeLeft, onComplete]);

  const handleCellClick = (isTarget: boolean) => {
    if (phase !== 'playing') return;

    if (isTarget) {
      const rt = Date.now() - roundStartTime;
      setReactionTimes(prev => [...prev, rt]);
      setScore(s => s + 1);
      if (round < config.maxRounds) {
        setRound(r => r + 1);
        generateGrid();
      } else {
        endGame();
      }
    } else {
      setMistakes(m => m + 1);
      // Optional: highlight mistake briefly
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Eye className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
            <p className="text-primary-700 text-sm">Find the target: <strong>{config.target}</strong></p>
          </div>
        </div>
        {phase === 'playing' && (
          <div className="flex items-center gap-2 text-xl font-bold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <Clock className="w-6 h-6 text-warning-500" />
            {timeLeft}s
          </div>
        )}
      </div>

      <div className="p-8">
        {phase === 'intro' && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Visual Discrimination</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Find and click the letter <strong>{config.target}</strong> as quickly as possible. Avoid clicking the distractors ({config.distractors.join(', ')}).
            </p>
            <button onClick={startGame} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              Start Game
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-6">
            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              <span>Round {round} of {config.maxRounds}</span>
              <span>Mistakes: <span className="text-danger-500">{mistakes}</span></span>
            </div>
            <div 
              className="grid gap-2" 
              style={{ gridTemplateColumns: `repeat(${Math.sqrt(config.gridSize)}, minmax(0, 1fr))` }}
            >
              {grid.map(cell => (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell.isTarget)}
                  className="aspect-square flex items-center justify-center text-3xl font-medium text-gray-800 bg-gray-50 rounded-xl border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors"
                >
                  {cell.char}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Activity Complete!</h3>
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">{score}/{config.maxRounds}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-danger-500">{mistakes}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Mistakes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
