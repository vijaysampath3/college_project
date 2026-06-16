import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface PatternRecognitionActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

type SequenceType = 'shape' | 'color' | 'number' | 'mixed';
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
const SHAPES = ['rounded-none', 'rounded-full', 'clip-path-triangle']; // standard css utilities or custom classes
const NUMBERS = ['1', '2', '3', '4', '5', '7', '9'];

const SETTINGS = {
  Easy: { sequenceLength: 3, rounds: 5, types: ['number', 'color'] as SequenceType[], timeLimit: 45 },
  Medium: { sequenceLength: 4, rounds: 7, types: ['shape', 'color', 'number'] as SequenceType[], timeLimit: 60 },
  Hard: { sequenceLength: 5, rounds: 10, types: ['shape', 'color', 'number', 'mixed'] as SequenceType[], timeLimit: 90 }
};

interface PatternItem {
  id: number;
  label: string;
  color: string;
  shape: string;
}

export const PatternRecognitionActivity: React.FC<PatternRecognitionActivityProps> = ({ activity, onComplete }) => {
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const config = SETTINGS[difficulty];

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<PatternItem[]>([]);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number>(0);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);

  const generatePattern = useCallback(() => {
    const type = config.types[Math.floor(Math.random() * config.types.length)];
    const newSeq: PatternItem[] = [];
    
    let baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    let baseShape = 'rounded-lg';
    
    // Simple arithmetic or repeating pattern logic
    const startNum = Math.floor(Math.random() * 3) + 1;
    const step = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < config.sequenceLength; i++) {
      let item = { id: i, label: '', color: baseColor, shape: baseShape };
      
      if (type === 'number') {
        item.label = (startNum + i * step).toString();
      } else if (type === 'color') {
        item.color = COLORS[i % COLORS.length];
      } else if (type === 'shape') {
        item.shape = SHAPES[i % SHAPES.length] || baseShape;
      } else {
        item.label = (startNum + i * step).toString();
        item.color = COLORS[i % COLORS.length];
      }
      newSeq.push(item);
    }

    // Determine the next correct item in the sequence
    const nextIndex = config.sequenceLength;
    const correctAnswer: PatternItem = {
      id: 999,
      label: type === 'number' || type === 'mixed' ? (startNum + nextIndex * step).toString() : '',
      color: type === 'color' || type === 'mixed' ? COLORS[nextIndex % COLORS.length] : baseColor,
      shape: type === 'shape' ? (SHAPES[nextIndex % SHAPES.length] || baseShape) : baseShape,
    };

    // Generate wrong options
    const newOptions = [correctAnswer];
    while (newOptions.length < 4) {
      const wrongOpt = {
        id: Math.random(),
        label: type === 'number' || type === 'mixed' ? (startNum + nextIndex * step + Math.floor(Math.random() * 5 + 1)).toString() : '',
        color: type === 'color' || type === 'mixed' ? COLORS[Math.floor(Math.random() * COLORS.length)] : baseColor,
        shape: type === 'shape' ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : baseShape,
      };
      
      // Avoid exact duplicates
      if (!newOptions.find(o => o.label === wrongOpt.label && o.color === wrongOpt.color && o.shape === wrongOpt.shape)) {
        newOptions.push(wrongOpt);
      }
    }

    setSequence(newSeq);
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setCorrectAnswerId(999);
    setRoundStartTime(Date.now());
  }, [config]);

  const startGame = () => {
    setPhase('playing');
    generatePattern();
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

  const handleOptionClick = (id: number) => {
    if (phase !== 'playing') return;

    if (id === correctAnswerId) {
      const rt = Date.now() - roundStartTime;
      setReactionTimes(prev => [...prev, rt]);
      setScore(s => s + 1);
      
      if (round < config.rounds) {
        setRound(r => r + 1);
        generatePattern();
      } else {
        endGame();
      }
    } else {
      setMistakes(m => m + 1);
    }
  };

  const renderItem = (item: PatternItem, isOption = false) => {
    const isTriangle = item.shape === 'clip-path-triangle';
    return (
      <div 
        className={`flex items-center justify-center font-bold text-white shadow-sm border border-black/10 transition-transform ${isOption ? 'cursor-pointer hover:scale-105' : ''} ${item.color} ${!isTriangle ? item.shape : ''}`}
        style={{ 
          width: '60px', 
          height: '60px',
          clipPath: isTriangle ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
          fontSize: '24px'
        }}
        onClick={() => isOption && handleOptionClick(item.id)}
      >
        {item.label}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
            <p className="text-primary-700 text-sm">Pattern Recognition • {difficulty}</p>
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
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Observe the sequence and identify the next correct item in the pattern before time runs out.</p>
            <button onClick={startGame} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              Start Activity
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-12">
            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
              <span>Round {round} of {config.rounds}</span>
              <span>Mistakes: {mistakes}</span>
            </div>

            <div className="flex items-center justify-center gap-4 p-8 bg-gray-50 rounded-2xl border border-gray-200">
              {sequence.map(item => (
                <React.Fragment key={item.id}>
                  {renderItem(item)}
                  <span className="text-gray-400 font-bold text-xl">→</span>
                </React.Fragment>
              ))}
              <div className="w-[60px] h-[60px] border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-2xl font-bold">
                ?
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Select Next:</h4>
              <div className="flex items-center justify-center gap-6">
                {options.map(opt => (
                  <div key={opt.id} onClick={() => handleOptionClick(opt.id)}>
                    {renderItem(opt, true)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Activity Complete!</h3>
            <p className="text-gray-600">Your score: {score}/{config.rounds}</p>
          </div>
        )}
      </div>
    </div>
  );
};
