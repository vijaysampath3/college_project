import React from 'react';
import { Brain, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { TypingAssessmentResult } from '../../../types/TypingAssessmentResult';

interface Step4InsightsProps {
  result: TypingAssessmentResult;
  onFinish: () => void;
}

export const Step4Insights: React.FC<Step4InsightsProps> = ({ result, onFinish }) => {
  const { insights } = result;

  if (!insights) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Insights Generated</h2>
        <p className="text-gray-600 mb-8">AI insights could not be loaded at this time. Your scores have still been saved.</p>
        <Button size="lg" onClick={onFinish} className="px-10 py-6 text-lg rounded-2xl">
          Return to Dashboard
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white mb-6 shadow-xl">
          <Brain className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Performance Analysis</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {insights.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-primary-500">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Typing Rhythm
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {insights.typingRhythmAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-secondary-500">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-secondary-500" />
              Error Analysis
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {insights.errorAnalysis}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-primary-600" />
            Actionable Recommendations
          </h3>
          <div className="grid gap-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-primary-100">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-8">
        <Button size="lg" onClick={onFinish} className="px-10 py-6 text-lg rounded-2xl shadow-xl shadow-primary-500/20">
          Return to Dashboard
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
};

function Target(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
