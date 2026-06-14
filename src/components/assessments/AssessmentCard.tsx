import React from 'react';
import { PlayCircle, Clock, BarChart2 } from 'lucide-react';
import { Button, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

export interface AssessmentInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  icon: React.ReactNode;
  route: string;
}

interface AssessmentCardProps {
  assessment: AssessmentInfo;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (assessment.status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          {assessment.icon}
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{assessment.title}</h3>
      <p className="text-gray-600 text-sm mb-6 flex-1">{assessment.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{assessment.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <span>{assessment.difficulty}</span>
        </div>
      </div>

      {assessment.status === 'In Progress' && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-primary-600 font-bold">{assessment.progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${assessment.progress}%` }}
            />
          </div>
        </div>
      )}

      <Button 
        className="w-full mt-auto" 
        onClick={() => navigate(assessment.route)}
        variant={assessment.status === 'Completed' ? 'secondary' : 'primary'}
      >
        <span className="flex items-center gap-2">
          {assessment.status === 'Completed' ? 'Retake Assessment' : 
           assessment.status === 'In Progress' ? 'Continue Assessment' : 'Start Assessment'}
          <PlayCircle className="w-4 h-4" />
        </span>
      </Button>
    </div>
  );
};
