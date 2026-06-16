import React, { useState, useEffect } from 'react';
import { Play, Square, Trophy, CheckCircle } from 'lucide-react';
import { LearningActivity } from '../../services/activity.service';

interface GenericActivityPlayerProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

export const GenericActivityPlayer: React.FC<GenericActivityPlayerProps> = ({ activity, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(100); // Default to 100 for generic player
  
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleComplete = () => {
    setIsPlaying(false);
    onComplete({
      score: score,
      accuracy_percentage: score,
      time_spent_seconds: timeSpent,
      metrics: {}
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2>
        <p className="text-gray-600 mb-8">{activity.description}</p>
        
        {!isPlaying ? (
          <button
            onClick={() => setIsPlaying(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Play className="w-5 h-5" />
            <span>{timeSpent === 0 ? 'Start Activity' : 'Resume Activity'}</span>
          </button>
        ) : (
          <div className="space-y-8 w-full animate-fade-in">
            <div className="flex items-center justify-center space-x-4 mb-4 text-gray-600">
              <span className="font-mono text-xl">{Math.floor(timeSpent / 60).toString().padStart(2, '0')}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
              <p className="text-indigo-800 text-lg">
                [ Interactive Activity Canvas for <span className="font-bold">{activity.activity_type}</span> would be rendered here ]
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Simulate Score (0-100)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={score} 
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="text-center font-bold text-indigo-700 mt-2">{score}%</div>
              </div>
              
              <button
                onClick={handleComplete}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm w-full max-w-xs justify-center"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit & Complete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
