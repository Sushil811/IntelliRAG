import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, orgName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { BACKEND_URL, apiClient } from '@/api';

export const API_BASE_URL = BACKEND_URL;
export const authAxios = apiClient;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('intellirag_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAxios.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch current user', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const accessToken = response.data.access_token;
    localStorage.setItem('intellirag_token', accessToken);
    setToken(accessToken);
    await fetchCurrentUser();
  };

  const register = async (email: string, password: string, fullName: string, orgName: string) => {
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      full_name: fullName,
      organization_name: orgName
    });

    // Auto login after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('intellirag_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
