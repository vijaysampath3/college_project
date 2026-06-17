import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge } from '../../components/ui';
import { ArrowLeft, Users, GraduationCap, Building, Activity, ShieldAlert, FileText } from 'lucide-react';
import { schoolService, School, SchoolStats } from '../../services/school.service';

export const SchoolDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (schoolId: string) => {
    try {
      setIsLoading(true);
      const [schoolData, statsData] = await Promise.all([
        schoolService.getSchoolById(schoolId),
        schoolService.getSchoolStats(schoolId)
      ]);
      setSchool(schoolData);
      setStats(statsData);
    } catch (err: any) {
      setError('Failed to load school details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardLayout role="admin" title="School Details"><div className="p-8 text-center text-gray-500">Loading...</div></DashboardLayout>;
  if (error || !school || !stats) return <DashboardLayout role="admin" title="School Details"><div className="p-8 text-center text-danger-600">{error || 'School not found'}</div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" title="School Details">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/schools')} className="p-2 border rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{school.school_name}</h1>
              <Badge variant={school.status === 'active' ? 'success' : school.status === 'inactive' ? 'danger' : 'warning'}>
                {school.status}
              </Badge>
            </div>
            <p className="text-gray-600 font-mono text-sm">Code: {school.school_code}</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          Edit Settings
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <StatCard title="Teachers" value={stats.teachers} icon={<Users className="w-6 h-6" />} color="primary" />
        <StatCard title="Students" value={stats.students} icon={<GraduationCap className="w-6 h-6" />} color="secondary" />
        <StatCard title="Parents" value={stats.parents} icon={<Users className="w-6 h-6" />} color="success" />
        <StatCard title="Assessments" value={stats.assessments} icon={<FileText className="w-6 h-6" />} color="warning" />
        <StatCard title="High Risk Students" value={stats.highRiskStudents} icon={<ShieldAlert className="w-6 h-6" />} color="danger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-400" /> Information
            </h3>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500 mb-1">District</span><span className="font-medium text-gray-900">{school.district || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Principal</span><span className="font-medium text-gray-900">{school.principal_name || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Email</span><span className="font-medium text-gray-900">{school.email || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Phone</span><span className="font-medium text-gray-900">{school.phone || '-'}</span></div>
              <div><span className="block text-gray-500 mb-1">Address</span><span className="font-medium text-gray-900">{school.address ? `${school.address}, ${school.city || ''} ${school.state || ''} ${school.postal_code || ''}` : '-'}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution Placeholder</h3>
            <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No data available yet</p>
              <p className="text-xs mt-1">Charts will populate once students complete assessments.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teachers Directory</h3>
            <div className="p-8 text-center text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
              <p>No data available yet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Students</h3>
            <div className="p-8 text-center text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
              <p>No data available yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
