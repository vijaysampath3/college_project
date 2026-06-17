import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, BarChart3, Target, Building, BookOpen, Activity } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge } from '../../components/ui';
import { teacherService, Teacher, TeacherStats } from '../../services/teacher.service';
import { schoolService, School } from '../../services/school.service';

export const TeacherDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    school_id: '',
    teacher_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    joining_date: '',
    status: 'active' as const,
    temp_password: ''
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (teacherId: string) => {
    try {
      setIsLoading(true);
      const [teacherData, statsData, schoolsData] = await Promise.all([
        teacherService.getTeacherById(teacherId),
        teacherService.getTeacherStats(teacherId),
        schoolService.getSchools()
      ]);
      setTeacher(teacherData);
      setStats(statsData);
      setSchools(schoolsData);
      
      setFormData({
        school_id: teacherData.school_id || '',
        teacher_name: teacherData.teacher_name || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        department: teacherData.department || '',
        designation: teacherData.designation || '',
        qualification: teacherData.qualification || '',
        joining_date: teacherData.joining_date || '',
        status: teacherData.status || 'active',
        temp_password: ''
      });
    } catch (error) {
      console.error("Failed to load teacher details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload = { ...formData };
      if (!payload.temp_password) {
        delete payload.temp_password;
      }
      await teacherService.updateTeacher(id, payload);
      setIsEditModalOpen(false);
      loadData(id);
    } catch (error) {
      console.error("Failed to update teacher", error);
      alert("Failed to update teacher details.");
    }
  };

  if (isLoading) return <DashboardLayout role="admin" title="Teacher Profile"><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!teacher || !stats) return <DashboardLayout role="admin" title="Teacher Profile"><div className="p-8 text-center text-danger-600">Teacher not found</div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" title="Teacher Profile">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/teachers')} className="p-2 border rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {teacher.teacher_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{teacher.teacher_name}</h1>
                <Badge variant={teacher.status === 'active' ? 'success' : teacher.status === 'inactive' ? 'danger' : 'warning'}>
                  {teacher.status}
                </Badge>
              </div>
              <p className="text-gray-600 font-mono text-sm">ID: {teacher.teacher_id} • Employee: {teacher.employee_id}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Assigned Students" value={stats.assignedStudents} icon={<Users className="w-6 h-6" />} color="primary" />
        <StatCard title="Assessments Reviewed" value={stats.completedAssessments} icon={<FileText className="w-6 h-6" />} color="secondary" />
        <StatCard title="Reports Generated" value={stats.generatedReports} icon={<BarChart3 className="w-6 h-6" />} color="success" />
        <StatCard title="Active Interventions" value={stats.activeInterventions} icon={<Target className="w-6 h-6" />} color="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> Basic Information
            </h3>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500 mb-1">School</span><span className="font-medium text-gray-900 flex items-center gap-1"><Building className="w-4 h-4 text-gray-400"/> {teacher.schools?.school_name}</span></div>
              <div><span className="block text-gray-500 mb-1">Department</span><span className="font-medium text-gray-900">{teacher.department || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Designation</span><span className="font-medium text-gray-900">{teacher.designation || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Qualification</span><span className="font-medium text-gray-900">{teacher.qualification || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Email</span><span className="font-medium text-gray-900">{teacher.email}</span></div>
              <div><span className="block text-gray-500 mb-1">Phone</span><span className="font-medium text-gray-900">{teacher.phone || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Joining Date</span><span className="font-medium text-gray-900">{teacher.joining_date || '-'}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Assigned Students Placeholder
              </h3>
              <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p>No data available yet</p>
                <p className="text-xs mt-1">Students will appear here once assigned.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-400" /> Active Interventions Placeholder
              </h3>
              <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p>No data available yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Teacher</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateTeacher} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name *</label>
                  <input required type="text" value={formData.teacher_name} onChange={e => setFormData({...formData, teacher_name: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Temporary Password</label>
                  <input type="text" placeholder="Leave blank to keep unchanged" value={formData.temp_password} onChange={e => setFormData({...formData, temp_password: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned School *</label>
                  <select required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.school_name} ({s.school_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
