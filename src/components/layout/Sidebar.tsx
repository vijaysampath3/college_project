import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Brain, LogOut } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, navItems, userRole }) => {
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
            NeuroLearn
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {userRole} Panel
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-500/20 transition-all'
                  : 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 font-medium transition-all hover:bg-gray-100 hover:text-gray-900'
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Help Card */}
      <div className="p-4 shrink-0">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Need Help?</h4>
          <p className="text-xs text-gray-500 mb-3">Visit our support center for assistance.</p>
          <button className="w-full py-2 text-sm font-medium text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors">
            Contact Support
          </button>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 w-full px-3 py-2.5 mt-2 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-100 hover:text-danger-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop static sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
};
