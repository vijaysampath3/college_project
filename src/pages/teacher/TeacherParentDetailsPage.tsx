import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Shield, User, Link, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, Button, Badge, Modal } from '../../components/ui';
import { teacherParentsService } from '../../services/teacherParents.service';

export const TeacherParentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parent, setParent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadParent = async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      const data = await teacherParentsService.getParent(id);
      setParent(data);
    } catch (error) {
      console.error('Failed to load parent:', error);
      navigate('/teacher/parents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParent();
  }, [id]);

  const handleRemoveRelationship = async (relationshipId: string) => {
    if (!window.confirm('Are you sure you want to remove this relationship?')) return;
    try {
      await teacherParentsService.removeRelationship(relationshipId);
      loadParent();
    } catch (error) {
      alert('Failed to remove relationship');
    }
  };

  if (isLoading || !parent) {
    return (
      <DashboardLayout role="teacher" title="Parent Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading parent details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Parent Details">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/teacher/parents')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Parents
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{parent.parent_name}</h1>
            <p className="text-gray-600">Parent Profile & Linkages</p>
          </div>
          <Badge variant={parent.status === 'active' ? 'success' : 'danger'}>
            {parent.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Linked Students Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Linked Students</h2>
                  <p className="text-sm text-gray-500">Manage student relationships for this parent</p>
                </div>
              </div>

              <div className="space-y-4">
                {parent.linked_students?.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No students linked to this parent.</p>
                ) : (
                  parent.linked_students?.map((link: any) => (
                    <div key={link.relationship_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div>
                        <div className="font-semibold text-gray-900">{link.student_name}</div>
                        <div className="text-sm text-gray-500">{link.student_id} • Grade {link.grade || '-'}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary">{link.relationship}</Badge>
                          {link.is_primary_parent && (
                            <Badge variant="primary">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRemoveRelationship(link.relationship_id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Placeholders */}
          <Card>
            <CardContent className="p-6 opacity-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Future: Parent Dashboard Preview</h2>
              <p className="text-sm text-gray-500">This area will display a read-only preview of what the parent sees on their dashboard.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 opacity-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Future: Communication History</h2>
              <p className="text-sm text-gray-500">This area will display messages and notifications sent to this parent.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Phone Number</span>
                  <span className="font-medium text-gray-900">{parent.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Email Address</span>
                  <span className="font-medium text-gray-900">{parent.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Address</span>
                  <span className="font-medium text-gray-900">{parent.address || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Occupation</span>
                  <span className="font-medium text-gray-900">{parent.occupation || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Administrative Info</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Parent ID</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">{parent.parent_id}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Account Status</span>
                  <Badge variant={parent.status === 'active' ? 'success' : 'danger'}>{parent.status}</Badge>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Created By Teacher</span>
                  <span className="font-medium text-gray-900">{parent.created_by_teacher}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Created Date</span>
                  <span className="font-medium text-gray-900">{new Date(parent.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Last Updated</span>
                  <span className="font-medium text-gray-900">{new Date(parent.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
