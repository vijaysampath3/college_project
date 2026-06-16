import React from 'react';
import { BookOpen, Brain, Target, TrendingUp, Clock, Award, ChevronRight, PlayCircle, Camera } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge } from '../components/ui';
import { AssessmentHistoryChart, WeeklyProgressChart } from '../components/charts';
import { RecentActivityList, RecommendationCard, QuickActionCard } from '../components/dashboard/Widgets';
import { XPProgressCard } from '../components/dashboard/XPProgressCard';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardData } from '../services/dashboard.service';
import { useNavigate } from 'react-router-dom';

type AssessmentType = 'reading' | 'comprehension' | 'typing' | 'attention' | 'cpt' | 'focus' | 'learning-behaviour';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [historyTab, setHistoryTab] = React.useState<AssessmentType>('reading');

  React.useEffect(() => {
    if (user?.id) {
      dashboardService.getDashboardData(user.id).then(res => {
        setData(res);
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to load dashboard data:", err);
        setIsLoading(false);
      });
    }
  }, [user]);

  const getRiskColor = (label: string) => {
    if (label === 'Low Risk') return 'success';
    if (label === 'Moderate Risk') return 'warning';
    if (label === 'High Risk') return 'danger';
    return 'primary';
  };

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : !data?.hasAssessments ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Target className="w-12 h-12 text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NeuroLearn!</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            It looks like you haven't completed any assessments yet. Complete your first assessment to begin generating insights and unlocking achievements.
          </p>
          <button 
            onClick={() => navigate('/student/assessments/reading')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
          >
            Start Reading Assessment
          </button>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-xl">
                {profile?.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h1>
                <p className="text-gray-600">{profile?.grade || 'Student'} • {profile?.school_name || 'School'}</p>
              </div>
            </div>
          </div>

          {/* XP Progress Card */}
          <XPProgressCard xpProgress={data.xpProgress} />

      {/* Score Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Reading Risk Score"
          value={data.scores.readingRiskScore.toString()}
          subtitle={data.scores.readingRiskLabel}
          trend="down"
          trendValue="Based on latest assessment"
          icon={<BookOpen className="w-6 h-6" />}
          color={getRiskColor(data.scores.readingRiskLabel)}
        />
        <StatCard
          title="Comprehension Score"
          value={data.scores.comprehensionScore}
          subtitle={data.scores.comprehensionScore === 'Pending Assessment' ? 'Needs Assessment' : 'Latest Score'}
          trend="up"
          trendValue={data.scores.comprehensionScore === 'Pending Assessment' ? 'Needs Assessment' : 'Based on latest assessment'}
          icon={<Brain className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Typing Score"
          value={data.scores.typingScore}
          subtitle={data.scores.typingScore === 'Pending Assessment' ? 'Needs Assessment' : 'Latest WPM'}
          trend="up"
          trendValue={data.scores.typingScore === 'Pending Assessment' ? 'Needs Assessment' : 'Based on latest assessment'}
          icon={<Target className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Attention Assessment"
          value={data.scores.attentionScore}
          subtitle="Not Evaluated"
          trend="up"
          trendValue="Needs Assessment"
          icon={<Brain className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="ADHD Risk (CPT)"
          value={data.scores.cptScore}
          subtitle={data.scores.cptScore === 'Pending Assessment' ? 'Needs Assessment' : 'Latest Score'}
          trend="up"
          trendValue={data.scores.cptScore === 'Pending Assessment' ? 'Needs Assessment' : 'Based on latest assessment'}
          icon={<Brain className="w-6 h-6" />}
          color={getRiskColor(data.scores.cptScore)}
        />
        {data.scores.learningBehaviour === 'Pending Assessment' ? (
          <StatCard
            title="Learning Behaviour"
            value="Pending"
            subtitle="Needs Assessment"
            trend="up"
            trendValue="Take assessment to unlock"
            icon={<Brain className="w-6 h-6" />}
            color="primary"
          />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-gray-500 font-medium mb-1">Learning Profile</h3>
                <div className="text-xl font-bold text-gray-900">{data.scores.learningBehaviour}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            
            <div className="space-y-3 mt-auto">
              {[
                { label: 'Visual', value: data.scores.learningProfileData?.visual || 0, color: 'bg-indigo-500' },
                { label: 'Interactive', value: data.scores.learningProfileData?.interactive || 0, color: 'bg-emerald-500' },
                { label: 'Sequential', value: data.scores.learningProfileData?.sequential || 0, color: 'bg-rose-500' },
                { label: 'Analytical', value: data.scores.learningProfileData?.analytical || 0, color: 'bg-amber-500' },
              ].map(trait => (
                <div key={trait.label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-600">{trait.label}</span>
                    <span className="text-gray-900">{trait.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${trait.color}`} style={{ width: `${trait.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <StatCard
          title="Focus & Engagement"
          value={data.scores.focusScore}
          subtitle={data.scores.focusScore === 'Pending Assessment' ? 'Needs Assessment' : `Engagement: ${data.scores.focusEngagement}`}
          trend="up"
          trendValue={data.scores.focusScore === 'Pending Assessment' ? 'Needs Assessment' : 'Based on latest assessment'}
          icon={<Camera className="w-6 h-6" />}
          color="secondary"
        />
        <StatCard
          title="Overall Progress"
          value={`${data.scores.overallProgress}%`}
          subtitle="Keep it up!"
          trend="up"
          trendValue="Completion Rate"
          icon={<TrendingUp className="w-6 h-6" />}
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={() => navigate('/student/assessments/reading')} className="cursor-pointer">
            <QuickActionCard
              title={data.hasAssessments ? "Retake Reading Assessment" : "Start Reading Assessment"}
              icon={<BookOpen className="w-5 h-5" />}
              description="Test your reading comprehension"
              color="primary"
            />
          </div>
          <div onClick={() => navigate('/student/assessments/typing')} className="cursor-pointer">
            <QuickActionCard
              title="Typing Speed Test"
              icon={<Target className="w-5 h-5" />}
              description="Measure your typing skills"
              color="secondary"
            />
          </div>
          <QuickActionCard
            title="View Full Reports"
            icon={<TrendingUp className="w-5 h-5" />}
            description="See your progress history"
            color="success"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assessment History</h3>
                <p className="text-sm text-gray-500">Your progress over time</p>
              </div>
              <div className="w-48">
                <select 
                  value={historyTab}
                  onChange={(e) => setHistoryTab(e.target.value as AssessmentType)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none cursor-pointer"
                >
                  <option value="reading">Reading</option>
                  <option value="comprehension">Comprehension</option>
                  <option value="typing">Typing</option>
                  <option value="attention">Attention</option>
                  <option value="cpt">CPT (ADHD Risk)</option>
                  <option value="focus">Focus & Engagement</option>
                  <option value="learning-behaviour">Learning Behaviour</option>
                </select>
              </div>
            </div>
            <AssessmentHistoryChart 
              data={
                historyTab === 'reading' ? data.readingHistory :
                historyTab === 'comprehension' ? data.comprehensionHistory :
                historyTab === 'typing' ? data.typingHistory :
                historyTab === 'attention' ? data.attentionHistory :
                historyTab === 'cpt' ? data.cptHistory :
                historyTab === 'focus' ? data.focusHistory :
                historyTab === 'learning-behaviour' ? data.learningBehaviourHistory :
                []
              } 
              type={historyTab}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Weekly Activity</h3>
                <p className="text-sm text-gray-500">Minutes spent on assessments</p>
              </div>
              <Badge variant="secondary">This Week</Badge>
            </div>
            <WeeklyProgressChart data={data.weeklyProgress} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <RecentActivityList activities={data.recentActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
              <Badge variant="success">{data.recommendations.length} New</Badge>
            </div>
            <div className="space-y-4">
              {data.recommendations.length > 0 ? (
                data.recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))
              ) : (
                <p className="text-gray-500 text-sm">Complete an assessment to receive recommendations.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Achievements</h3>
                <p className="text-sm text-gray-500">Keep learning to unlock more badges</p>
              </div>
              <Award className="w-6 h-6 text-warning-500" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.achievements.map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl text-center transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-primary-100 to-secondary-100 border-2 border-primary-300'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      badge.unlocked ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {badge.iconType === 'PlayCircle' && <PlayCircle className="w-6 h-6" />}
                    {badge.iconType === 'Target' && <Target className="w-6 h-6" />}
                    {badge.iconType === 'Clock' && <Clock className="w-6 h-6" />}
                    {badge.iconType === 'BookOpen' && <BookOpen className="w-6 h-6" />}
                    {badge.iconType === 'Brain' && <Brain className="w-6 h-6" />}
                    {badge.iconType === 'Award' && <Award className="w-6 h-6" />}
                  </div>
                  <p className={`text-sm font-medium ${badge.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </>)}
    </DashboardLayout>
  );
};

export default StudentDashboard;
