import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveApiBaseUrl } from "../services/api";

export const API_BASE_URL = resolveApiBaseUrl();

interface RequestOptions extends RequestInit {
  data?: any;
}

export const apiClient = {
  get: async (endpoint: string, options: RequestOptions = {}) => {
    return request(endpoint, { ...options, method: "GET" });
  },
  post: async (endpoint: string, data?: any, options: RequestOptions = {}) => {
    return request(endpoint, {
      ...options,
      method: "POST",
      data,
    });
  },
};

async function request(endpoint: string, options: RequestOptions) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = await AsyncStorage.getItem("token");
  const authUserRaw = await AsyncStorage.getItem("@auth_user");
  const activeService = await AsyncStorage.getItem("@fieldy_active_service");
  let userPhone: string | null = null;
  try {
    userPhone = authUserRaw ? JSON.parse(authUserRaw)?.phone || null : null;
  } catch {
    userPhone = null;
  }
  if (!token && !userPhone) {
    throw new Error("Please sign in again to continue.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userPhone ? { "X-Demo-Phone": userPhone } : {}),
    ...(activeService ? { "X-Service-Key": activeService } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.log("API Request notice:", url);
    throw error;
  }
}
