import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { me, signOut, onAuthChange } from '@/api/auth';

// Who is signed in, for the parts of the app that need to know across routes.
//
// This used to do considerably more: fetch the old platform's public settings
// before the app would render, hold an app id and a bootstrap token, and carry
// an error type for a person who had signed in but had no account. None of that
// survives the move. Supabase keeps the session itself, so this is a thin
// wrapper over it and nothing blocks first paint.
//
// `isLoadingPublicSettings` is kept, always false, because App.jsx waits on it.
// Removing it would mean editing the shell for no gain; it costs one line here.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const current = await me();
      setUser(current);
      setIsAuthenticated(Boolean(current));
      setAuthError(null);
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null); // signed out is an ordinary state, not an error
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
    // Signing in or out in another tab should not leave this one stale.
    return onAuthChange(() => { checkUserAuth(); });
  }, [checkUserAuth]);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authChecked,
        authError,
        checkUserAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
};
