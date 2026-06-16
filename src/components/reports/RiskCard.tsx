import React from 'react';
import { RiskFactor } from '../../types/Report';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  title: string;
  risk: RiskFactor;
  description?: string;
}

export const RiskCard: React.FC<Props> = ({ title, risk, description }) => {
  const isHigh = risk.level === 'High';
  const isModerate = risk.level === 'Moderate';
  const isLow = risk.level === 'Low';

  const bgColor = isHigh ? 'bg-danger-50' : isModerate ? 'bg-warning-50' : 'bg-success-50';
  const borderColor = isHigh ? 'border-danger-200' : isModerate ? 'border-warning-200' : 'border-success-200';
  const textColor = isHigh ? 'text-danger-700' : isModerate ? 'text-warning-700' : 'text-success-700';
  const progressColor = isHigh ? 'bg-danger-500' : isModerate ? 'bg-warning-500' : 'bg-success-500';

  const Icon = isHigh ? ShieldAlert : isModerate ? AlertTriangle : CheckCircle;

  return (
    <div className={`p-5 rounded-2xl border ${bgColor} ${borderColor} flex flex-col h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white bg-opacity-60`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
          <h4 className="font-bold text-gray-900">{title}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white ${textColor}`}>
          {risk.level} Risk
        </span>
      </div>
      
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

      <div className="mt-auto space-y-3">
        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-gray-500">Probability</span>
            <span className="text-gray-900">{risk.probability}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
            <div className={`h-full ${progressColor}`} style={{ width: `${risk.probability}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-gray-500">Confidence Score</span>
            <span className="text-gray-900">{risk.confidence}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
            <div className={`h-full bg-gray-400`} style={{ width: `${risk.confidence}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
