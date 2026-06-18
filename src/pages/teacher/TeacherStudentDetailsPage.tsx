import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, BookOpen, Clock, Activity, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { teacherStudentsService } from '../../services/teacherStudents.service';

export const TeacherStudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        if (!id) return;
        setIsLoading(true);
        const data = await teacherStudentsService.getStudent(id);
        setStudent(data);
      } catch (error: any) {
        alert(error.message || 'Failed to load student details');
        navigate('/teacher/students');
      } finally {
        setIsLoading(false);
      }
    };
    loadStudentDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" title="Student Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) return null;

  return (
    <DashboardLayout role="teacher" title="Student Details">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/teacher/students')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.student_name}</h1>
          <p className="text-gray-600">ID: {student.student_id} • Grade {student.grade || '-'} {student.section || ''}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
            {student.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Contact */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium text-gray-900">{student.student_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium text-gray-900">{student.gender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p className="font-medium text-gray-900">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Enrollment Date</label>
                  <p className="font-medium text-gray-900">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-secondary-600" />
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{student.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{student.phone || 'No phone provided'}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                  <p className="text-gray-900 mt-1">{student.emergency_contact_name || 'Not provided'}</p>
                  <p className="text-gray-600 text-sm">{student.emergency_contact_number || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Academic & Journey */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Academic Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Assessments</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Activities</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-sm text-gray-500">Avg Score</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-900 text-warning-600">N/A</div>
                  <div className="text-sm text-gray-500">Risk Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary-600" />
                Learning Journey
              </h3>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No journey data available yet.</p>
                <p className="text-sm text-gray-400">Student needs to complete initial assessments.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                Parent Information
              </h3>
              <div className="bg-warning-50 text-warning-800 p-4 rounded-xl border border-warning-100">
                <p className="font-medium">No Parent Linked Yet</p>
                <p className="text-sm mt-1">Parent portal integration will be available in Phase T3.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
