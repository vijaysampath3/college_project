import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Activity, Eye, Brain } from 'lucide-react';

export const Step3Processing: React.FC = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1500);
    const timer2 = setTimeout(() => setStage(2), 3000);
    const timer3 = setTimeout(() => setStage(3), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full mb-6">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Focus Metrics...</h2>
        <p className="text-gray-600">Please wait while we process your webcam telemetry.</p>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 1 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 1 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Eye className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 1 ? 'text-success-900' : 'text-gray-500'}`}>Calculating Focus Score</span>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 2 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 2 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Activity className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 2 ? 'text-success-900' : 'text-gray-500'}`}>Evaluating Engagement</span>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${stage >= 3 ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
          {stage >= 3 ? <CheckCircle2 className="w-6 h-6 text-success-500" /> : <Brain className="w-6 h-6 text-gray-400" />}
          <span className={`font-medium ${stage >= 3 ? 'text-success-900' : 'text-gray-500'}`}>Generating AI Feedback</span>
        </div>
      </div>
    </div>
  );
};
