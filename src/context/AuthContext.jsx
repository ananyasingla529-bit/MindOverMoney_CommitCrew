import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakeUser = localStorage.getItem('fake_user');
    if (fakeUser) {
      setUser(JSON.parse(fakeUser));
      setSession({ user: JSON.parse(fakeUser) });
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    const fakeUser = { id: 'fake-user-id', email, user_metadata: { full_name: name } };
    setUser(fakeUser);
    setSession({ user: fakeUser });
    localStorage.setItem('fake_user', JSON.stringify(fakeUser));
    return { user: fakeUser };
  };

  const signIn = async (email, password) => {
    const fakeUser = { id: 'fake-user-id', email };
    setUser(fakeUser);
    setSession({ user: fakeUser });
    localStorage.setItem('fake_user', JSON.stringify(fakeUser));
    return { user: fakeUser };
  };

  const signOut = async () => {
    localStorage.removeItem('fake_user');
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
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
