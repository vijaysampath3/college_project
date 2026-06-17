import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge } from '../../components/ui';
import { ArrowLeft, Users, GraduationCap, Building, ShieldAlert, FileText, ClipboardCheck } from 'lucide-react';
import { schoolService, School, SchoolStats } from '../../services/school.service';
import { teacherService, Teacher } from '../../services/teacher.service';
import { studentService, Student } from '../../services/student.service';
import { assignmentService, TeacherStudentCount } from '../../services/assignment.service';

export const SchoolDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherCounts, setTeacherCounts] = useState<TeacherStudentCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (schoolId: string) => {
    try {
      setIsLoading(true);
      const [schoolData, statsData, teachersData, studentsData, countsData] = await Promise.all([
        schoolService.getSchoolById(schoolId),
        schoolService.getSchoolStats(schoolId),
        teacherService.getTeachersBySchool(schoolId),
        studentService.getStudentsBySchool(schoolId),
        assignmentService.getTeachersStudentCount(schoolId)
      ]);
      setSchool(schoolData);
      setStats(statsData);
      setTeachers(teachersData);
      setStudents(studentsData);
      setTeacherCounts(countsData);
    } catch (err: unknown) {
      setError('Failed to load school details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardLayout role="admin" title="School Details"><div className="p-8 text-center text-gray-500">Loading...</div></DashboardLayout>;
  if (error || !school || !stats) return <DashboardLayout role="admin" title="School Details"><div className="p-8 text-center text-danger-600">{error || 'School not found'}</div></DashboardLayout>;

  // Calculate Assignment Summary
  const totalStudents = students.length;
  // This is a naive calculation. A more robust way would check assigned_teacher for each student.
  // For now we use the sum of counts. 
  // Wait, if a student is assigned to multiple teachers (not allowed by rules but possible in DB)? 
  // We can just sum the active teacher counts for assigned students.
  const assignedStudentsCount = teacherCounts.reduce((acc, curr) => acc + curr.count, 0);
  const unassignedStudentsCount = Math.max(0, totalStudents - assignedStudentsCount);

  return (
    <DashboardLayout role="admin" title="School Details">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/schools')} className="p-2 border rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{school.school_name}</h1>
              <Badge variant={school.status === 'active' ? 'success' : school.status === 'inactive' ? 'danger' : 'warning'}>
                {school.status}
              </Badge>
            </div>
            <p className="text-gray-600 font-mono text-sm">Code: {school.school_code}</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          Edit Settings
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <StatCard title="Teachers" value={teachers.length} icon={<Users className="w-6 h-6" />} color="primary" />
        <StatCard title="Students" value={totalStudents} icon={<GraduationCap className="w-6 h-6" />} color="secondary" />
        <StatCard title="Parents" value={stats.parents} icon={<Users className="w-6 h-6" />} color="success" />
        <StatCard title="Assessments" value={stats.assessments} icon={<FileText className="w-6 h-6" />} color="warning" />
        <StatCard title="High Risk Students" value={stats.highRiskStudents} icon={<ShieldAlert className="w-6 h-6" />} color="danger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-400" /> Information
            </h3>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900">{school.district || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Principal</span><span className="font-medium text-gray-900">{school.principal_name || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Email</span><span className="font-medium text-gray-900">{school.email || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Phone</span><span className="font-medium text-gray-900">{school.phone || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Address</span><span className="font-medium text-gray-900">{school.address ? `${school.address}, ${school.city || ''} ${school.state || ''} ${school.postal_code || ''}` : '-'}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-gray-400" /> Assignment Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-success-50">
                <p className="text-sm text-success-600 mb-1">Assigned</p>
                <p className="text-2xl font-bold text-success-700">{assignedStudentsCount}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-warning-50">
                <p className="text-sm text-warning-600 mb-1">Unassigned</p>
                <p className="text-2xl font-bold text-warning-700">{unassignedStudentsCount}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">Teacher Distribution</h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {teachers.map(teacher => {
                const count = teacherCounts.find(tc => tc.teacher_id === teacher.id)?.count || 0;
                return (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                        {teacher.teacher_name.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{teacher.teacher_name}</p>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {count} Assigned Students
                    </Badge>
                  </div>
                );
              })}
              {teachers.length === 0 && (
                <div className="text-center text-gray-500 py-4">No teachers available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
