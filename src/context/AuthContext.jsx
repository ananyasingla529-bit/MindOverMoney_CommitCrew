import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

const REGISTERED_USERS_KEY = 'mom_registered_users';

const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
  'trashmail.com', 'dispostable.com', 'yopmail.com', 'sharklasers.com',
  'fakeinbox.com', 'temp-mail.org', 'getnada.com', 'throwawaymail.com',
  'disposable.com', 'maildrop.cc', 'tempmail.net'
];

/**
 * Strict Real Email Validator
 * Verifies standard RFC 5322 structure, valid TLD extension, and blocks fake/disposable emails.
 */
export function validateRealEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  const clean = email.trim().toLowerCase();

  // Standard RFC 5322 regex requiring valid domain and TLD extension
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'Please enter a valid email address format (e.g. alex@example.com).' };
  }

  const domain = clean.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, message: 'Disposable or temporary email addresses are not allowed. Please use a real email.' };
  }

  return { valid: true, email: clean };
}

// Helper to generate deterministic user IDs in offline/demo mode
const getFallbackUserId = (email) => {
  const cleanEmail = (email || 'user@example.com').trim().toLowerCase();
  const safeStr = cleanEmail.replace(/[^a-z0-9]/g, '_');
  return `usr_${safeStr}`;
};

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
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      throw new Error(emailCheck.message);
    }
    const cleanEmail = emailCheck.email;

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
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

    // Offline / Demo Fallback Sign Up with persistent user ID mapping
    const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
    if (registeredUsers[cleanEmail]) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const userId = getFallbackUserId(cleanEmail);
    const newUserObj = {
      id: userId,
      email: cleanEmail,
      password: password,
      user_metadata: { full_name: name || 'Investor' },
      created_at: new Date().toISOString()
    };

    registeredUsers[cleanEmail] = newUserObj;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

    const sessionUser = {
      id: userId,
      email: cleanEmail,
      user_metadata: { full_name: name || 'Investor' },
      created_at: newUserObj.created_at
    };

    setUser(sessionUser);
    setSession({ user: sessionUser });
    localStorage.setItem('mom_authenticated_user', JSON.stringify(sessionUser));
    return { user: sessionUser };
  };

  const signIn = async (email, password) => {
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      throw new Error(emailCheck.message);
    }
    const cleanEmail = emailCheck.email;

    if (!password) {
      throw new Error('Please enter your password.');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
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

    // Offline / Demo Fallback Sign In with strict account verification & password check
    const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
    const existing = registeredUsers[cleanEmail];

    if (!existing) {
      throw new Error('No account found with this email address. Please check your spelling or sign up first.');
    }

    if (existing.password !== password) {
      throw new Error('Incorrect password. Please check your password and try again.');
    }

    const sessionUser = {
      id: existing.id,
      email: existing.email,
      user_metadata: existing.user_metadata || { full_name: 'Investor' },
      created_at: existing.created_at
    };

    setUser(sessionUser);
    setSession({ user: sessionUser });
    localStorage.setItem('mom_authenticated_user', JSON.stringify(sessionUser));
    return { user: sessionUser };
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
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      throw new Error(emailCheck.message);
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.email, {
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
