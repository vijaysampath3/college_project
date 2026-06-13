import React from 'react';
import {
  BookOpen,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  date: string;
  score?: number;
  status?: string;
}

export const RecentActivityList: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
  <div className="space-y-4">
    {activities.map((activity) => (
      <div
        key={activity.id}
        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div
          className={`p-2 rounded-lg ${
            activity.type === 'assessment'
              ? 'bg-primary-100 text-primary-600'
              : 'bg-secondary-100 text-secondary-600'
          }`}
        >
          {activity.type === 'assessment' ? (
            <FileText className="w-5 h-5" />
          ) : (
            <Lightbulb className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{activity.title}</p>
          <p className="text-sm text-gray-500">{activity.date}</p>
        </div>
        {activity.score !== undefined && (
          <Badge variant={activity.score >= 70 ? 'success' : activity.score >= 50 ? 'warning' : 'danger'}>
            {activity.score}%
          </Badge>
        )}
      </div>
    ))}
  </div>
);

interface Recommendation {
  id: number;
  title: string;
  description: string;
  priority: string;
  category: string;
}

export const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
  const priorityColors = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  } as const;

  const categoryIcons = {
    reading: BookOpen,
    attention: Target,
    general: Brain,
  };

  const Icon = categoryIcons[recommendation.category as keyof typeof categoryIcons] || Brain;

  return (
    <div className="p-5 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 group-hover:from-primary-200 group-hover:to-secondary-200 transition-colors">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
            <Badge variant={priorityColors[recommendation.priority as keyof typeof priorityColors]} size="sm">
              {recommendation.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{recommendation.description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </div>
  );
};

interface Alert {
  id: number;
  type: string;
  message: string;
  date: string;
}

export const AlertPanel: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const alertStyles = {
    warning: { bg: 'bg-warning-50', border: 'border-warning-200', icon: AlertTriangle, text: 'text-warning-700' },
    danger: { bg: 'bg-danger-50', border: 'border-danger-200', icon: AlertTriangle, text: 'text-danger-700' },
    success: { bg: 'bg-success-50', border: 'border-success-200', icon: CheckCircle2, text: 'text-success-700' },
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const style = alertStyles[alert.type as keyof typeof alertStyles] || alertStyles.warning;
        const Icon = style.icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-xl ${style.bg} border ${style.border}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 ${style.text}`} />
            <div className="flex-1">
              <p className={`font-medium ${style.text}`}>{alert.message}</p>
              <p className={`text-sm mt-1 ${style.text} opacity-70`}>{alert.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface Student {
  id: number;
  name: string;
  grade: string;
  riskLevel: string;
  lastAssessment: string;
  progress: number;
}

export const StudentTable: React.FC<{ students: Student[] }> = ({ students }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Student</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Grade</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Risk Level</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Progress</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Last Assessment</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-sm">
                  {student.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{student.name}</span>
              </div>
            </td>
            <td className="py-3 px-4 text-gray-600">{student.grade}</td>
            <td className="py-3 px-4">
              <Badge
                variant={
                  student.riskLevel === 'low'
                    ? 'success'
                    : student.riskLevel === 'medium'
                    ? 'warning'
                    : 'danger'
                }
              >
                {student.riskLevel}
              </Badge>
            </td>
            <td className="py-3 px-4">
              <div className="w-24">
                <Progress value={student.progress} size="sm" />
              </div>
            </td>
            <td className="py-3 px-4 text-gray-500 text-sm">{student.lastAssessment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const QuickActionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'success';
}> = ({ title, icon, description, onClick, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-success-500 to-success-600',
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all text-left group"
    >
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  );
};

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}> = ({ title, value, subtitle, icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-100 to-primary-50 text-primary-600',
    secondary: 'from-secondary-100 to-secondary-50 text-secondary-600',
    success: 'from-success-100 to-success-50 text-success-600',
    warning: 'from-warning-100 to-warning-50 text-warning-600',
    danger: 'from-danger-100 to-danger-50 text-danger-600',
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.direction === 'up'
                ? 'text-success-600'
                : trend.direction === 'down'
                ? 'text-danger-600'
                : 'text-gray-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};
