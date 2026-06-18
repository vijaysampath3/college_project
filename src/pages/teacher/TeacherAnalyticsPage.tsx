import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { teacherAnalyticsService } from '../../services/teacherAnalytics.service';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  Activity, 
  Users, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const TeacherAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [overview, setOverview] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [assessments, setAssessments] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [interventions, setInterventions] = useState<any>(null);
  const [paths, setPaths] = useState<any>(null);
  const [parents, setParents] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [ovData, rkData, asData, imData, inData, ptData, paData] = await Promise.all([
          teacherAnalyticsService.getOverviewMetrics(),
          teacherAnalyticsService.getRiskAnalytics(),
          teacherAnalyticsService.getAssessmentAnalytics(),
          teacherAnalyticsService.getStudentImprovements(),
          teacherAnalyticsService.getInterventionAnalytics(),
          teacherAnalyticsService.getLearningPathAnalytics(),
          teacherAnalyticsService.getParentAnalytics()
        ]);
        
        setOverview(ovData);
        setRisk(rkData);
        setAssessments(asData);
        setImprovements(imData);
        setInterventions(inData);
        setPaths(ptData);
        setParents(paData);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Analytics Center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !overview) {
    return (
      <DashboardLayout role="teacher" title="Analytics Center">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error || 'Failed to load'}</div>
      </DashboardLayout>
    );
  }

  const isEmpty = overview?.empty;

  if (isEmpty) {
    return (
      <DashboardLayout role="teacher" title="Analytics Center">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No analytics data available yet.</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Once your students complete assessments and activities, class-wide trends and performance metrics will appear here.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const riskColors = { High: '#EF4444', Moderate: '#F59E0B', Low: '#10B981' };
  const riskPieData = [
    { name: 'Low Risk', value: risk?.counts?.Low || 0, color: riskColors.Low },
    { name: 'Moderate Risk', value: risk?.counts?.Moderate || 0, color: riskColors.Moderate },
    { name: 'High Risk', value: risk?.counts?.High || 0, color: riskColors.High }
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout role="teacher" title="Analytics Center">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Section 1: Performance Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-600" /> Performance Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Avg Readiness" value={`${overview.avgReadiness}`} />
            <MetricCard label="Avg Assessment" value={`${overview.avgAssessment}`} />
            <MetricCard label="Activity Completion" value={`${overview.activityCompletion}%`} />
            <MetricCard label="Assessment Completion" value={`${overview.assessmentCompletion}%`} />
            <MetricCard label="Intervention Success" value={`${overview.interventionSuccess}%`} />
            <MetricCard label="Active Paths" value={`${overview.activePaths}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 2: Risk Analytics */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Risk Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48">
                <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-48">
                <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">30-Day Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={risk?.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="High" stroke={riskColors.High} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Moderate" stroke={riskColors.Moderate} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Low" stroke={riskColors.Low} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> High: {risk?.distribution?.High}%</span>
              <span className="flex items-center gap-1 text-yellow-600"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate: {risk?.distribution?.Moderate}%</span>
              <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low: {risk?.distribution?.Low}%</span>
            </div>
          </Card>

          {/* Section 3: Assessment Analytics */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> Assessment Analytics
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(assessments?.assessments || []).filter((a: any) => a.hasData)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="type" tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} tick={{fontSize: 10}} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" name="Avg Score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="improvement" name="Improvement %" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Section 4: Student Improvement Leaderboard */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" /> Student Improvement Leaderboard
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-0 overflow-hidden border-green-100">
              <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <h3 className="font-bold text-green-800">Most Improved Students</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="p-4">
                {(!improvements?.improved || improvements.improved.length === 0) ? (
                  <p className="text-sm text-gray-500 text-center py-4">No improvement data available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {improvements.improved.map((student: any) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{student.student_name}</p>
                          <p className="text-xs text-gray-500">{student.previous_score} → {student.current_score}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-green-600">+{student.change}</span>
                          <button onClick={() => navigate(`/teacher/monitoring/${student.student_id}`)} className="text-primary-600 hover:text-primary-800">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-0 overflow-hidden border-red-100">
              <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                <h3 className="font-bold text-red-800">Declining Students</h3>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="p-4">
                {(!improvements?.declining || improvements.declining.length === 0) ? (
                  <p className="text-sm text-gray-500 text-center py-4">No declining students. Great job!</p>
                ) : (
                  <div className="space-y-3">
                    {improvements.declining.map((student: any) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{student.student_name}</p>
                          <p className="text-xs text-gray-500">{student.previous_score} → {student.current_score}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-red-600">{student.change}</span>
                          <button onClick={() => navigate(`/teacher/monitoring/${student.student_id}`)} className="text-primary-600 hover:text-primary-800">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 5: Learning Path Analytics */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" /> Learning Path Analytics
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Active Paths</p>
                <p className="text-2xl font-bold text-gray-900">{paths?.activePaths || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-1">Completed Paths</p>
                <p className="text-2xl font-bold text-gray-900">{paths?.completedPaths || 0}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Average Completion</span>
                <span className="font-bold text-blue-600">{paths?.avgCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${paths?.avgCompletion || 0}%` }}></div>
              </div>
              
              <h3 className="text-sm font-bold text-gray-700 mb-3">Week Progress Distribution</h3>
              <div className="flex gap-2">
                {Object.entries(paths?.weekDistribution || {}).map(([week, pct]: any) => (
                  <div key={week} className="flex-1 text-center">
                    <div className="h-16 bg-gray-100 rounded-t-sm relative flex items-end">
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{height: `${pct}%`}}></div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mt-1">{week}</p>
                    <p className="text-xs font-bold text-gray-900">{pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 6: Parent Engagement */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Parent Engagement
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">Linked Parents</p>
                  <p className="text-sm text-gray-500">Total verified parent relationships</p>
                </div>
                <div className="text-2xl font-bold text-teal-600">{parents?.linkedParents || 0}</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">Active Parents</p>
                  <p className="text-sm text-gray-500">Parents with linked students</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{parents?.activeParents || 0}</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-xl">
                <div>
                  <p className="font-bold text-red-800">Unlinked Students</p>
                  <p className="text-sm text-red-600">Students without parent links</p>
                </div>
                <div className="text-2xl font-bold text-red-600">{parents?.studentsWithoutLinks || 0}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 7: Intervention Effectiveness */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Intervention Effectiveness
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-500">Activity Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-center">Assigned</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-center">Completed</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-center">Improved</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!interventions?.activities || interventions.activities.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No intervention data available yet.
                    </td>
                  </tr>
                ) : (
                  interventions.activities.map((act: any, i: number) => (
                    <tr key={i}>
                      <td className="py-4 font-medium text-gray-900">{act.activity_name}</td>
                      <td className="py-4 text-center text-gray-600">{act.assigned}</td>
                      <td className="py-4 text-center text-gray-600">{act.completed}</td>
                      <td className="py-4 text-center text-green-600 font-medium">{act.improved}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          act.success_rate >= 70 ? 'bg-green-100 text-green-800' :
                          act.success_rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {act.success_rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);
