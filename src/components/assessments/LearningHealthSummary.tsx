import React from 'react';
import { Brain, Target, BookOpen, HeartPulse } from 'lucide-react';

interface HealthMetricProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const HealthMetric: React.FC<HealthMetricProps> = ({ label, value, icon, color, trend }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-0.5">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {trend && <span className="text-xs font-medium text-success-600">{trend}</span>}
      </div>
    </div>
  </div>
);

export const LearningHealthSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-danger-50 text-danger-500 flex items-center justify-center">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Learning Health</h3>
          <p className="text-sm text-gray-500">Based on your recent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HealthMetric 
          label="Overall Score"
          value="85/100"
          trend="+5%"
          icon={<Brain className="w-6 h-6" />}
          color="bg-primary-100 text-primary-600"
        />
        <HealthMetric 
          label="Reading Risk"
          value="Low"
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-success-100 text-success-600"
        />
        <HealthMetric 
          label="Attention"
          value="Strong"
          icon={<Target className="w-6 h-6" />}
          color="bg-secondary-100 text-secondary-600"
        />
        <HealthMetric 
          label="Learning Style"
          value="Visual"
          icon={<Brain className="w-6 h-6" />}
          color="bg-warning-100 text-warning-600"
        />
      </div>
    </div>
  );
};
