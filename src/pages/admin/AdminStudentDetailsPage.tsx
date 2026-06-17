import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building, FileText, Target, LayoutList } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { studentService, StudentDetails } from '../../services/student.service';

export const AdminStudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (studentId: string) => {
    try {
      setIsLoading(true);
      const data = await studentService.getStudentById(studentId);
      setStudent(data);
    } catch (error) {
      console.error("Failed to load student details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateStudent = async () => {
    if(!student || student.status === 'inactive') return;
    if(window.confirm("Are you sure you want to deactivate this student? This preserves history but disables access.")) {
      try {
        await studentService.deactivateStudent(student.id);
        loadData(student.id);
      } catch (error) {
        console.error("Failed to deactivate student", error);
      }
    }
  };

  if (isLoading) return <DashboardLayout role="admin" title="Student Profile"><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!student) return <DashboardLayout role="admin" title="Student Profile"><div className="p-8 text-center text-danger-600">Student not found</div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" title="Student Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/students')} className="p-2 border rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-xl font-bold">
              {student.student_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{student.student_name}</h1>
                <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'danger' : 'warning'}>
                  {student.status}
                </Badge>
                <Badge variant={student.assignmentStatus === 'Assigned' ? 'primary' : 'warning'}>
                  {student.assignmentStatus}
                </Badge>
              </div>
              <p className="text-gray-600 font-mono text-sm">ID: {student.student_id} • School: {student.schools?.school_name}</p>
            </div>
          </div>
        </div>
        {student.status !== 'inactive' && (
          <button 
            onClick={deactivateStudent}
            className="px-6 py-2 bg-white border border-danger-200 text-danger-600 rounded-xl font-bold hover:bg-danger-50 transition-colors"
          >
            Deactivate Student
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info & Admin Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Student Information
              </h3>
              <div className="space-y-4 text-sm">
                <div><span className="block text-gray-500 mb-1">Student Name</span><span className="font-medium text-gray-900">{student.student_name}</span></div>
                <div><span className="block text-gray-500 mb-1">Grade</span><span className="font-medium text-gray-900">{student.grade || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Section</span><span className="font-medium text-gray-900">{student.section || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Date of Birth</span><span className="font-medium text-gray-900">{student.date_of_birth || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Gender</span><span className="font-medium text-gray-900">{student.gender || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Email</span><span className="font-medium text-gray-900">{student.email || '-'}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-400" /> Administrative Information
              </h3>
              <div className="space-y-4 text-sm">
                <div><span className="block text-gray-500 mb-1">Student ID</span><span className="font-medium text-gray-900 font-mono">{student.student_id}</span></div>
                <div><span className="block text-gray-500 mb-1">Admission Number</span><span className="font-medium text-gray-900 font-mono">{student.admission_number || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">School</span><span className="font-medium text-gray-900">{student.schools?.school_name}</span></div>
                <div><span className="block text-gray-500 mb-1">Assigned Teacher</span><span className="font-medium text-gray-900">{student.assigned_teacher || 'Unassigned'}</span></div>
                <div><span className="block text-gray-500 mb-1">Created By Teacher</span><span className="font-medium text-gray-900">{student.created_by_teacher || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Created Date</span><span className="font-medium text-gray-900">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Last Updated</span><span className="font-medium text-gray-900">{student.updated_at ? new Date(student.updated_at).toLocaleDateString() : '-'}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Academic Summaries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" /> Assessment Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-bold text-gray-900">{student.assessmentSummary.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${student.assessmentSummary.completionPercentage}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 pt-2">
                    Latest Assessment: {student.assessmentSummary.latestAssessmentDate ? new Date(student.assessmentSummary.latestAssessmentDate).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-success-500" /> Learning Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Path Completion</span>
                    <span className="font-bold text-gray-900">{student.learningJourneySummary.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: `${student.learningJourneySummary.completionPercentage}%` }}></div>
                  </div>
                  <div className="pt-2 text-sm text-gray-500 flex justify-between">
                    <span>Current: {student.learningJourneySummary.currentJourney || 'None'}</span>
                    <span>Activities: {student.learningJourneySummary.activitiesCompleted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-warning-500" /> Risk Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Overall Risk Level</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.riskLevel}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Learning Difficulties</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.learningDifficultiesRisk}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Dyslexia Indicators</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.dyslexiaIndicators}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Reading Fluency</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.readingFluencyProblems}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Attention Issues</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.attentionInconsistency}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Cognitive Overload</p>
                  <p className="font-bold text-gray-900">{student.riskOverview.cognitiveOverload}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
