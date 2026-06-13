import React from 'react';
import { BookOpen, Brain, Target, TrendingUp, ArrowRight, Lightbulb, Heart, Calendar } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge } from '../components/ui';
import { ChildProgressChart } from '../components/charts';
import { parentData } from '../data/mockData';

const ParentDashboard: React.FC = () => {
  const { profile, children, homeRecommendations } = parentData;
  const child = children[0];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  return (
    <DashboardLayout role="parent" title="Parent Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {profile.name}!</h1>
        <p className="text-gray-600">Monitor your child's learning progress and discover helpful recommendations.</p>
      </div>

      {/* Child Overview Card */}
      <div className="mb-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                {child.name.charAt(0)}
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-1">{child.name}</h2>
                <p className="text-white/80">{child.grade} • {child.school}</p>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{child.scores.readingProgress}%</p>
                  <p className="text-white/80 text-sm">Reading</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{child.scores.attentionScore}%</p>
                  <p className="text-white/80 text-sm">Attention</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{child.scores.learningScore}%</p>
                  <p className="text-white/80 text-sm">Learning</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-3 gap-8 md:hidden">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{child.scores.readingProgress}%</p>
                <p className="text-gray-500 text-sm">Reading</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{child.scores.attentionScore}%</p>
                <p className="text-gray-500 text-sm">Attention</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{child.scores.learningScore}%</p>
                <p className="text-gray-500 text-sm">Learning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Reading Progress"
          value={`${child.scores.readingProgress}%`}
          subtitle="Above grade level"
          trend="up"
          trendValue="+5% this month"
          icon={<BookOpen className="w-6 h-6" />}
          color={getScoreColor(child.scores.readingProgress)}
        />
        <StatCard
          title="Attention Score"
          value={`${child.scores.attentionScore}%`}
          subtitle="Good focus capability"
          trend="up"
          trendValue="+3% improvement"
          icon={<Target className="w-6 h-6" />}
          color={getScoreColor(child.scores.attentionScore)}
        />
        <StatCard
          title="Learning Score"
          value={`${child.scores.learningScore}%`}
          subtitle="Excellent engagement"
          trend="up"
          trendValue="+7% this semester"
          icon={<Brain className="w-6 h-6" />}
          color={getScoreColor(child.scores.learningScore)}
        />
      </div>

      {/* Progress Chart */}
      <div className="mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Progress Over Time</h3>
                <p className="text-sm text-gray-500">Track improvement across all areas</p>
              </div>
              <Badge variant="primary">Academic Year</Badge>
            </div>
            <ChildProgressChart data={child.progressHistory} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
              </div>
            </div>
            <div className="space-y-4">
              {child.recentAssessments.map((assessment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`p-3 rounded-xl ${
                      assessment.trend === 'up'
                        ? 'bg-success-100 text-success-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 ${assessment.trend === 'stable' ? 'rotate-0' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{assessment.title}</p>
                    <p className="text-sm text-gray-500">{assessment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{assessment.score}%</p>
                    <Badge
                      variant={assessment.score >= 70 ? 'success' : assessment.score >= 50 ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {assessment.trend === 'up' ? 'Improving' : 'Stable'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning-500" />
                <h3 className="text-lg font-bold text-gray-900">Activities at Home</h3>
              </div>
              <Badge variant="success">Easy to Do</Badge>
            </div>
            <div className="space-y-4">
              {homeRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        rec.category === 'reading'
                          ? 'bg-primary-100 text-primary-600'
                          : rec.category === 'attention'
                          ? 'bg-secondary-100 text-secondary-600'
                          : 'bg-success-100 text-success-600'
                      }`}
                    >
                      {rec.category === 'reading' ? (
                        <BookOpen className="w-5 h-5" />
                      ) : rec.category === 'attention' ? (
                        <Target className="w-5 h-5" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className="mt-2">
                        <Badge
                          variant={rec.difficulty === 'easy' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {rec.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Encouragement Card */}
      <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success-100">
              <Heart className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Great Progress!</h3>
              <p className="text-gray-600">
                {child.name} has shown consistent improvement across all areas. Keep encouraging their learning journey at home.
                Your support makes a real difference!
              </p>
              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-2 text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+15% overall improvement</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ParentDashboard;
