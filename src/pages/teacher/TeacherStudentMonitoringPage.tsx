import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { teacherMonitoringService } from '../../services/teacherMonitoring.service';
import { ArrowLeft, Activity, Brain, Clock, Plus, Target, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export const TeacherStudentMonitoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [overview, setOverview] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [path, setPath] = useState<any>(null);
  const [assignedActivities, setAssignedActivities] = useState<any[]>([]);
  const [assignedAssessments, setAssignedAssessments] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          ovData, 
          assData, 
          pathData, 
          recData, 
          actData, 
          notesData
        ] = await Promise.all([
          teacherMonitoringService.getStudentMonitoring(id),
          teacherMonitoringService.getStudentAssessments(id),
          teacherMonitoringService.getStudentLearningPath(id),
          teacherMonitoringService.getStudentRecommendations(id),
          teacherMonitoringService.getStudentActivities(id),
          teacherMonitoringService.getNotes(id)
        ]);

        setOverview(ovData);
        setAssessments(assData);
        setPath(pathData?.learning_path || null);
        setAssignedActivities(pathData?.assigned_activities || []);
        setAssignedAssessments(pathData?.assigned_assessments || []);
        setRecs(recData);
        setActivities(actData);
        setNotes(notesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !id) return;
    
    try {
      setSubmittingNote(true);
      const added = await teacherMonitoringService.createNote(id, newNote);
      setNotes([added, ...notes]);
      setNewNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Student Monitoring Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !overview) {
    return (
      <DashboardLayout role="teacher" title="Student Monitoring Details">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error || 'Student not found'}</div>
      </DashboardLayout>
    );
  }

  const { student, risk_level, readiness_score, parents } = overview;
  
  let riskColor = "bg-gray-100 text-gray-700";
  if (risk_level === 'High' || risk_level === 'Severe') riskColor = "bg-red-100 text-red-700";
  else if (risk_level === 'Moderate') riskColor = "bg-yellow-100 text-yellow-700";
  else if (risk_level === 'Low') riskColor = "bg-green-100 text-green-700";

  return (
    <DashboardLayout role="teacher" title="Student Monitoring Details">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/monitoring')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.student_name}</h1>
            <p className="text-gray-500">{student.student_id} • Grade {student.grade} • {student.section}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-medium ${riskColor}`}>
              Risk Level: {risk_level}
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5 text-gray-400" />
              <span className="font-bold text-gray-900">{readiness_score}</span>
              <span className="text-sm text-gray-500">Readiness</span>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Assessment Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" /> Assessment Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assessments.map((ass, i) => (
                  <div key={i} className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 capitalize">{ass.type.replace('_', ' ')}</h3>
                    <div className="mt-2 flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{ass.score}</div>
                        <div className={`text-xs font-medium mt-1 ${ass.trend_value && ass.trend_value > 0 ? 'text-green-600' : ass.trend_value && ass.trend_value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {ass.trend}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ass.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {assessments.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-4">
                    No assessments completed yet.
                  </div>
                )}
              </div>
            </Card>

            {/* Learning Journey Progress */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" /> Learning Journey
              </h2>
              {path ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm font-medium text-purple-600">{path.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${path.completion_percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-xs text-purple-600 font-medium mb-1">Current Week</div>
                      <div className="text-lg font-bold text-gray-900">Week {path.current_week}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">Status</div>
                      <div className="text-lg font-bold text-gray-900 capitalize">{path.status.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No active learning path.</div>
              )}
            </Card>

            {/* Recommendations & Activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activities */}
              <Card className="p-6">
                <h2 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Recent Activities
                </h2>
                <div className="space-y-3">
                  {activities.slice(0, 4).map((act, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="truncate pr-2">
                        <span className="font-medium text-gray-900 block truncate">{act.learning_activities.title}</span>
                        <span className="text-xs text-gray-500">{new Date(act.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block">{act.score}%</span>
                        <span className="text-xs text-gray-500">{Math.round(act.time_spent_seconds / 60)} min</span>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-sm text-gray-500">No activities recorded.</p>}
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6">
                <h2 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Recommendations
                </h2>
                <div className="space-y-3">
                  {recs.slice(0, 4).map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {rec.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${rec.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {rec.title}
                        </p>
                        <p className="text-xs text-gray-500">{rec.priority} Priority</p>
                      </div>
                    </div>
                  ))}
                  {recs.length === 0 && <p className="text-sm text-gray-500">No recommendations.</p>}
                </div>
              </Card>
              {/* Assigned Interventions */}
              <Card className="p-6 md:col-span-2">
                <h2 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" /> Assigned Interventions
                </h2>
                <div className="space-y-4">
                  {assignedAssessments.map(ass => (
                    <div key={ass.id} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <span className="text-xs font-semibold text-purple-600 uppercase mb-1 block">Assessment</span>
                        <h3 className="font-medium text-gray-900">{ass.assessment_title}</h3>
                        {ass.due_date && <p className="text-xs text-gray-500 mt-1">Due: {new Date(ass.due_date).toLocaleDateString()}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${ass.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ass.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assignedActivities.map(act => (
                    <div key={act.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase mb-1 block">Activity</span>
                        <h3 className="font-medium text-gray-900">{act.activity_title}</h3>
                        {act.due_date && <p className="text-xs text-gray-500 mt-1">Due: {new Date(act.due_date).toLocaleDateString()}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${act.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {act.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assignedAssessments.length === 0 && assignedActivities.length === 0 && (
                    <p className="text-sm text-gray-500">No active interventions assigned.</p>
                  )}
                </div>
              </Card>

            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Parent Information */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" /> Parents / Guardians
              </h2>
              {parents.length > 0 ? (
                <div className="space-y-4">
                  {parents.map((p: any, i: number) => (
                    <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900">{p.parent_profiles?.parent_name}</div>
                        {p.is_primary_parent && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{p.relationship}</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {p.parent_profiles?.email && <div>{p.parent_profiles.email}</div>}
                        {p.parent_profiles?.phone && <div>{p.parent_profiles.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No parents linked yet.</div>
              )}
            </Card>

            {/* Intervention History / Notes */}
            <Card className="p-6 flex flex-col" style={{ maxHeight: '600px' }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" /> Intervention History
              </h2>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                {notes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-900 mb-2 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-gray-500 text-right">
                      {new Date(note.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">No notes added yet.</div>
                )}
              </div>

              <form onSubmit={handleAddNote} className="mt-auto">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a teacher note..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="mt-2 w-full flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {submittingNote ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Note
                    </>
                  )}
                </button>
              </form>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
