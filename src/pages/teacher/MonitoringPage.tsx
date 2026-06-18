import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { teacherMonitoringService } from '../../services/teacherMonitoring.service';
import { AlertCircle, AlertTriangle, Clock, BookOpen, UserX, Activity, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MonitoringPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, studentData] = await Promise.all([
          teacherMonitoringService.getMonitoringSummary(),
          teacherMonitoringService.getInterventionStudents()
        ]);
        setSummary(sumData);
        setStudents(studentData);
      } catch (err: any) {
        setError(err.message || 'Failed to load monitoring data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Monitoring Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const highRiskCount = summary?.requiringIntervention || 0;
  const inactiveCount = summary?.inactiveStudents || 0;

  return (
    <DashboardLayout role="teacher" title="Monitoring Dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requires Intervention</p>
                <h3 className="text-2xl font-bold text-gray-900">{highRiskCount}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <UserX className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Students (7d+)</p>
                <h3 className="text-2xl font-bold text-gray-900">{inactiveCount}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Learning Paths</p>
                <h3 className="text-2xl font-bold text-gray-900">{summary?.activeLearningPaths || 0}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Assessments</p>
                <h3 className="text-2xl font-bold text-gray-900">{summary?.assessmentsOverdue || 0}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Student Intervention Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Student Intervention Priority</h2>
            <div className="text-sm text-gray-500">
              Sorted by Priority (High Risk First)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Risk Level</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Readiness</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Path Progress</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  let riskColor = "bg-gray-100 text-gray-700";
                  if (student.risk_level === 'High' || student.risk_level === 'Severe') riskColor = "bg-red-100 text-red-700";
                  else if (student.risk_level === 'Moderate') riskColor = "bg-yellow-100 text-yellow-700";
                  else if (student.risk_level === 'Low') riskColor = "bg-green-100 text-green-700";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{student.student_name}</div>
                        <div className="text-xs text-gray-500">{student.student_id} • Grade {student.grade} {student.section}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                          {student.risk_level}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{student.readiness_score}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${student.path_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{student.path_progress}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          {student.status_tags && student.status_tags.map((tag: string, i: number) => (
                            <span key={i} className="text-xs font-medium text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {tag}
                            </span>
                          ))}
                          {(!student.status_tags || student.status_tags.length === 0) && (
                            <span className="text-xs text-gray-500">On Track</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate(`/teacher/students/${student.id}`)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/teacher/students/${student.id}/monitor`)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Monitor
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No students found.
                    </td>
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
