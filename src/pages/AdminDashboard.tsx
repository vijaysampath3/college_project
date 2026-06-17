import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge, Progress } from '../components/ui';
import { RiskDistributionChart, PlatformUsageChart } from '../components/charts';
import {
  adminDashboardService,
  PlatformStats,
  PlatformUsageData,
  RiskDistributionData,
  SchoolOverviewData,
  RecentUserData,
  HealthStats
} from '../services/adminDashboard.service';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsageData[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistributionData[]>([]);
  const [schoolOverview, setSchoolOverview] = useState<SchoolOverviewData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUserData[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usageRes, riskRes, schoolsRes, usersRes, healthRes] = await Promise.all([
          adminDashboardService.getStats(),
          adminDashboardService.getPlatformUsage(),
          adminDashboardService.getRiskDistribution(),
          adminDashboardService.getSchoolOverview(),
          adminDashboardService.getRecentUsers(),
          adminDashboardService.getHealth()
        ]);
        setPlatformStats(statsRes);
        setPlatformUsage(usageRes);
        setRiskDistribution(riskRes);
        setSchoolOverview(schoolsRes);
        setRecentUsers(usersRes);
        setHealthStats(healthRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading platform data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Overview</h1>
        <p className="text-gray-600">Monitor system performance and manage users across all schools.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={platformStats?.totalStudents.toLocaleString() || "0"}
          trend="up"
          trendValue="Active platform data"
          icon={<GraduationCap className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Teachers"
          value={platformStats?.totalTeachers.toLocaleString() || "0"}
          trend="up"
          trendValue="Active count"
          icon={<Users className="w-6 h-6" />}
          color="secondary"
        />
        <StatCard
          title="Parents"
          value={platformStats?.totalParents.toLocaleString() || "0"}
          trend="up"
          trendValue="Active platform data"
          icon={<Users className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Schools"
          value={platformStats?.totalSchools.toLocaleString() || "0"}
          trend="up"
          trendValue="Active platform data"
          icon={<Building className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Assigned Students"
          value={platformStats?.assignedStudents?.toLocaleString() || "0"}
          trend="up"
          trendValue="Assigned to teachers"
          icon={<Activity className="w-6 h-6" />}
          color="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Platform Usage</h3>
                <p className="text-sm text-gray-500">Monthly active users and assessments</p>
              </div>
              <Badge variant="primary">Last 5 Months</Badge>
            </div>
            {platformUsage.length > 0 ? (
              <PlatformUsageChart data={platformUsage} height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No usage data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Risk Distribution</h3>
                <p className="text-sm text-gray-500">Students by latest risk report</p>
              </div>
            </div>
            {riskDistribution.length > 0 && riskDistribution.some(d => d.value > 0) ? (
              <RiskDistributionChart data={riskDistribution} height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No risk reports generated</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Total Active Teachers</h4>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{healthStats?.activeTeachers || 0}</p>
            </div>
            <div className="mt-4">
              <Progress value={healthStats?.activeTeachers || 0} max={Math.max(100, (healthStats?.activeTeachers || 0) * 2)} color="primary" size="sm" />
              <p className="text-xs text-gray-500 mt-1">Platform capacity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Student Reports Coverage</h4>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {healthStats?.totalStudents ? Math.round(((healthStats.studentsWithReports) / healthStats.totalStudents) * 100) : 0}%
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2">{healthStats?.studentsWithReports} / {healthStats?.totalStudents} students evaluated</p>
            <div className="mt-4 flex items-center gap-2 text-success-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Diagnostic coverage</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Active Schools</h4>
              <Badge variant="warning">Platform wide</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{healthStats?.activeSchools || 0}</p>
            </div>
            <div className="mt-4">
              <Progress value={healthStats?.activeSchools || 0} max={Math.max(20, (healthStats?.activeSchools || 0) * 2)} color="warning" size="sm" />
              <p className="text-xs text-gray-500 mt-1">Registered institutions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users & Schools */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No recent users found.</div>
              ) : (
                recentUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        user.role === 'Student'
                          ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                          : user.role === 'Teacher'
                          ? 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                          : 'bg-gradient-to-br from-success-400 to-success-600'
                      }`}
                    >
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.school_name || 'No school assigned'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.created_by}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <Badge
                        variant={
                          user.role === 'Student'
                            ? 'primary'
                            : user.role === 'Teacher'
                            ? 'secondary'
                            : 'success'
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schools Overview */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Schools Overview</h3>
              <button onClick={() => navigate('/admin/schools')} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                Manage Schools
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {schoolOverview.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No schools registered yet.</div>
              ) : (
                schoolOverview.map((school) => (
                  <div
                    key={school.school_id}
                    onClick={() => navigate(`/admin/schools/${school.school_id}`)}
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{school.school_name}</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center mt-3">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Students</p>
                        <p className="font-bold text-gray-900">{school.student_count}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Teachers</p>
                        <p className="font-bold text-gray-900">{school.teacher_count}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Parents</p>
                        <p className="font-bold text-gray-900">{school.parent_count}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Assessments</p>
                        <p className="font-bold text-gray-900">{school.assessment_count}</p>
                      </div>
                    </div>
                    {school.avg_risk_level && (
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Avg Risk Level:</span>
                        <span className={`font-semibold ${
                          school.avg_risk_level > 2.0 ? 'text-danger-600' : 
                          school.avg_risk_level > 1.2 ? 'text-warning-600' : 'text-success-600'
                        }`}>
                          {school.avg_risk_level > 2.0 ? 'High' : school.avg_risk_level > 1.2 ? 'Moderate' : 'Low'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
    </DashboardLayout>
  );
};

export default AdminDashboard;
