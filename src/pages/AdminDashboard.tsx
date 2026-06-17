import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge, Progress } from '../components/ui';
import { RiskDistributionChart, PlatformUsageChart } from '../components/charts';
import { adminData } from '../data/mockData';
import { schoolService, School } from '../services/school.service';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dynamicSchools, setDynamicSchools] = useState<School[]>([]);
  const { stats, platformUsage, systemAnalytics, riskDistribution, recentUsers } = adminData;

  useEffect(() => {
    schoolService.getSchools().then(setDynamicSchools).catch(console.error);
  }, []);

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
          value={stats.totalStudents.toLocaleString()}
          trend="up"
          trendValue="+12% this month"
          icon={<GraduationCap className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Teachers"
          value={stats.totalTeachers}
          trend="up"
          trendValue="+5 new"
          icon={<Users className="w-6 h-6" />}
          color="secondary"
        />
        <StatCard
          title="Parents"
          value={stats.totalParents.toLocaleString()}
          trend="up"
          trendValue="+8% this month"
          icon={<Users className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Schools"
          value={stats.totalSchools}
          trend="neutral"
          trendValue="2 pending"
          icon={<Building className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Assessments"
          value={stats.assessmentsCompleted.toLocaleString()}
          trend="up"
          trendValue="+23% growth"
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
            <PlatformUsageChart data={platformUsage} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Risk Distribution</h3>
                <p className="text-sm text-gray-500">Students by risk level platform-wide</p>
              </div>
            </div>
            <RiskDistributionChart data={riskDistribution} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Active Users Today</h4>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-success-600 font-medium flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-4 h-4" />
                +18%
              </p>
            </div>
            <div className="mt-4">
              <Progress value={stats.activeUsers} max={3000} color="primary" size="sm" />
              <p className="text-xs text-gray-500 mt-1">{stats.activeUsers} / 3000 daily sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">System Uptime</h4>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">99.8%</p>
            </div>
            <p className="text-sm text-gray-400 mt-2">Last 30 days availability</p>
            <div className="mt-4 flex items-center gap-2 text-success-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>All systems operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Data Storage</h4>
              <Badge variant="warning">78% Used</Badge>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">78 GB</p>
              <p className="text-sm text-gray-400 mb-1">/ 100 GB</p>
            </div>
            <div className="mt-4">
              <Progress value={78} max={100} color="warning" size="sm" />
              <p className="text-xs text-gray-500 mt-1">Consider upgrading storage plan</p>
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
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
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
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.school}</p>
                  </div>
                  <div className="text-right">
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
                    <p className="text-xs text-gray-400 mt-1">{user.joined}</p>
                  </div>
                </div>
              ))}
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
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {dynamicSchools.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No schools registered yet.</div>
              ) : (
                dynamicSchools.map((school) => (
                  <div
                    key={school.id}
                    onClick={() => navigate(`/admin/schools/${school.id}`)}
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{school.school_name}</h4>
                      <Badge variant={school.status === 'active' ? 'success' : school.status === 'inactive' ? 'danger' : 'warning'} size="sm">
                        {school.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{school.district || 'No district'}</span>
                      <span className="font-mono text-xs">{school.school_code}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Overview */}
      <div>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">User Distribution</h3>
              <Badge variant="primary">Platform-wide</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {systemAnalytics.map((item, idx) => {
                const colors = ['primary', 'secondary', 'success', 'warning'] as const;
                const icons = [<GraduationCap key="0" className="w-6 h-6" />, <Users key="1" className="w-6 h-6" />, <Users key="2" className="w-6 h-6" />, <Building key="3" className="w-6 h-6" />];
                const total = systemAnalytics.reduce((sum, i) => sum + i.value, 0);
                const percentage = ((item.value / total) * 100).toFixed(1);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg ${
                          colors[idx] === 'primary'
                            ? 'bg-primary-100 text-primary-600'
                            : colors[idx] === 'secondary'
                            ? 'bg-secondary-100 text-secondary-600'
                            : colors[idx] === 'success'
                            ? 'bg-success-100 text-success-600'
                            : 'bg-warning-100 text-warning-600'
                        }`}
                      >
                        {icons[idx]}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.name}</p>
                    <div className="mt-2">
                      <Progress value={parseFloat(percentage)} max={100} color={colors[idx]} size="sm" />
                      <p className="text-xs text-gray-400 mt-1">{percentage}% of total users</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
