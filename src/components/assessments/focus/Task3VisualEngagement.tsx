import React, { useState, useEffect, useRef } from 'react';
import { Target } from 'lucide-react';

interface Props {
  onComplete: (accuracy: number) => void;
}

export const Task3VisualEngagement: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<{ id: string, x: number, y: number, isTarget: boolean }[]>([]);
  const metricsRef = useRef({ correct: 0, wrong: 0, totalSpawned: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const total = metricsRef.current.totalSpawned;
          const acc = total > 0 ? (metricsRef.current.correct / total) * 100 : 0;
          onComplete(acc);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const spawnTimer = setInterval(() => {
      const isTarget = Math.random() > 0.3; // 70% blue targets, 30% red distractors
      if (isTarget) metricsRef.current.totalSpawned++;
      
      const newTarget = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 70 + 10,
        isTarget
      };
      
      setTargets(prev => [...prev, newTarget]);
      
      // Auto remove after 2 seconds
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== newTarget.id));
      }, 2000);
      
    }, 1500); // spawn every 1.5s

    return () => clearInterval(spawnTimer);
  }, []);

  const handleClick = (isTarget: boolean, id: string) => {
    if (isTarget) {
      metricsRef.current.correct++;
    } else {
      metricsRef.current.wrong++;
    }
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full items-center relative">
      <div className="w-full flex justify-end mb-2">
        <div className="bg-primary-100 text-primary-700 px-5 py-2 rounded-xl font-bold font-mono text-lg shadow-sm border border-primary-200">
          ⏱ {timeLeft}s remaining
        </div>
      </div>
      
      <div className="text-center mb-6">
        <Target className="w-10 h-10 text-primary-500 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-gray-900 mb-1">Visual Engagement</h3>
        <p className="text-gray-600">Click the <span className="font-bold text-blue-600">Blue</span> circles. Ignore the <span className="font-bold text-red-500">Red</span> ones.</p>
      </div>

      <div className="w-full max-w-4xl flex-1 bg-gray-50 border-2 border-gray-200 rounded-3xl relative overflow-hidden min-h-[350px]">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => handleClick(t.isTarget, t.id)}
            className={`absolute w-12 h-12 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90 shadow-md ${
              t.isTarget ? 'bg-blue-500 hover:bg-blue-400' : 'bg-red-500 hover:bg-red-400'
            }`}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          />
        ))}
      </div>
    </div>
  );
};
