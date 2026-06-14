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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data) {
        setRole(data.role as Role);
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
