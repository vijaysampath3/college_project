import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { studentService, Student } from '../../services/student.service';
import { schoolService, School } from '../../services/school.service';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    school_id: '',
    student_id: '',
    student_name: '',
    admission_number: '',
    temporary_password: '',
    grade: '',
    section: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [studentsData, schoolsData] = await Promise.all([
        studentService.getStudents(),
        schoolService.getSchools()
      ]);
      setStudents(studentsData);
      setSchools(schoolsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentService.createStudent(formData);
      setIsCreateModalOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error("Failed to create student", error);
      alert("Failed to create student. Please check if Student ID or Admission Number are unique.");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      const payload = { ...formData };
      if (!payload.temporary_password) {
        delete payload.temporary_password;
      }
      await studentService.updateStudent(formData.id, payload);
      setIsEditModalOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error("Failed to update student", error);
      alert("Failed to update student.");
    }
  };

  const openEditModal = (student: Student) => {
    setFormData({
      id: student.id,
      school_id: student.school_id || '',
      student_id: student.student_id || '',
      student_name: student.student_name || '',
      admission_number: student.admission_number || '',
      temporary_password: '',
      grade: student.grade || '',
      section: student.section || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      phone: student.phone || '',
      email: student.email || '',
      status: student.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      school_id: '',
      student_id: '',
      student_name: '',
      admission_number: '',
      temporary_password: '',
      grade: '',
      section: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      status: 'active'
    });
  };

  const deactivateStudent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to deactivate this student?")) {
      try {
        await studentService.deactivateStudent(id);
        loadData();
      } catch (error) {
        console.error("Failed to deactivate student", error);
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSchool = selectedSchoolId === '' || s.school_id === selectedSchoolId;

    return matchesSearch && matchesSchool;
  });

  return (
    <DashboardLayout role="admin" title="Student Management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Students Directory</h1>
          <p className="text-gray-600">Manage student profiles across all schools</p>
        </div>
        {/* Add Student button hidden as requested
        <button
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
        */}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
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
                <th className="p-4 text-sm font-semibold text-gray-500">Student Name</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Student ID</th>
                <th className="p-4 text-sm font-semibold text-gray-500">School</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Grade / Section</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {student.student_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.student_name}</p>
                          {student.email && <p className="text-sm text-gray-500">{student.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">{student.student_id}</td>
                    <td className="p-4 text-gray-600">{student.schools?.school_name}</td>
                    <td className="p-4 text-gray-600">
                      {student.grade ? `Grade ${student.grade}` : '-'}
                      {student.section ? ` - ${student.section}` : ''}
                    </td>
                    <td className="p-4">
                      <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'danger' : 'warning'} size="sm">
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {student.status !== 'inactive' && (
                          <button 
                            onClick={(e) => deactivateStudent(student.id, e)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
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

      {/* Create / Edit Student Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditModalOpen ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleUpdateStudent : handleCreateStudent} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                  <input required type="text" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                  <input required type="text" placeholder="STU0001" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned School *</label>
                  <select required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    <option value="">Select a school...</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.school_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditModalOpen ? 'Update Temporary Password' : 'Temporary Password *'}
                  </label>
                  <input required={!isEditModalOpen} type="text" placeholder={isEditModalOpen ? "Leave blank to keep unchanged" : "Temp@123"} value={formData.temporary_password} onChange={e => setFormData({...formData, temporary_password: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                  <input type="text" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'pending'})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none bg-white">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 outline-none" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-6 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  {isEditModalOpen ? 'Save Changes' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
