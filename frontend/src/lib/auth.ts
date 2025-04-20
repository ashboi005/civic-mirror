import axios from 'axios';
import api from './api';

// Types for authentication
export interface User {
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  id: number;
  created_at: string;
  updated_at: string;
}

export interface UserRegisterData {
  email: string;
  username: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  token: string;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_TYPE_KEY = 'token_type';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Authentication functions
export const login = async (username: string, password: string): Promise<AuthTokens> => {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post(
      `${api.defaults.baseURL}/auth/login`, 
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: false,
      }
    );
    
    const tokens: AuthTokens = response.data;
    
    // Store tokens in localStorage
    if (isBrowser) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      localStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type);
    }
    
    return tokens;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData: UserRegisterData): Promise<User> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<AuthTokens> => {
  if (!isBrowser) {
    throw new Error('Cannot refresh token in non-browser environment');
  }
  
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    // Instead of immediately throwing, clear any stale tokens and redirect to auth flow
    logout();
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`, 
      { token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const tokens: AuthTokens = response.data;
    
    // Update tokens in localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type);
    
    return tokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout(); // Clear tokens if refresh fails
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logout(); // Clear tokens on auth failure
    }
    return null;
  }
};

export const logout = (): void => {
  if (isBrowser) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
  }
};

export const getAuthHeader = (): { Authorization: string } | undefined => {
  if (!isBrowser) {
    return undefined;
  }
  
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
  
  if (token) {
    return { Authorization: `${tokenType} ${token}` };
  }
  
  return undefined;
};

export const isAuthenticated = (): boolean => {
  if (!isBrowser) {
    return false;
  }
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Setup axios interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Only try to refresh if we have a refresh token
        if (!isBrowser || !localStorage.getItem(REFRESH_TOKEN_KEY)) {
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const tokens = await refreshToken();
        
        // Update the authorization header
        originalRequest.headers.Authorization = `${tokens.token_type} ${tokens.access_token}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  getAuthHeader,
  isAuthenticated,
};