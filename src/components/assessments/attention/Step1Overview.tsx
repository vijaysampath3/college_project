import React from 'react';
import { Target, Search, Maximize, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';

interface Step1OverviewProps {
  onNext: () => void;
}

export const Step1Overview: React.FC<Step1OverviewProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Attention Assessment</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          This assessment evaluates your visual attention, search speed, and distractor filtering through four engaging challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="border-l-4 border-l-primary-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Target Detection</h3>
                <p className="text-gray-600 text-sm">Find specific letters in a crowded grid quickly and accurately.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-50 rounded-xl text-secondary-600">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Symbol Search</h3>
                <p className="text-gray-600 text-sm">Scan a field of symbols and locate the correct targets.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-success-50 rounded-xl text-success-600">
                <Maximize className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pattern Matching</h3>
                <p className="text-gray-600 text-sm">Memorize a brief pattern and determine if the next one matches.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-warning-50 rounded-xl text-warning-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Rapid Visual Scanning</h3>
                <p className="text-gray-600 text-sm">React instantly when a specific target symbol appears.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" className="px-10 py-4 text-lg rounded-xl shadow-lg">
          Begin Assessment
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
