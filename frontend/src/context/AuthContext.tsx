import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import authAPI  from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    role?: string
  ) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
          })
        );
        setToken(response.token);
        setUser({
          id: response.userId || '',
          email: response.email || '',
          fullName: response.fullName || '',
          phoneNumber: '',
          role: response.role || 'USER',
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    role: string = 'USER'
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authAPI.register({ email, password, fullName, phoneNumber, role });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role || role,
          })
        );
        setToken(response.token);
        setUser({
          id: response.userId || '',
          email: response.email || '',
          fullName: response.fullName || '',
          phoneNumber: phoneNumber,
          role: response.role || role,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};