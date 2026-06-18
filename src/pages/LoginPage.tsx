import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, User, GraduationCap, Users, Shield, Mail, Lock, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';

type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

interface RoleConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  fields: { name: string; label: string; type: string; placeholder: string; icon: React.ReactNode }[];
  dashboard: string;
}

const roleConfigs: Record<UserRole, RoleConfig> = {
  student: {
    icon: <GraduationCap className="w-6 h-6" />,
    label: 'Student',
    description: 'Take assessments and track progress',
    fields: [
      {
        name: 'studentId',
        label: 'Student ID',
        type: 'text',
        placeholder: 'Enter your Student ID',
        icon: <CreditCard className="w-5 h-5" />,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        icon: <Lock className="w-5 h-5" />,
      },
    ],
    dashboard: '/student',
  },
  teacher: {
    icon: <User className="w-6 h-6" />,
    label: 'Teacher',
    description: 'Manage students and view reports',
    fields: [
      {
        name: 'teacherId',
        label: 'Teacher ID',
        type: 'text',
        placeholder: 'Enter your Teacher ID',
        icon: <CreditCard className="w-5 h-5" />,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        icon: <Lock className="w-5 h-5" />,
      },
    ],
    dashboard: '/teacher',
  },
  parent: {
    icon: <Users className="w-6 h-6" />,
    label: 'Parent',
    description: 'Monitor your child\'s progress',
    fields: [
      {
        name: 'email',
        label: 'Email / Parent ID',
        type: 'text',
        placeholder: 'Enter your email or Parent ID',
        icon: <Mail className="w-5 h-5" />,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        icon: <Lock className="w-5 h-5" />,
      },
    ],
    dashboard: '/parent',
  },
  admin: {
    icon: <Shield className="w-6 h-6" />,
    label: 'Admin',
    description: 'Manage schools and users',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        icon: <Mail className="w-5 h-5" />,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        icon: <Lock className="w-5 h-5" />,
      },
    ],
    dashboard: '/admin',
  },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentConfig = roleConfigs[selectedRole];

  const { login } = useAuth();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const password = formData.password;
      let identifier = '';
      let type: 'student' | 'teacher' | 'email' = 'email';

      if (selectedRole === 'student') {
        identifier = formData.studentId;
        type = 'student';
      } else if (selectedRole === 'teacher') {
        identifier = formData.teacherId;
        type = 'teacher';
      } else {
        identifier = formData.email;
        if (identifier && !identifier.includes('@')) {
          identifier = `${identifier.toLowerCase()}@parent.neurolearn.com`;
        }
        type = 'email';
      }

      if (!identifier || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      const result = await login(type, identifier, password);

      if (result.success) {
        navigate(currentConfig.dashboard);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const roles: UserRole[] = ['student', 'teacher', 'parent', 'admin'];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">NeuroLearn</span>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Empowering Every Student to Reach Their Full Potential
          </h1>
          <p className="text-lg text-white/80 mb-8">
            AI-powered learning difficulty screening that helps educators identify and support students early.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>50,000+ Students Screened</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>500+ Schools</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>92% Detection Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                NeuroLearn
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue to your dashboard</p>
          </div>

          {/* Role Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const config = roleConfigs[role];
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/10'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg mb-2 flex items-center justify-center ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {config.icon}
                    </div>
                    <p className={`font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentConfig.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In as {currentConfig.label}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                Contact your administrator
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
