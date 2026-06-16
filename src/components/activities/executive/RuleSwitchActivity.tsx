import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface RuleSwitchSortingActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

const SHAPES = ['circle', 'square', 'triangle'];
const COLORS = ['bg-blue-500', 'bg-red-500', 'bg-green-500'];
const RULES = ['Sort by Color', 'Sort by Shape'];

const SETTINGS = {
  Easy: { rounds: 10, timeLimit: 45, switchFrequency: 4 },
  Medium: { rounds: 15, timeLimit: 60, switchFrequency: 3 },
  Hard: { rounds: 20, timeLimit: 75, switchFrequency: 2 }
};

interface SortObject {
  id: number;
  shape: string;
  color: string;
}

export const RuleSwitchSortingActivity: React.FC<RuleSwitchSortingActivityProps> = ({ activity, onComplete }) => {
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const config = SETTINGS[difficulty];

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [round, setRound] = useState(1);
  const [currentRule, setCurrentRule] = useState<string>(RULES[0]);
  const [currentObject, setCurrentObject] = useState<SortObject | null>(null);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [flashRule, setFlashRule] = useState(false);

  const generateObject = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentObject({ id: Date.now(), shape, color });
    setRoundStartTime(Date.now());
  }, []);

  const startGame = () => {
    setPhase('playing');
    setCurrentRule(RULES[0]);
    generateObject();
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
    
    const finalScore = Math.min(100, Math.round(((score * 10) / config.rounds) * (accuracy / 100)));

    onComplete({
      score: finalScore,
      accuracy_percentage: accuracy,
      time_spent_seconds: config.timeLimit - timeLeft,
      metrics: { reaction_time_ms: avgReaction, mistake_count: mistakes }
    });
  }, [score, mistakes, reactionTimes, round, config, timeLeft, onComplete]);

  const handleSort = (binValue: string) => {
    if (phase !== 'playing' || !currentObject) return;

    let isCorrect = false;
    if (currentRule === 'Sort by Color') {
      isCorrect = binValue === currentObject.color;
    } else {
      isCorrect = binValue === currentObject.shape;
    }

    if (isCorrect) {
      const rt = Date.now() - roundStartTime;
      setReactionTimes(prev => [...prev, rt]);
      setScore(s => s + 1);
      
      const newRound = round + 1;
      if (newRound <= config.rounds) {
        setRound(newRound);
        // Maybe switch rule
        if (newRound % config.switchFrequency === 0) {
          setCurrentRule(prev => prev === RULES[0] ? RULES[1] : RULES[0]);
          setFlashRule(true);
          setTimeout(() => setFlashRule(false), 1000);
        }
        generateObject();
      } else {
        endGame();
      }
    } else {
      setMistakes(m => m + 1);
    }
  };

  const renderShape = (shape: string, colorClass: string = 'bg-gray-400') => {
    if (shape === 'circle') return <div className={`w-16 h-16 rounded-full ${colorClass}`} />;
    if (shape === 'square') return <div className={`w-16 h-16 rounded-xl ${colorClass}`} />;
    if (shape === 'triangle') return <div className={`w-16 h-16 ${colorClass}`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />;
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
            <p className="text-primary-700 text-sm">Rule Switch Sorting • {difficulty}</p>
          </div>
        </div>
        {phase === 'playing' && (
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <Clock className="w-5 h-5 text-warning-500" /> {timeLeft}s
          </div>
        )}
      </div>

      <div className="p-8">
        {phase === 'intro' && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Sort the objects based on the current rule shown at the top. Be careful, the rule will change randomly!</p>
            <button onClick={startGame} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              Start Sorting
            </button>
          </div>
        )}

        {phase === 'playing' && currentObject && (
          <div className="space-y-8">
            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
              <span>Object {round} of {config.rounds}</span>
              <span>Mistakes: {mistakes}</span>
            </div>

            <div className={`text-center p-4 rounded-xl transition-colors duration-300 ${flashRule ? 'bg-amber-100 border-2 border-amber-400' : 'bg-indigo-50 border-2 border-indigo-100'}`}>
              <h3 className={`text-2xl font-black ${flashRule ? 'text-amber-700 scale-110' : 'text-indigo-900'} transition-transform`}>
                {currentRule.toUpperCase()}
              </h3>
            </div>

            <div className="flex justify-center py-8">
              {renderShape(currentObject.shape, currentObject.color)}
            </div>

            {currentRule === 'Sort by Color' ? (
              <div className="grid grid-cols-3 gap-4">
                {COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => handleSort(color)}
                    className="p-6 border-2 border-gray-200 rounded-2xl flex flex-col items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full ${color}`} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {SHAPES.map(shape => (
                  <button 
                    key={shape} 
                    onClick={() => handleSort(shape)}
                    className="p-6 border-2 border-gray-200 rounded-2xl flex flex-col items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    {renderShape(shape, 'bg-gray-700')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Activity Complete!</h3>
            <p className="text-gray-600">Your score: {score}/{config.rounds} sorted correctly.</p>
          </div>
        )}
      </div>
    </div>
  );
};
