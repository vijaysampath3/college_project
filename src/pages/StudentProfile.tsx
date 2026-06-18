import React from 'react';
import { DashboardLayout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, School, GraduationCap, Calendar, Hash } from 'lucide-react';
import { Card, CardContent } from '../components/ui';

export const StudentProfile: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <DashboardLayout role="student" title="Student Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">View your account details and learning profile.</p>
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 h-32"></div>
          <CardContent className="p-8 relative">
            <div className="absolute -top-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-700 font-bold text-5xl">
                {profile?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
            
            <div className="mt-16 sm:mt-4 sm:ml-40">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile?.full_name || 'Student Name'}</h2>
              <p className="text-gray-500 font-medium capitalize">{profile?.role || 'Student'} Account</p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
                  <Mail className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-gray-900 font-semibold">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
                  <GraduationCap className="w-6 h-6 text-secondary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Grade Level</p>
                  <p className="text-gray-900 font-semibold">{profile?.grade || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
                  <School className="w-6 h-6 text-success-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">School</p>
                  <p className="text-gray-900 font-semibold">{profile?.school_name || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
                  <Calendar className="w-6 h-6 text-warning-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Age</p>
                  <p className="text-gray-900 font-semibold">{profile?.age ? `${profile.age} years old` : 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
                  <Hash className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Account ID</p>
                  <p className="text-gray-900 font-mono text-sm bg-white px-2 py-1 rounded border mt-1 select-all">
                    {profile?.id || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
