import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Lightbulb } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';
import { AttentionAssessmentResult } from '../../../types/AttentionAssessmentResult';

interface Props {
  result: AttentionAssessmentResult;
  onFinish: () => void;
}

export const Step5Insights: React.FC<Props> = ({ result, onFinish }) => {
  const { insights } = result;

  if (!insights) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your AI Attention Insights</h2>
        <p className="text-xl text-gray-600">Actionable feedback based on your visual search and scanning performance.</p>
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
              <Activity className="w-6 h-6 text-warning-600" />
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
