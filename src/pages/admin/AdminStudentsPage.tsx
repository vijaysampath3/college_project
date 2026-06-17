import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, UserCheck, UserX, Building, Activity } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge } from '../../components/ui';
import { studentService, Student, StudentStats, StudentFilters } from '../../services/student.service';
import { schoolService, School } from '../../services/school.service';
import { teacherService, Teacher } from '../../services/teacher.service';

export const AdminStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<StudentFilters>({
    school_id: '',
    teacher_id: '',
    grade: '',
    section: '',
    status: '',
    search: ''
  });

  // Load initial data (stats, schools, teachers) and students
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const data = await studentService.getStudents(filters);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [statsData, schoolsData, teachersData] = await Promise.all([
        studentService.getStudentStats(),
        schoolService.getSchools(),
        teacherService.getTeachers()
      ]);
      setStats(statsData);
      setSchools(schoolsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  };


  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const deactivateStudent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to deactivate this student? This will disable access but retain history.")) {
      try {
        await studentService.deactivateStudent(id);
        const data = await studentService.getStudents(filters);
        setStudents(data);
        studentService.getStudentStats().then(setStats);
      } catch (error) {
        console.error("Failed to deactivate student", error);
      }
    }
  };

  return (
    <DashboardLayout role="admin" title="Student Directory">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Students Directory</h1>
        <p className="text-gray-600">Platform-wide visibility and monitoring of all student profiles.</p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<GraduationCap className="w-6 h-6" />} color="primary" />
          <StatCard title="Active Students" value={stats.activeStudents} icon={<Activity className="w-6 h-6" />} color="success" />
          <StatCard title="Assigned Students" value={stats.assignedStudents} icon={<UserCheck className="w-6 h-6" />} color="secondary" />
          <StatCard title="Unassigned Students" value={stats.unassignedStudents} icon={<UserX className="w-6 h-6" />} color="warning" />
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select 
                  value={filters.school_id}
                  onChange={(e) => handleFilterChange('school_id', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Schools</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)}
                </select>
                <select 
                  value={filters.teacher_id}
                  onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.teacher_name}</option>)}
                </select>
                <select 
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Grades</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>
                <select 
                  value={filters.section}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" /> School Distribution
              </h3>
              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2">
                {stats?.schoolDistribution.map((dist, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate mr-2">{dist.schoolName}</span>
                    <Badge variant="secondary" size="sm">{dist.totalStudents}</Badge>
                  </div>
                ))}
                {stats?.schoolDistribution.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No schools found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-500">Student</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Student ID</th>
                <th className="p-4 text-sm font-semibold text-gray-500">School</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Grade/Sec</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Assigned Teacher</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Created By</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Created Date</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">No students found matching filters.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                          {student.student_name.charAt(0)}
                        </div>
                        <p className="font-semibold text-gray-900">{student.student_name}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">{student.student_id}</td>
                    <td className="p-4 text-gray-600">{student.schools?.school_name}</td>
                    <td className="p-4 text-gray-600">
                      {student.grade ? `Grade ${student.grade}` : '-'}
                      {student.section ? ` - ${student.section}` : ''}
                    </td>
                    <td className="p-4 text-gray-600">
                      {student.assignmentStatus === 'Assigned' ? (
                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-primary-500" /> {student.assigned_teacher}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{student.created_by_teacher || '-'}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'danger' : 'warning'} size="sm">
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium">
                          View
                        </button>
                        {student.status !== 'inactive' && (
                          <button 
                            onClick={(e) => deactivateStudent(student.id, e)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
