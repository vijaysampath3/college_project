import React from 'react';
import { BookOpen, Brain, Target, TrendingUp, Clock, Award, ChevronRight, PlayCircle } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge } from '../components/ui';
import { AssessmentHistoryChart, WeeklyProgressChart } from '../components/charts';
import { RecentActivityList, RecommendationCard, QuickActionCard } from '../components/dashboard/Widgets';
import { studentData } from '../data/mockData';

const StudentDashboard: React.FC = () => {
  const { profile, scores, assessmentHistory, weeklyProgress, recentActivity, recommendations } = studentData;

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'success';
    if (score <= 60) return 'warning';
    return 'danger';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Moderate';
    return 'High Risk';
  };

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-xl">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.name}!</h1>
            <p className="text-gray-600">{profile.grade} • {profile.school}</p>
          </div>
        </div>
      </div>

      {/* Score Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Reading Risk Score"
          value={scores.readingRisk}
          subtitle={getRiskLabel(scores.readingRisk)}
          trend="down"
          trendValue="-5% from last month"
          icon={<BookOpen className="w-6 h-6" />}
          color={getRiskColor(scores.readingRisk)}
        />
        <StatCard
          title="Attention Score"
          value={`${scores.attentionScore}%`}
          subtitle="Above average"
          trend="up"
          trendValue="+8% improvement"
          icon={<Target className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Learning Behaviour"
          value={`${scores.learningBehaviour}%`}
          subtitle="Excellent progress"
          trend="up"
          trendValue="+12% improvement"
          icon={<Brain className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Overall Progress"
          value={`${scores.overallProgress}%`}
          subtitle="Keep it up!"
          trend="up"
          trendValue="+15% this semester"
          icon={<TrendingUp className="w-6 h-6" />}
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            title="Start Reading Assessment"
            icon={<BookOpen className="w-5 h-5" />}
            description="Test your reading comprehension"
            color="primary"
          />
          <QuickActionCard
            title="Typing Speed Test"
            icon={<Target className="w-5 h-5" />}
            description="Measure your typing skills"
            color="secondary"
          />
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
              <Badge variant="primary">5 Months</Badge>
            </div>
            <AssessmentHistoryChart data={assessmentHistory} />
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
            <WeeklyProgressChart data={weeklyProgress} />
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
            <RecentActivityList activities={recentActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
              <Badge variant="success">3 New</Badge>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
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
              {[
                { name: 'First Assessment', icon: <PlayCircle className="w-6 h-6" />, unlocked: true },
                { name: 'Perfect Score', icon: <Target className="w-6 h-6" />, unlocked: true },
                { name: '7-Day Streak', icon: <Clock className="w-6 h-6" />, unlocked: false },
                { name: 'Reading Master', icon: <BookOpen className="w-6 h-6" />, unlocked: false },
              ].map((badge, idx) => (
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
                    {badge.icon}
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
    </DashboardLayout>
  );
};

export default StudentDashboard;
