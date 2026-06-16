import React from 'react';
import { Play, Brain, Shield, Clock, Search, Target } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export const Step1Overview: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-2xl mb-6">
          <Brain className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Behaviour Assessment</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover your unique learning profile. This is not a test of knowledge—it's an interactive journey to understand how you learn, adapt, and solve problems.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Target className="w-8 h-8 text-primary-500 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Pattern Discovery</h3>
          <p className="text-sm text-gray-600">Interact with sequences to show us how you process new information.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Shield className="w-8 h-8 text-secondary-500 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Rule Adaptation</h3>
          <p className="text-sm text-gray-600">Navigate changing rules to demonstrate your cognitive flexibility.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Search className="w-8 h-8 text-accent-500 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Persistence</h3>
          <p className="text-sm text-gray-600">Tackle challenges to reveal your approach to problem-solving effort.</p>
        </div>
      </div>

      <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          What to Expect
        </h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">1</span>
            <p><strong>There are no wrong answers.</strong> Focus on engaging naturally.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">2</span>
            <p><strong>Time matters, but so does consistency.</strong> Work at a comfortable, steady pace.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">3</span>
            <p><strong>Takes about 4-5 minutes.</strong> Try to complete it in one sitting without distractions.</p>
          </li>
        </ul>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow active:scale-95"
          >
            Start Assessment
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
