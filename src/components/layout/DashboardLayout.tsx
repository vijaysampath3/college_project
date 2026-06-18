import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import {
  Home,
  FileText,
  BarChart3,
  Lightbulb,
  User,
  Users,
  ClipboardCheck,
  Settings,
  Building,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  title?: string;
}

const roleNavItems = {
  student: [
    { label: 'Dashboard', path: '/student', icon: <Home className="w-5 h-5" /> },
    { label: 'Assessments', path: '/student/assessments', icon: <FileText className="w-5 h-5" /> },
    { label: 'Monitoring', path: '/student/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Recommendations', path: '/student/recommendations', icon: <Lightbulb className="w-5 h-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher', icon: <Home className="w-5 h-5" /> },
    { label: 'Students', path: '/teacher/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Parents', path: '/teacher/parents', icon: <HeartHandshake className="w-5 h-5" /> },
    { label: 'Assessments', path: '/teacher/assessments', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Monitoring', path: '/teacher/monitoring', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Analytics', path: '/teacher/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent', icon: <Home className="w-5 h-5" /> },
    { label: 'Progress', path: '/parent/progress', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Monitoring', path: '/parent/reports', icon: <FileText className="w-5 h-5" /> },
    { label: 'Recommendations', path: '/parent/recommendations', icon: <Lightbulb className="w-5 h-5" /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: <Home className="w-5 h-5" /> },
    { label: 'Assignments', path: '/admin/assignments', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Teachers', path: '/admin/teachers', icon: <Users className="w-5 h-5" /> },
    { label: 'Parents', path: '/admin/parents', icon: <HeartHandshake className="w-5 h-5" /> },
    { label: 'Schools', path: '/admin/schools', icon: <Building className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/students', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Comparison Graphs', path: '/admin/comparison', icon: <BarChart3 className="w-5 h-5" /> },
  ],
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = roleNavItems[role];
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        userRole={roleLabel}
      />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
          {children}
        </main>
      </div>
    </div>
  );
};
