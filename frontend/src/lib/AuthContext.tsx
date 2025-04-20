'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, getCurrentUser, logout, User, refreshToken } from './auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkAndRefreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Function to check and refresh the auth token
  const checkAndRefreshToken = async (): Promise<boolean> => {
    try {
      // Only attempt to refresh if we think we're logged in
      if (isAuthenticated()) {
        const tokens = await refreshToken();
        return !!tokens; // Return true if we successfully refreshed
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };
  
  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
          return;
        }
        
        // If we didn't get user data, try to refresh the token once
        const tokenRefreshed = await checkAndRefreshToken();
        if (tokenRefreshed) {
          const refreshedUserData = await getCurrentUser();
          if (refreshedUserData) {
            setUser(refreshedUserData);
            setIsLoggedIn(true);
            return;
          }
        }
        
        // If we still don't have user data, log out
        handleLogout();
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
        
        // Check if we're on a public page
        const isPublicPage = pathname === '/login' || 
                            pathname === '/register' || 
                            pathname === '/' ||
                            pathname === undefined;
        
        if (isAuthenticated()) {
          await refreshUser();
        } else if (!isPublicPage) {
          // If we're not authenticated and not on a public page, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [pathname]);
  
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
        checkAndRefreshToken
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