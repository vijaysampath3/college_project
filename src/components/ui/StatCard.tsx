import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
    gradient: 'from-primary-500 to-primary-600',
  },
  secondary: {
    bg: 'bg-secondary-100',
    text: 'text-secondary-600',
    gradient: 'from-secondary-500 to-secondary-600',
  },
  success: {
    bg: 'bg-success-100',
    text: 'text-success-600',
    gradient: 'from-success-500 to-success-600',
  },
  warning: {
    bg: 'bg-warning-100',
    text: 'text-warning-600',
    gradient: 'from-warning-500 to-warning-600',
  },
  danger: {
    bg: 'bg-danger-100',
    text: 'text-danger-600',
    gradient: 'from-danger-500 to-danger-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'primary',
}) => {
  const colorStyles = colorMap[color];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100/50 p-6 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-danger-600' : 'text-gray-500'
            }`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles.gradient} text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
