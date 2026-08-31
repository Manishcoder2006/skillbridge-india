import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, isLiveSupabase } from '../services/supabaseClient';
import { apiService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session & profile on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isLiveSupabase) {
          try {
            const { data: { session: activeSession } } = await supabase.auth.getSession();
            if (activeSession && mounted) {
              setSession(activeSession);
              localStorage.setItem('sb_auth_token', activeSession.access_token);
              // Fetch verified user profile
              const profile = await apiService.getProfile();
              if (profile) {
                localStorage.setItem('sb_user_profile', JSON.stringify(profile));
                setUser(profile);
                return;
              }
            }
          } catch (supaInitErr) {
            console.warn('Supabase session getSession error, falling back to local storage:', supaInitErr);
          }
        }
        
        // Dev / Local session restoration
        const storedToken = localStorage.getItem('sb_auth_token');
        const storedUser = localStorage.getItem('sb_user_profile');
        if (storedToken && storedUser && mounted) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('sb_user_profile');
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Supabase auth state change listener
    let authListener = null;
    if (isLiveSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          localStorage.setItem('sb_auth_token', currentSession.access_token);
          try {
            const profile = await apiService.getProfile();
            if (profile) {
              localStorage.setItem('sb_user_profile', JSON.stringify(profile));
              setUser(profile);
            }
          } catch (e) {
            console.error('Failed to sync profile after auth change:', e);
          }
        } else {
          setSession(null);
          setUser(null);
          localStorage.removeItem('sb_auth_token');
          localStorage.removeItem('sb_user_profile');
        }
      });
      authListener = subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (isLiveSupabase) {
        try {
          const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
          if (authError) throw authError;
          setSession(data.session);
          localStorage.setItem('sb_auth_token', data.session.access_token);
          const profile = await apiService.getProfile();
          localStorage.setItem('sb_user_profile', JSON.stringify(profile));
          setUser(profile);
          return profile;
        } catch (supaErr) {
          console.warn('Live Supabase auth network error, falling back to backend API:', supaErr);
          // Fallback to FastAPI backend auth
          const res = await apiService.login(email, password);
          localStorage.setItem('sb_auth_token', res.access_token);
          localStorage.setItem('sb_user_profile', JSON.stringify(res.user));
          setUser(res.user);
          return res.user;
        }
      } else {
        const res = await apiService.login(email, password);
        localStorage.setItem('sb_auth_token', res.access_token);
        localStorage.setItem('sb_user_profile', JSON.stringify(res.user));
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Login failed. Please verify credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Direct Mock Login for testing evaluation roles
  const loginWithMockRole = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const token = `demo_token_${role}`;
      localStorage.setItem('sb_auth_token', token);
      const profile = await apiService.getProfile();
      localStorage.setItem('sb_user_profile', JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Mock login failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Register (Self-registration strictly blocked for Super Admin & Institution Admin)
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      if (['super_admin', 'institution_admin'].includes(formData.role)) {
        throw new Error('Self-registration as Administrator is strictly disallowed.');
      }
      const res = await apiService.register(formData);
      if (res.access_token) {
        localStorage.setItem('sb_auth_token', res.access_token);
        localStorage.setItem('sb_user_profile', JSON.stringify(res.user));
        setUser(res.user);
      }
      return res.user;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      if (isLiveSupabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('sb_auth_token');
      localStorage.removeItem('sb_user_profile');
      setLoading(false);
    }
  };

  // Reset Password Request
  const resetPassword = async (email) => {
    if (isLiveSupabase) {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
    }
    return { success: true };
  };

  // Safe Profile Update
  const updateProfile = async (updateData) => {
    const updated = await apiService.updateProfile(updateData);
    setUser(updated);
    localStorage.setItem('sb_user_profile', JSON.stringify(updated));
    return updated;
  };

  const value = {
    user,
    session,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    loginWithMockRole,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
