import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { teacherInterventionService } from '../../services/teacherIntervention.service';
import { ClipboardCheck, Activity, Target, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const TeacherAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [overview, setOverview] = useState<any>(null);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovData, recentData, queueData] = await Promise.all([
          teacherInterventionService.getOverview(),
          teacherInterventionService.getRecentAssessments(),
          teacherInterventionService.getInterventionQueue()
        ]);
        setOverview(ovData);
        setRecentAssessments(recentData);
        setQueue(queueData);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessments data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Intervention Center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Intervention Center">
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <ClipboardCheck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviewed</p>
                <h3 className="text-2xl font-bold text-gray-900">{overview?.totalAssessments || 0}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Activities</p>
                <h3 className="text-2xl font-bold text-gray-900">{overview?.pendingActivities || 0}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Assessments</p>
                <h3 className="text-2xl font-bold text-gray-900">{overview?.pendingAssessments || 0}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Intervention</p>
                <h3 className="text-2xl font-bold text-gray-900">{overview?.requiringIntervention || 0}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Assessment Results */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Assessment Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Assessment Type</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Score</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Risk Level</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAssessments.map((ass) => {
                  let riskColor = "bg-gray-100 text-gray-700";
                  if (ass.risk === 'High' || ass.risk === 'Severe') riskColor = "bg-red-100 text-red-700";
                  else if (ass.risk === 'Moderate') riskColor = "bg-yellow-100 text-yellow-700";
                  else if (ass.risk === 'Low') riskColor = "bg-green-100 text-green-700";

                  return (
                    <tr key={ass.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{ass.student_name}</div>
                        <div className="text-xs text-gray-500">Grade {ass.grade} {ass.section}</div>
                      </td>
                      <td className="py-4 capitalize font-medium text-gray-700">{ass.type.replace('_', ' ')}</td>
                      <td className="py-4 font-bold text-gray-900">{ass.score}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                          {ass.risk}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">{new Date(ass.date).toLocaleDateString()}</td>
                      <td className="py-4">
                        <button 
                          onClick={() => navigate(`/teacher/assessments/${ass.student_id}/${ass.id}`)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Review & Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {recentAssessments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No assessments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Intervention Queue */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Intervention Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Overall Risk</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Assigned Activities</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Assigned Assessments</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queue.map((item) => {
                  let riskColor = "bg-gray-100 text-gray-700";
                  if (item.risk_level === 'High' || item.risk_level === 'Severe') riskColor = "bg-red-100 text-red-700";
                  else if (item.risk_level === 'Moderate') riskColor = "bg-yellow-100 text-yellow-700";
                  else if (item.risk_level === 'Low') riskColor = "bg-green-100 text-green-700";

                  return (
                    <tr key={item.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{item.student_name}</div>
                        <div className="text-xs text-gray-500">Grade {item.grade} {item.section}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{item.completed_activities} / {item.assigned_activities}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">{item.completed_assessments} / {item.assigned_assessments}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {item.has_overdue ? (
                          <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Overdue Tasks
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> On Track
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => navigate(`/teacher/students/${item.student_id}/monitor`)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg"
                        >
                          View Monitoring
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No students in queue.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};
