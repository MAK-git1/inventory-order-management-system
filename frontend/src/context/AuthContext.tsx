import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api-client';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, phone: string | null, password: string, role: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check for stored session on load (Auto-Login Persistence)
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch current logged-in customer profile
          const response = await apiClient.get<User>('/profile/');
          setUser(response.data);
        } catch (error) {
          console.error('Session restoration failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ access_token: string; token_type: string; user: User }>(
        '/auth/login',
        { email, password }
      );
      const { access_token, user: loggedUser } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, phone: string | null, password: string, role: string) => {
    try {
      // 1. Submit signup request to register customer
      await apiClient.post('/auth/signup', {
        name,
        email,
        phone: phone || null,
        password,
        role,
      });

      // 2. Perform automatic login after successful registration
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
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
