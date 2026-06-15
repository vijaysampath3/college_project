import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui';

export const Step3Processing: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3000);
    const timer3 = setTimeout(() => setStep(3), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Attention Performance...</h2>
        <p className="text-gray-600">Please wait while our models analyze your visual tracking and search metrics.</p>
      </div>

      <Card className="border-2 border-primary-100 bg-white/50 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4 transition-opacity duration-500">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 1 ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className={`font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Calculating Reaction Times
            </p>
          </div>

          <div className={`flex items-center gap-4 transition-opacity duration-500 delay-100`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 2 ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className={`font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Computing Attention Scores
            </p>
          </div>

          <div className={`flex items-center gap-4 transition-opacity duration-500 delay-200`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 3 ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className={`font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
              Generating AI Feedback
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
