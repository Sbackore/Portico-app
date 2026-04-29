'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { getErrorMessage } from './api';

interface User {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  kycEstado: string;
  scoreSeguridadCuenta: number;
  notificacionesConfig: { permisoNotificacionesActivo: boolean; canalesActivos: string[] };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string, telefono?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const persist = (tok: string, usr: User) => {
    localStorage.setItem('portico_token', tok);
    localStorage.setItem('portico_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('portico_token');
    const savedUser = localStorage.getItem('portico_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data.token, res.data.user);
    router.push('/home');
  };

  const register = async (nombre: string, email: string, password: string, telefono?: string) => {
    const res = await api.post('/auth/register', { nombre, email, password, telefono });
    persist(res.data.token, res.data.user);
    router.push('/home');
  };

  const logout = useCallback(() => {
    localStorage.removeItem('portico_token');
    localStorage.removeItem('portico_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('portico_user', JSON.stringify(res.data));
    } catch { /* silently fail */ }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { getErrorMessage };
