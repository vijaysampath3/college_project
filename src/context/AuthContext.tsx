import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'student' | 'teacher' | 'parent' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  login: (type: 'student' | 'teacher' | 'email', identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  getCurrentRole: () => Role;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      // First check if they have a role in user metadata
      const { data: userData } = await supabase.auth.getUser();
      const metaRole = userData?.user?.user_metadata?.role;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setRole(data.role as Role);
        setProfile(data);
      } else {
        // Fallback for students
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*, schools(name)')
          .eq('user_id', userId)
          .single();
          
        if (studentData && !studentError) {
          let age;
          if (studentData.date_of_birth) {
            const dob = new Date(studentData.date_of_birth);
            const diff_ms = Date.now() - dob.getTime();
            const age_dt = new Date(diff_ms);
            age = Math.abs(age_dt.getUTCFullYear() - 1970);
          }

          setRole('student');
          setProfile({
            ...studentData,
            role: 'student',
            full_name: studentData.student_name,
            grade: studentData.grade,
            school_name: studentData.schools?.name || 'Unknown School',
            age: age
          });
          return;
        }

        // Fallback for metadata role if available
        if (metaRole) {
          setRole(metaRole as Role);
        }
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (type: 'student' | 'teacher' | 'email', identifier: string, password: string) => {
    try {
      let emailToLogin = identifier;

      if (type === 'student' || type === 'teacher') {
        // Use the security definer RPC function to lookup the email, bypassing RLS
        const { data, error } = await supabase.rpc('get_email_by_id', {
          id_type: type,
          id_value: identifier
        });

        if (error || !data) {
          return { success: false, error: 'Invalid ID or user not found' };
        }
        
        emailToLogin = data;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during login' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      profile,
      loading,
      login,
      logout,
      getCurrentUser: () => user,
      getCurrentRole: () => role
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
