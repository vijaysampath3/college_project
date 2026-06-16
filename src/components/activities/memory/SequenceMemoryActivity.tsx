import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, Clock } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface SequenceMemoryActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

const SETTINGS = {
  Easy: { initialSequence: 3, rounds: 4, speed: 800 },
  Medium: { initialSequence: 4, rounds: 5, speed: 600 },
  Hard: { initialSequence: 5, rounds: 6, speed: 400 }
};

export const SequenceMemoryActivity: React.FC<SequenceMemoryActivityProps> = ({ activity, onComplete }) => {
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const config = SETTINGS[difficulty];

  const [phase, setPhase] = useState<'intro' | 'showing' | 'playing' | 'done'>('intro');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const generateSequence = useCallback((length: number) => {
    const newSeq = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSeq);
    setPlayerInput([]);
  }, []);

  const playSequence = useCallback(async () => {
    setPhase('showing');
    setActiveSquare(null);
    
    // Brief pause before starting
    await new Promise(r => setTimeout(r, 500));

    for (let i = 0; i < sequence.length; i++) {
      setActiveSquare(sequence[i]);
      await new Promise(r => setTimeout(r, config.speed));
      setActiveSquare(null);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setPhase('playing');
  }, [sequence, config.speed]);

  const startGame = () => {
    setStartTime(Date.now());
    setRound(1);
    generateSequence(config.initialSequence);
  };

  useEffect(() => {
    if (sequence.length > 0 && phase === 'intro') {
      playSequence();
    }
  }, [sequence, playSequence, phase]);

  const handleSquareClick = (index: number) => {
    if (phase !== 'playing') return;

    const currentStep = playerInput.length;
    
    if (sequence[currentStep] === index) {
      // Correct click
      const newInput = [...playerInput, index];
      setPlayerInput(newInput);
      
      // Flash the square briefly
      setActiveSquare(index);
      setTimeout(() => setActiveSquare(null), 150);

      if (newInput.length === sequence.length) {
        // Round complete
        setScore(s => s + 1);
        if (round < config.rounds) {
          setTimeout(() => {
            setRound(r => r + 1);
            generateSequence(config.initialSequence + round);
            setPhase('intro'); // trigger replay
          }, 1000);
        } else {
          endGame();
        }
      }
    } else {
      // Wrong click
      setMistakes(m => m + 1);
      setActiveSquare(index); // Show red briefly
      setTimeout(() => {
        setActiveSquare(null);
        // Reset their input for this round so they try again
        setPlayerInput([]);
      }, 500);
    }
  };

  const endGame = () => {
    setPhase('done');
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const totalAttempts = score + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    
    const finalScore = Math.min(100, Math.round(((score * 10) / config.rounds) * (accuracy / 100)));

    onComplete({
      score: finalScore,
      accuracy_percentage: accuracy,
      time_spent_seconds: timeSpent,
      metrics: { mistake_count: mistakes, rounds_completed: score }
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-4">
        <Brain className="w-8 h-8 text-primary-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
          <p className="text-primary-700 text-sm">Sequence Memory • {difficulty}</p>
        </div>
      </div>

      <div className="p-8">
        {phase === 'intro' && sequence.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Memorize the sequence of flashing squares and repeat it back. The sequence will get longer each round.</p>
            <button onClick={startGame} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              Start Memory Challenge
            </button>
          </div>
        )}

        {(phase === 'showing' || phase === 'playing' || (phase === 'intro' && sequence.length > 0)) && (
          <div className="space-y-8">
            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
              <span>Round {round} of {config.rounds}</span>
              <span>Mistakes: {mistakes}</span>
            </div>

            <div className="text-center mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${phase === 'showing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {phase === 'showing' ? 'Memorize the sequence...' : 'Your turn! Repeat the sequence.'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div 
                  key={i}
                  onClick={() => handleSquareClick(i)}
                  className={`aspect-square rounded-xl shadow-sm border-2 transition-all duration-100 ${
                    phase === 'playing' ? 'cursor-pointer hover:bg-indigo-50' : ''
                  } ${
                    activeSquare === i && phase === 'showing' ? 'bg-primary-500 border-primary-600 scale-105' :
                    activeSquare === i && phase === 'playing' ? (playerInput[playerInput.length - 1] === i ? 'bg-success-500 border-success-600' : 'bg-error-500 border-error-600') :
                    'bg-gray-100 border-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              {sequence.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < playerInput.length ? 'bg-primary-600' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Challenge Complete!</h3>
            <p className="text-gray-600">You completed {score} rounds with {mistakes} mistakes.</p>
          </div>
        )}
      </div>
    </div>
  );
};
