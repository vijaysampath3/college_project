import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Activity, Brain, Target, Compass } from 'lucide-react';

export const Step3Processing: React.FC = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1500);
    const timer2 = setTimeout(() => setStage(2), 3000);
    const timer3 = setTimeout(() => setStage(3), 4500);
    const timer4 = setTimeout(() => setStage(4), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-16 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full mb-6">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Behaviour Patterns...</h2>
        <p className="text-gray-600">Please wait while we build your Learning Profile.</p>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 1 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 1 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Target className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 1 ? 'text-success-900' : 'text-gray-500'}`}>Evaluating Persistence</span>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 2 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 2 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Activity className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 2 ? 'text-success-900' : 'text-gray-500'}`}>Measuring Adaptability</span>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 3 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 3 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Compass className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 3 ? 'text-success-900' : 'text-gray-500'}`}>Building Learning Profile</span>
        </div>
        
        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 4 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 4 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Brain className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 4 ? 'text-success-900' : 'text-gray-500'}`}>Generating AI Insights</span>
        </div>
      </div>
    </div>
  );
};
