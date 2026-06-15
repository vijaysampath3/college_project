import React from 'react';
import { Target, Activity, Zap, Brain, ChevronRight } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';
import { CPTAssessmentResult } from '../../../types/CPTAssessmentResult';

interface Step3ResultsProps {
  result: CPTAssessmentResult;
  onViewInsights: () => void;
}

export const Step3Results: React.FC<Step3ResultsProps> = ({ result, onViewInsights }) => {
  const { metrics, inference } = result;
  
  const getRiskLevelColor = (level: number) => {
    if (level === 1) return 'text-error-600 bg-error-50 border-error-200';
    return 'text-success-600 bg-success-50 border-success-200';
  };

  const getRiskLevelText = (level: number, prob: number) => {
    if (prob >= 0.7) return 'High';
    if (prob >= 0.4) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete</h2>
        <p className="text-xl text-gray-600">Your Continuous Performance Test results have been calculated.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-primary-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-primary-100 pb-4">
              <Activity className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Attention Model Output</h3>
            </div>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${getRiskLevelColor(inference.predictionClass)}`}>
                <span className="font-semibold text-lg">Attention Risk Level</span>
                <span className="text-2xl font-bold">{getRiskLevelText(inference.predictionClass, inference.predictionProbability)}</span>
              </div>
              
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Model Confidence (Risk Prob)</span>
                <span className="font-bold">{(inference.predictionProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">ADHD Confidence Index Proxy</span>
                <span className="font-bold">{metrics["Adhd Confidence Index"].toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-primary-100 pb-4">
              <Target className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Omissions (Missed Targets)</span>
                <span className="font-bold">{metrics["Raw Score Omissions"]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Commissions (Impulsive Presses)</span>
                <span className="font-bold">{metrics["Raw Score Commissions"]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Reaction Time</span>
                <span className="font-bold">{metrics["Raw Score HitRT"].toFixed(0)} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Attention Consistency (HitSE)</span>
                <span className="font-bold">{metrics["Raw Score HitSE"].toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Detectability (D-Prime)</span>
                <span className="font-bold">{metrics["Raw Score DPrime"].toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={onViewInsights}
          size="lg" 
          className="px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          <Brain className="w-6 h-6 mr-2" />
          View AI Learning Insights
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
