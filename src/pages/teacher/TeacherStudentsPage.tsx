import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Plus, Edit2, Lock, Ban, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Button, Badge, Modal } from '../../components/ui';
import { teacherStudentsService } from '../../services/teacherStudents.service';

export const TeacherStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterGender, setFilterGender] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset Password state
  const [newPassword, setNewPassword] = useState('');
  
  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await teacherStudentsService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenAddModal = async () => {
    setFormError('');
    setFormData({
      student_name: '',
      gender: 'Male',
      date_of_birth: '',
      grade: '',
      address: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      email: '',
      phone: '',
      emergency_contact_name: '',
      emergency_contact_number: '',
      student_id: 'Loading...',
      temporary_password: 'Loading...'
    });
    setShowAddModal(true);
    
    try {
      const nextId = await teacherStudentsService.getNextStudentId();
      setFormData(prev => ({
        ...prev,
        student_id: nextId,
        temporary_password: `Stu@${Math.floor(1000 + Math.random() * 9000)}`
      }));
    } catch (error) {
      console.error('Failed to get next ID', error);
      setFormData(prev => ({
        ...prev,
        student_id: '',
        temporary_password: 'Password123'
      }));
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherStudentsService.createStudent(formData);
      setShowAddModal(false);
      loadStudents();
    } catch (error: any) {
      setFormError(error.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      student_name: student.student_name,
      gender: student.gender || '',
      date_of_birth: student.date_of_birth || '',
      grade: student.grade || '',
      address: student.address || '',
      email: student.email || '',
      phone: student.phone || '',
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_number: student.emergency_contact_number || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherStudentsService.updateStudent(selectedStudent.id, formData);
      setShowEditModal(false);
      loadStudents();
    } catch (error: any) {
      setFormError(error.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    if (confirm(`Are you sure you want to mark ${student.student_name} as ${newStatus}?`)) {
      try {
        await teacherStudentsService.deactivateStudent(student.id, newStatus);
        loadStudents();
      } catch (error: any) {
        alert(error.message || 'Failed to change status');
      }
    }
  };

  const handleOpenResetModal = (student: any) => {
    setSelectedStudent(student);
    setNewPassword(`Stu@${Math.floor(1000 + Math.random() * 9000)}`);
    setShowResetModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherStudentsService.resetPassword(selectedStudent.id, newPassword);
      setShowResetModal(false);
      alert(`Password reset successfully for ${selectedStudent.student_name}. New Password: ${newPassword}`);
    } catch (error: any) {
      setFormError(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade ? s.grade === filterGrade : true;
    const matchesGender = filterGender ? s.gender === filterGender : true;
    return matchesSearch && matchesGrade && matchesGender;
  });

  const uniqueGrades = Array.from(new Set(students.map(s => s.grade).filter(Boolean)));

  return (
    <DashboardLayout role="teacher" title="Student Management">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage your assigned students and their profiles</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-5 h-5 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={`bg-white ${showFilters ? 'ring-2 ring-primary-500' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>

        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-white flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">All Grades</option>
                {uniqueGrades.map((g: any) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setFilterGrade(''); setFilterGender(''); }}>Clear</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Student Info</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Grade</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Risk Level</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-900">{student.student_name}</div>
                        <div className="text-sm text-gray-500">{student.student_id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">Grade: {student.grade || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={
                        student.risk_level === 'High' || student.risk_level === 'Severe' ? 'danger' :
                        student.risk_level === 'Moderate' ? 'warning' : 'success'
                      }>
                        {student.risk_level || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/students/${student.id}`)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(student)}>
                          <Edit2 className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenResetModal(student)} title="Reset Password">
                          <Lock className="w-4 h-4 text-gray-500 hover:text-warning-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(student)} title={student.status === 'active' ? 'Deactivate' : 'Activate'}>
                          {student.status === 'active' ? (
                            <Ban className="w-4 h-4 text-gray-500 hover:text-danger-600" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-gray-500 hover:text-success-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Student" size="lg">
          <form onSubmit={handleCreateStudent} className="space-y-4">
            {formError && <div className="text-danger-600 text-sm">{formError}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Auto-generated)</label>
                <input type="text" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input type="text" value={formData.temporary_password} onChange={e => setFormData({...formData, temporary_password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
              <input type="text" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name *</label>
                <input type="text" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number *</label>
                <input type="text" value={formData.emergency_contact_number} onChange={e => setFormData({...formData, emergency_contact_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Student'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)} title="Edit Student Info" size="lg">
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            {formError && <div className="text-danger-600 text-sm">{formError}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input type="text" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input type="text" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
                <input type="text" value={formData.emergency_contact_number} onChange={e => setFormData({...formData, emergency_contact_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Update Info'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <Modal onClose={() => setShowResetModal(false)} title="Reset Password" size="md">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-600">You are resetting the password for <strong>{selectedStudent?.student_name}</strong>.</p>
            {formError && <div className="text-danger-600 text-sm">{formError}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" onClick={() => setShowResetModal(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Resetting...' : 'Confirm Reset'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};
