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
  type?: 'reading' | 'comprehension';
}

export const AssessmentHistoryChart: React.FC<ChartProps> = ({ data, height = 300, type = 'reading' }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data as object[]}>
      <defs>
        <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorBehaviour" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
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
      <Area
        type="monotone"
        dataKey="score"
        stroke={type === 'reading' ? "#4F46E5" : "#06B6D4"}
        strokeWidth={2}
        fillOpacity={1}
        fill={type === 'reading' ? "url(#colorReading)" : "url(#colorAttention)"}
        name={type === 'reading' ? "Reading Score" : "Comprehension Score"}
      />
    </AreaChart>
  </ResponsiveContainer>
);

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

interface ProgressHistoryData {
  month: string;
  reading: number;
  attention: number;
  behaviour: number;
}

export const ChildProgressChart: React.FC<{ data: ProgressHistoryData[]; height?: number }> = ({
  data,
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
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
      <Line
        type="monotone"
        dataKey="reading"
        stroke="#4F46E5"
        strokeWidth={3}
        dot={{ fill: '#4F46E5', strokeWidth: 2 }}
        name="Reading"
      />
      <Line
        type="monotone"
        dataKey="attention"
        stroke="#06B6D4"
        strokeWidth={3}
        dot={{ fill: '#06B6D4', strokeWidth: 2 }}
        name="Attention"
      />
      <Line
        type="monotone"
        dataKey="behaviour"
        stroke="#10B981"
        strokeWidth={3}
        dot={{ fill: '#10B981', strokeWidth: 2 }}
        name="Behaviour"
      />
    </LineChart>
  </ResponsiveContainer>
);
