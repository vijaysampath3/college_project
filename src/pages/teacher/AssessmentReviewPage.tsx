import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { teacherInterventionService } from '../../services/teacherIntervention.service';
import { ArrowLeft, Target, Lightbulb, CheckCircle, Clock } from 'lucide-react';

export const AssessmentReviewPage: React.FC = () => {
  const { studentId, assessmentId } = useParams<{ studentId: string, assessmentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [data, setData] = useState<any>(null);

  // Form states for assignments
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Normal');

  useEffect(() => {
    if (!studentId || !assessmentId) return;
    const fetchRecs = async () => {
      try {
        const res = await teacherInterventionService.getRecommendations(studentId, assessmentId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [studentId, assessmentId]);

  const handleAssignActivity = async (activity: any) => {
    if (!studentId) return;
    try {
      await teacherInterventionService.assignActivity(studentId, {
        activity_code: activity.code,
        activity_title: activity.title,
        activity_category: activity.category,
        priority,
        teacher_note: note,
        due_date: dueDate || null
      });
      alert('Activity assigned successfully!');
      setNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to assign activity');
    }
  };

  const handleAssignAssessment = async (assessment: any) => {
    if (!studentId) return;
    try {
      await teacherInterventionService.assignAssessment(studentId, {
        assessment_type: assessment.type,
        assessment_title: assessment.title,
        priority,
        teacher_note: note,
        due_date: dueDate || null,
        reason: 'Recommended based on previous assessment'
      });
      alert('Assessment assigned successfully!');
      setNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to assign assessment');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Assessment Review">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="teacher" title="Assessment Review">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error || 'Data not found'}</div>
      </DashboardLayout>
    );
  }

  const { assessment, explanation, recommended_activities, recommended_assessments } = data;
  const score = assessment.result_data?.overallScore || 0;
  const risk = assessment.result_data?.riskLevel || 'Low';

  let riskColor = "bg-green-100 text-green-700";
  if (risk === 'High' || risk === 'Severe') riskColor = "bg-red-100 text-red-700";
  else if (risk === 'Moderate') riskColor = "bg-yellow-100 text-yellow-700";

  return (
    <DashboardLayout role="teacher" title="Assessment Review">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/assessments')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{assessment.assessment_type.replace('_', ' ')} Review</h1>
            <p className="text-gray-500">Taken on {new Date(assessment.created_at).toLocaleDateString()}</p>
          </div>
          <div className="ml-auto flex gap-4">
            <div className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <span className="text-sm text-gray-500 mr-2">Score</span>
              <span className="font-bold text-gray-900">{score}</span>
            </div>
            <div className={`px-4 py-2 rounded-lg font-medium ${riskColor}`}>
              Risk: {risk}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Risk Explanation */}
            <Card className="p-6 border-l-4 border-blue-500 bg-blue-50/30">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" /> AI Risk Explanation
              </h2>
              <p className="text-gray-700">{explanation}</p>
            </Card>

            {/* Recommended Activities */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> Recommended Activities
              </h2>
              <div className="space-y-4">
                {recommended_activities.map((act: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900">{act.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{act.category} Activity</p>
                    </div>
                    <button 
                      onClick={() => handleAssignActivity(act)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Assign Activity
                    </button>
                  </div>
                ))}
                {recommended_activities.length === 0 && (
                  <p className="text-sm text-gray-500">No activities recommended for this risk profile.</p>
                )}
              </div>
            </Card>

            {/* Recommended Assessments */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-purple-500" /> Recommended Assessments
              </h2>
              <div className="space-y-4">
                {recommended_assessments.map((ass: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900">{ass.title}</h3>
                    </div>
                    <button 
                      onClick={() => handleAssignAssessment(ass)}
                      className="px-4 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Assign Assessment
                    </button>
                  </div>
                ))}
                {recommended_assessments.length === 0 && (
                  <p className="text-sm text-gray-500">No additional assessments recommended.</p>
                )}
              </div>
            </Card>

          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Note (Optional)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Complete before Friday."
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <p>Settings applied to the next assignment action you perform.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
