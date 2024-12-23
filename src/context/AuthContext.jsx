import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient.jsx';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) checkRegistrationStatus(session);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) checkRegistrationStatus(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add login function
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Add register function
  const register = async (email, password, username) => {
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Password validation (at least 6 characters)
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Username validation
      if (!username || username.trim().length === 0) {
        throw new Error('Username is required');
      }

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim() // Add username to auth metadata
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: username.trim(),
              email: email.trim().toLowerCase(),
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Failed to create profile');
        }

        // 3. Set up Row Level Security (RLS) policy
        const { error: policyError } = await supabase.rpc('setup_profile_policies', {
          user_id: authData.user.id
        });

        if (policyError) {
          console.error('Policy setup error:', policyError);
        }

        setUser(authData.user);
        return authData;
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Add logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const checkRegistrationStatus = async (session) => {
    if (!session?.user) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error('Profile check error:', error);
      // Profile doesn't exist, create it
      const { error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: session.user.id,
            username: session.user.user_metadata?.username || 'User',
            email: session.user.email,
            created_at: new Date().toISOString()
          }
        ]);

      if (createError) {
        console.error('Profile creation error:', createError);
      }
    }
  };

  const value = {
    user,
    loading,
    login,      // Add login to context
    register,   // Add register to context
    logout      // Add logout to context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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