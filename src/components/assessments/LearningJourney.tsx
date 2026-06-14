import React from 'react';
import { Check, Lock } from 'lucide-react';
import { AssessmentInfo } from './AssessmentCard';

interface LearningJourneyProps {
  assessments: AssessmentInfo[];
}

export const LearningJourney: React.FC<LearningJourneyProps> = ({ assessments }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Your Learning Journey</h3>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-6 relative">
          {assessments.map((assessment, index) => {
            const isCompleted = assessment.status === 'Completed';
            const isInProgress = assessment.status === 'In Progress';
            
            let dotColor = 'bg-gray-200 border-gray-300';
            let icon = <Lock className="w-4 h-4 text-gray-400" />;
            
            if (isCompleted) {
              dotColor = 'bg-success-500 border-success-600';
              icon = <Check className="w-4 h-4 text-white" />;
            } else if (isInProgress) {
              dotColor = 'bg-primary-500 border-primary-600 shadow-md shadow-primary-500/20';
              icon = <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />;
            } else if (index === 0 || assessments[index - 1]?.status === 'Completed') {
              dotColor = 'bg-white border-primary-300';
              icon = <div className="w-2.5 h-2.5 bg-primary-400 rounded-full" />;
            }

            return (
              <div key={assessment.id} className="flex gap-4 group">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white z-10 shrink-0 transition-all ${dotColor}`}>
                  {icon}
                </div>
                <div className="pt-2 flex-1">
                  <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : isInProgress ? 'text-primary-700' : 'text-gray-500'}`}>
                    {assessment.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{assessment.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
