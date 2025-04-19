import axios from "axios";

// Create axios instance with base URL and default config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://855amc8i0k.execute-api.ap-south-1.amazonaws.com/Prod";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Remove withCredentials to avoid CORS issues with wildcard origin
  withCredentials: false,
});

// Add request interceptor to attach auth token if available
api.interceptors.request.use((config) => {
  // Get token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const tokenType = typeof window !== "undefined" ? localStorage.getItem("token_type") || "Bearer" : "Bearer";
  
  if (token) {
    config.headers.Authorization = `${tokenType} ${token}`;
  }
  
  return config;
});

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
}

export interface Vote {
  report_id: number;
  id?: number;
  user_id?: number;
  created_at?: string;
}

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
export const createReport = async (reportData: FormData): Promise<Report> => {
  const response = await api.post("/reports/", reportData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

export default api;