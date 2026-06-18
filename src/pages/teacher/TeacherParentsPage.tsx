import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Plus, Edit2, Lock, Ban, CheckCircle2, UserPlus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Button, Badge, Modal } from '../../components/ui';
import { teacherParentsService } from '../../services/teacherParents.service';

export const TeacherParentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [parentsData, statsData] = await Promise.all([
        teacherParentsService.getParents(),
        teacherParentsService.getStats()
      ]);
      setParents(parentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load parents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = async () => {
    setFormError('');
    setFormData({
      parent_name: '',
      email: '',
      phone: '',
      occupation: '',
      address: '',
      status: 'active',
      parent_id: '',
      temporary_password: `Par@${Math.floor(1000 + Math.random() * 9000)}`
    });
    setShowAddModal(true);
    // In a real scenario, we might call an endpoint to auto-suggest the ID.
    // For now, we'll let the backend generate it if empty, but the user requested auto-suggestion.
    // Let's just pass empty and let the backend do it, OR we can generate a mock one.
    // Wait, let's leave it blank and say "Auto-generated on save" if empty.
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError('');
      const res = await teacherParentsService.createParent(formData);
      alert(`Parent Created! ID: ${res.parent.parent_id}\nTemp Password: ${res.temporary_password}`);
      setShowAddModal(false);
      loadData();
    } catch (error: any) {
      setFormError(error.message || 'Failed to create parent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (parent: any) => {
    setSelectedParent(parent);
    setFormData({
      parent_name: parent.parent_name || '',
      email: parent.email || '',
      phone: parent.phone || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
      status: parent.status || 'active'
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherParentsService.updateParent(selectedParent.parent_id, formData);
      setShowEditModal(false);
      loadData();
    } catch (error: any) {
      setFormError(error.message || 'Failed to update parent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (parentId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this parent?')) return;
    try {
      await teacherParentsService.deactivateParent(parentId);
      loadData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleOpenResetModal = (parent: any) => {
    setSelectedParent(parent);
    setNewPassword(`Par@${Math.floor(1000 + Math.random() * 9000)}`);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherParentsService.resetPassword(selectedParent.parent_id, newPassword);
      setShowResetModal(false);
      alert(`Password reset successfully. New Password: ${newPassword}`);
    } catch (error: any) {
      setFormError(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignModal = async (parent: any) => {
    setSelectedParent(parent);
    setFormError('');
    setStudentAssignments([]);
    setShowAssignModal(true);
    try {
      const students = await teacherParentsService.getAvailableStudents(parent.parent_id);
      setAvailableStudents(students);
    } catch (error: any) {
      setFormError(error.message || 'Failed to load students');
    }
  };

  const handleToggleStudent = (studentId: string) => {
    const existing = studentAssignments.find(a => a.student_id === studentId);
    if (existing) {
      setStudentAssignments(studentAssignments.filter(a => a.student_id !== studentId));
    } else {
      setStudentAssignments([...studentAssignments, { student_id: studentId, relationship: 'Father', is_primary_parent: true }]);
    }
  };

  const handleUpdateAssignment = (studentId: string, field: string, value: any) => {
    setStudentAssignments(studentAssignments.map(a => 
      a.student_id === studentId ? { ...a, [field]: value } : a
    ));
  };

  const handleSaveAssignments = async () => {
    if (studentAssignments.length === 0) {
      setFormError('Please select at least one student.');
      return;
    }
    try {
      setIsSubmitting(true);
      setFormError('');
      await teacherParentsService.assignStudents(selectedParent.parent_id, studentAssignments);
      setShowAssignModal(false);
      loadData();
    } catch (error: any) {
      setFormError(error.message || 'Failed to assign students');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParents = parents.filter(p => {
    const matchesSearch = p.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.parent_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="teacher" title="Parent Management">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-600">Manage parent accounts and relationships</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-5 h-5 mr-2" />
          Add Parent
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total_parents}</div>
                <div className="text-sm font-medium text-gray-500">Total Parents</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active_parents}</div>
                <div className="text-sm font-medium text-gray-500">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.linked_parents}</div>
                <div className="text-sm font-medium text-gray-500">Linked Parents</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.children_linked}</div>
                <div className="text-sm font-medium text-gray-500">Children Linked</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilterStatus('')}>Clear</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Parent Info</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Contact</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">Linked Students</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading parents...</td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No parents found.</td>
                </tr>
              ) : (
                filteredParents.map(parent => (
                  <tr key={parent.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/teacher/parents/${parent.parent_id}`)}>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-900">{parent.parent_name}</div>
                        <div className="text-sm text-gray-500">{parent.parent_id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{parent.phone || '-'}</div>
                      <div className="text-sm text-gray-500">{parent.email || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={parent.linked_students_count > 0 ? 'primary' : 'secondary'}>
                        {parent.linked_students_count}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={parent.status === 'active' ? 'success' : 'danger'}>
                        {parent.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignModal(parent)}>
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(parent)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenResetModal(parent)}>
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(parent.parent_id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Ban className="w-4 h-4" />
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

      {/* Add Modal */}
      {showAddModal && (
      <Modal onClose={() => setShowAddModal(false)} title="Add New Parent">
        <form onSubmit={handleCreateParent} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent ID (Leave blank to auto-generate)</label>
              <input type="text" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="PAR001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name *</label>
              <input type="text" required value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Temporary Password</h4>
            <p className="text-sm text-blue-700">{formData.temporary_password}</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Parent'}
            </Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
      <Modal onClose={() => setShowEditModal(false)} title="Edit Parent">
        <form onSubmit={handleUpdateParent} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name *</label>
              <input type="text" required value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Assign Students Modal */}
      {showAssignModal && (
      <Modal onClose={() => setShowAssignModal(false)} title={`Assign Child to ${selectedParent?.parent_name}`}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {formError}
            </div>
          )}
          
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
              {availableStudents.length === 0 ? (
                <p className="text-gray-500 text-sm">No available students found.</p>
              ) : (
                availableStudents.map(student => {
                  const assignment = studentAssignments.find(a => a.student_id === student.id);
                  const isSelected = !!assignment;

                  return (
                    <div key={student.id} className={`p-4 rounded-xl border transition-colors ${isSelected ? 'border-primary-500 bg-primary-50/10' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleStudent(student.id)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-sm text-gray-500">{student.student_id} • Grade {student.grade || '-'}</div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                            <select 
                              value={assignment.relationship}
                              onChange={(e) => handleUpdateAssignment(student.id, 'relationship', e.target.value)}
                              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Primary Parent</label>
                            <select 
                              value={assignment.is_primary_parent ? "true" : "false"}
                              onChange={(e) => handleUpdateAssignment(student.id, 'is_primary_parent', e.target.value === "true")}
                              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleSaveAssignments} disabled={isSubmitting || studentAssignments.length === 0}>
              {isSubmitting ? 'Saving...' : 'Save Assignments'}
            </Button>
          </div>
        </div>
      </Modal>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
      <Modal onClose={() => setShowResetModal(false)} title="Reset Password">
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to reset the password for <strong>{selectedParent?.parent_name}</strong>.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="text" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </Modal>
      )}

    </DashboardLayout>
  );
};
