import axios from 'axios';

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

// API base URL - define it here to avoid circular dependencies
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://855amc8i0k.execute-api.ap-south-1.amazonaws.com/Prod";

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
      `${API_BASE_URL}/auth/login`, 
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
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<AuthTokens | null> => {
  if (!isBrowser) {
    console.log('Cannot refresh token in non-browser environment');
    return null;
  }
  
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    console.log('No refresh token available');
    logout();
    return null;
  }
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`, 
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
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) {
    return null;
  }
  
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `${tokenType} ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Try to refresh the token
      const newTokens = await refreshToken();
      
      if (newTokens) {
        // Retry with new token
        try {
          const retryResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `${newTokens.token_type} ${newTokens.access_token}`
            }
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error('Failed to get user after token refresh:', retryError);
          logout();
          return null;
        }
      } else {
        logout();
        return null;
      }
    }
    return null;
  }
};

export const logout = (): void => {
  if (isBrowser) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    
    // Force reload to clear any in-memory state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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

// Create a function to handle authentication errors that can be used with axios interceptors
export const handleAuthError = async (error: any) => {
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
      
      if (!tokens) {
        throw new Error('Failed to refresh token');
      }
      
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
};

export default {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  getAuthHeader,
  isAuthenticated,
  handleAuthError,
};