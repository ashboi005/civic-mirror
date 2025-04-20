'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, getCurrentUser, logout, User } from './auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        handleLogout();
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        await refreshUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
    router.push('/login');
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