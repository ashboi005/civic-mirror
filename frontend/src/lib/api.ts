import { Ticket } from "@/types";
import axios from "axios";
import { handleAuthError } from "./auth";

// Create axios instance with base URL and default config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pleasant-mullet-unified.ngrok-free.app";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Remove withCredentials to avoid CORS issues with wildcard origin
  withCredentials: false,
  timeout: 15000, // Set a timeout to prevent hanging requests
});

// Add request interceptor to attach auth token if available
api.interceptors.request.use((config) => {
  // Only try to get tokens in browser environment
  if (isBrowser) {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "Bearer";
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  handleAuthError // Use the function from auth.ts to avoid circular dependencies
);

// Types
export interface UserDetails {
  age: number;
  sex: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  id?: number;
  user_id?: number;
}

export interface Comment {
  id: number;
  text: string;
  user_id: number;
  report_id: number;
  created_at: string;
  updated_at?: string;
  username?: string;
}

export interface Report {
  title: string;
  description: string;
  type: string;
  location: string;
  id?: number;
  user_id?: number;
  status?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  vote_count?: number;
  votes?: Vote[];
  comments?: number; // Number of comments
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Vote {
  report_id: number;
  id?: number;
  user_id?: number;
  created_at?: string;
}

// Admin Reports API
export const getAdminReports = async (
  skip = 0, 
  limit = 10, 
  status?: string
): Promise<Ticket[]> => {
  const params = { skip, limit, ...(status && { status }) };
  const response = await api.get("/admin/reports", { params });
  return response.data;
};

export const updateReportStatus = async (
  reportId: number,
  status: string
): Promise<any> => {
  try {
    console.log(`Updating report with ID ${reportId} to status: ${status}`);
    
    const response = await api.patch(`/admin/reports/${reportId}/status`, { status });
    
    // Log the response to confirm it was successful
    console.log("Response data:", response.data);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error response:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to update report status.");
  }
};


// Complete report API
export const completeReport = async (reportId: number): Promise<any> => {
  try {
    console.log(`Completing report with ID: ${reportId}`);

    // Send POST request to complete the report
    const response = await api.post(`/admin/reports/${reportId}/complete`);

    // Log the response to confirm it was successful
    console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error response:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to complete report.");
  }
};


// User Details API
export const getUserDetails = async (): Promise<UserDetails> => {
  const response = await api.get("/user/details");
  return response.data;
};

export const updateUserDetails = async (details: UserDetails): Promise<UserDetails> => {
  const response = await api.put("/user/details", details);
  return response.data;
};

export const createUserDetails = async (details: UserDetails): Promise<UserDetails> => {
  const response = await api.post("/user/details", details);
  return response.data;
};

// Reports API
export const createReport = async (reportData: any): Promise<Report> => {
  // If reportData is FormData, use multipart/form-data content type
  // Otherwise, use the default application/json
  const headers = reportData instanceof FormData
    ? { "Content-Type": "multipart/form-data" }
    : {};

  const response = await api.post("/reports/", reportData, { headers });
  return response.data;
};

export const getAllReports = async (
  skip = 0, 
  limit = 10, 
  status?: string
): Promise<Report[]> => {
  const params = { skip, limit, ...(status && { status }) };
  const response = await api.get("/reports/", { params });
  return response.data;
};

export const getUserReports = async (
  skip = 0, 
  limit = 10
): Promise<Report[]> => {
  const params = { skip, limit };
  const response = await api.get("/reports/me", { params });
  return response.data;
};

export const getReportById = async (reportId: number): Promise<Report> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

export const voteForReport = async (reportId: number): Promise<Vote> => {
  const response = await api.post("/reports/vote", { report_id: reportId });
  return response.data;
};

// Comments API
export const createComment = async (text: string, reportId: number): Promise<Comment> => {
  const response = await api.post("/comments/", { 
    text, 
    report_id: reportId 
  });
  return response.data;
};

export const getCommentsByReport = async (
  reportId: number,
  skip = 0,
  limit = 100
): Promise<Comment[]> => {
  const params = { skip, limit };
  const response = await api.get(`/comments/report/${reportId}`, { params });
  return response.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

export default api;