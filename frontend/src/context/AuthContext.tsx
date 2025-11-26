import React, { createContext, useState } from 'react';
import { authAPI } from '../lib/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isStaff: boolean;
  isApprover: boolean;
  isFinance: boolean;
}

// Export context so the hook can use it
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to load user from localStorage
const loadUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as User;
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialization: function runs ONLY on initial render
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());
  const loading = false;

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      
      // Destructure new response format
      const { access, refresh, user_short_detail } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Map backend "staff" to frontend "STAFF"
      const mappedRole = user_short_detail.user_type.toUpperCase() as UserRole;

      const userData: User = { 
        username: user_short_detail.username, 
        role: mappedRole, 
        id: user_short_detail.id // UUID string
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear(); // Clear all stored data
    setUser(null);
  };

  const isStaff = user?.role === 'STAFF';
  const isApprover = user?.role === 'MANAGEMENT';
  const isFinance = user?.role === 'FINANCE';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isStaff, isApprover, isFinance: !!isFinance }}>
      {children}
    </AuthContext.Provider>
  );
};