import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session fallback first
    const localUser = localStorage.getItem('mom_authenticated_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setUser(parsed);
        setSession({ user: parsed });
      } catch {}
    }

    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // 2. Fetch current Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem('mom_authenticated_user', JSON.stringify(session.user));
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // 3. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          localStorage.setItem('mom_authenticated_user', JSON.stringify(session.user));
        } else {
          setSession(null);
          setUser(null);
          localStorage.removeItem('mom_authenticated_user');
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || 'First-Time Investor' }
        }
      });

      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('mom_authenticated_user', JSON.stringify(data.user));
      }
      return data;
    }

    // Offline / Demo Fallback Sign Up
    const fakeUser = {
      id: 'usr_' + Date.now(),
      email: email || 'user@example.com',
      user_metadata: { full_name: name || 'Demo Investor' },
      created_at: new Date().toISOString()
    };
    setUser(fakeUser);
    setSession({ user: fakeUser });
    localStorage.setItem('mom_authenticated_user', JSON.stringify(fakeUser));
    return { user: fakeUser };
  };

  const signIn = async (email, password) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('mom_authenticated_user', JSON.stringify(data.user));
      }
      return data;
    }

    // Offline / Demo Fallback Sign In
    const fakeUser = {
      id: 'usr_' + Date.now(),
      email: email || 'user@example.com',
      user_metadata: { full_name: 'Demo Investor' },
      created_at: new Date().toISOString()
    };
    setUser(fakeUser);
    setSession({ user: fakeUser });
    localStorage.setItem('mom_authenticated_user', JSON.stringify(fakeUser));
    return { user: fakeUser };
  };

  const signOut = async () => {
    localStorage.removeItem('mom_authenticated_user');
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        isConfigured: isSupabaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
