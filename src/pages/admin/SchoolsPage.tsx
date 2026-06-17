import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { Building, Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { schoolService, School } from '../../services/school.service';

export const SchoolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<School>>({
    school_name: '', school_code: '', district: '', email: '', phone: '', principal_name: ''
  });

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolService.getSchools();
      setSchools(data);
    } catch (err: any) {
      setError('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleDeactivate = async (id: string) => {
    if (window.confirm("Are you sure you want to deactivate this school?")) {
      try {
        await schoolService.deactivateSchool(id);
        loadSchools();
      } catch (err) {
        alert("Failed to deactivate school");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schoolService.createSchool(formData);
      setIsModalOpen(false);
      setFormData({ school_name: '', school_code: '', district: '', email: '', phone: '', principal_name: '' });
      loadSchools();
    } catch (err: any) {
      alert(err.message || 'Error creating school');
    }
  };

  const filteredSchools = schools.filter(s => 
    s.school_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.school_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="School Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600">Manage organizational roots for teachers and students</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add School
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-danger-50 text-danger-700 rounded-xl">{error}</div>}

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search schools by name, code, or district..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-600">School</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Code</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">District</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">Loading schools...</td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No schools found</td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                            <Building className="w-5 h-5 text-primary-600" />
                          </div>
                          <span className="font-medium text-gray-900">{school.school_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">{school.school_code}</td>
                      <td className="py-3 px-4 text-gray-600">{school.district || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={school.status === 'active' ? 'success' : school.status === 'inactive' ? 'danger' : 'warning'}>
                          {school.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/schools/${school.id}`)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeactivate(school.id)} className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" title="Deactivate">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New School</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <input required type="text" value={formData.school_name} onChange={e => setFormData({...formData, school_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code *</label>
                  <input required type="text" value={formData.school_code} onChange={e => setFormData({...formData, school_code: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                  <input type="text" value={formData.principal_name} onChange={e => setFormData({...formData, principal_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Create School</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
