import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserCheck, UserX, Building, Activity, HeartHandshake } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge } from '../../components/ui';
import { parentService, Parent, ParentStats, ParentFilters } from '../../services/parent.service';
import { schoolService, School } from '../../services/school.service';
import { teacherService, Teacher } from '../../services/teacher.service';
import { studentService, Student } from '../../services/student.service';

export const AdminParentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<Parent[]>([]);
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<ParentFilters>({
    school_id: '',
    teacher_id: '',
    student_id: '',
    relationship: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        setIsLoading(true);
        const data = await parentService.getParents(filters);
        setParents(data);
      } catch (error) {
        console.error("Failed to fetch parents", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [statsData, schoolsData, teachersData, studentsData] = await Promise.all([
        parentService.getParentStats(),
        schoolService.getSchools(),
        teacherService.getTeachers(),
        studentService.getStudents() // Load all students to allow filtering by student
      ]);
      setStats(statsData);
      setSchools(schoolsData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  };

  const handleFilterChange = (key: keyof ParentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const deactivateParent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to deactivate this parent? This will disable access but retain history and relationships.")) {
      try {
        await parentService.deactivateParent(id);
        const data = await parentService.getParents(filters);
        setParents(data);
        parentService.getParentStats().then(setStats);
      } catch (error) {
        console.error("Failed to deactivate parent", error);
      }
    }
  };

  return (
    <DashboardLayout role="admin" title="Parent Directory">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parents Directory</h1>
        <p className="text-gray-600">Platform-wide visibility and monitoring of all parent profiles and relationships.</p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Parents" value={stats.totalParents} icon={<Users className="w-6 h-6" />} color="primary" />
          <StatCard title="Active Parents" value={stats.activeParents} icon={<Activity className="w-6 h-6" />} color="success" />
          <StatCard title="Linked Parents" value={stats.linkedParents} icon={<UserCheck className="w-6 h-6" />} color="secondary" />
          <StatCard title="Unlinked Parents" value={stats.unlinkedParents} icon={<UserX className="w-6 h-6" />} color="warning" />
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* Filters */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, phone, or email..."
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
                  value={filters.student_id}
                  onChange={(e) => handleFilterChange('student_id', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Students</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.student_name}</option>)}
                </select>
                <select 
                  value={filters.relationship}
                  onChange={(e) => handleFilterChange('relationship', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Relationships</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Small Widgets */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="flex-1">
            <CardContent className="p-4 h-[120px] overflow-hidden">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" /> School Distribution
              </h3>
              <div className="space-y-2 h-full overflow-y-auto pr-2">
                {stats?.schoolDistribution.map((dist, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate mr-2">{dist.schoolName}</span>
                    <Badge variant="secondary" size="sm">{dist.totalParents}</Badge>
                  </div>
                ))}
                {stats?.schoolDistribution.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No schools found</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardContent className="p-4 h-[120px] overflow-hidden">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-gray-400" /> Relationship Summary
              </h3>
              <div className="grid grid-cols-2 gap-2 pr-2 h-full overflow-y-auto">
                <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">Fathers</span>
                  <span className="text-xs font-bold">{stats?.relationshipSummary.Fathers || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">Mothers</span>
                  <span className="text-xs font-bold">{stats?.relationshipSummary.Mothers || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">Guardians</span>
                  <span className="text-xs font-bold">{stats?.relationshipSummary.Guardians || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">Others</span>
                  <span className="text-xs font-bold">{stats?.relationshipSummary.Others || 0}</span>
                </div>
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
                <th className="p-4 text-sm font-semibold text-gray-500">Parent</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Contact</th>
                <th className="p-4 text-sm font-semibold text-gray-500">School</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Linked Teacher</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Linked Students</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Created Date</th>
                <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">Loading parents...</td>
                </tr>
              ) : parents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No parents found matching filters.</td>
                </tr>
              ) : (
                parents.map((parent) => (
                  <tr 
                    key={parent.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/parents/${parent.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                          {parent.parent_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{parent.parent_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{parent.parent_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div>{parent.phone || '-'}</div>
                      <div className="text-gray-500">{parent.email || '-'}</div>
                    </td>
                    <td className="p-4 text-gray-600">{parent.school_name || '-'}</td>
                    <td className="p-4 text-gray-600">{parent.created_by_teacher_name || '-'}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {parent.linked_students?.map((s, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-gray-900">{s.student_name}</span>
                            <span className="text-gray-500 ml-1">({s.relationship})</span>
                          </div>
                        ))}
                        {(!parent.linked_students || parent.linked_students.length === 0) && (
                          <span className="text-gray-400 italic text-sm">No students linked</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={parent.status === 'active' ? 'success' : 'danger'} size="sm">
                        {parent.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {parent.created_at ? new Date(parent.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium">
                          View
                        </button>
                        {parent.status !== 'inactive' && (
                          <button 
                            onClick={(e) => deactivateParent(parent.id, e)}
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
