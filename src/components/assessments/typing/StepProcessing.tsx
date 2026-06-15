import React, { useState, useEffect } from 'react';
import { Target, Brain, Activity, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui';

export const StepProcessing: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    // 10 second timeout protection
    const slowTimeout = setTimeout(() => {
      setIsSlow(true);
    }, 10000);

    const steps = [
      { delay: 0, index: 1 },
      { delay: 1500, index: 2 },
      { delay: 3000, index: 3 },
      { delay: 4500, index: 4 }
    ];

    const timeouts = steps.map(s => setTimeout(() => setStep(s.index), s.delay));

    return () => {
      clearTimeout(slowTimeout);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Typing Performance...</h2>
        {isSlow ? (
          <p className="text-warning-600 font-medium">Your typing metrics have been saved. AI insights are still being generated.</p>
        ) : (
          <p className="text-gray-600">Please wait while our AI engine evaluates your results.</p>
        )}
      </div>

      <Card className="border-2 border-primary-100 bg-white/50 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <div className="space-y-6">
            <ProcessItem 
              icon={<Zap className="w-5 h-5" />} 
              label="Calculating Words Per Minute (WPM)" 
              active={step >= 1} 
              completed={step > 1} 
            />
            <ProcessItem 
              icon={<Target className="w-5 h-5" />} 
              label="Analyzing Error Patterns" 
              active={step >= 2} 
              completed={step > 2} 
            />
            <ProcessItem 
              icon={<Clock className="w-5 h-5" />} 
              label="Evaluating Typing Rhythm" 
              active={step >= 3} 
              completed={step > 3} 
            />
            <ProcessItem 
              icon={<Brain className="w-5 h-5" />} 
              label="Generating AI Feedback" 
              active={step >= 4} 
              completed={false} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProcessItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  completed: boolean;
}

const ProcessItem: React.FC<ProcessItemProps> = ({ icon, label, active, completed }) => {
  return (
    <div className={`flex items-center gap-4 transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${completed ? 'bg-success-100 text-success-600' : active ? 'bg-primary-100 text-primary-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${completed ? 'text-gray-900' : active ? 'text-primary-700' : 'text-gray-500'}`}>
          {label}
        </div>
      </div>
      {completed && (
        <div className="w-6 h-6 rounded-full bg-success-500 text-white flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
