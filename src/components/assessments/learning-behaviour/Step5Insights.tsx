import React from 'react';
import { Brain, Star, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';
import { LearningBehaviourResult } from '../../../types/LearningBehaviourResult';

interface Props {
  result: LearningBehaviourResult;
  onFinish: () => void;
}

export const Step5Insights: React.FC<Props> = ({ result, onFinish }) => {
  const { insights } = result;

  if (!insights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Insights could not be generated at this time.</p>
        <button onClick={onFinish} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg">Finish</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full mb-6">
          <Brain className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Learning Insights</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {insights.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-success-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-100 rounded-lg">
              <Star className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Key Strengths</h3>
          </div>
          <ul className="space-y-4">
            {insights.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
                <span className="text-gray-700 leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-warning-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Growth Areas</h3>
          </div>
          <ul className="space-y-4">
            {insights.growthAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warning-400 shrink-0 mt-2"></div>
                <span className="text-gray-700 leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Actionable Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {insights.recommendations.map((rec, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="text-primary-200 font-bold mb-2 text-sm uppercase tracking-wider">Action {i + 1}</div>
                <p className="text-white leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onFinish}
          className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
