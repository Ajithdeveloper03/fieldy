import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Detect if we're on Android emulator or real device
// Usually 10.0.2.2 for Android Emulator, localhost for iOS simulator
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes(":8081")) {
    if (
      Platform.OS === "android" &&
      (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
    ) {
      return envUrl
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }
    return envUrl;
  }
  return Platform.OS === "android"
    ? "http://10.0.2.2:8000/api/v1"
    : "http://127.0.0.1:8000/api/v1";
};

export const API_BASE_URL = getBaseUrl();

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
  if (!token) {
    throw new Error("Please sign in again to continue.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
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
