import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, CheckCircle2 } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface TypingDrillActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

const PASSAGES = {
  Easy: "The quick brown fox jumps over the lazy dog. Practice makes perfect when you are learning to type.",
  Medium: "Concentration and muscle memory are key to improving your typing speed. Do not look down at the keyboard.",
  Hard: "Punctuation, capitalization, and complex formatting will test your true typing proficiency. Can you maintain accuracy?"
};

export const TypingDrillActivity: React.FC<TypingDrillActivityProps> = ({ activity, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro');
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const textToType = PASSAGES[difficulty];
  
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const startTest = () => {
    setPhase('test');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finishTest = useCallback(() => {
    setPhase('done');
    if (startTime) {
      const timeSpentSec = Math.round((Date.now() - startTime) / 1000);
      const totalChars = textToType.length;
      const words = totalChars / 5;
      const wpm = Math.round((words / timeSpentSec) * 60) || 0;
      const accuracy = Math.round(((totalChars - mistakes) / totalChars) * 100);
      
      const score = Math.round((wpm * 0.5) + (accuracy * 0.5));
      const finalScore = Math.max(0, Math.min(100, score));

      onComplete({
        score: finalScore,
        accuracy_percentage: accuracy,
        time_spent_seconds: timeSpentSec,
        metrics: { wpm, mistake_count: mistakes }
      });
    }
  }, [startTime, mistakes, textToType, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'test') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace') return;
    e.preventDefault();

    if (e.key === 'Backspace') {
      if (typedText.length > 0) {
        setTypedText(prev => prev.slice(0, -1));
      }
    } else {
      const expectedChar = textToType[typedText.length];
      if (!expectedChar) return;

      if (e.key !== expectedChar) {
        setMistakes(m => m + 1);
      }
      
      const newTyped = typedText + e.key;
      setTypedText(newTyped);

      if (newTyped.length === textToType.length) {
        finishTest();
      }
    }
  };

  const renderText = () => {
    return textToType.split('').map((char, index) => {
      let className = "text-3xl font-mono relative transition-colors duration-75 ";
      
      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += "text-success-600 bg-success-50";
        } else {
          className += "text-error-600 bg-error-50";
          if (char === ' ') className += " underline decoration-error-500 decoration-4";
        }
      } else if (index === typedText.length) {
        className += "text-primary-600 bg-primary-50 relative";
        return (
          <span key={index} className={className}>
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500 animate-pulse"></span>
            {char}
          </span>
        );
      } else {
        className += "text-gray-400";
      }

      return <span key={index} className={className}>{char}</span>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-4">
        <Keyboard className="w-8 h-8 text-primary-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
          <p className="text-primary-700 text-sm">Typing Drill • Difficulty: {difficulty}</p>
        </div>
      </div>

      <div className="p-8">
        {phase === 'intro' && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-8">Type the following text as accurately and quickly as possible.</p>
            <button onClick={startTest} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              Start Typing Drill
            </button>
          </div>
        )}

        {phase === 'test' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-500">
              <span>Progress: {Math.round((typedText.length / textToType.length) * 100)}%</span>
              <span>Mistakes: {mistakes}</span>
            </div>
            <div 
              className="relative rounded-xl p-8 bg-gray-50/50 min-h-[200px] cursor-text select-none outline-none border-2 border-primary-200"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-text z-0"
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <div className="relative z-10 leading-relaxed tracking-wide pointer-events-none whitespace-pre-wrap">
                {renderText()}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Drill Complete!</h3>
            <p className="text-gray-600">Your metrics have been recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
