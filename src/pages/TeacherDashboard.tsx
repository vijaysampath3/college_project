import React from 'react';
import { Users, AlertTriangle, CheckCircle2, Clock, TrendingUp, UserPlus, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge, Button } from '../components/ui';
import { RiskDistributionChart, ClassPerformanceChart } from '../components/charts';
import { StudentTable, AlertPanel } from '../components/dashboard/Widgets';
import { teacherData } from '../data/mockData';

const TeacherDashboard: React.FC = () => {
  const { profile, stats, students, riskDistribution, classPerformance, recentAssessments, alerts } = teacherData;

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.name}!</h1>
            <p className="text-gray-600">{profile.school} • {profile.subjects.join(', ')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <UserPlus className="w-5 h-5 mr-2" />
              Add Student
            </Button>
            <Button>
              <Clock className="w-5 h-5 mr-2" />
              Schedule Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="In your classes"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="High Risk Students"
          value={stats.highRiskStudents}
          subtitle="Require attention"
          trend="down"
          trendValue="-2 from last week"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="danger"
        />
        <StatCard
          title="Assessments Completed"
          value={stats.assessmentsCompleted}
          subtitle="This month"
          trend="up"
          trendValue="+15% from last month"
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          subtitle="Awaiting your review"
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Risk Distribution</h3>
                <p className="text-sm text-gray-500">Class overview</p>
              </div>
            </div>
            <RiskDistributionChart data={riskDistribution} height={250} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Class Performance</h3>
                <p className="text-sm text-gray-500">Average scores by subject</p>
              </div>
              <Badge variant="primary">Current Semester</Badge>
            </div>
            <ClassPerformanceChart data={classPerformance} height={250} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <div className="mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                <h3 className="text-lg font-bold text-gray-900">Recent Alerts</h3>
              </div>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <AlertPanel alerts={alerts} />
          </CardContent>
        </Card>
      </div>

      {/* Student Management */}
      <div className="mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Student Management</h3>
                <p className="text-sm text-gray-500">Monitor and manage your students</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option>All Classes</option>
                  <option>8th Grade</option>
                  <option>9th Grade</option>
                </select>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option>All Risk Levels</option>
                  <option>High Risk</option>
                  <option>Medium Risk</option>
                  <option>Low Risk</option>
                </select>
              </div>
            </div>
            <StudentTable students={students} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <div>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
                <p className="text-sm text-gray-500">Latest student submissions</p>
              </div>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{assessment.student}</td>
                      <td className="py-3 px-4 text-gray-600">{assessment.type}</td>
                      <td className="py-3 px-4">
                        <Badge variant={assessment.score >= 70 ? 'success' : assessment.score >= 50 ? 'warning' : 'danger'}>
                          {assessment.score}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{assessment.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant={assessment.status === 'reviewed' ? 'success' : 'warning'}>
                          {assessment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent>
            <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Weekly Improvement</h4>
            <p className="text-3xl font-bold">+12%</p>
            <p className="text-sm text-white/70 mt-2">Class average improved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <CardContent>
            <CheckCircle2 className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Goals Met</h4>
            <p className="text-3xl font-bold">87%</p>
            <p className="text-sm text-white/70 mt-2">Students on track</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <CardContent>
            <Clock className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Engagement</h4>
            <p className="text-3xl font-bold">94%</p>
            <p className="text-sm text-white/70 mt-2">Assessment completion rate</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
