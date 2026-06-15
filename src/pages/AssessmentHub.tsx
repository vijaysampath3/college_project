import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { assessmentService } from '../services/assessment.service';
import { dashboardService, ActivityEntry } from '../services/dashboard.service';
import { AssessmentCard, AssessmentInfo } from '../components/assessments/AssessmentCard';
import { LearningJourney } from '../components/assessments/LearningJourney';
import { LearningHealthSummary } from '../components/assessments/LearningHealthSummary';
import { BookOpen, Keyboard, Target, Brain, Activity } from 'lucide-react';
import { Card, CardContent } from '../components/ui';

const initialAssessments: AssessmentInfo[] = [
  {
    id: 'reading',
    title: 'Reading Assessment',
    description: 'Evaluate your reading fluency, accuracy, and comprehension through interactive text passages.',
    duration: '15 mins',
    difficulty: 'Beginner',
    status: 'Not Started',
    progress: 0,
    icon: <BookOpen className="w-6 h-6" />,
    route: '/student/assessments/reading',
  },
  {
    id: 'typing',
    title: 'Typing Assessment',
    description: 'Measure your typing speed and accuracy to assess motor skills and coordination.',
    duration: '10 mins',
    difficulty: 'Beginner',
    status: 'Not Started',
    progress: 0,
    icon: <Keyboard className="w-6 h-6" />,
    route: '/student/assessments/typing',
  },
  {
    id: 'attention',
    title: 'Attention Assessment',
    description: 'Track your sustained attention and focus through continuous performance tasks.',
    duration: '20 mins',
    difficulty: 'Intermediate',
    status: 'Not Started',
    progress: 0,
    icon: <Target className="w-6 h-6" />,
    route: '/student/assessments/attention',
  },
  {
    id: 'comprehension',
    title: 'Reading Comprehension',
    description: 'Advanced assessment of your ability to understand and interpret complex text.',
    duration: '25 mins',
    difficulty: 'Advanced',
    status: 'Not Started',
    progress: 0,
    icon: <Brain className="w-6 h-6" />,
    route: '/student/assessments/comprehension',
  },
  {
    id: 'learning-behaviour',
    title: 'Learning Behaviour',
    description: 'Identify your preferred learning styles and behavioural patterns in educational settings.',
    duration: '15 mins',
    difficulty: 'Intermediate',
    status: 'Not Started',
    progress: 0,
    icon: <Activity className="w-6 h-6" />,
    route: '/student/assessments/learning-behaviour',
  },
  {
    id: 'cpt',
    title: 'CPT Assessment (ADHD Risk)',
    description: 'Continuous Performance Test designed to measure sustained attention and impulsivity.',
    duration: '2 mins',
    difficulty: 'Intermediate',
    status: 'Not Started',
    progress: 0,
    icon: <Brain className="w-6 h-6" />,
    route: '/student/assessments/cpt',
  },
];

const AssessmentHub: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentInfo[]>(initialAssessments);
  const [recentActivities, setRecentActivities] = useState<ActivityEntry[]>([]);
  const [readingAccuracy, setReadingAccuracy] = useState<number | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const loadStatus = async () => {
      let sbProgressMap: Record<string, any> = {};
      let hasSupabaseData = false;

      // 1. Try Supabase First
      if (user) {
        try {
          const progressData = await assessmentService.getStudentProgress(user.id);
          if (progressData && progressData.length > 0) {
            hasSupabaseData = true;
            progressData.forEach((p: any) => {
              // Convert DB status to UI status
              let uiStatus = 'Not Started';
              if (p.status === 'in_progress') uiStatus = 'In Progress';
              if (p.status === 'completed') uiStatus = 'Completed';

              sbProgressMap[p.assessment_type] = {
                status: uiStatus,
                progress: p.progress_percentage
              };
            });
            
            // Sync Supabase data down to localStorage
            const existingLsStr = localStorage.getItem('neurolearn_assessment_status');
            const existingLs = existingLsStr ? JSON.parse(existingLsStr) : {};
            const mergedStatus = { ...existingLs, ...sbProgressMap };
            localStorage.setItem('neurolearn_assessment_status', JSON.stringify(mergedStatus));
          }
          
          // Fetch real recent activity data
          const dashData = await dashboardService.getDashboardData(user.id);
          setRecentActivities(dashData.recentActivity);
          if (dashData.readingHistory?.length > 0) {
            setReadingAccuracy(dashData.readingHistory[0].accuracy || null);
          }
        } catch (err) {
          console.error('Failed to load from Supabase, falling back to local', err);
        }
      }

      // 2. Load from localStorage (either updated by SB or fallback)
      const savedStatus = localStorage.getItem('neurolearn_assessment_status');
      if (savedStatus) {
        try {
          const parsedStatus = JSON.parse(savedStatus);
          setAssessments(prev => prev.map(a => ({
            ...a,
            status: parsedStatus[a.id]?.status || a.status,
            progress: parsedStatus[a.id]?.progress || a.progress,
          })));
        } catch (e) {
          console.error('Failed to parse assessment status', e);
        }
      } else if (!hasSupabaseData) {
        // 3. Demo fallback if completely empty
        const demoState = [...initialAssessments];
        demoState[0].status = 'In Progress';
        demoState[0].progress = 45;
        setAssessments(demoState);
        
        const statusMap = demoState.reduce((acc, curr) => {
          acc[curr.id] = { status: curr.status, progress: curr.progress };
          return acc;
        }, {} as Record<string, any>);
        localStorage.setItem('neurolearn_assessment_status', JSON.stringify(statusMap));
      }
    };

    loadStatus();
  }, [user]);

  const total = assessments.length;
  const completed = assessments.filter(a => a.status === 'Completed').length;
  const inProgress = assessments.filter(a => a.status === 'In Progress').length;
  const pending = total - completed - inProgress;
  
  // Calculate overall progress based on status and progress percentages
  const overallProgress = Math.round(
    assessments.reduce((acc, curr) => acc + (curr.status === 'Completed' ? 100 : curr.progress), 0) / total
  );

  return (
    <DashboardLayout role="student" title="Assessments">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Assessments</h1>
        <p className="text-gray-600 max-w-3xl text-lg">
          Complete assessments to help NeuroLearn understand your learning patterns and provide personalized recommendations.
        </p>
      </div>

      {/* Progress Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-primary-600 mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-primary-900">{total}</p>
          </CardContent>
        </Card>
        <Card className="bg-success-50 border-success-100">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-success-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-success-900">{completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-warning-50 border-warning-100">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-warning-700 mb-1">Pending</p>
            <p className="text-3xl font-bold text-warning-900">{pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary-50 border-secondary-100">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-secondary-600 mb-1">Overall Progress</p>
            <p className="text-3xl font-bold text-secondary-900">{overallProgress}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Assessment Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Assessments</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {assessments.map(assessment => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar content */}
        <div className="space-y-6">
          <LearningHealthSummary accuracy={readingAccuracy} />
          <LearningJourney assessments={assessments} />
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
                    <div key={activity.id} className={`flex items-center justify-between ${idx !== recentActivities.length - 1 ? 'border-b border-gray-50 pb-4' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">Completed {activity.date}</p>
                      </div>
                      <span className="font-bold text-success-600">{Math.round(activity.score)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentHub;
