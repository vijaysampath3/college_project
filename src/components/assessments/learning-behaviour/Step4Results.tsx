import React from 'react';
import { ArrowRight, Activity, Target, Zap, Clock, ShieldCheck, Compass } from 'lucide-react';
import { LearningBehaviourResult } from '../../../types/LearningBehaviourResult';

interface Props {
  result: LearningBehaviourResult;
  onNext: () => void;
}

export const Step4Results: React.FC<Props> = ({ result, onNext }) => {
  const { scores, profile } = result;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const MetricCard = ({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-gray-500 font-medium mb-1">{title}</h4>
      <div className={`text-3xl font-bold mb-2 ${getScoreColor(value)}`}>
        {value}
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Behavioural Blueprint</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We've analyzed how you approached the challenges. Here is your cognitive breakdown.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Core Scores */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard 
            title="Persistence" 
            value={scores.persistenceScore} 
            icon={<Target className="w-6 h-6 text-primary-500" />} 
            description="Effort maintained during challenges"
          />
          <MetricCard 
            title="Adaptability" 
            value={scores.adaptabilityScore} 
            icon={<Activity className="w-6 h-6 text-secondary-500" />} 
            description="Flexibility when rules change"
          />
          <MetricCard 
            title="Consistency" 
            value={scores.consistencyScore} 
            icon={<ShieldCheck className="w-6 h-6 text-success-500" />} 
            description="Steadiness of performance"
          />
          <MetricCard 
            title="Processing Style" 
            value={scores.processingStyleScore} 
            icon={<Clock className="w-6 h-6 text-accent-500" />} 
            description="Balance of speed vs accuracy"
          />
        </div>

        {/* Learning Profile Visualization */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Compass className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">Learning Profile</h3>
          </div>
          
          <div className="mb-8">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Dominant Style</div>
            <div className="text-2xl font-bold text-primary-700 bg-primary-50 px-4 py-2 rounded-xl inline-block border border-primary-100">
              {profile.dominantProfile}
            </div>
          </div>

          <div className="space-y-5">
            {[
              { label: 'Visual', value: profile.visual, color: 'bg-indigo-500' },
              { label: 'Interactive', value: profile.interactive, color: 'bg-emerald-500' },
              { label: 'Analytical', value: profile.analytical, color: 'bg-amber-500' },
              { label: 'Sequential', value: profile.sequential, color: 'bg-rose-500' },
            ].map(trait => (
              <div key={trait.label}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">{trait.label}</span>
                  <span className="text-gray-900 font-bold">{trait.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${trait.color} transition-all duration-1000`}
                    style={{ width: `${trait.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Overall Behaviour Score</h3>
          <p className="text-gray-600">A measure of your positive learning behaviours.</p>
        </div>
        <div className="text-4xl font-black text-primary-700">
          {scores.learningBehaviourScore}<span className="text-2xl text-primary-400">/100</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm active:scale-95"
        >
          View AI Learning Insights
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
