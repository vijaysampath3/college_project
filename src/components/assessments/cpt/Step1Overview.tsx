import React from 'react';
import { Target, AlertTriangle, Play, Zap } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';

interface Step1OverviewProps {
  onNext: () => void;
}

export const Step1Overview: React.FC<Step1OverviewProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
          <Target className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Continuous Performance Test (CPT)</h2>
        <p className="text-xl text-gray-600">Measure your sustained attention, focus, and impulsivity over 5 minutes.</p>
      </div>

      <Card className="border-2 border-primary-100 shadow-xl overflow-hidden mb-8">
        <div className="bg-primary-50 px-8 py-4 border-b border-primary-100 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-primary-600" />
          <h3 className="font-bold text-primary-900">Instructions</h3>
        </div>
        <CardContent className="p-8">
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900 text-lg">Focus on the screen</p>
                <p className="text-gray-600">Letters will flash one by one in the center of the screen.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-success-100 text-success-600 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900 text-lg">Press the SPACEBAR</p>
                <p className="text-gray-600">Press the spacebar as quickly as possible for <strong>EVERY</strong> letter...</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-error-100 text-error-600 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900 text-lg">EXCEPT the letter "X"</p>
                <p className="text-gray-600">If you see an <strong>X</strong>, do <strong>NOT</strong> press anything.</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100">
            <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              The test takes exactly 5 minutes. Try to be as fast and accurate as possible. Maintain your focus throughout the entire test.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" className="px-10 py-6 text-xl rounded-2xl shadow-xl shadow-primary-500/25 hover:scale-105 transition-transform">
          Start Assessment
          <Play className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
};
