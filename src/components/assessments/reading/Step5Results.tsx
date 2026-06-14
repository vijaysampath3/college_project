import React from 'react';
import { Award, Brain, Activity, Clock, AlertTriangle, CheckCircle, ArrowLeft, Lightbulb, Target } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';

interface Step5ResultsProps {
  onReturn: () => void;
}

export const Step5Results: React.FC<Step5ResultsProps> = ({ onReturn }) => {
  // Fixed professional mock values for Phase 2B
  const mockResults = {
    accuracy: 88,
    speed: 110,
    pronunciation: 84,
    errors: 3,
    risk: 'Moderate',
    confidence: 91,
    summary: 'The student demonstrates a solid baseline in reading speed, though there are occasional hesitations indicating slight difficulty with phonemic decoding on advanced multi-syllabic words.',
    recommendations: [
      'Focus on phonemic awareness exercises for 10 minutes daily.',
      'Practice reading aloud with immediate feedback on pronunciation.',
      'Introduce vocabulary building modules targeting advanced academic terms.'
    ]
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
        <p className="text-lg text-gray-600">
          Your reading assessment has been successfully processed. The preliminary results are available below.
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Reading Accuracy</p>
            <p className="text-3xl font-bold text-gray-900">{mockResults.accuracy}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-secondary-50 text-secondary-600 rounded-full flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Reading Speed</p>
            <p className="text-3xl font-bold text-gray-900">{mockResults.speed} <span className="text-lg">WPM</span></p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-success-50 text-success-600 rounded-full flex items-center justify-center mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pronunciation Score</p>
            <p className="text-3xl font-bold text-gray-900">{mockResults.pronunciation}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-warning-50 text-warning-600 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Word Errors</p>
            <p className="text-3xl font-bold text-gray-900">{mockResults.errors}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-danger-50 text-danger-600 rounded-full flex items-center justify-center mb-3">
              <Brain className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Reading Risk</p>
            <p className="text-2xl font-bold text-gray-900">{mockResults.risk}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-info-50 text-info-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Model Confidence</p>
            <p className="text-3xl font-bold text-gray-900">{mockResults.confidence}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary and Recommendations */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-500" />
            Performance Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {mockResults.summary}
          </p>
        </div>

        <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
          <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning-500" />
            Recommended Next Steps
          </h3>
          <ul className="space-y-3">
            {mockResults.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                <span className="text-primary-800">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center border-t border-gray-100 pt-8">
        <Button size="lg" onClick={onReturn}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return to Assessment Hub
        </Button>
      </div>
    </div>
  );
};


