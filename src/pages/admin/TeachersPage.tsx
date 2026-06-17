import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ShieldAlert, GraduationCap, Users, Building, Activity, FileText } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { teacherService, Teacher } from '../../services/teacher.service';
import { schoolService, School } from '../../services/school.service';
import { assignmentService, TeacherStudentCount } from '../../services/assignment.service';
import { generateNextId } from '../../utils/idGenerator';

export const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [teacherCounts, setTeacherCounts] = useState<TeacherStudentCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    school_id: '',
    teacher_id: '',
    employee_id: '',
    teacher_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    joining_date: '',
    temp_password: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teachersData, schoolsData, countsData] = await Promise.all([
        teacherService.getTeachers(),
        schoolService.getSchools(),
        assignmentService.getTeachersStudentCount()
      ]);
      setTeachers(teachersData);
      setSchools(schoolsData);
      setTeacherCounts(countsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Uniqueness
    const isTeacherIdExists = teachers.some(t => t.teacher_id.toLowerCase() === formData.teacher_id.toLowerCase());
    const isEmployeeIdExists = teachers.some(t => t.employee_id.toLowerCase() === formData.employee_id.toLowerCase());
    
    if (isTeacherIdExists) {
      alert(`Teacher ID ${formData.teacher_id} already exists. Please choose a different one.`);
      return;
    }
    
    if (isEmployeeIdExists) {
      alert(`Employee ID ${formData.employee_id} already exists. Please choose a different one.`);
      return;
    }

    try {
      await teacherService.createTeacher(formData);
      setIsCreateModalOpen(false);
      loadData();
      // Reset form
      setFormData({
        school_id: '',
        teacher_id: '',
        employee_id: '',
        teacher_name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        qualification: '',
        joining_date: '',
        temp_password: '',
        status: 'active'
      });
    } catch (error) {
      console.error("Failed to create teacher", error);
      alert("Failed to create teacher. Please check if email is unique.");
    }
  };

  const handleOpenModal = () => {
    const nextTchId = generateNextId('TCH', teachers.map(t => t.teacher_id));
    const nextEmpId = generateNextId('EMP', teachers.map(t => t.employee_id));
    setFormData({
      ...formData,
      teacher_id: nextTchId,
      employee_id: nextEmpId,
    });
    setIsCreateModalOpen(true);
  };

  const deactivateTeacher = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to deactivate this teacher?")) {
      try {
        await teacherService.deactivateTeacher(id);
        loadData();
      } catch (error) {
        console.error("Failed to deactivate teacher", error);
      }
    }
  };

  const deleteTeacher = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to PERMANENTLY delete this teacher? This action cannot be undone.")) {
      try {
        await teacherService.deleteTeacher(id);
        loadData();
      } catch (error) {
        console.error("Failed to delete teacher", error);
        alert("Failed to delete teacher. They might be linked to existing students or assessments.");
      }
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSchool = selectedSchoolId === '' || t.school_id === selectedSchoolId;

    return matchesSearch && matchesSchool;
  });

  return (
    <DashboardLayout role="admin" title="Teacher Management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Teachers Directory</h1>
          <p className="text-gray-600">Manage teachers and assignments across all schools</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Teacher
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none transition-colors"
            />
          </div>
          <select 
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors outline-none bg-white min-w-[200px]"
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.school_name}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-500">Teacher</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Employee ID</th>
                <th className="p-4 text-sm font-semibold text-gray-500">School</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Department</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Designation</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Assigned Students</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">Loading teachers...</td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No teachers found.</td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr 
                    key={teacher.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {teacher.teacher_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{teacher.teacher_name}</p>
                          <p className="text-sm text-gray-500">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">{teacher.employee_id}</td>
                    <td className="p-4 text-gray-600">{teacher.schools?.school_name}</td>
                    <td className="p-4 text-gray-600">{teacher.department || '-'}</td>
                    <td className="p-4 text-gray-600">{teacher.designation || '-'}</td>
                    <td className="p-4">
                      <Badge variant="secondary" size="sm">
                        {teacherCounts.find(tc => tc.teacher_id === teacher.id)?.count || 0}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={teacher.status === 'active' ? 'success' : teacher.status === 'inactive' ? 'danger' : 'warning'} size="sm">
                        {teacher.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          View
                        </button>
                        {teacher.status !== 'inactive' && (
                          <button 
                            onClick={(e) => deactivateTeacher(teacher.id, e)}
                            className="p-2 text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            Deactivate
                          </button>
                        )}
                        <button 
                          onClick={(e) => deleteTeacher(teacher.id, e)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="Delete Permanently"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Teacher Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Teacher</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateTeacher} className="p-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                  <input required type="text" placeholder="TCH0001" value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
                  <input required type="text" placeholder="Temp@123" value={formData.temp_password} onChange={e => setFormData({...formData, temp_password: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input required type="text" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned School *</label>
                  <select required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    <option value="">Select a school...</option>
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
