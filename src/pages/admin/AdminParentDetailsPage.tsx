import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building, Users, Briefcase, Mail, Phone, MapPin, Network, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Badge } from '../../components/ui';
import { parentService, ParentDetails } from '../../services/parent.service';

export const AdminParentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parent, setParent] = useState<ParentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (parentId: string) => {
    try {
      setIsLoading(true);
      const data = await parentService.getParentById(parentId);
      setParent(data);
    } catch (error) {
      console.error("Failed to load parent details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateParent = async () => {
    if(!parent || parent.status === 'inactive') return;
    if(window.confirm("Are you sure you want to deactivate this parent? This preserves history but disables access.")) {
      try {
        await parentService.deactivateParent(parent.id);
        loadData(parent.id);
      } catch (error) {
        console.error("Failed to deactivate parent", error);
      }
    }
  };

  if (isLoading) return <DashboardLayout role="admin" title="Parent Profile"><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!parent) return <DashboardLayout role="admin" title="Parent Profile"><div className="p-8 text-center text-danger-600">Parent not found</div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" title="Parent Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/parents')} className="p-2 border rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {parent.parent_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{parent.parent_name}</h1>
                <Badge variant={parent.status === 'active' ? 'success' : 'danger'}>
                  {parent.status}
                </Badge>
              </div>
              <p className="text-gray-600 font-mono text-sm">ID: {parent.parent_id}</p>
            </div>
          </div>
        </div>
        {parent.status !== 'inactive' && (
          <button 
            onClick={deactivateParent}
            className="px-6 py-2 bg-white border border-danger-200 text-danger-600 rounded-xl font-bold hover:bg-danger-50 transition-colors"
          >
            Deactivate Parent
          </button>
        )}
      </div>

      {/* Ownership Chain Visualization */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-gray-400" /> Ownership Hierarchy
        </h3>
        <div className="flex flex-col gap-2 relative pl-4 border-l-2 border-gray-200 ml-2">
          <div className="flex items-center gap-3 relative">
            <div className="w-2 h-2 rounded-full bg-warning-500 absolute -left-[21px]"></div>
            <Building className="w-4 h-4 text-warning-500" />
            <span className="font-semibold text-gray-900">{parent.school_name || 'Unknown School'}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">School</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="w-2 h-2 rounded-full bg-secondary-500 absolute -left-[21px]"></div>
            <User className="w-4 h-4 text-secondary-500" />
            <span className="font-semibold text-gray-900">{parent.created_by_teacher_name || 'Unknown Teacher'}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Teacher (Creator)</span>
          </div>
          {parent.linked_students && parent.linked_students.length > 0 ? (
            parent.linked_students.map((student, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-success-500 absolute -left-[21px]"></div>
                  <Users className="w-4 h-4 text-success-500" />
                  <span className="font-semibold text-gray-900">{student.student_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Student</span>
                </div>
                <div className="flex items-center gap-3 relative ml-4">
                  <div className="w-2 h-2 rounded-full bg-primary-500 absolute -left-[21px]"></div>
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-gray-900">{parent.parent_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{student.relationship}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-gray-300 absolute -left-[21px]"></div>
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-400 italic">No students linked</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Student</span>
                </div>
                <div className="flex items-center gap-3 relative ml-4">
                  <div className="w-2 h-2 rounded-full bg-primary-500 absolute -left-[21px]"></div>
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-gray-900">{parent.parent_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Parent</span>
                </div>
              </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Parent Information
              </h3>
              <div className="space-y-4 text-sm">
                <div><span className="flex items-center gap-2 text-gray-500 mb-1"><User className="w-4 h-4"/> Name</span><span className="font-medium text-gray-900">{parent.parent_name}</span></div>
                <div><span className="flex items-center gap-2 text-gray-500 mb-1"><Mail className="w-4 h-4"/> Email</span><span className="font-medium text-gray-900">{parent.email || '-'}</span></div>
                <div><span className="flex items-center gap-2 text-gray-500 mb-1"><Phone className="w-4 h-4"/> Phone</span><span className="font-medium text-gray-900">{parent.phone || '-'}</span></div>
                <div><span className="flex items-center gap-2 text-gray-500 mb-1"><Briefcase className="w-4 h-4"/> Occupation</span><span className="font-medium text-gray-900">{parent.occupation || '-'}</span></div>
                <div><span className="flex items-center gap-2 text-gray-500 mb-1"><MapPin className="w-4 h-4"/> Address</span><span className="font-medium text-gray-900">{parent.address || '-'}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" /> Administrative Information
              </h3>
              <div className="space-y-4 text-sm">
                <div><span className="block text-gray-500 mb-1">Parent ID</span><span className="font-medium text-gray-900 font-mono">{parent.parent_id}</span></div>
                <div><span className="block text-gray-500 mb-1">Status</span>
                  <Badge variant={parent.status === 'active' ? 'success' : 'danger'} size="sm">{parent.status}</Badge>
                </div>
                <div><span className="block text-gray-500 mb-1">School</span><span className="font-medium text-gray-900">{parent.school_name || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Created By Teacher</span><span className="font-medium text-gray-900">{parent.created_by_teacher_name || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Teacher ID</span><span className="font-medium text-gray-900 font-mono">{parent.created_by_teacher_employee_id || '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Created Date</span><span className="font-medium text-gray-900">{parent.created_at ? new Date(parent.created_at).toLocaleDateString() : '-'}</span></div>
                <div><span className="block text-gray-500 mb-1">Last Updated</span><span className="font-medium text-gray-900">{parent.updated_at ? new Date(parent.updated_at).toLocaleDateString() : '-'}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Linked Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" /> Linked Students
                </h3>
                <Badge variant="secondary">{parent.linked_students?.length || 0} Students</Badge>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-sm font-semibold text-gray-500">Student Name</th>
                      <th className="pb-3 text-sm font-semibold text-gray-500">ID</th>
                      <th className="pb-3 text-sm font-semibold text-gray-500">Grade/Sec</th>
                      <th className="pb-3 text-sm font-semibold text-gray-500">Assigned Teacher</th>
                      <th className="pb-3 text-sm font-semibold text-gray-500">School</th>
                      <th className="pb-3 text-sm font-semibold text-gray-500">Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parent.linked_students?.map((student, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-4 font-semibold text-gray-900">{student.student_name}</td>
                        <td className="py-4 font-mono text-sm text-gray-600">{student.student_id}</td>
                        <td className="py-4 text-gray-600">
                          {student.grade ? `Grade ${student.grade}` : '-'} {student.section ? ` - ${student.section}` : ''}
                        </td>
                        <td className="py-4 text-gray-600">{student.assigned_teacher || 'Unassigned'}</td>
                        <td className="py-4 text-gray-600">{student.school_name}</td>
                        <td className="py-4">
                          <Badge variant="primary" size="sm">{student.relationship}</Badge>
                        </td>
                      </tr>
                    ))}
                    {(!parent.linked_students || parent.linked_students.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 italic">No students linked to this parent.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-success-500" /> Communication Summary (Placeholder)
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4"/> Last Login</div>
                    <span className="font-bold text-gray-900">{parent.communicationSummary.lastLogin || 'Never'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600"><Activity className="w-4 h-4"/> Portal Usage</div>
                    <span className="font-bold text-gray-900">{parent.communicationSummary.portalUsage}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600"><MessageSquare className="w-4 h-4"/> Messages Sent</div>
                    <span className="font-bold text-gray-900">{parent.communicationSummary.messagesSent}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600"><AlertCircle className="w-4 h-4"/> Notifications Viewed</div>
                    <span className="font-bold text-gray-900">{parent.communicationSummary.notificationsViewed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
