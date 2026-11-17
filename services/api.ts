import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const resolveApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/v1';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost ||
    '';
  const metroHost = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';
  const hasLanMetroHost =
    Boolean(metroHost) &&
    metroHost !== 'localhost' &&
    metroHost !== '127.0.0.1';

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes(':8081')) {
    const isLocalEnvUrl =
      envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
    if (!isLocalEnvUrl) {
      return envUrl;
    }
    if (Platform.OS === 'android') {
      const targetHost = hasLanMetroHost ? metroHost : '10.0.2.2';
      return envUrl
        .replace('localhost', targetHost)
        .replace('127.0.0.1', targetHost);
    }
    if (hasLanMetroHost) {
      return envUrl
        .replace('localhost', metroHost)
        .replace('127.0.0.1', metroHost);
    }
    return envUrl;
  }

  if (hasLanMetroHost) {
    return `http://${metroHost}:8000/api/v1`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://127.0.0.1:8000/api/v1';
};

const getApiUrl = resolveApiBaseUrl;

const TOKEN_KEY = 'token';
const USER_KEY = '@auth_user';

interface RequestConfig extends RequestInit {
  data?: any;
}

const request = async (endpoint: string, { data, headers, ...customConfig }: RequestConfig = {}) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const authUserRaw = await AsyncStorage.getItem(USER_KEY);
  let userPhone: string | null = null;
  try {
    userPhone = authUserRaw ? JSON.parse(authUserRaw)?.phone || null : null;
  } catch {
    userPhone = null;
  }
  const baseUrl = getApiUrl();
  
  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userPhone ? { 'X-Demo-Phone': userPhone } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
      throw new Error(result?.message || 'Something went wrong');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const api = {
  get: (endpoint: string, config?: RequestConfig) => request(endpoint, { ...config, method: 'GET' }),
  post: (endpoint: string, data: any, config?: RequestConfig) => request(endpoint, { ...config, method: 'POST', data }),
  put: (endpoint: string, data: any, config?: RequestConfig) => request(endpoint, { ...config, method: 'PUT', data }),
  delete: (endpoint: string, config?: RequestConfig) => request(endpoint, { ...config, method: 'DELETE' }),
};

export const setAuthSession = async (token: string, user: any) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearAuthSession = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem('isLoggedIn');
  await AsyncStorage.removeItem('isClockedIn');
};

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
