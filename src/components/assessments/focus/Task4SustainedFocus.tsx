import React, { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';

interface Props {
  onComplete: (accuracy: number) => void;
}

export const Task4SustainedFocus: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const metricsRef = useRef({ correct: 0, total: 0 });

  useEffect(() => {
    // Generate a long sequence of numbers to track
    const newSeq = Array.from({ length: 30 }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(newSeq);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const total = metricsRef.current.total;
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

  // Progress the sequence slowly
  useEffect(() => {
    const seqTimer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % sequence.length);
    }, 2000); // changes every 2 seconds
    return () => clearInterval(seqTimer);
  }, [sequence.length]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!sequence.length) return;
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      metricsRef.current.total++;
      if (num === sequence[currentIndex]) {
        metricsRef.current.correct++;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, sequence]);

  return (
    <div className="flex flex-col h-full items-center justify-center relative">
      <div className="w-full flex justify-end mb-2">
        <div className="bg-primary-100 text-primary-700 px-5 py-2 rounded-xl font-bold font-mono text-lg shadow-sm border border-primary-200">
          ⏱ {timeLeft}s remaining
        </div>
      </div>
      
      <div className="text-center mb-12">
        <Eye className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sustained Focus Challenge</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Keep your eyes on the screen. Press the number on your keyboard that matches the active number below.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-2xl bg-gray-50 p-8 rounded-3xl border-2 border-gray-200">
        {sequence.map((num, i) => {
          // Only show 5 numbers around the current index
          if (Math.abs(i - currentIndex) > 2) return null;
          
          const isActive = i === currentIndex;
          return (
            <div 
              key={i} 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-500 text-white scale-125 shadow-lg' 
                  : 'bg-white text-gray-400 border-2 border-gray-200 scale-90'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
