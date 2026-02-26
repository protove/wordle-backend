'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiLogin, apiSignup, AuthResponse, SignupPayload } from '@/lib/api';

const TOKEN_KEY = 'cosmic-wordle-token';
const USER_KEY  = 'cosmic-wordle-user';

export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}

export function useAuth() {
  const [token, setToken]   = useState<string | null>(null);
  const [user,  setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t && u) { setToken(t); setUser(JSON.parse(u) as AuthUser); }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    const u: AuthUser = { userId: res.userId, username: res.username, role: res.role };
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(res.accessToken);
    setUser(u);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    persist(res);
    return res;
  }, [persist]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await apiSignup(payload);
    persist(res);
    return res;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, loading, login, signup, logout, isLoggedIn: !!token };
}
