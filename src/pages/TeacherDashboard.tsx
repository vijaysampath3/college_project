import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, Clock, TrendingUp, UserPlus, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge, Button } from '../components/ui';
import { RiskDistributionChart, ClassPerformanceChart } from '../components/charts';
import { StudentTable, AlertPanel } from '../components/dashboard/Widgets';
import { teacherDashboardService, TeacherProfile, DashboardStats, RiskDistribution, AnalyticsData, Alert } from '../services/teacherDashboard.service';

const TeacherDashboard: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [
          teacherData,
          statsData,
          studentsData,
          riskData,
          assessmentsData,
          alertsData,
          analyticsData,
          studentPerformanceData
        ] = await Promise.all([
          teacherDashboardService.getCurrentTeacher(),
          teacherDashboardService.getDashboardStats(),
          teacherDashboardService.getAssignedStudents(),
          teacherDashboardService.getRiskDistribution(),
          teacherDashboardService.getRecentAssessments(),
          teacherDashboardService.getTeacherAlerts(),
          teacherDashboardService.getAnalytics(),
          teacherDashboardService.getStudentPerformanceOverview()
        ]);

        setProfile(teacherData);
        setStats(statsData);
        setStudents(studentsData.map(s => ({
          id: s.id,
          name: s.student_name,
          grade: s.grade,
          section: s.section,
          riskLevel: 'Unknown', // This will be calculated later or we can fetch it
          progress: 0,
          lastAssessment: s.updated_at
        })));
        setRiskDistribution(riskData);
        setRecentAssessments(assessmentsData.map(a => ({
          id: a.id,
          student: a.student?.student_name || 'Unknown',
          type: a.category || 'General',
          score: a.score || 0,
          date: new Date(a.created_at).toLocaleDateString(),
          status: a.status || 'pending'
        })));
        setAlerts(alertsData);
        setAnalytics(analyticsData);
        setStudentPerformance(studentPerformanceData);
      } catch (error) {
        console.error("Failed to load teacher dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" title="Teacher Dashboard">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const classPerformance = studentPerformance ? [
    { subject: 'Reading', average: studentPerformance.reading || 0 },
    { subject: 'Attention', average: studentPerformance.attention || 0 },
    { subject: 'Typing', average: studentPerformance.typing || 0 },
    { subject: 'Learning Behaviour', average: studentPerformance.learningBehaviour || 0 },
    { subject: 'Comprehension', average: studentPerformance.comprehension || 0 },
  ] : [
    { subject: 'Reading', average: 0 },
    { subject: 'Attention', average: 0 },
    { subject: 'Typing', average: 0 },
    { subject: 'Learning Behaviour', average: 0 },
    { subject: 'Comprehension', average: 0 },
  ];

  const riskDataFormatted = riskDistribution ? [
    { level: 'Low Risk', value: riskDistribution['Low Risk'], color: '#10B981' },
    { level: 'Moderate Risk', value: riskDistribution['Moderate Risk'], color: '#F59E0B' },
    { level: 'High Risk', value: riskDistribution['High Risk'], color: '#EF4444' },
  ] : [];

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.teacherName}!</h1>
            <p className="text-gray-600">{profile?.schoolName} • {profile?.department} {profile?.designation ? `(${profile.designation})` : ''}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <UserPlus className="w-5 h-5 mr-2" />
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="In your classes"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="High Risk Students"
          value={stats?.highRiskStudents || 0}
          subtitle="Require attention"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="danger"
        />
        <StatCard
          title="Assessments Completed"
          value={stats?.assessmentsCompleted || 0}
          subtitle="This month"
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingReviews || 0}
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
            <RiskDistributionChart data={riskDataFormatted} height={250} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Student Performance Overview</h3>
                <p className="text-sm text-gray-500">Average assessment performance of assigned students</p>
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
      <div className="mb-8">
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
                  {recentAssessments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500">No recent assessments found</td></tr>
                  ) : recentAssessments.map((assessment) => (
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
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent>
            <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Weekly Improvement</h4>
            <p className="text-3xl font-bold">{analytics?.weeklyImprovement}</p>
            <p className="text-sm text-white/70 mt-2">Class average improved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <CardContent>
            <CheckCircle2 className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Goals Met</h4>
            <p className="text-3xl font-bold">{analytics?.goalsMet}</p>
            <p className="text-sm text-white/70 mt-2">Students on track</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <CardContent>
            <Clock className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-semibold text-white/80 mb-1">Engagement</h4>
            <p className="text-3xl font-bold">{analytics?.engagement}</p>
            <p className="text-sm text-white/70 mt-2">Active students in last 7 days</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;

