import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartProps {
  data: unknown[];
  height?: number;
  type?: 'reading' | 'comprehension' | 'typing' | 'attention' | 'cpt' | 'focus' | 'learning-behaviour';
}

const chartConfig = {
  'reading': { stroke: '#4F46E5', fill: 'url(#colorReading)', name: 'Reading Score' },
  'comprehension': { stroke: '#10B981', fill: 'url(#colorComprehension)', name: 'Comprehension Score' },
  'typing': { stroke: '#8B5CF6', fill: 'url(#colorTyping)', name: 'Typing WPM' },
  'attention': { stroke: '#F59E0B', fill: 'url(#colorAttention)', name: 'Attention Score' },
  'cpt': { stroke: '#EF4444', fill: 'url(#colorCpt)', name: 'CPT DPrime' },
  'focus': { stroke: '#3B82F6', fill: 'url(#colorFocus)', name: 'Focus Score' },
  'learning-behaviour': { stroke: '#06B6D4', fill: 'url(#colorBehaviour)', name: 'Behaviour Score' },
};

export const AssessmentHistoryChart: React.FC<ChartProps> = ({ data, height = 300, type = 'reading' }) => {
  const config = chartConfig[type] || chartConfig['reading'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data as object[]}>
        <defs>
          <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorComprehension" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTyping" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCpt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBehaviour" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="score"
          name={config.name}
          stroke={config.stroke}
          strokeWidth={2}
          fillOpacity={1}
          fill={config.fill}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const WeeklyProgressChart: React.FC<ChartProps> = ({ data, height = 250 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data as object[]}>
      <defs>
        <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4F46E5" stopOpacity={1} />
          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
      <YAxis stroke="#9CA3AF" fontSize={12} />
      <Tooltip
        contentStyle={{
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      />
      <Bar dataKey="minutes" fill="url(#colorMinutes)" radius={[4, 4, 0, 0]} name="Minutes Spent" />
    </BarChart>
  </ResponsiveContainer>
);

interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

export const RiskDistributionChart: React.FC<{ data: RiskDistributionData[]; height?: number }> = ({
  data,
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={2}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

interface PerformanceData {
  subject: string;
  average: number;
  improvement: number;
}

export const ClassPerformanceChart: React.FC<{ data: PerformanceData[]; height?: number }> = ({
  data,
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
      <YAxis dataKey="subject" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
      <Tooltip
        contentStyle={{
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      />
      <Bar dataKey="average" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Average Score" />
    </BarChart>
  </ResponsiveContainer>
);

interface UsageData {
  month: string;
  users: number;
  assessments: number;
}

export const PlatformUsageChart: React.FC<{ data: UsageData[]; height?: number }> = ({
  data,
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
      <YAxis stroke="#9CA3AF" fontSize={12} />
      <Tooltip
        contentStyle={{
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="users"
        stroke="#4F46E5"
        strokeWidth={3}
        dot={{ fill: '#4F46E5', strokeWidth: 2 }}
        name="Active Users"
      />
      <Line
        type="monotone"
        dataKey="assessments"
        stroke="#06B6D4"
        strokeWidth={3}
        dot={{ fill: '#06B6D4', strokeWidth: 2 }}
        name="Assessments"
      />
    </LineChart>
  </ResponsiveContainer>
);

export const ChildProgressChart: React.FC<{ data: any[]; height?: number }> = ({
  data,
  height = 300,
}) => {
  // Extract all unique keys from data (excluding 'date' or 'month')
  const keys = Array.from(
    new Set(
      data.flatMap((item) => Object.keys(item).filter((k) => k !== 'date' && k !== 'month'))
    )
  );

  const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey={data[0]?.date ? 'date' : 'month'} stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend />
        {keys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={3}
            dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
            name={key.charAt(0).toUpperCase() + key.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
