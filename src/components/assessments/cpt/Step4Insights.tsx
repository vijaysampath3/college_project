import React from 'react';
import { Sparkles, ArrowRight, Brain, Lightbulb, ShieldCheck } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';
import { CPTAssessmentResult } from '../../../types/CPTAssessmentResult';

interface Step4InsightsProps {
  result: CPTAssessmentResult;
  onFinish: () => void;
}

export const Step4Insights: React.FC<Step4InsightsProps> = ({ result, onFinish }) => {
  const { insights, inference } = result;

  if (!insights) return null;

  const getRiskLevelText = (prob: number) => {
    if (prob >= 0.7) return 'High Attention Risk';
    if (prob >= 0.4) return 'Moderate Attention Risk';
    return 'Low Attention Risk';
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your AI Learning Insights</h2>
        <p className="text-xl text-gray-600">Based on your {getRiskLevelText(inference.predictionProbability)} profile.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-l-4 border-l-success-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-success-600" />
              <h3 className="text-xl font-bold text-gray-900">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {insights.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success-400 mt-2 shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{strength}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ActivityIcon className="w-6 h-6 text-warning-600" />
              <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {insights.areasForImprovement.map((area, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning-400 mt-2 shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{area}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-500 shadow-md bg-primary-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Actionable Recommendations</h3>
            </div>
            <ul className="space-y-4">
              {insights.actionableRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-primary-100 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-10">
        <Button onClick={onFinish} size="lg" className="px-8 py-4 text-lg rounded-xl shadow-lg">
          Return to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
