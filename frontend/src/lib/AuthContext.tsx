'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, logout } from './auth';
import type { User } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };
  
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    
    initAuth();
  }, []);
  
  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};